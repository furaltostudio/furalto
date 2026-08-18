/**
 * Attach confirmed orphan Cloudinary 4_ lifestyle shots and promote to primary.
 * Matches verified by product silhouette + upload version proximity.
 *
 * Run: node scripts/attach-orphan-image4.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

const CLOUD = "m1zm0cpq";

/** @type {Record<string, { publicId: string; version: number; width: number; height: number; format: string }>} */
const ATTACH = {
  "mono-block-sofa": {
    publicId: "4_tlnxcw",
    version: 1785599472,
    width: 2500,
    height: 1667,
    format: "jpg",
  },
  "urban-loft-sofa": {
    publicId: "4_iggiq7",
    version: 1785599482,
    width: 2500,
    height: 1875,
    format: "jpg",
  },
  "nova-modular-sofa": {
    publicId: "4_vdutq8",
    version: 1785599479,
    width: 2500,
    height: 1668,
    format: "jpg",
  },
};

function srcFor(meta) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/v${meta.version}/${meta.publicId}.${meta.format}`;
}

function plain(img) {
  return {
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

function withoutExistingFour(images = []) {
  return images.filter((img) => !/\/4v?_/.test(img.src || ""));
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const [slug, meta] of Object.entries(ATTACH)) {
    const product = await Product.findOne({ slug }).select("slug name images");
    if (!product) {
      console.log("MISSING product", slug);
      continue;
    }

    const fourSrc = srcFor(meta);
    const baseAlt = String(product.name || slug).trim();
    const four = {
      src: fourSrc,
      alt: `${baseAlt} — primary`,
      width: meta.width,
      height: meta.height,
    };

    const rest = withoutExistingFour(product.images || []).map((img, index) => {
      const next = plain(img);
      const name =
        String(next.alt || "")
          .replace(/\s*—\s*(lifestyle|view\s*\d+|primary)\s*$/i, "")
          .trim() || baseAlt;
      next.alt = `${name} — view ${index + 2}`;
      return next;
    });

    // Drop duplicate if same public id already present under another path
    const filtered = rest.filter(
      (img) => !(img.src || "").includes(`${meta.publicId}.`),
    );

    const nextImages = [four, ...filtered];
    await Product.updateOne(
      { _id: product._id },
      { $set: { images: nextImages } },
    );

    console.log(
      "OK",
      slug,
      "→ primary",
      meta.publicId + "." + meta.format,
      `(${nextImages.length} images)`,
    );
  }

  // cloud-wave: no true 4_ on CDN — promote best lifestyle-ish existing slot
  // Prefer 5_* (detail with floor context) over white studio 1_/2_/3_
  const cloud = await Product.findOne({ slug: "cloud-wave-sofa" }).select(
    "slug name images",
  );
  if (cloud) {
    const images = (cloud.images || []).map(plain);
    const fiveIdx = images.findIndex((img) => /\/5_/.test(img.src || ""));
    if (fiveIdx > 0) {
      const chosen = { ...images[fiveIdx] };
      const base = String(cloud.name || "Cloud Wave Sofa").trim();
      chosen.alt = `${base} — primary`;
      const rest = images
        .filter((_, i) => i !== fiveIdx)
        .map((img, index) => {
          const next = { ...img };
          const name =
            String(next.alt || "")
              .replace(/\s*—\s*(lifestyle|view\s*\d+|primary)\s*$/i, "")
              .trim() || base;
          next.alt = `${name} — view ${index + 2}`;
          return next;
        });
      await Product.updateOne(
        { _id: cloud._id },
        { $set: { images: [chosen, ...rest] } },
      );
      console.log(
        "OK cloud-wave-sofa → primary (no CDN 4_; used 5_)",
        chosen.src.split("/").pop(),
      );
    } else {
      console.log("cloud-wave-sofa: no 5_ to promote");
    }
  }

  // Final audit
  const all = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug category images")
    .lean();

  let withFour = 0;
  let primaryFour = 0;
  const gaps = [];
  for (const p of all) {
    const imgs = p.images || [];
    const hasFour = imgs.some((i) => /\/4v?_/.test(i.src || ""));
    const primaryIsFour = /\/4v?_/.test(imgs[0]?.src || "");
    if (hasFour) withFour += 1;
    if (primaryIsFour) primaryFour += 1;
    if (!primaryIsFour) {
      gaps.push(
        `${p.slug}: primary=${(imgs[0]?.src || "").split("/").pop()} has4=${hasFour}`,
      );
    }
  }

  console.log(`\nAudit: ${primaryFour}/${all.length} primary is 4_`);
  console.log(`Audit: ${withFour}/${all.length} have a 4_ file`);
  if (gaps.length) {
    console.log("Still not 4_ primary:");
    gaps.forEach((g) => console.log(" ", g));
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
