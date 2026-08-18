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

async function listAllSubfolders(folder) {
  const out = [];
  const page = await cloudinary.api.sub_folders(folder);
  for (const f of page.folders || []) {
    out.push(f.path);
  }
  return out;
}

async function listResourcesInFolder(folder) {
  const resources = [];
  let next;
  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      prefix: folder + "/",
      max_results: 100,
      next_cursor: next,
    });
    resources.push(...(page.resources || []));
    next = page.next_cursor;
  } while (next);
  return resources;
}

(async () => {
  const bedFolders = await listAllSubfolders("furalto/Furalto_Bed");
  const sofaFolders = await listAllSubfolders("furalto/Furalto_Sofa");
  console.log("Bed product folders:", bedFolders.length);
  console.log("Sofa product folders:", sofaFolders.length);

  bedFolders.slice(0, 5).forEach((f) => console.log(" bed", f));
  sofaFolders.slice(0, 5).forEach((f) => console.log(" sofa", f));

  // Sample one known gap product
  const samples = [
    ...sofaFolders.filter((f) => /nova|cloud.?wave|mono|urban|aura.?veil|serene|arc.?curve/i.test(f)),
    ...bedFolders.filter((f) => /noire|luna.?orbit/i.test(f)),
  ];

  const catalog = {};
  for (const folder of [...bedFolders, ...sofaFolders]) {
    const resources = await listResourcesInFolder(folder);
    catalog[folder] = resources.map((r) => ({
      public_id: r.public_id,
      format: r.format,
      version: r.version,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      secure_url: r.secure_url,
      filename: r.public_id.split("/").pop(),
    }));
  }

  console.log("\nSample folder contents:");
  for (const folder of samples.slice(0, 8)) {
    const items = catalog[folder] || [];
    console.log("\n", folder, "(" + items.length + ")");
    items.forEach((i) =>
      console.log("  ", i.filename + "." + i.format, "v" + i.version),
    );
  }

  // Counts summary
  let total = 0;
  const empty = [];
  for (const [folder, items] of Object.entries(catalog)) {
    total += items.length;
    if (!items.length) empty.push(folder);
  }
  console.log("\nTotal assets in folder tree:", total);
  console.log("Empty folders:", empty.length);
  empty.slice(0, 10).forEach((f) => console.log(" ", f));

  fs.writeFileSync(
    path.join(__dirname, "cloudinary-folder-catalog.json"),
    JSON.stringify(catalog, null, 2),
  );
  console.log("Wrote scripts/cloudinary-folder-catalog.json");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
