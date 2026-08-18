/**
 * Seed Product.scaleImageIndex from the frontend SCALE_IMAGE_INDEX map
 * so admin + storefront stay aligned after migrating off hardcoded defaults.
 *
 * Usage: node scripts/seed-scale-image-index.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

/** Keep in sync with frontend/src/lib/products/scale.ts SCALE_IMAGE_INDEX */
const SCALE_IMAGE_INDEX = {
  "arcella-sofa": 1,
  "aura-veil-sofa": 4,
  "arc-curve-sofa": 1,
  "arc-curved-sofa": 1,
  "cloud-embrace-lounge-set": 3,
  "cloud-wave-sofa": 0,
  "cloud-curve-sofa": 5,
  "luna-cloud-curve-sofa": 0,
  "flowline-sofa": 0,
  "mono-block-sofa": 4,
  "serene-curve-sofa": 0,
  "urban-loft-sofa": 4,
  "aeris-bed": 3,
  "aura-softline-bed": 3,
  "aurelia-wing-bed": 3,
  "aurelio-panel-bed": 3,
  "aurelio-wing-bed": 3,
  "aurelle-bed": 3,
  "aurum-soft-edge-bed": 3,
  "duo-arc-bed": 3,
  "gridlounge-bed": 3,
  "linear-edge-bed": 3,
  "lumina-arc-bed": 3,
  "luna-orbit-bed": 2,
  "montero-bed": 3,
  "noir-haven-bed": 3,
  "nova-radiant-bed": 3,
  "noir-shell-bed": 3,
  "novara-panel-bed": 3,
  "obsidian-block-bed": 3,
  "terra-block-bed": 3,
  "velora-layer-bed": 3,
  "verda-softedge-bed": 3,
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  let updated = 0;
  let skipped = 0;

  for (const [slug, index] of Object.entries(SCALE_IMAGE_INDEX)) {
    const product = await Product.findOne({ slug }).select("slug images scaleImageIndex");
    if (!product) {
      console.log("missing", slug);
      skipped += 1;
      continue;
    }

    const max = (product.images || []).length - 1;
    if (max < 0 || index > max) {
      console.log("out-of-range", slug, index, "max", max);
      skipped += 1;
      continue;
    }

    if (product.scaleImageIndex === index) {
      skipped += 1;
      continue;
    }

    product.scaleImageIndex = index;
    await product.save();
    updated += 1;
    console.log("set", slug, "→", index);
  }

  console.log(`done. updated=${updated} skipped=${skipped}`);
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
