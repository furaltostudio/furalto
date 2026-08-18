const fs = require("fs");
const path = require("path");

const productsPath = path.join(__dirname, "../src/data/products.json");
const frontendProductsPath = path.join(__dirname, "../../frontend/src/config/products.ts");

const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
const updated = products.map((product) => ({
  ...product,
  collection: product.category,
}));
fs.writeFileSync(productsPath, `${JSON.stringify(updated, null, 2)}\n`);

let frontendSource = fs.readFileSync(frontendProductsPath, "utf8");
for (const product of updated) {
  const pattern = new RegExp(
    `(slug:\\s*"${product.slug}"[\\s\\S]*?collection:\\s*)"[^"]+"`
  );
  if (pattern.test(frontendSource)) {
    frontendSource = frontendSource.replace(pattern, `$1"${product.category}"`);
  }
}
fs.writeFileSync(frontendProductsPath, frontendSource);

console.log(`Updated ${updated.length} products: collection = category`);
