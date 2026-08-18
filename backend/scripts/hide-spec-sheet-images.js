/**
 * Hide catalog dimension/spec sheets (typically Cloudinary files named 5_*.png).
 * Usage: node scripts/hide-spec-sheet-images.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const isSpecSheetImage = (image = {}) => {
  const src = String(image.src || "");
  const alt = String(image.alt || "");
  if (/\/5[_-][^/?#]+\.png(?:\?|$)/i.test(src)) return true;
  return /spec|dimension|measure|sheet|diagram|blueprint|infographic/i.test(`${alt} ${src}`);
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furalto");
  const Product = require("../src/models/Product.model");
  const products = await Product.find({}).select("slug name images scaleImageIndex");

  let productsTouched = 0;
  let imagesHidden = 0;
  let alreadyHidden = 0;
  const samples = [];

  for (const product of products) {
    let changed = false;
    const images = product.images || [];

    images.forEach((image, index) => {
      if (!isSpecSheetImage(image)) return;
      if (image.hidden) {
        alreadyHidden += 1;
        return;
      }
      image.hidden = true;
      imagesHidden += 1;
      changed = true;
      if (samples.length < 12) {
        samples.push({
          slug: product.slug,
          index,
          file: String(image.src || "").split("/").pop(),
          alt: image.alt,
        });
      }
    });

    // If the Size guide pointed at a now-hidden image, clear it.
    if (
      changed &&
      product.scaleImageIndex != null &&
      images[product.scaleImageIndex]?.hidden
    ) {
      product.scaleImageIndex = null;
    }

    if (changed) {
      productsTouched += 1;
      await product.save();
    }
  }

  console.log(
    JSON.stringify(
      {
        productsTouched,
        imagesHidden,
        alreadyHidden,
        samples,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
