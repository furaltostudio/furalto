require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || "m1zm0cpq",
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const slug of ["aeris-bed", "aeris-upholstered-bed", "arc-curve-sofa", "nova-modular-sofa", "serene-curve-sofa"]) {
    const p = await Product.findOne({ slug }).select("slug name images").lean();
    if (!p) {
      console.log("NO", slug);
      continue;
    }
    console.log("\n" + p.name + " (" + p.slug + ")");
    (p.images || []).forEach((i) => console.log(" ", (i.src || "").split("/").pop()));
  }

  // List both Aeris folders
  for (const folder of [
    "furalto/Furalto_Bed/AERIS BED",
    "furalto/Furalto_Bed/Aeris Upholstered Bed",
    "furalto/Furalto_Sofa/Arce Curve Sofa",
    "furalto/Furalto_Sofa/NOVA MODULAR SOFA",
    "furalto/Furalto_Sofa/SERENE CURVE SOFA",
  ]) {
    const page = await cloudinary.api.resources_by_asset_folder(folder, {
      max_results: 50,
    });
    console.log("\nCLOUD", folder);
    (page.resources || []).forEach((r) =>
      console.log(" ", r.public_id + "." + r.format, r.secure_url),
    );
  }

  // Search DB for arc
  const arcs = await Product.find({ name: /arc/i, category: "sofas" })
    .select("slug name")
    .lean();
  console.log("\nDB arc sofas:", arcs);

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
