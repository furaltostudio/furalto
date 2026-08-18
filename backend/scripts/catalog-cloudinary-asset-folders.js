require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || "m1zm0cpq",
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

async function searchAll(expression) {
  const resources = [];
  let next;
  do {
    let q = cloudinary.search
      .expression(expression)
      .with_field("asset_folder")
      .with_field("folder")
      .max_results(100);
    if (next) q = q.next_cursor(next);
    const page = await q.execute();
    resources.push(...(page.resources || []));
    next = page.next_cursor;
  } while (next);
  return resources;
}

(async () => {
  // Probe asset_folder usage
  const probe = await cloudinary.search
    .expression("resource_type:image")
    .with_field("asset_folder")
    .max_results(20)
    .execute();

  console.log("Probe sample:");
  (probe.resources || []).forEach((r) =>
    console.log(
      " ",
      r.public_id + "." + r.format,
      "asset_folder=",
      JSON.stringify(r.asset_folder || ""),
      "folder=",
      JSON.stringify(r.folder || ""),
    ),
  );

  // Search by asset_folder path
  for (const expr of [
    'asset_folder:furalto/*',
    'asset_folder="furalto/Furalto_Sofa/CLOUD WAVE SOFA"',
    'folder:furalto/*',
    'asset_folder:Furalto*',
  ]) {
    try {
      const res = await searchAll(expr);
      console.log("\nSearch", expr, "→", res.length);
      res.slice(0, 5).forEach((r) =>
        console.log(
          " ",
          r.public_id,
          r.asset_folder,
          r.secure_url?.slice(0, 80),
        ),
      );
    } catch (e) {
      console.log("\nSearch failed", expr, e.message || e.error?.message);
    }
  }

  // Full dump of images that have non-empty asset_folder under furalto
  try {
    const all = await searchAll("asset_folder:furalto*");
    console.log("\nasset_folder furalto* total:", all.length);

    const byFolder = {};
    for (const r of all) {
      const key = r.asset_folder || "(none)";
      if (!byFolder[key]) byFolder[key] = [];
      byFolder[key].push({
        public_id: r.public_id,
        format: r.format,
        version: r.version,
        width: r.width,
        height: r.height,
        secure_url: r.secure_url,
        filename: (r.public_id || "").split("/").pop(),
      });
    }

    console.log("Unique asset_folders:", Object.keys(byFolder).length);
    Object.entries(byFolder)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([folder, items]) =>
        console.log(items.length.toString().padStart(3), folder),
      );

    fs.writeFileSync(
      path.join(__dirname, "cloudinary-asset-folder-catalog.json"),
      JSON.stringify(byFolder, null, 2),
    );
    console.log("Wrote scripts/cloudinary-asset-folder-catalog.json");
  } catch (e) {
    console.log("asset_folder dump failed:", e.message || e.error?.message);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
