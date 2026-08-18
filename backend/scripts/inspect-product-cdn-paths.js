require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug name category images")
    .lean();

  console.log("count", products.length);
  for (const p of products.slice(0, 3)) {
    console.log("\n", p.category, p.slug, p.name);
    (p.images || []).forEach((img, i) => console.log(" ", i + 1, img.src));
  }

  // Collect unique path prefixes from CDN URLs
  const prefixes = new Map();
  for (const p of products) {
    for (const img of p.images || []) {
      const m = String(img.src || "").match(
        /res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/,
      );
      if (!m) continue;
      const cloud = m[1];
      const publicId = m[2];
      const folder = publicId.includes("/")
        ? publicId.slice(0, publicId.lastIndexOf("/"))
        : "(root)";
      const key = cloud + "|" + folder;
      prefixes.set(key, (prefixes.get(key) || 0) + 1);
    }
  }
  console.log("\nCDN path prefixes:");
  [...prefixes.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, n]) => console.log(n, k));

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
