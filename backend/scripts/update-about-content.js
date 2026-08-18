/**
 * Sync About page + brand site settings with the live About story.
 * Usage: node scripts/update-about-content.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const aboutData = {
  eyebrow: "About Us",
  title: "A Legacy Reborn Through Craftsmanship",
  description:
    "Furalto is more than a furniture brand — a story of legacy, courage, and craftsmanship carried across generations. Crafted with heart. Built on legacy.",
  sections: [
    {
      title: "Our Story",
      body: "Our journey began in 1979, with Late Ramchandar, a highly respected master carpenter who led a team of more than 100 skilled craftsmen. His workshop was known for precision, integrity, and the kind of artistry that could only come from a lifetime of dedication. For decades, he shaped wood into beautiful, functional pieces that became a part of countless homes. But life took an unexpected turn. A sudden paralysis brought everything to a halt, and the dream he built slowly began to collapse. In 2022, we lost him — but his craft, his passion, and his vision remained alive in the hearts of those he inspired.",
    },
    {
      title: "The Birth of Furalto",
      body: "I am Gayatri, his daughter and the founder of Furalto. Furalto was created as a tribute to him — a promise to complete the dream he could not finish. I grew up watching my father create magic with his hands. Today, I carry that same spirit forward by bringing together India’s finest artisans, designers, and craftsmen to build premium, thoughtfully designed furniture that reflects heritage, skill, and modern luxury.",
    },
  ],
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection("sitecontents");

  const about = await col.updateOne(
    { key: "page.about" },
    {
      $set: {
        title: "About",
        type: "page",
        description: "Edit the About page content shown on the website.",
        path: "/about",
        data: aboutData,
      },
      $setOnInsert: { key: "page.about" },
    },
    { upsert: true }
  );

  const settings = await col.updateOne(
    { key: "site.settings" },
    {
      $set: {
        "data.tagline": "Elevate Every Detail",
        "data.subtagline": "Luxury Furniture",
        "data.footerDescription":
          "Furalto — designer furniture from true Indian craftsmanship. A legacy begun in 1979, carried forward with heart.",
      },
    }
  );

  const homepage = await col.updateOne(
    { key: "homepage" },
    {
      $set: {
        "data.hero.eyebrow": "Luxury Furniture · Est. 1979",
        "data.hero.subtitle": "Handcrafted pieces of quiet distinction.",
        "data.hero.secondaryCtaLabel": "Our Showrooms",
        "data.hero.secondaryCtaHref": "/showrooms",
      },
    }
  );

  console.log("about", about.matchedCount, about.modifiedCount);
  console.log("settings", settings.matchedCount, settings.modifiedCount);
  console.log("homepage", homepage.matchedCount, homepage.modifiedCount);

  const check = await col.findOne(
    { key: "homepage" },
    { projection: { "data.hero": 1 } }
  );
  const setCheck = await col.findOne(
    { key: "site.settings" },
    { projection: { "data.tagline": 1, "data.subtagline": 1 } }
  );
  console.log(JSON.stringify({ hero: check?.data?.hero, settings: setCheck?.data }, null, 2));

  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
