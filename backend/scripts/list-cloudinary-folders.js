require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || "m1zm0cpq",
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  console.log("cloud:", cloudinary.config().cloud_name);

  try {
    const root = await cloudinary.api.root_folders();
    console.log("\nRoot folders:");
    (root.folders || []).forEach((f) => console.log(" -", f.path || f.name));
  } catch (e) {
    console.log("root_folders error:", e.message || e.error?.message);
  }

  // Try common folder names
  for (const folder of [
    "furalto",
    "furalto/products",
    "Furalto_Sofa",
    "Furalto_Bed",
    "sofa",
    "sofas",
    "bed",
    "beds",
  ]) {
    try {
      const sub = await cloudinary.api.sub_folders(folder);
      console.log(`\nsub_folders(${folder}):`);
      (sub.folders || []).slice(0, 30).forEach((f) =>
        console.log(" -", f.path || f.name),
      );
      if ((sub.folders || []).length > 30) {
        console.log(" ... +" + ((sub.folders || []).length - 30));
      }
    } catch (e) {
      console.log(`sub_folders(${folder}):`, e.message || e.error?.message);
    }
  }

  // Sample resources with folder prefix
  try {
    const page = await cloudinary.api.resources({
      type: "upload",
      prefix: "",
      max_results: 5,
    });
    console.log("\nSample root resources:");
    (page.resources || []).forEach((r) =>
      console.log(" ", r.public_id, r.folder || "(no folder)"),
    );
  } catch (e) {
    console.log("resources error:", e.message);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
