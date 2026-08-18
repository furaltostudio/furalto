const fs = require("fs");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

const BED_ROOT = "C:\\Users\\rahul\\Downloads\\Furalto_Bed\\Furalto_Bed";
const SOFA_ROOT = "C:\\Users\\rahul\\Downloads\\Furalto_Sofa\\Furalto_Sofa";

function slugify(name) {
  return String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function listLocalProducts(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "__MACOSX")
    .map((d) => {
      const dir = path.join(root, d.name);
      const files = fs
        .readdirSync(dir)
        .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
      const slots = files
        .map((f) => {
          const m = f.match(/^(\d+)/);
          return m ? Number(m[1]) : null;
        })
        .filter((n) => n != null)
        .sort((a, b) => a - b);
      return {
        folderName: d.name,
        slugGuess: slugify(d.name),
        files,
        slots,
        count: files.length,
      };
    });
}

function dbSlots(images = []) {
  return images
    .map((img) => {
      const file = String(img.src || "").split("/").pop() || "";
      const m = file.match(/^(\d+)v?_/i) || file.match(/^(\d+)\./);
      return m ? Number(m[1]) : null;
    })
    .filter((n) => n != null);
}

function scoreMatch(local, product) {
  const a = local.slugGuess;
  const b = product.slug;
  if (a === b) return 100;
  if (b.includes(a) || a.includes(b)) return 80;
  const an = a.replace(/-sofa$|-bed$/, "");
  const bn = b.replace(/-sofa$|-bed$/, "");
  if (an === bn) return 90;
  if (bn.includes(an) || an.includes(bn)) return 70;
  // token overlap
  const at = new Set(an.split("-").filter(Boolean));
  const bt = new Set(bn.split("-").filter(Boolean));
  let inter = 0;
  for (const t of at) if (bt.has(t)) inter += 1;
  return inter * 15;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug name category images")
    .lean();

  const localSofas = listLocalProducts(SOFA_ROOT);
  const localBeds = listLocalProducts(BED_ROOT);

  console.log("Local sofas:", localSofas.length, "beds:", localBeds.length);
  console.log("DB sofas+beds:", products.length);

  const gaps = [];

  function analyze(locals, category) {
    const pool = products.filter((p) => p.category === category);
    for (const local of locals) {
      let best = null;
      let bestScore = 0;
      for (const p of pool) {
        const s = scoreMatch(local, p);
        if (s > bestScore) {
          bestScore = s;
          best = p;
        }
      }
      if (!best || bestScore < 60) {
        gaps.push({
          type: "unmatched-local",
          category,
          folder: local.folderName,
          slots: local.slots,
          count: local.count,
        });
        continue;
      }

      const have = new Set(dbSlots(best.images));
      const missingSlots = local.slots.filter((s) => !have.has(s));
      const extraInDb = [...have].filter((s) => !local.slots.includes(s));

      if (missingSlots.length || local.count !== (best.images || []).length) {
        gaps.push({
          type: "slot-gap",
          category,
          folder: local.folderName,
          slug: best.slug,
          score: bestScore,
          localSlots: local.slots,
          dbSlots: [...have].sort((a, b) => a - b),
          missingSlots,
          extraInDb,
          localCount: local.count,
          dbCount: (best.images || []).length,
          dbFiles: (best.images || []).map((i) =>
            String(i.src || "").split("/").pop(),
          ),
        });
      }
    }
  }

  analyze(localSofas, "sofas");
  analyze(localBeds, "beds");

  console.log("\nGaps:", gaps.length);
  for (const g of gaps) {
    if (g.type === "unmatched-local") {
      console.log("UNMATCHED", g.category, g.folder, "slots", g.slots.join(","));
    } else {
      console.log(
        "GAP",
        g.slug,
        "| local",
        g.localSlots.join(","),
        "| db",
        g.dbSlots.join(","),
        "| missing",
        g.missingSlots.join(",") || "-",
        "| counts",
        g.localCount,
        "vs",
        g.dbCount,
      );
    }
  }

  // DB products with no local match
  const matchedSlugs = new Set(
    gaps.filter((g) => g.slug).map((g) => g.slug),
  );
  // rebuild matched from full analyze
  const allMatched = new Set();
  for (const local of [...localSofas, ...localBeds]) {
    const cat = localSofas.includes(local) ? "sofas" : "beds";
    const pool = products.filter((p) => p.category === cat);
    let best = null;
    let bestScore = 0;
    for (const p of pool) {
      const s = scoreMatch(local, p);
      if (s > bestScore) {
        bestScore = s;
        best = p;
      }
    }
    if (best && bestScore >= 60) allMatched.add(best.slug);
  }
  const dbOnly = products.filter((p) => !allMatched.has(p.slug));
  console.log("\nDB without strong local match:", dbOnly.length);
  dbOnly.forEach((p) =>
    console.log(" ", p.category, p.slug, "imgs", (p.images || []).length),
  );

  fs.writeFileSync(
    path.join(__dirname, "image-sync-gaps.json"),
    JSON.stringify({ gaps, dbOnly: dbOnly.map((p) => p.slug) }, null, 2),
  );
  console.log("\nWrote scripts/image-sync-gaps.json");

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
