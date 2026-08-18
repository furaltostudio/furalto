/**
 * Update site.settings announcement bar text in MongoDB.
 * Usage: node scripts/update-announcement.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Content = mongoose.connection.collection("sitecontents");
  const update = {
    "data.announcementText": "₹2,000 off on prepaid orders · Pan India",
    "data.announcementCta": "Shop now",
    "data.announcementHref": "/collections",
  };
  const r = await Content.updateOne({ key: "site.settings" }, { $set: update });
  console.log("matched", r.matchedCount, "modified", r.modifiedCount);
  const doc = await Content.findOne(
    { key: "site.settings" },
    { projection: { "data.announcementText": 1, "data.announcementCta": 1, "data.announcementHref": 1 } }
  );
  console.log(JSON.stringify(doc?.data, null, 2));
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
