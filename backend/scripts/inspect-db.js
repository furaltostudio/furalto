/**
 * Inspect Atlas for real product/sofa collections (no secrets printed).
 * Run: node scripts/inspect-db.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI missing");
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log("db=", db.databaseName);

  const cols = await db.listCollections().toArray();
  console.log(
    "collections=",
    cols.map((c) => c.name).join(",") || "(none)"
  );

  for (const c of cols) {
    const n = await db.collection(c.name).countDocuments();
    console.log(`${c.name}=${n}`);
  }

  const candidates = ["products", "Products", "sofas", "Sofas", "items", "catalog"];
  for (const name of candidates) {
    const exists = cols.some((c) => c.name === name);
    if (!exists) continue;

    const col = db.collection(name);
    const total = await col.countDocuments();
    const sofaish = await col.countDocuments({
      $or: [
        { category: /sofa/i },
        { Category: /sofa/i },
        { name: /sofa/i },
        { subcategory: /sofa/i },
      ],
    });
    console.log(`${name}_total=${total} sofaish=${sofaish}`);

    const one = await col.findOne(
      {},
      {
        projection: {
          name: 1,
          category: 1,
          Category: 1,
          price: 1,
          description: 1,
          images: 1,
          image: 1,
          slug: 1,
        },
      }
    );
    console.log(`${name}_sample_keys=`, Object.keys(one || {}));
    console.log(
      `${name}_sample=`,
      JSON.stringify({
        name: one?.name,
        category: one?.category || one?.Category,
        slug: one?.slug,
        price: one?.price,
        hasImages: Boolean(one?.images || one?.image),
      })
    );
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("ERR", error.message);
  process.exit(1);
});
