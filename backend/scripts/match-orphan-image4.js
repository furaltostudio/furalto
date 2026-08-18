require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

function fileName(src = "") {
  return String(src).split("/").pop() || "";
}

function versionOf(src = "") {
  const m = String(src).match(/\/upload\/(v\d+)\//);
  return m ? Number(m[1].slice(1)) : 0;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug category images")
    .lean();

  const used = new Set();
  for (const p of products) {
    for (const img of p.images || []) used.add(fileName(img.src).toLowerCase());
  }

  let nextCursor;
  const fours = [];
  do {
    let q = cloudinary.search
      .expression("filename:4_* OR filename:4v_*")
      .max_results(100);
    if (nextCursor) q = q.next_cursor(nextCursor);
    const page = await q.execute();
    fours.push(...(page.resources || []));
    nextCursor = page.next_cursor;
  } while (nextCursor);

  const orphanFours = fours.filter((r) => !used.has(fileName(r.secure_url).toLowerCase()));

  console.log("Cloudinary 4_/4v_ total:", fours.length);
  console.log("Orphan 4_ count:", orphanFours.length);
  orphanFours.forEach((r) =>
    console.log(" ", fileName(r.secure_url), "v" + r.version, r.uploaded_at),
  );

  const missing = products.filter(
    (p) => !(p.images || []).some((i) => /\/4v?_/.test(i.src || "")),
  );

  console.log("\nMissing products + nearby orphans:");
  for (const p of missing) {
    const versions = (p.images || []).map((i) => versionOf(i.src)).filter(Boolean);
    const minV = Math.min(...versions);
    const maxV = Math.max(...versions);
    const candidates = orphanFours.filter((r) => {
      const v = Number(r.version);
      return v >= minV - 30 && v <= maxV + 30;
    });
    console.log("\n" + p.slug, "range", minV, maxV);
    console.log("  images:", (p.images || []).map((i) => fileName(i.src)).join(", "));
    console.log(
      "  candidates:",
      candidates.map((r) => fileName(r.secure_url) + "@v" + r.version).join(", ") || "none",
    );
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
