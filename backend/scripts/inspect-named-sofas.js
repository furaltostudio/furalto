require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

const SLUGS = [
  "aura-veil-sofa",
  "cloud-curve-sofa",
  "mono-block-sofa",
  "urban-loft-sofa",
  "nova-modular-sofa",
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const slug of SLUGS) {
    const p = await Product.findOne({
      $or: [
        { slug },
        { name: new RegExp(slug.replace(/-/g, ".*"), "i") },
      ],
    })
      .select("slug name images")
      .lean();

    // Also try by name
    const byName = p
      ? null
      : await Product.findOne({
          name: new RegExp(
            slug
              .split("-")
              .slice(0, -1)
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" "),
            "i",
          ),
        })
          .select("slug name images")
          .lean();

    const product = p || byName;
    if (!product) {
      console.log("NOT FOUND", slug);
      continue;
    }
    console.log("\n" + product.name + " (" + product.slug + ")");
    (product.images || []).forEach((img, i) =>
      console.log(`  ${i + 1}. ${(img.src || "").split("/").pop()} | ${img.src}`),
    );
  }

  // Fuzzy name search
  console.log("\n--- name search ---");
  const names = [
    "Aura Veil",
    "Cloud Curve",
    "Mono Block",
    "Urban Loft",
    "Nova Modular",
  ];
  for (const n of names) {
    const hits = await Product.find({ name: new RegExp(n, "i") })
      .select("slug name")
      .lean();
    console.log(n, "→", hits.map((h) => h.slug).join(", ") || "none");
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
