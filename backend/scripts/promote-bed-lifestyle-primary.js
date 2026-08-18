require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

function fileName(src = "") {
  return String(src).split("/").pop() || "";
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchBuffer(res.headers.location).then(resolve, reject);
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

/**
 * Crude lifestyle score from JPEG bytes without a decoder:
 * lifestyle room shots tend to be larger, darker overall, and less "white-clipped".
 * Better: decode via Cloudinary e_bgremoval isn't available.
 * Use Cloudinary pixel analysis via fetching a tiny raw? 
 *
 * Instead: use average of sampled luminance from a Cloudinary
 * `fl_getinfo` or just compare file sizes + fetch as grayscale via transformation
 * that returns a tiny 8x8 and we... still need decode.
 *
 * Practical approach: Cloudinary URL with f_jpg and use `pngjs`/`jpeg-js` from npm install.
 */

(async () => {
  // Ensure jpeg-js
  let jpeg;
  try {
    jpeg = require("jpeg-js");
  } catch {
    const { execSync } = require("child_process");
    execSync("npm install jpeg-js --no-save", { stdio: "inherit" });
    jpeg = require("jpeg-js");
  }

  function lifestyleScore(buf) {
    let decoded;
    try {
      decoded = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 50 });
    } catch {
      return { score: -1, mean: 0, edgeVar: 0, whiteRatio: 1 };
    }
    const { data, width, height } = decoded;
    if (!width || !height) return { score: -1, mean: 0, edgeVar: 0, whiteRatio: 1 };

    // Sample corners + center for white-bg detection
    const size = Math.max(2, Math.floor(Math.min(width, height) * 0.08));
    const points = [
      [2, 2],
      [width - size - 2, 2],
      [2, height - size - 2],
      [width - size - 2, height - size - 2],
      [Math.floor(width / 2 - size / 2), Math.floor(height / 2 - size / 2)],
    ];

    function sample(sx, sy) {
      let r = 0,
        g = 0,
        b = 0,
        n = 0;
      for (let y = sy; y < sy + size && y < height; y += 1) {
        for (let x = sx; x < sx + size && x < width; x += 1) {
          const i = (y * width + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n += 1;
        }
      }
      if (!n) return { lum: 1 };
      const rr = r / n,
        gg = g / n,
        bb = b / n;
      return { lum: (0.2126 * rr + 0.7152 * gg + 0.0722 * bb) / 255 };
    }

    const cornerLums = points.slice(0, 4).map(([x, y]) => sample(x, y).lum);
    const cornerMean =
      cornerLums.reduce((a, b) => a + b, 0) / cornerLums.length;
    const cornerVar =
      cornerLums.reduce((s, l) => s + (l - cornerMean) ** 2, 0) /
      cornerLums.length;

    // White ratio across sparse grid
    let white = 0,
      total = 0,
      sum = 0;
    for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 24))) {
      for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 24))) {
        const i = (y * width + x) * 4;
        const lum =
          (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) /
          255;
        sum += lum;
        total += 1;
        if (lum > 0.92) white += 1;
      }
    }
    const mean = sum / (total || 1);
    const whiteRatio = white / (total || 1);

    // Lifestyle: low white ratio, higher corner variance (room has dark/light corners)
    let score = 0;
    score += (1 - whiteRatio) * 100;
    score += Math.min(cornerVar, 0.08) * 800;
    if (whiteRatio > 0.55 && cornerMean > 0.85) score -= 40; // studio white
    if (cornerVar > 0.01) score += 15; // scene richness
    return { score, mean, edgeVar: cornerVar, whiteRatio };
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const beds = await Product.find({ isActive: true, category: "beds" }).select(
    "slug name images",
  );

  const report = [];
  const dryRun = !process.argv.includes("--apply");
  console.log(dryRun ? "DRY RUN" : "APPLYING");

  function plain(img) {
    return {
      src: img.src,
      alt: img.alt,
      width: img.width,
      height: img.height,
    };
  }

  for (const bed of beds) {
    const images = bed.images || [];
    const scored = [];

    for (let i = 0; i < images.length; i += 1) {
      const img = images[i];
      const src = img.src || "";
      // skip obvious cutout pngs for primary preference unless only option
      const thumb = src.replace(
        "/upload/",
        "/upload/c_limit,w_280,h_210,q_40,f_jpg/",
      );
      let buf;
      try {
        buf = await fetchBuffer(thumb);
      } catch {
        scored.push({ i, file: fileName(src), score: -1, whiteRatio: 1 });
        continue;
      }
      const meta = lifestyleScore(buf);
      scored.push({
        i,
        file: fileName(src),
        src,
        ...meta,
        isPng: /\.png(\?|$)/i.test(src),
      });
    }

    // Prefer non-png lifestyle
    const ranked = [...scored].sort((a, b) => {
      const ap = a.isPng ? -8 : 0;
      const bp = b.isPng ? -8 : 0;
      return b.score + bp - (a.score + ap);
    });

    const best = ranked[0];
    const current = scored[0];
    const needsChange =
      best && current && best.i !== 0 && best.score - current.score > 12;

    report.push({
      slug: bed.slug,
      current: current?.file,
      currentScore: current?.score?.toFixed?.(1),
      currentWhite: current?.whiteRatio?.toFixed?.(2),
      best: best?.file,
      bestScore: best?.score?.toFixed?.(1),
      bestWhite: best?.whiteRatio?.toFixed?.(2),
      needsChange,
      ranked: ranked.map(
        (r) =>
          `${r.file}:${r.score.toFixed(0)}(w${(r.whiteRatio * 100).toFixed(0)}%)`,
      ),
    });

    if (!dryRun && needsChange) {
      const chosen = plain(images[best.i]);
      const base = String(bed.name || bed.slug).trim();
      chosen.alt = `${base} — primary`;
      const rest = images
        .filter((_, idx) => idx !== best.i)
        .map((img, idx) => {
          const next = plain(img);
          const name =
            String(next.alt || "")
              .replace(/\s*—\s*(lifestyle|view\s*\d+|primary)\s*$/i, "")
              .trim() || base;
          next.alt = `${name} — view ${idx + 2}`;
          return next;
        });
      await Product.updateOne(
        { _id: bed._id },
        { $set: { images: [chosen, ...rest] } },
      );
    }
  }

  console.log("\nBeds needing lifestyle primary:");
  report
    .filter((r) => r.needsChange)
    .forEach((r) =>
      console.log(
        r.slug,
        r.current,
        `(${r.currentScore}/w${r.currentWhite})`,
        "→",
        r.best,
        `(${r.bestScore}/w${r.bestWhite})`,
        "\n  ",
        r.ranked.join(" | "),
      ),
    );

  console.log("\nAlready good:");
  report
    .filter((r) => !r.needsChange)
    .forEach((r) =>
      console.log(r.slug, r.current, `(${r.currentScore}/w${r.currentWhite})`),
    );

  fs.writeFileSync(
    path.join(__dirname, "bed-lifestyle-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log("\nWrote bed-lifestyle-report.json");
  console.log(
    "Changes:",
    report.filter((r) => r.needsChange).length,
    "/",
    report.length,
  );

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
