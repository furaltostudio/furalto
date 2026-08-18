/**
 * Sync visually matched room-plate hotspots into CMS homepage.
 * Run: node scripts/sync-inspiration-slides.js
 *
 * Rule: only pin sofas/beds that truly match the furniture in frame.
 * Prefer one honest pin over forced multi-pins.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const SiteContent = require("../src/models/SiteContent.model");

function pin(id, x, y, slug, name, price) {
  return {
    id,
    x,
    y,
    product: { name, price, href: `/products/${slug}`, slug },
  };
}

const inspirationSlides = [
  {
    id: "living-room",
    label: "Living Room Edit",
    image: "/home/furnitures_five.jpeg",
    imageAlt:
      "Luxury living room with cream upholstered seating and warm ambient lighting",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspots: [
      pin(
        "living-main-sofa",
        50,
        56,
        "linea-lounge-modular-sofa",
        "Linea Lounge Modular Sofa",
        "₹1,05,000",
      ),
    ],
  },
  {
    id: "bedroom",
    label: "Bedroom Retreat",
    image: "/home/furnitures_two.jpeg",
    imageAlt: "Serene bedroom with upholstered bed, layered pillows, and soft light",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspots: [
      pin(
        "bedroom-bed",
        50,
        48,
        "aura-softline-bed",
        "Aura Softline Bed",
        "₹65,000",
      ),
    ],
  },
  {
    id: "dining",
    label: "Open Living Edit",
    image: "/home/furnitures_four.jpeg",
    imageAlt:
      "Open-plan living and dining space with curved cream seating and warm lighting",
    imageWidth: 1402,
    imageHeight: 1122,
    hotspots: [
      pin(
        "open-curve-sofa",
        42,
        60,
        "cloud-curve-sofa",
        "Cloud Curve Sofa",
        "₹60,000",
      ),
    ],
  },
  {
    id: "outdoor",
    label: "Terrace Edit",
    image: "/home/furnitures_one.jpeg",
    imageAlt:
      "Luxury outdoor patio with lounge seating, dining area, and garden views at dusk",
    imageWidth: 1536,
    imageHeight: 1024,
    // Woven rope + wood outdoor — no catalogue match
    hotspots: [],
  },
  {
    id: "rooftop",
    label: "Rooftop Lounge",
    image: "/home/furnitures_three.jpeg",
    imageAlt:
      "Rooftop terrace with curved outdoor seating and city views at sunset",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspots: [
      pin(
        "rooftop-curve",
        52,
        58,
        "lunara-arc-sofa",
        "Lunara Arc Sofa",
        "₹1,20,000",
      ),
    ],
  },
  {
    id: "lobby",
    label: "Grand Lobby",
    image: "/home/furnitures_six.jpeg",
    imageAlt:
      "Grand hotel lobby with curved cream seating, marble coffee table, and warm ambient lighting",
    imageWidth: 1402,
    imageHeight: 1122,
    hotspots: [
      pin(
        "lobby-lounge-set",
        48,
        58,
        "cloud-embrace-lounge-set",
        "Cloud Embrace Lounge Set",
        "₹2,00,000",
      ),
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const doc = await SiteContent.findOne({ key: "homepage" });
  if (!doc) {
    console.log("No homepage CMS doc — frontend fallback will be used");
    await mongoose.disconnect();
    return;
  }

  const data = doc.data && typeof doc.data === "object" ? { ...doc.data } : {};
  data.inspirations = {
    title: (data.inspirations && data.inspirations.title) || "Product Inspirations",
    slides: inspirationSlides,
  };
  doc.data = data;
  doc.markModified("data");
  await doc.save();

  console.log("Synced", inspirationSlides.length, "room slides with honest pins");
  inspirationSlides.forEach((s) =>
    console.log(
      " ",
      s.id,
      "→",
      s.hotspots.length
        ? s.hotspots.map((h) => h.product.slug).join(", ")
        : "(no pin — no catalogue match)",
    ),
  );

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
