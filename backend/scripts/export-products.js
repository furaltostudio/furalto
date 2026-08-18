/**
 * Exports products from frontend config into backend seed JSON.
 * Run: node scripts/export-products.js
 */
const fs = require("fs");
const path = require("path");

const tsPath = path.join(__dirname, "../../frontend/src/config/products.ts");
const outPath = path.join(__dirname, "../src/data/products.json");

let source = fs.readFileSync(tsPath, "utf8");

source = source.replace(/^import.*$/gm, "");
source = source.replace(/const unsplash = \(id: string.*?\n.*?\n.*?\n/s, "");
source = source.replace(/export const products: Product\[\] = /, "const products = ");
source = source.replace(
  /unsplash\("([^"]+)"(?:,\s*(\d+))?(?:,\s*(\d+))?\)/g,
  (_match, id, w = "1200", h = "1500") =>
    `"https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85"`
);
source = source.replace(/export function[\s\S]*$/m, "");
source += "\nmodule.exports = products;\n";

const tempPath = path.join(__dirname, ".products-temp.cjs");
fs.writeFileSync(tempPath, source);

try {
  const products = require(tempPath);
  fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
  console.log(`Exported ${products.length} products to ${outPath}`);
} finally {
  fs.unlinkSync(tempPath);
}
