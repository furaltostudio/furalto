/**
 * Seed admin, CMS content, and flat categories.
 * Does NOT load mock products — use `npm run import:sofas` for real catalog data.
 * Run: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User.model");
const contentService = require("../src/services/content.service");
const defaultContent = require("../src/data/default-content");
const { USER_ROLES } = require("../src/constants");

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to run seed in production. Set NODE_ENV=development for local seeding.");
  process.exit(1);
}

const DEFAULT_ADMIN_EMAIL = "furaltostudio@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Rahul@123";

const seedAdmin = async () => {
  await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: USER_ROLES.CUSTOMER, isActive: true } }
  );

  const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = USER_ROLES.ADMIN;
    existing.isActive = true;
    existing.isEmailVerified = true;
    existing.password = password;
    await existing.save();
    console.log(`Admin ready: ${email}`);
    return;
  }

  await User.create({
    firstName: process.env.ADMIN_FIRST_NAME || "Furalto",
    lastName: process.env.ADMIN_LAST_NAME || "Admin",
    email: email.toLowerCase(),
    password,
    provider: "local",
    role: USER_ROLES.ADMIN,
    isEmailVerified: true,
    isActive: true,
  });

  console.log(`Admin user created: ${email}`);
};

const seed = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furalto";

  await mongoose.connect(uri);
  console.log(`Connected to ${mongoose.connection.name}`);

  const Product = require("../src/models/Product.model");
  const productCount = await Product.countDocuments();
  console.log(`Products in database: ${productCount} (mock catalog seed disabled)`);

  await seedAdmin();

  const obsoleteHomepageKeys = [
    "homepage.hero",
    "homepage.brandStrip",
    "homepage.discover",
    "homepage.customServices",
    "homepage.categoryShowcase",
    "homepage.inspirations",
  ];
  const SiteContent = require("../src/models/SiteContent.model");
  const removed = await SiteContent.deleteMany({ key: { $in: obsoleteHomepageKeys } });
  if (removed.deletedCount) {
    console.log(`Removed obsolete homepage CMS keys: ${removed.deletedCount}`);
  }

  const contentResult = await contentService.seedDefaults(defaultContent);
  console.log(
    `Website content ready: ${contentResult.upserted} new entries, ${contentResult.total} total`
  );

  const Category = require("../src/models/Category.model");
  const defaultCategories = require("../src/data/default-categories");

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
  const categoryCount = await Category.countDocuments();
  console.log(`Categories ready (flat): ${categoryCount}`);

  const homepageEntry = defaultContent.find((entry) => entry.key === "homepage");
  const flatShowcase = homepageEntry?.data?.categoryShowcase;
  if (flatShowcase?.items?.length) {
    const showcaseMerge = await SiteContent.updateOne(
      { key: "homepage" },
      { $set: { "data.categoryShowcase": flatShowcase } }
    );
    if (showcaseMerge.modifiedCount) {
      console.log("Updated homepage categoryShowcase to flat furniture types");
    }
  }

  const customStudio = homepageEntry?.data?.customStudio;
  if (customStudio) {
    const studioMerge = await SiteContent.updateOne(
      { key: "homepage", "data.customStudio": { $exists: false } },
      { $set: { "data.customStudio": customStudio } }
    );
    if (studioMerge.modifiedCount) {
      console.log("Added customStudio section to existing homepage CMS entry");
    }
  }

  const testimonials = homepageEntry?.data?.testimonials;
  if (testimonials) {
    const testimonialsMerge = await SiteContent.updateOne(
      { key: "homepage", "data.testimonials": { $exists: false } },
      { $set: { "data.testimonials": testimonials } }
    );
    if (testimonialsMerge.modifiedCount) {
      console.log("Added testimonials section to existing homepage CMS entry");
    }
  }

  const stripHomeStories = await SiteContent.updateOne(
    { key: "homepage", "data.testimonials.items": { $exists: true } },
    {
      $unset: { "data.testimonials.items": "" },
      $set: { "data.testimonials.featuredCount": "5" },
    }
  );
  if (stripHomeStories.modifiedCount) {
    console.log("Moved homepage story list to Client Stories (page.testimonials) as source of truth");
  }

  const pageTestimonials = defaultContent.find((entry) => entry.key === "page.testimonials");
  if (pageTestimonials?.data?.items?.length) {
    const ensureStories = await SiteContent.updateOne(
      {
        key: "page.testimonials",
        $or: [
          { "data.items": { $exists: false } },
          { "data.items": { $size: 0 } },
        ],
      },
      { $set: { data: pageTestimonials.data } }
    );
    if (ensureStories.modifiedCount) {
      console.log("Restored Client Stories items from defaults");
    }
  }

  const companyHeroDefaults = [
    {
      key: "page.sustainability",
      heroImageSrc: "/home/furnitures_one.jpeg",
      heroImageAlt: "Natural materials and enduring outdoor furniture in soft evening light",
    },
    {
      key: "page.trade-program",
      heroImageSrc: "/home/furnitures_four.jpeg",
      heroImageAlt: "Open-plan dining and living space with marble accents",
    },
    {
      key: "page.careers",
      heroImageSrc: "/home/furnitures_five.jpeg",
      heroImageAlt: "Premium living room with cream upholstered seating",
    },
  ];

  for (const page of companyHeroDefaults) {
    const heroMerge = await SiteContent.updateOne(
      { key: page.key, "data.heroImageSrc": { $exists: false } },
      {
        $set: {
          "data.heroImageSrc": page.heroImageSrc,
          "data.heroImageAlt": page.heroImageAlt,
        },
      }
    );
    if (heroMerge.modifiedCount) {
      console.log(`Added editable hero image fields to ${page.key}`);
    }
  }

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
