/**
 * Download team portraits from live WP and upload to Cloudinary (folder: furalto/about/team).
 * Usage: node scripts/upload-team-photos.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const TEAM = [
  {
    id: "gayatri",
    name: "Gayatri",
    role: "Founder",
    featured: true,
    url: "https://furalto.com/wp-content/uploads/2026/05/FounderGaytri.jpg",
    file: "gayatri.jpg",
  },
  {
    id: "gautam",
    name: "Ar. Gautam Jha",
    role: "Co-Founder",
    featured: true,
    url: "https://furalto.com/wp-content/uploads/2026/05/gautamjha.jpg",
    file: "gautam-jha.jpg",
  },
  {
    id: "pinky",
    name: "Pinky Jha",
    role: "Logistics Manager",
    url: "https://furalto.com/wp-content/uploads/2026/05/NehaSharma.jpg",
    file: "pinky-jha.jpg",
  },
  {
    id: "akshay",
    name: "Akshay Sharma",
    role: "Architect",
    url: "https://furalto.com/wp-content/uploads/2026/05/03.jpg",
    file: "akshay-sharma.jpg",
  },
  {
    id: "maheep",
    name: "Maheep",
    role: "Designer",
    url: "https://furalto.com/wp-content/uploads/2026/05/MaheepDESIGNER.jpg",
    file: "maheep.jpg",
  },
  {
    id: "govind",
    name: "Govind Jha",
    role: "Production Manager",
    url: "https://furalto.com/wp-content/uploads/2026/05/ProductionManager.jpg",
    file: "govind-jha.jpg",
  },
  {
    id: "ritam",
    name: "Ritam Mazinder Baruah",
    role: "Senior Architect",
    url: "https://furalto.com/wp-content/uploads/2026/05/RitamMazinderBaruah.jpg",
    file: "ritam-mazinder-baruah.jpg",
  },
];

const localDir = path.resolve(__dirname, "../../frontend/public/about/team");

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} for ${url}`);
  }
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(dest));
  const stat = await fs.promises.stat(dest);
  if (stat.size < 1000) {
    throw new Error(`File too small (${stat.size}b): ${dest}`);
  }
}

(async () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    throw new Error("Cloudinary env missing");
  }

  const results = [];

  for (const member of TEAM) {
    const dest = path.join(localDir, member.file);
    process.stdout.write(`Downloading ${member.id}… `);
    await download(member.url, dest);
    console.log("ok");

    process.stdout.write(`Uploading ${member.id}… `);
    const uploaded = await cloudinary.uploader.upload(dest, {
      folder: "furalto/about/team",
      public_id: member.id,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    });
    console.log(uploaded.secure_url);
    results.push({
      id: member.id,
      name: member.name,
      role: member.role,
      featured: Boolean(member.featured),
      imageSrc: uploaded.secure_url,
      localSrc: `/about/team/${member.file}`,
    });
  }

  const outPath = path.join(localDir, "manifest.json");
  await fs.promises.writeFile(outPath, JSON.stringify(results, null, 2));
  console.log("\nWrote", outPath);
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
