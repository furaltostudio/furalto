require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || "m1zm0cpq",
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

async function listSubfolders(folder) {
  const page = await cloudinary.api.sub_folders(folder);
  return (page.folders || []).map((f) => f.path);
}

async function listByAssetFolder(assetFolder) {
  const resources = [];
  let next;
  do {
    const page = await cloudinary.api.resources_by_asset_folder(assetFolder, {
      max_results: 100,
      next_cursor: next,
    });
    resources.push(...(page.resources || []));
    next = page.next_cursor;
  } while (next);
  return resources;
}

function slotFromFilename(name = "") {
  const base = String(name).split("/").pop() || "";
  const m =
    base.match(/^(\d+)v?_/i) ||
    base.match(/^(\d+)\./) ||
    base.match(/^(\d+)$/);
  return m ? Number(m[1]) : null;
}

function slugify(name) {
  return String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FOLDER_ALIASES = {
  "arce curve sofa": "arc-curve-sofa",
  "arcé curve sofa": "arc-curve-sofa",
  "aeris upholstered bed": null, // no DB product yet — skip
};

function scoreMatch(folderName, product) {
  const alias = FOLDER_ALIASES[folderName.toLowerCase()];
  if (alias === null) return 0;
  if (alias && product.slug === alias) return 100;

  const a = slugify(folderName);
  const b = product.slug;
  if (a === b) return 100;
  const an = a.replace(/-sofa$|-bed$/, "");
  const bn = b.replace(/-sofa$|-bed$/, "");
  if (an === bn) return 95;
  // Avoid "aeris-upholstered" matching "aeris"
  if (an.startsWith(bn + "-") || bn.startsWith(an + "-")) return 40;
  if (b === a || a === b) return 100;
  if (b.includes(an) && an.length >= 8) return 75;
  if (a.includes(bn) && bn.length >= 8) return 75;
  const at = new Set(an.split("-").filter((t) => t.length > 2));
  const bt = new Set(bn.split("-").filter((t) => t.length > 2));
  let inter = 0;
  for (const t of at) if (bt.has(t)) inter += 1;
  const union = new Set([...at, ...bt]).size || 1;
  return Math.round((inter / union) * 60);
}

function plain(img) {
  return {
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

function fileKey(src = "") {
  return String(src).split("/").pop()?.toLowerCase() || "";
}

(async () => {
  const dryRun = process.argv.includes("--apply") ? false : true;
  console.log(dryRun ? "DRY RUN (pass --apply to write)" : "APPLYING UPDATES");

  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  }).select("slug name category images");

  const sofaFolders = await listSubfolders("furalto/Furalto_Sofa");
  const bedFolders = await listSubfolders("furalto/Furalto_Bed");

  const report = [];
  let updated = 0;
  let addedImages = 0;

  async function processFolders(folders, category) {
    const pool = products.filter((p) => p.category === category);

    for (const folderPath of folders) {
      const folderName = folderPath.split("/").pop();
      // skip junk batch folders
      if (/^\d+_/.test(folderName) || /SOFA1TO10/i.test(folderName)) {
        report.push({ folderPath, skip: "batch-folder" });
        continue;
      }

      let resources;
      try {
        resources = await listByAssetFolder(folderPath);
      } catch (e) {
        report.push({
          folderPath,
          error: e.message || e.error?.message || String(e),
        });
        continue;
      }

      let best = null;
      let bestScore = 0;
      for (const p of pool) {
        const s = scoreMatch(folderName, p);
        if (s > bestScore) {
          bestScore = s;
          best = p;
        }
      }

      if (!best || bestScore < 70) {
        report.push({
          folderPath,
          resources: resources.length,
          unmatched: true,
          bestScore,
          bestSlug: best?.slug,
        });
        continue;
      }

      const existingKeys = new Set(
        (best.images || []).map((img) => fileKey(img.src)),
      );
      const existingSrcs = new Set((best.images || []).map((img) => img.src));

      const missing = [];
      for (const r of resources) {
        const filename = (r.public_id || "").split("/").pop();
        const key = `${filename}.${r.format}`.toLowerCase();
        const url = r.secure_url;
        if (existingKeys.has(key) || existingSrcs.has(url)) continue;
        // also match by public id without format
        if ([...existingKeys].some((k) => k.startsWith(filename.toLowerCase() + ".")))
          continue;
        missing.push({
          src: url,
          alt: `${best.name} — view`,
          width: r.width,
          height: r.height,
          slot: slotFromFilename(filename) ?? slotFromFilename(r.display_name),
          filename: `${filename}.${r.format}`,
        });
      }

      const entry = {
        folderPath,
        slug: best.slug,
        score: bestScore,
        cloudinaryCount: resources.length,
        dbCount: (best.images || []).length,
        missingCount: missing.length,
        missingFiles: missing.map((m) => m.filename),
      };

      if (!missing.length) {
        report.push(entry);
        continue;
      }

      if (!dryRun) {
        const images = (best.images || []).map(plain);
        // Append missing, then sort by slot number when available (keep current primary first)
        const primary = images[0];
        const rest = images.slice(1);
        for (const m of missing) {
          rest.push({
            src: m.src,
            alt: m.alt,
            width: m.width,
            height: m.height,
          });
        }

        const withSlot = rest.map((img) => ({
          img,
          slot: slotFromFilename(fileKey(img.src)) ?? 999,
        }));
        withSlot.sort((a, b) => a.slot - b.slot);

        // Keep existing primary at front
        const next = [plain(primary), ...withSlot.map((x) => x.img)].filter(
          (img, idx, arr) =>
            arr.findIndex((i) => i.src === img.src) === idx,
        );

        // Re-number alts lightly
        const base = String(best.name || best.slug).trim();
        next[0].alt = `${base} — primary`;
        for (let i = 1; i < next.length; i += 1) {
          const name =
            String(next[i].alt || "")
              .replace(/\s*—\s*(lifestyle|view\s*\d+|primary)\s*$/i, "")
              .trim() || base;
          next[i].alt = `${name} — view ${i + 1}`;
        }

        await Product.updateOne({ _id: best._id }, { $set: { images: next } });
        // refresh in-memory
        best.images = next;
        updated += 1;
        addedImages += missing.length;
      }

      report.push(entry);
    }
  }

  await processFolders(sofaFolders, "sofas");
  await processFolders(bedFolders, "beds");

  console.log("\n=== REPORT ===");
  const withMissing = report.filter((r) => r.missingCount > 0);
  const unmatched = report.filter((r) => r.unmatched);
  const errors = report.filter((r) => r.error);

  console.log("Folders checked:", report.length);
  console.log("With missing:", withMissing.length);
  console.log("Unmatched:", unmatched.length);
  console.log("Errors:", errors.length);
  console.log("Products updated:", updated);
  console.log("Images added:", addedImages);

  withMissing.forEach((r) =>
    console.log(
      "MISSING",
      r.slug,
      `(${r.missingCount})`,
      r.missingFiles.join(", "),
      `| cloud ${r.cloudinaryCount} db was ${r.dbCount}`,
    ),
  );
  unmatched.forEach((r) =>
    console.log("UNMATCHED", r.folderPath, "assets", r.resources, "best", r.bestSlug, r.bestScore),
  );
  errors.forEach((r) => console.log("ERROR", r.folderPath, r.error));

  fs.writeFileSync(
    path.join(__dirname, "sync-cloudinary-folders-report.json"),
    JSON.stringify({ dryRun, updated, addedImages, report }, null, 2),
  );
  console.log("\nWrote scripts/sync-cloudinary-folders-report.json");

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
