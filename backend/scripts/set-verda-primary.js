require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

const SLUG = "verda-softedge-bed";
const SRC =
  "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785860969/1_tx2wjv.jpg";

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
  const p = await Product.findOne({ slug: SLUG }).select("slug name images");
  if (!p) throw new Error("product not found");

  const images = (p.images || []).map(plain);
  const file = SRC.split("/").pop();
  let idx = images.findIndex((i) => i.src === SRC);
  if (idx < 0) idx = images.findIndex((i) => (i.src || "").includes(file));

  const base = String(p.name || SLUG).trim();
  let next;
  if (idx >= 0) {
    const chosen = { ...images[idx], alt: `${base} — primary` };
    next = [
      chosen,
      ...images
        .filter((_, i) => i !== idx)
        .map((img, i) => {
          const name =
            String(img.alt || "")
              .replace(/\s*—\s*(lifestyle|view\s*\d+|primary)\s*$/i, "")
              .trim() || base;
          return { ...img, alt: `${name} — view ${i + 2}` };
        }),
    ];
  } else {
    next = [{ src: SRC, alt: `${base} — primary` }, ...images];
  }

  await Product.updateOne({ _id: p._id }, { $set: { images: next } });
  console.log(p.name, "→", next[0].src);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
