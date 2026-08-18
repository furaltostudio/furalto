/**
 * Sync site.navigation CMS (removes More from header labels).
 * Run: node scripts/sync-site-navigation.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const SiteContent = require("../src/models/SiteContent.model");
const remainingContent = require("../src/data/cms-remaining");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const seed = remainingContent.find((row) => row.key === "site.navigation");
  if (!seed) {
    throw new Error("site.navigation seed missing");
  }

  const doc = await SiteContent.findOneAndUpdate(
    { key: "site.navigation" },
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
    "Synced site.navigation →",
    (doc.data?.items || []).map((i) => i.label).join(" · "),
  );
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
