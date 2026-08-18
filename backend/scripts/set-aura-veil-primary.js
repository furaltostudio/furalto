/**
 * Promote Aura Veil Sofa gallery image #4 (index 3) to primary.
 * Run: node scripts/set-aura-veil-primary.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

function plain(img) {
  return {
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

function promoteIndex(images, pickIndex, productName) {
  if (pickIndex < 0 || pickIndex >= images.length) return null;
  const base = String(productName || "Product").trim();
  const chosen = plain(images[pickIndex]);
  chosen.alt = `${base} — primary`;
  const rest = images
    .filter((_, i) => i !== pickIndex)
    .map((img, index) => {
      const next = plain(img);
      const name =
        String(next.alt || "")
          .replace(/\s*—\s*(lifestyle|view\s*\d+|primary)\s*$/i, "")
          .trim() || base;
      next.alt = `${name} — view ${index + 2}`;
      return next;
    });
  return [chosen, ...rest];
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const p = await Product.findOne({ slug: "aura-veil-sofa" }).select(
    "slug name images"
  );
  if (!p) throw new Error("aura-veil-sofa missing");

  console.log("Before:");
  (p.images || []).forEach((img, i) => {
    console.log(`  ${i + 1}. ${(img.src || "").split("/").pop()}`);
  });

  const pickIndex = 3; // 4th image (1-based)
  const next = promoteIndex(p.images || [], pickIndex, p.name);
  if (!next) throw new Error(`No image at index ${pickIndex}`);

  await Product.updateOne({ _id: p._id }, { $set: { images: next } });

  console.log("\nAfter:");
  next.forEach((img, i) => {
    console.log(`  ${i + 1}. ${(img.src || "").split("/").pop()}`);
  });
  console.log("\nPrimary →", next[0].src.split("/").pop());

  await mongoose.disconnect();
})().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
