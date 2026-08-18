/**
 * Reorder product galleries so the full product hero (1_*.jpg / view 1) sits first.
 * Demotes trailing cutouts and avoids promoting mid-gallery detail crops as primary.
 *
 * Run: node scripts/promote-listing-images.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

function isSpecSheet(img) {
  return /spec|dimension|measure|sheet|diagram/i.test(
    `${img.alt || ""} ${img.src || ""}`,
  );
}

function isFullProductHero(img) {
  // Filename is the source of truth — alts are often renumbered incorrectly.
  return /\/1_[^/?#]+\.(jpe?g|webp)/i.test(img.src || "");
}

function isLikelyCutout(img) {
  return (
    /\.png(\?|$)/i.test(img.src || "") ||
    /cutout|isolated|transparent/i.test(`${img.alt || ""} ${img.src || ""}`)
  );
}

function syncScore(img, index, total) {
  if (isSpecSheet(img)) return -1000;
  let score = 0;
  if (isFullProductHero(img)) score += 100;
  if (/lifestyle|interior|styled/i.test(`${img.alt || ""}`) && !isFullProductHero(img)) {
    score += 20;
  }
  if (isLikelyCutout(img)) score -= 50;
  if (/\.(jpe?g|webp)(\?|$)/i.test(img.src || "")) score += 8;
  score += Math.max(0, 5 - index);
  void total;
  return score;
}

function plainImage(img) {
  return {
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

function reorderImages(images = []) {
  const indexed = images.map((img, index) => ({ img: plainImage(img), index }));
  indexed.sort((a, b) => {
    const scoreDiff =
      syncScore(b.img, b.index, images.length) -
      syncScore(a.img, a.index, images.length);
    if (scoreDiff !== 0) return scoreDiff;
    return a.index - b.index;
  });

  return indexed.map(({ img }) => {
    const next = { ...img };
    // Clean mistaken “lifestyle” tags on non-hero frames so detectors stay honest.
    if (
      !isFullProductHero(next) &&
      /—\s*lifestyle\s*$/i.test(String(next.alt || ""))
    ) {
      next.alt = String(next.alt).replace(/\s*—\s*lifestyle\s*$/i, "").trim();
    }
    return next;
  });
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({ isActive: true }).select(
    "slug name images",
  );
  let changed = 0;

  for (const product of products) {
    const before = (product.images || []).map((img) => img.src).join("|");
    const nextImages = reorderImages(product.images || []);
    const after = nextImages.map((img) => img.src).join("|");
    if (before === after) continue;

    await Product.updateOne(
      { _id: product._id },
      { $set: { images: nextImages } },
    );
    changed += 1;
    const first = nextImages[0]?.src?.split("/").pop();
    console.log(`promoted ${product.slug} → ${first}`);
  }

  console.log(`Done. Updated ${changed}/${products.length} products.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
