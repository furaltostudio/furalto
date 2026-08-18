require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const https = require("https");
const http = require("http");

function head(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, { method: "HEAD", timeout: 8000 }, (res) => {
      resolve(res.statusCode || 0);
      res.resume();
    });
    req.on("error", () => resolve(0));
    req.on("timeout", () => {
      req.destroy();
      resolve(0);
    });
    req.end();
  });
}

function baseDir(src) {
  // https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599460/3_l35lfd.webp
  const m = src.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v\d+\/)/);
  return m ? m[1] : null;
}

function extOf(src) {
  const m = src.match(/\.(jpe?g|webp|png)(\?|$)/i);
  return m ? m[1].toLowerCase() : "jpg";
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({
    isActive: true,
    category: { $in: ["sofas", "beds"] },
  })
    .select("slug category images")
    .lean();

  const missing = products.filter(
    (p) => !(p.images || []).some((i) => /\/4v?_/.test(i.src || "")),
  );

  console.log("Missing 4_ file in DB:", missing.length);

  for (const p of missing) {
    console.log("\nProbing", p.slug);
    const sample = p.images?.[0]?.src;
    if (!sample) continue;
    const dir = baseDir(sample);
    if (!dir) {
      console.log("  no cloudinary dir");
      continue;
    }

    // Try common hash patterns won't work. Instead try replacing number prefix
    // of each existing file with 4_ / 4v_ keeping same random suffix — unlikely.
    // Better: probe 4_<suffix> using suffixes from siblings? suffixes differ per file.

    // Probe by trying to list via Cloudinary unsigned? Can't.
    // Try version folder with wildcard — can't via HTTP.

    // Practical approach: for each existing image URL, replace leading N_ with 4_
    const candidates = new Set();
    for (const img of p.images || []) {
      const name = img.src.split("/").pop() || "";
      const ext = extOf(img.src);
      const suffix = name.replace(/^\d+v?_/, "").replace(/\.(jpe?g|webp|png)$/i, "");
      // sibling suffixes won't match 4_ hash
      candidates.add(`${dir}4_${suffix}.${ext}`);
      candidates.add(`${dir}4v_${suffix}.${ext}`);
    }

    // Also try a few generic probes using first image version folder — skip

    let found = null;
    for (const url of candidates) {
      const code = await head(url);
      if (code >= 200 && code < 300) {
        found = url;
        break;
      }
    }
    console.log("  probed", candidates.size, "urls, found:", found ? found.split("/").pop() : "none");
  }

  await mongoose.disconnect();
})();
