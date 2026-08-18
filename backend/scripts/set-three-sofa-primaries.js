require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

const UPDATES = [
  [
    "cloud-wave-sofa",
    "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599460/1_mrs7vv.webp",
  ],
  [
    "cloud-curve-sofa",
    "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599457/1_omsc46.jpg",
  ],
  [
    "aura-veil-sofa",
    "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599453/4_ro7m3o.webp",
  ],
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

  for (const [slug, src] of UPDATES) {
    const p = await Product.findOne({ slug }).select("slug name images");
    if (!p) {
      console.log("MISSING", slug);
      continue;
    }

    const images = (p.images || []).map(plain);
    const file = src.split("/").pop();
    let idx = images.findIndex((i) => i.src === src);
    if (idx < 0) {
      idx = images.findIndex((i) => (i.src || "").includes(file));
    }

    const base = String(p.name || slug).trim();
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
      next = [{ src, alt: `${base} — primary` }, ...images];
    }

    await Product.updateOne({ _id: p._id }, { $set: { images: next } });
    console.log(p.name, "→", next[0].src);
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
