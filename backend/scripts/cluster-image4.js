require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

function fileName(src = "") {
  return String(src).split("/").pop() || "";
}

function versionOf(src = "") {
  const m = String(src).match(/\/upload\/(v\d+)\//);
  return m ? Number(m[1].slice(1)) : 0;
}

const TARGETS = [
  "mono-block-sofa",
  "urban-loft-sofa",
  "nova-modular-sofa",
  "cloud-wave-sofa",
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({ slug: { $in: TARGETS } })
    .select("slug name images")
    .lean();

  // All resources near each product's versions
  for (const p of products) {
    const versions = (p.images || []).map((i) => versionOf(i.src)).filter(Boolean);
    const minV = Math.min(...versions) - 5;
    const maxV = Math.max(...versions) + 15;
    console.log("\n===", p.slug, "===");
    console.log("DB:", (p.images || []).map((i) => `${fileName(i.src)}@v${versionOf(i.src)}`).join(", "));

    // Search by version isn't direct; list recent and filter
    // Use admin API resources by prefix empty with max
    const page = await cloudinary.search
      .expression(`uploaded_at>2026-08-01 AND uploaded_at<2026-08-02`)
      .sort_by("uploaded_at", "asc")
      .max_results(100)
      .execute();

    // Filter by version window
    const nearby = (page.resources || []).filter((r) => {
      const v = Number(r.version);
      return v >= minV && v <= maxV;
    });
    nearby.forEach((r) =>
      console.log(
        " ",
        "v" + r.version,
        fileName(r.secure_url),
        r.bytes,
        `${r.width}x${r.height}`,
      ),
    );
  }

  // Also dump orphan fours with dimensions for visual matching later
  console.log("\n=== Orphan 4_ details ===");
  for (const id of ["4_tlnxcw", "4_vdutq8", "4_iggiq7", "4_j9bxsy"]) {
    const r = await cloudinary.api.resource(id, { resource_type: "image" });
    console.log(
      id,
      "v" + r.version,
      `${r.width}x${r.height}`,
      r.format,
      r.secure_url,
    );
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
