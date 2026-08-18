/**
 * Migrate frontend/src/config/products.ts category fields to flat furniture types.
 * Run from repo root: node backend/scripts/migrate-frontend-products-config.js
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../frontend/src/config/products.ts");
let source = fs.readFileSync(filePath, "utf8");

const OLD_ROOMS = new Set([
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

// Transform each product-like object block by rewriting category/subcategory/collection/rooms
// Heuristic: find `category: "..." , subcategory: "..."` pairs.
source = source.replace(
  /category:\s*"([^"]+)",\s*\n(\s*)subcategory:\s*"([^"]+)",\s*\n(\s*)collection:\s*"([^"]+)"/g,
  (match, category, indent1, subcategory, indent2, collection) => {
    if (!OLD_ROOMS.has(category) || !subcategory) {
      return match;
    }
    return `category: "${subcategory}",\n${indent1}subcategory: "",\n${indent2}collection: "${subcategory}"`;
  }
);

// Ensure rooms arrays include former category when missing — skip complex rewrite; rooms already present in file.

fs.writeFileSync(filePath, source);
console.log("Updated", filePath);
