/**
 * Sync homepage customStudio.priceFrom to catalogue-aligned starting price.
 * Usage: node scripts/sync-custom-price-from.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const r = await mongoose.connection.collection("sitecontents").updateOne(
    { key: "homepage" },
    { $set: { "data.customStudio.priceFrom": "₹65,000" } }
  );
  console.log("matched", r.matchedCount, "modified", r.modifiedCount);
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
