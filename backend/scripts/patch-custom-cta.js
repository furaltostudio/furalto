require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.db.collection("sitecontents").updateOne(
    { key: "homepage" },
    {
      $set: {
        "data.customServices.ctaLabel": "Design Your Piece",
        "data.customServices.ctaHref": "/custom",
      },
    }
  );
  console.log("updated", result.modifiedCount);
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
