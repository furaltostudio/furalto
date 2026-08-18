require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");

const OUTDATED = [
  "milano-sectional",
  "palermo-accent-chair",
  "aria-coffee-table",
  "monarch-sideboard",
  "vela-table-lamp",
  "calais-nightstand",
  "heritage-wardrobe",
  "heritage-dining-table",
  "arc-pendant",
  "riviera-outdoor-sofa",
  "coastal-lounge-chair",
  "marble-outdoor-table",
  "terrace-dining-set",
  "arc-outdoor-sectional",
  "skyline-outdoor-bar",
  "arc-curved-sofa",
  "milano-modular-sofa",
];

function formatInr(amount) {
  const abs = Math.round(Math.abs(amount));
  const digits = String(abs);
  if (digits.length <= 3) return `₹${digits}`;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${rest},${lastThree}`;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("--- outdated slug check ---");
  for (const s of OUTDATED) {
    const p = await Product.findOne({ slug: s }).select("slug isActive category").lean();
    console.log(s, p ? `${p.category} active=${p.isActive}` : "MISSING");
  }

  const sofas = await Product.find({ category: "sofas", isActive: true })
    .select("slug name price compareAtPrice images")
    .sort({ name: 1 })
    .lean();
  const beds = await Product.find({ category: "beds", isActive: true })
    .select("slug name price compareAtPrice images")
    .sort({ name: 1 })
    .lean();

  console.log("\n--- SOFAS ---");
  for (const p of sofas) {
    console.log(
      p.slug,
      formatInr(p.price),
      (p.images?.[0]?.src || "").split("/").pop(),
    );
  }
  console.log("\n--- BEDS ---");
  for (const p of beds) {
    console.log(
      p.slug,
      formatInr(p.price),
      (p.images?.[0]?.src || "").split("/").pop(),
    );
  }

  // Pick strong lifestyle images for slides
  const pick = [
    "aura-veil-sofa",
    "mono-block-sofa",
    "urban-loft-sofa",
    "nova-modular-sofa",
    "serene-curve-sofa",
    "cloud-curve-sofa",
    "verda-softedge-bed",
    "luna-orbit-bed",
    "aeris-bed",
    "noire-arch-panel-bed",
    "nova-radiant-bed",
    "linear-edge-bed",
  ];
  console.log("\n--- slide candidates ---");
  for (const slug of pick) {
    const p = await Product.findOne({ slug, isActive: true })
      .select("slug name price compareAtPrice images category")
      .lean();
    if (!p) {
      console.log("MISSING", slug);
      continue;
    }
    const img = p.images?.[0];
    console.log(
      JSON.stringify({
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: formatInr(p.price),
        image: img?.src,
        w: img?.width,
        h: img?.height,
      }),
    );
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
