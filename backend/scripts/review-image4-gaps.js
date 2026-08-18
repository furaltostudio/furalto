require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const slugs = [
    "cloud-wave-sofa",
    "mono-block-sofa",
    "nova-modular-sofa",
    "urban-loft-sofa",
    "aura-veil-sofa",
    "aeris-bed",
    "arc-curve-sofa",
  ];

  for (const slug of slugs) {
    const p = await Product.findOne({ slug }).select("slug images").lean();
    console.log("\n" + slug);
    (p?.images || []).forEach((img, i) => console.log(i + 1, img.src));
  }

  const all = await Product.find({
    category: { $in: ["sofas", "beds"] },
    isActive: true,
  })
    .select("slug images")
    .lean();

  console.log("\n--- 4_/4v_ not first ---");
  for (const p of all) {
    const idx = (p.images || []).findIndex((i) => /\/4v?_/.test(i.src));
    if (idx > 0) {
      console.log(
        "NOT FIRST",
        p.slug,
        "at",
        idx + 1,
        p.images[idx].src.split("/").pop(),
      );
    }
  }

  console.log("\n--- no 4_/4v_ at all ---");
  for (const p of all) {
    const has = (p.images || []).some((i) => /\/4v?_/.test(i.src));
    if (!has) {
      console.log(
        p.slug,
        "→",
        (p.images || []).map((i) => i.src.split("/").pop()).join(", "),
      );
    }
  }

  await mongoose.disconnect();
})();
