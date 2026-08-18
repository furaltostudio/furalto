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

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Any bed/sofa without true 4_
  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug category images name")
    .lean();

  const missing = products.filter(
    (p) => !(p.images || []).some((i) => /\/4v?_/.test(i.src || "")),
  );
  console.log("Missing true 4_:", missing.map((p) => `${p.category}/${p.slug}`).join(", "));

  // Beds whose primary isn't 4_
  const bedsWrong = products.filter((p) => {
    if (p.category !== "beds") return false;
    const first = p.images?.[0]?.src || "";
    return !/\/4v?_/.test(first);
  });
  console.log(
    "Beds primary not 4_:",
    bedsWrong.map((p) => `${p.slug} -> ${fileName(p.images?.[0]?.src)}`).join(" | ") || "none",
  );

  // Is 4_j9bxsy already on any product?
  const hasJ9 = products.filter((p) =>
    (p.images || []).some((i) => (i.src || "").includes("4_j9bxsy")),
  );
  console.log("4_j9bxsy owners:", hasJ9.map((p) => p.slug).join(", ") || "none");

  // Cloud-wave sibling assets: list all public ids that share upload version 1785599460 via search format
  // Try filename patterns that might be lifestyle for cloud
  const searches = [
    "filename:4_* AND format:webp",
    "filename:*mrs7vv*",
    "filename:4v_*",
    "tags=cloud OR context.custom.caption:cloud",
  ];
  for (const expr of searches) {
    try {
      const page = await cloudinary.search.expression(expr).max_results(20).execute();
      console.log("\nSearch:", expr, "→", (page.resources || []).length);
      (page.resources || []).slice(0, 10).forEach((r) =>
        console.log(" ", r.public_id + "." + r.format, "v" + r.version),
      );
    } catch (e) {
      console.log("\nSearch failed:", expr, e.message || e.error?.message);
    }
  }

  // List resources by prefix empty around cloud-wave filenames already known
  const known = ["1_mrs7vv", "2_lyarqa", "3_l35lfd", "5_vi3x5x", "6_acofo7"];
  for (const id of known) {
    try {
      const r = await cloudinary.api.resource(id, { resource_type: "image" });
      console.log("known", id, r.format, r.width + "x" + r.height, "v" + r.version);
    } catch (e) {
      console.log("missing resource", id, e.message);
    }
  }

  // Find unused jpg/webp near version 9460 by listing folder root recent
  let next;
  const near = [];
  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      max_results: 100,
      next_cursor: next,
    });
    for (const r of page.resources || []) {
      const v = Number(r.version);
      if (v >= 1785599455 && v <= 1785599470) near.push(r);
    }
    next = page.next_cursor;
    if (near.length > 40) break;
  } while (next);

  console.log("\nAssets version 9455-9470:");
  near
    .sort((a, b) => a.version - b.version)
    .forEach((r) =>
      console.log(
        `v${r.version} ${r.public_id}.${r.format} ${r.width}x${r.height}`,
      ),
    );

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
