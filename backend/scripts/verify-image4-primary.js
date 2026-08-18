require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const slugs = [
    "mono-block-sofa",
    "urban-loft-sofa",
    "nova-modular-sofa",
    "cloud-wave-sofa",
  ];

  for (const slug of slugs) {
    const p = await Product.findOne({ slug }).select("slug images").lean();
    console.log("\n" + slug);
    (p?.images || []).forEach((img, i) =>
      console.log(`  ${i + 1}. ${(img.src || "").split("/").pop()}`),
    );
  }

  // Any sofa/bed where primary does not look like 4_/4v_ (except known cloud-wave)
  const all = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug category images")
    .lean();

  console.log("\n--- non-4 primary ---");
  for (const p of all) {
    const first = p.images?.[0]?.src || "";
    if (!/\/4v?_/.test(first)) {
      console.log(p.slug, "→", first.split("/").pop());
    }
  }

  // Has 4_ but not first
  console.log("\n--- 4_ buried ---");
  for (const p of all) {
    const imgs = p.images || [];
    const idx = imgs.findIndex((i) => /\/4v?_/.test(i.src || ""));
    if (idx > 0) console.log(p.slug, "at", idx + 1);
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
