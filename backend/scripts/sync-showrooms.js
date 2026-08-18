/**
 * Sync page.showrooms CMS to Rohini-only.
 * Run: node scripts/sync-showrooms.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const SiteContent = require("../src/models/SiteContent.model");
const defaultContent = require("../src/data/default-content");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const seed = defaultContent.find((row) => row.key === "page.showrooms");
  if (!seed) {
    throw new Error("page.showrooms seed missing");
  }

  const doc = await SiteContent.findOneAndUpdate(
    { key: "page.showrooms" },
    {
      $set: {
        title: seed.title,
        type: seed.type,
        description: seed.description,
        data: seed.data,
        isPublished: true,
      },
    },
    { upsert: true, new: true },
  );

  console.log(
    "Synced page.showrooms →",
    (doc.data?.locations || []).map((l) => `${l.city}: ${l.name}`).join(" · ") ||
      "(none)",
  );
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
