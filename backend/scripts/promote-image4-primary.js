/**
 * Sofas + beds: put gallery image #4 (filename 4_/4v_ or 4th slot) first.
 * Run: node scripts/promote-image4-primary.js
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

function findImage4Index(images = []) {
  const byName = images.findIndex((img) =>
    /\/4v?_[^/?#]+\.(jpe?g|webp|png)/i.test(img.src || ""),
  );
  if (byName >= 0) return byName;
  if (images.length >= 4) return 3;
  return -1;
}

function promoteImage4(images = []) {
  if (!images.length) return images;

  const pick = findImage4Index(images);
  if (pick < 0) return images.map(plain);
  if (pick === 0) return images.map(plain);

  const chosen = plain(images[pick]);
  const base =
    String(chosen.alt || "")
      .replace(/\s*—\s*(lifestyle|view\s*\d+|primary)\s*$/i, "")
      .trim() || "Product";
  chosen.alt = `${base} — primary`;

  const rest = images
    .filter((_, index) => index !== pick)
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

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  }).select("slug category images");

  let changed = 0;

  for (const product of products) {
    const before = (product.images || []).map((img) => img.src).join("|");
    const next = promoteImage4(product.images || []);
    const after = next.map((img) => img.src).join("|");
    if (before === after) continue;

    await Product.updateOne({ _id: product._id }, { $set: { images: next } });
    changed += 1;
    console.log(
      product.category,
      product.slug,
      "→",
      next[0]?.src?.split("/").pop(),
    );
  }

  console.log(`Done. Updated ${changed}/${products.length}.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
