/**
 * Force-sync admin CMS docs with the live storefront IA.
 * Run: node scripts/migrate-admin-cms-to-live.js
 *
 * Updates:
 * - site.navigation (Sofas/Beds/Chairs/Dining/Bespoke/Sale)
 * - page.collections + page.collections.meta (furniture types)
 * - page.inspiration hub copy
 * - homepage announcementHref, categoryShowcase, inspirations slides, discover
 * - site.settings announcementHref
 */
require("dotenv").config();
const mongoose = require("mongoose");
const SiteContent = require("../src/models/SiteContent.model");
const defaults = require("../src/data/default-content");
const remaining = require("../src/data/cms-remaining");

// Sofa/bed slides — keep aligned with frontend/src/config/inspirations.ts
const slides = [
  {
    id: "aura-veil-sofa",
    label: "Sofa Edit",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599453/4_ro7m3o.webp",
    imageAlt: "Aura Veil Sofa styled in a soft contemporary living room",
    imageWidth: 1200,
    imageHeight: 1500,
    hotspots: [
      {
        id: "aura-veil-sofa-primary",
        x: 48,
        y: 58,
        product: {
          name: "Aura Veil Sofa",
          price: "₹90,000",
          href: "/products/aura-veil-sofa",
          slug: "aura-veil-sofa",
        },
      },
    ],
  },
  {
    id: "mono-block-sofa",
    label: "Modular Edit",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599472/4_tlnxcw.jpg",
    imageAlt: "Mono Block Sofa in a calm, light-filled living space",
    imageWidth: 2500,
    imageHeight: 1667,
    hotspots: [
      {
        id: "mono-block-sofa-primary",
        x: 52,
        y: 56,
        product: {
          name: "Mono Block Sofa",
          price: "₹60,000",
          href: "/products/mono-block-sofa",
          slug: "mono-block-sofa",
        },
      },
    ],
  },
  {
    id: "urban-loft-sofa",
    label: "Urban Edit",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599482/4_iggiq7.jpg",
    imageAlt: "Urban Loft Sofa in a modern loft living room",
    imageWidth: 2500,
    imageHeight: 1875,
    hotspots: [
      {
        id: "urban-loft-sofa-primary",
        x: 50,
        y: 55,
        product: {
          name: "Urban Loft Sofa",
          price: "₹50,000",
          href: "/products/urban-loft-sofa",
          slug: "urban-loft-sofa",
        },
      },
    ],
  },
  {
    id: "nova-modular-sofa",
    label: "Colour Block Edit",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785599479/4_vdutq8.jpg",
    imageAlt: "Nova Modular Sofa in a bright contemporary salon",
    imageWidth: 2500,
    imageHeight: 1668,
    hotspots: [
      {
        id: "nova-modular-sofa-primary",
        x: 50,
        y: 58,
        product: {
          name: "Nova Modular Sofa",
          price: "₹65,000",
          href: "/products/nova-modular-sofa",
          slug: "nova-modular-sofa",
        },
      },
    ],
  },
  {
    id: "verda-softedge-bed",
    label: "Bedroom Edit",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785860969/1_tx2wjv.jpg",
    imageAlt: "Verda Softedge Bed in a serene bedroom setting",
    imageWidth: 1200,
    imageHeight: 1500,
    hotspots: [
      {
        id: "verda-softedge-bed-primary",
        x: 50,
        y: 52,
        product: {
          name: "Verda Softedge Bed",
          price: "₹65,000",
          href: "/products/verda-softedge-bed",
          slug: "verda-softedge-bed",
        },
      },
    ],
  },
  {
    id: "luna-orbit-bed",
    label: "Soft Orbit Edit",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785860940/1v_ximulo.jpg",
    imageAlt: "Luna Orbit Bed in a warm, minimal bedroom",
    imageWidth: 1200,
    imageHeight: 1500,
    hotspots: [
      {
        id: "luna-orbit-bed-primary",
        x: 52,
        y: 50,
        product: {
          name: "Luna Orbit Bed",
          price: "₹75,000",
          href: "/products/luna-orbit-bed",
          slug: "luna-orbit-bed",
        },
      },
    ],
  },
  {
    id: "aeris-bed",
    label: "Quiet Retreat",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785860967/1_gtoebn.jpg",
    imageAlt: "Aeris Bed in a tailored contemporary bedroom",
    imageWidth: 1200,
    imageHeight: 1500,
    hotspots: [
      {
        id: "aeris-bed-primary",
        x: 50,
        y: 52,
        product: {
          name: "Aeris Bed",
          price: "₹65,000",
          href: "/products/aeris-bed",
          slug: "aeris-bed",
        },
      },
    ],
  },
  {
    id: "noire-arch-panel-bed",
    label: "Arch Panel Edit",
    image: "https://res.cloudinary.com/m1zm0cpq/image/upload/v1785860996/4_hkubdu.jpg",
    imageAlt: "Noire Arch Panel Bed in a layered luxury bedroom",
    imageWidth: 1200,
    imageHeight: 1500,
    hotspots: [
      {
        id: "noire-arch-panel-bed-primary",
        x: 48,
        y: 54,
        product: {
          name: "Noire Arch Panel Bed",
          price: "₹65,000",
          href: "/products/noire-arch-panel-bed",
          slug: "noire-arch-panel-bed",
        },
      },
    ],
  },
];

