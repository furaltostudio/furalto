require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

function fileName(src = "") {
  return String(src).split("/").pop() || "";
}

function isImage4Name(src = "") {
  return /\/4v?_[^/?#]+\.(jpe?g|webp|png)/i.test(src);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug category images")
    .sort({ category: 1, slug: 1 })
    .lean();

  console.log(`Total sofas/beds: ${products.length}\n`);

  const issues = [];
  for (const p of products) {
    const images = p.images || [];
    const first = images[0];
    const firstOk = first && isImage4Name(first.src);
    const named4 = images.filter((img) => isImage4Name(img.src));
    const slot4 = images[3];

    if (!firstOk) {
      issues.push({
        slug: p.slug,
        category: p.category,
        count: images.length,
        primary: fileName(first?.src),
        named4: named4.map((img) => fileName(img.src)),
        all: images.map((img, i) => `${i + 1}:${fileName(img.src)}`),
        slot4: fileName(slot4?.src),
      });
    }
  }

  console.log(`Issues (primary is not 4_/4v_): ${issues.length}\n`);
  for (const issue of issues) {
    console.log("—", issue.category, issue.slug);
    console.log("  count:", issue.count);
    console.log("  primary:", issue.primary);
    console.log("  named4 files:", issue.named4.join(", ") || "(none)");
    console.log("  slot4:", issue.slot4 || "(none)");
    console.log("  all:", issue.all.join(" | "));
  }

  await mongoose.disconnect();
})();
