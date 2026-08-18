/**
 * One-shot helper: rewrite default-categories.js (flat) and migrate products.json.
 * Run: node scripts/build-flat-categories.js
 */
const fs = require("fs");
const path = require("path");

const preferred = {
  tables: "Tables",
  chairs: "Chairs",
  sofas: "Sofas",
  rugs: "Rugs",
  pillows: "Pillows & Throws",
  lighting: "Lighting",
  mirrors: "Mirrors",
  benches: "Benches",
  storage: "Storage",
  dining: "Dining Sets",
  outdoor: "Outdoor Rugs",
  living: "Living Sale",
  bedroom: "Bedroom Sale",
  clearance: "Clearance",
  bars: "Bars",
  textiles: "Textiles",
};

const oldPath = path.join(__dirname, "../src/data/default-categories.js");
// Prefer rebuilding from previous room taxonomy if still nested; otherwise keep current.
delete require.cache[require.resolve("../src/data/default-categories.js")];

let bySlug = new Map();

// Hard-coded promotion list from the pre-flatten room taxonomy (stable even if file already flat).
const legacySubs = [
  ["chairs", "Chairs"],
  ["sofas", "Sofas"],
  ["sectionals", "Sectionals"],
  ["loungers", "Chaises & Daybeds"],
  ["dining", "Dining Sets"],
  ["tables", "Tables"],
  ["benches", "Benches"],
  ["fire-pits", "Fire Pits & Heat Lamps"],
  ["planters", "Planters"],
  ["lighting", "Lighting"],
  ["umbrellas", "Umbrellas"],
  ["rugs", "Rugs"],
  ["pillows", "Pillows & Throws"],
  ["lounge-chairs", "Lounge Chairs"],
  ["coffee-tables", "Coffee Tables"],
  ["side-tables", "Side Tables"],
  ["media-consoles", "Media Consoles"],
  ["bookcases", "Bookcases & Shelving"],
  ["throws", "Throws & Blankets"],
  ["mirrors", "Mirrors"],
  ["decor", "Vases & Objects"],
  ["stools", "Bar & Counter Stools"],
  ["sideboards", "Sideboards & Buffets"],
  ["bar-cabinets", "Bar Cabinets"],
  ["tabletop", "Tabletop"],
  ["serveware", "Serveware"],
  ["beds", "Beds"],
  ["nightstands", "Nightstands"],
  ["dressers", "Dressers"],
  ["chests", "Chests"],
  ["bedding", "Bedding"],
  ["vanities", "Vanities"],
  ["storage", "Storage"],
  ["linen-towers", "Linen Towers"],
  ["towels", "Towels & Linens"],
  ["accessories", "Bath Accessories"],
  ["pendants", "Pendant Lights"],
  ["chandeliers", "Chandeliers"],
  ["floor-lamps", "Floor Lamps"],
  ["table-lamps", "Table Lamps"],
  ["sconces", "Wall Sconces"],
  ["objects", "Objects"],
  ["vases", "Vases"],
  ["candles", "Candles"],
  ["trays", "Trays"],
  ["wall-art", "Wall Art"],
  ["frames", "Frames"],
  ["area-rugs", "Area Rugs"],
  ["runners", "Runners"],
  ["outdoor", "Outdoor Rugs"],
  ["desks", "Desks"],
  ["living", "Living Sale"],
  ["bedroom", "Bedroom Sale"],
  ["clearance", "Clearance"],
  ["bars", "Bars"],
  ["textiles", "Textiles"],
];

for (const [slug, name] of legacySubs) {
  bySlug.set(slug, preferred[slug] || name);
}

let order = 10;
const categories = [...bySlug.entries()].map(([slug, name]) => {
  const item = {
    name,
    slug,
    sortOrder: order,
    subcategories: [],
  };
  order += 10;
  return item;
});

const categoriesFile = `/**
 * Flat furniture-type taxonomy (client data has no room-level parent).
 * Seeded into MongoDB when empty / by migrate-to-flat-categories.
 * Admins can edit freely after seed.
 */
module.exports = ${JSON.stringify(categories, null, 2)};
`;

fs.writeFileSync(oldPath, categoriesFile);

const productsPath = path.join(__dirname, "../src/data/products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

const alreadyFlat = products.every(
  (p) => p.subcategory === "" || p.subcategory === undefined || p.category === p.subcategory
);

const migrated = products.map((p) => {
  // If already migrated (category looks like old subcategory, subcategory empty), leave alone.
  if (p.subcategory === "" || p.subcategory == null) {
    return { ...p, subcategory: "" };
  }

  const oldCategory = p.category;
  const oldSub = p.subcategory;
  const rooms = Array.from(new Set([...(p.rooms || []), oldCategory].filter(Boolean)));

  return {
    ...p,
    category: oldSub,
    subcategory: "",
    collection: oldSub || p.collection,
    rooms,
  };
});

fs.writeFileSync(productsPath, JSON.stringify(migrated, null, 2) + "\n");

console.log("Wrote", categories.length, "flat categories");
console.log("Migrated", migrated.length, "products (alreadyFlat hint:", alreadyFlat, ")");
console.log(
  "Sample:",
  migrated.slice(0, 3).map((p) => ({ slug: p.slug, category: p.category, rooms: p.rooms }))
);
