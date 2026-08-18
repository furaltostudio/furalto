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
  return String(src).split("/").pop()?.toLowerCase() || "";
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({ isActive: true })
    .select("slug images")
    .lean();
  const used = new Set();
  for (const p of products) {
    for (const img of p.images || []) used.add(fileName(img.src));
  }

  const page = await cloudinary.search
    .expression("filename:4_* AND format:webp")
    .max_results(50)
    .execute();

  console.log("webp 4_ orphan check:");
  for (const r of page.resources || []) {
    const name = fileName(r.secure_url);
    console.log(
      used.has(name) ? "USED" : "ORPHAN",
      name,
      "v" + r.version,
      `${r.width}x${r.height}`,
      r.secure_url,
    );
  }

  // Also orphan jpg fours again
  const jpg = await cloudinary.search
    .expression("filename:4_* AND format:jpg")
    .max_results(100)
    .execute();
  const orphanJpg = (jpg.resources || []).filter(
    (r) => !used.has(fileName(r.secure_url)),
  );
  console.log("\nOrphan jpg 4_:");
  orphanJpg.forEach((r) =>
    console.log(" ", fileName(r.secure_url), "v" + r.version, `${r.width}x${r.height}`),
  );

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
