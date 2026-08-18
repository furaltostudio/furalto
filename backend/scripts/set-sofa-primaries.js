/**
 * Apply user-specified primary images for named sofas.
 * Run: node scripts/set-sofa-primaries.js
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

function promoteBySrc(images, src, productName) {
  const idx = images.findIndex((img) => (img.src || "") === src);
  if (idx >= 0) return promoteIndex(images, idx, productName);

  // Insert if missing, then promote
  const base = String(productName || "Product").trim();
  const inserted = [
    { src, alt: `${base} — primary`, width: undefined, height: undefined },
    ...images.map(plain).filter((img) => !(img.src || "").includes(src.split("/").pop())),
  ];
  return inserted;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // 1) Aura Veil — second image (index 1) on top
  {
    const p = await Product.findOne({ slug: "aura-veil-sofa" }).select(
      "slug name images",
    );
    if (!p) throw new Error("aura-veil-sofa missing");
    const next = promoteIndex(p.images || [], 1, p.name);
    await Product.updateOne({ _id: p._id }, { $set: { images: next } });
    console.log("Aura Veil →", next[0].src.split("/").pop());
  }

  // 2) Cloud Curve — first image on top (index 0 of current gallery)
  //    If 4_ is already first, keep it. User said "first wali".
  {
    const p = await Product.findOne({ slug: "cloud-curve-sofa" }).select(
      "slug name images",
    );
    if (!p) throw new Error("cloud-curve-sofa missing");
    const next = promoteIndex(p.images || [], 0, p.name);
    await Product.updateOne({ _id: p._id }, { $set: { images: next } });
    console.log("Cloud Curve →", next[0].src.split("/").pop(), "(first kept/set)");
  }

  // 3–5) Explicit lifestyle URLs
  const byUrl = [
    [
      "mono-block-sofa",
      "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599472/4_tlnxcw.jpg",
    ],
    [
      "urban-loft-sofa",
      "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599482/4_iggiq7.jpg",
    ],
    [
      "nova-modular-sofa",
      "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599479/4_vdutq8.jpg",
    ],
  ];

  for (const [slug, src] of byUrl) {
    const p = await Product.findOne({ slug }).select("slug name images");
    if (!p) {
      console.log("MISSING", slug);
      continue;
    }
    const next = promoteBySrc(p.images || [], src, p.name);
    await Product.updateOne({ _id: p._id }, { $set: { images: next } });
    console.log(p.name, "→", next[0].src.split("/").pop());
  }

  // Print finals
  const slugs = [
    "aura-veil-sofa",
    "cloud-curve-sofa",
    "mono-block-sofa",
    "urban-loft-sofa",
    "nova-modular-sofa",
  ];
  console.log("\n--- final ---");
  for (const slug of slugs) {
    const p = await Product.findOne({ slug }).select("name images").lean();
    console.log(
      p.name,
      "primary:",
      p.images?.[0]?.src,
    );
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
