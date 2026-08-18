require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

const SLUGS = [
  "mono-block-sofa",
  "urban-loft-sofa",
  "nova-modular-sofa",
  "cloud-wave-sofa",
];

function plain(img) {
  return {
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const slug of SLUGS) {
    const product = await Product.findOne({ slug }).select("slug images");
    if (!product) {
      console.log("missing", slug);
      continue;
    }
    console.log("\n", slug);
    (product.images || []).forEach((img, i) =>
      console.log(" ", i + 1, img.src?.split("/").pop()),
    );

    const images = (product.images || []).map(plain);
    if (images.length < 4) {
      console.log("  only", images.length, "images — cannot promote slot 4");
      continue;
    }

    // Force 4th slot (index 3) to front regardless of filename.
    const pick = 3;
    const chosen = { ...images[pick] };
    const rest = images.filter((_, i) => i !== pick);
    const next = [chosen, ...rest];
    await Product.updateOne({ _id: product._id }, { $set: { images: next } });
    console.log("  → forced slot4", next[0].src.split("/").pop());
  }

  await mongoose.disconnect();
})();
