require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const https = require("https");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ASSET_CLOUD_NAME || "m1zm0cpq",
  api_key: process.env.CLOUDINARY_ASSET_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_ASSET_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

function fileName(src = "") {
  return String(src).split("/").pop() || "";
}

function isFour(src = "") {
  return /\/4v?_[^/?#]+\.(jpe?g|webp|png)/i.test(src);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const beds = await Product.find({ isActive: true, category: "beds" })
    .select("slug name images")
    .lean();

  console.log("Beds:", beds.length);
  let primaryFour = 0;
  const notFour = [];

  for (const p of beds) {
    const imgs = p.images || [];
    const first = imgs[0]?.src || "";
    const fourIdx = imgs.findIndex((i) => isFour(i.src || ""));
    if (isFour(first)) primaryFour += 1;
    else {
      notFour.push({
        slug: p.slug,
        name: p.name,
        primary: fileName(first),
        hasFour: fourIdx >= 0,
        fourFile: fourIdx >= 0 ? fileName(imgs[fourIdx].src) : null,
        files: imgs.map((i) => fileName(i.src)),
      });
    }
  }

  console.log(`Primary is 4_/4v_: ${primaryFour}/${beds.length}`);
  console.log("Not lifestyle-primary:", notFour.length);
  notFour.forEach((p) =>
    console.log(
      " ",
      p.slug,
      "→",
      p.primary,
      p.hasFour ? `(has ${p.fourFile})` : "(NO 4_)",
      p.files.join(", "),
    ),
  );

  // Download first image thumbnails for all beds to classify lifestyle vs studio
  const outDir = path.join(__dirname, "_bed_primaries");
  fs.mkdirSync(outDir, { recursive: true });

  function fetchTo(url, dest) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      https
        .get(url, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            file.close();
            fs.unlinkSync(dest);
            return fetchTo(res.headers.location, dest).then(resolve, reject);
          }
          res.pipe(file);
          file.on("finish", () => file.close(resolve));
        })
        .on("error", reject);
    });
  }

  // Sample: current primary + any 4_ for beds where primary isn't 4
  for (const p of beds) {
    const first = p.images?.[0];
    if (!first?.src) continue;
    const thumb = first.src.replace(
      "/upload/",
      "/upload/c_limit,w_320,h_240,q_50,f_jpg/",
    );
    const dest = path.join(outDir, `${p.slug}__primary.jpg`);
    try {
      await fetchTo(thumb, dest);
    } catch (e) {
      console.log("fail download", p.slug, e.message);
    }
  }

  console.log("\nDownloaded primaries to", outDir);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
