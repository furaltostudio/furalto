/**
 * Migrate MongoDB from room → subcategory hierarchy to flat furniture-type categories.
 * Run: node scripts/migrate-to-flat-categories.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/Category.model");
const Product = require("../src/models/Product.model");
const defaultCategories = require("../src/data/default-categories");

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to run category migration in production without explicit review.");
  process.exit(1);
}

const OLD_ROOM_SLUGS = new Set([
  "outdoor",
  "living-room",
  "dining",
  "bedroom",
  "bath",
  "lighting",
  "decor",
  "art-mirrors",
  "rugs",
  "office",
  "sale",
]);

const migrate = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furalto";
  await mongoose.connect(uri);
  console.log(`Connected to ${mongoose.connection.name}`);

  const products = await Product.find({}).lean();
  let updatedProducts = 0;

  for (const product of products) {
    const looksLikeOldRoomParent = OLD_ROOM_SLUGS.has(product.category) && product.subcategory;
    if (!looksLikeOldRoomParent) {
      // Still clear empty/null subcategory for consistency
      if (product.subcategory == null) {
        await Product.updateOne({ _id: product._id }, { $set: { subcategory: "" } });
      }
      continue;
    }

    const rooms = Array.from(
      new Set([...(product.rooms || []), product.category].filter(Boolean))
    );

    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          category: product.subcategory,
          subcategory: "",
          collection: product.subcategory || product.collection,
          rooms,
        },
      }
    );
    updatedProducts += 1;
  }

  await Category.deleteMany({});
  await Category.insertMany(
    defaultCategories.map((category, index) => ({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder ?? (index + 1) * 10,
      isActive: true,
      subcategories: [],
    }))
  );

  console.log(`Updated ${updatedProducts} products to flat categories`);
  console.log(`Reseeded ${defaultCategories.length} flat categories`);
  await mongoose.disconnect();
};

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
