require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  // Resources with version around cloud-wave (9460) and the gap products
  const ranges = [
    ["cloud-wave zone", 1785599455, 1785599470],
    ["mono/nova zone", 1785599470, 1785599480],
    ["urban zone", 1785599480, 1785599490],
  ];

  let nextCursor;
  const all = [];
  do {
    let q = cloudinary.search
      .expression("uploaded_at>2026-08-01T15:45:00Z AND uploaded_at<2026-08-01T16:00:00Z")
      .sort_by("uploaded_at", "asc")
      .max_results(100);
    if (nextCursor) q = q.next_cursor(nextCursor);
    const page = await q.execute();
    all.push(...(page.resources || []));
    nextCursor = page.next_cursor;
  } while (nextCursor);

  console.log("Total in 15-min window:", all.length);
  all.forEach((r) => {
    const name = r.public_id.split("/").pop() + "." + r.format;
    console.log(`v${r.version} ${name} ${r.width}x${r.height} ${r.format}`);
  });

  // Also search for any 4_ webp
  const webp4 = await cloudinary.search
    .expression("filename:4_* AND format:webp")
    .max_results(50)
    .execute();
  console.log("\nwebp 4_ count:", (webp4.resources || []).length);
  (webp4.resources || []).forEach((r) =>
    console.log(" ", r.public_id + "." + r.format, "v" + r.version),
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