function findDefault(key) {
  return (
    defaults.find((item) => item.key === key) ||
    remaining.find((item) => item.key === key) ||
    null
  );
}

async function upsertFromDefault(key, dataPatch) {
  const seed = findDefault(key);
  if (!seed) {
    console.log("skip missing seed", key);
    return;
  }

  const data = dataPatch
    ? { ...seed.data, ...dataPatch }
    : { ...seed.data };

  const result = await SiteContent.findOneAndUpdate(
    { key },
    {
      $set: {
        title: seed.title,
        type: seed.type,
        description: seed.description,
        data,
        isPublished: true,
      },
      $setOnInsert: { key },
    },
    { upsert: true, new: true },
  );

  console.log("upserted", result.key);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  await upsertFromDefault("site.navigation");
  await upsertFromDefault("page.collections");
  await upsertFromDefault("page.collections.meta");
  await upsertFromDefault("page.inspiration");
  await upsertFromDefault("page.inspiration.rooms");

  const settings = findDefault("site.settings");
  if (settings) {
    await SiteContent.findOneAndUpdate(
      { key: "site.settings" },
      {
        $set: {
          "data.announcementHref": "/collections/sofas",
        },
      },
      { upsert: false },
    );
    // If missing, create full settings
    const exists = await SiteContent.findOne({ key: "site.settings" }).lean();
    if (!exists) {
      await upsertFromDefault("site.settings");
    } else {
      console.log("patched site.settings.announcementHref");
    }
  }

  const homepage = findDefault("homepage");
  if (homepage) {
    const existing = await SiteContent.findOne({ key: "homepage" });
    if (!existing) {
      const data = {
        ...homepage.data,
        inspirations: {
          title: "Product Inspirations",
          slides,
        },
      };
      await SiteContent.create({
        key: "homepage",
        title: homepage.title,
        type: homepage.type,
        description: homepage.description,
        data,
        isPublished: true,
      });
      console.log("created homepage");
    } else {
      const data = { ...(existing.data || {}) };
      data.inspirations = {
        title: data.inspirations?.title || "Product Inspirations",
        slides,
      };
      if (homepage.data.categoryShowcase) {
        data.categoryShowcase = homepage.data.categoryShowcase;
      }
      if (homepage.data.discover) {
        data.discover = homepage.data.discover;
      }
      if (homepage.data.customStudio) {
        data.customStudio = {
          ...(data.customStudio || {}),
          ...homepage.data.customStudio,
          eyebrow: "Made for you",
          ctaHref: "/custom",
        };
      }
      existing.data = data;
      existing.markModified("data");
      await existing.save();
      console.log("patched homepage inspirations + showcase + discover");
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
