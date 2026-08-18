/**
 * Import real products from backend/src/data/sofas.import.json into MongoDB.
 * External numeric `id` fields are ignored — products key off slug.
 *
 * Run: npm run import:sofas
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../src/models/Product.model");
const Category = require("../src/models/Category.model");

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const humanizeKey = (key = "") =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const CATEGORY_MAP = {
  sofa: "sofas",
  sofas: "sofas",
  sectional: "sectionals",
  sectionals: "sectionals",
  chair: "chairs",
  chairs: "chairs",
  bed: "beds",
  beds: "beds",
  table: "tables",
  tables: "tables",
};

const linesFrom = (value) => {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) {
    return value.map((line) => cleanText(line)).filter(Boolean);
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, entry]) => {
      const label = humanizeKey(key);
      if (Array.isArray(entry)) {
        return entry.map((line) => `${label}: ${cleanText(line)}`).filter(Boolean);
      }
      return [`${label}: ${cleanText(entry)}`];
    });
  }
  return String(value)
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^["']+|["']+$/g, ""))
    .filter(Boolean);
};

const cleanText = (value = "") =>
  String(value)
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const DEFAULT_BED_MATERIALS = {
  frame: "Kiln-dried hardwood with marine plywood reinforcement and heavy-duty internal support",
  upholstery: "Premium bouclé, velvet, linen blend, or leatherette",
  cushioning: "High-density HR foam with multi-layer soft padding and comfort edge support",
  storage: "Premium hydraulic lift hardware with anti-rust fittings and reinforced hinges",
};

const DEFAULT_CARE = [
  "Vacuum fabric regularly with soft brush attachment",
  "Clean spills immediately using a dry soft cloth",
  "Avoid direct sunlight and excessive moisture",
  "Do not use harsh chemicals or bleach",
  "Operate hydraulic storage smoothly without overloading",
  "Professional upholstery cleaning recommended periodically",
  "Indoor use only",
];

const DEFAULT_PACKAGING =
  "Secure multi-layer protective packaging with foam, corner guards and heavy-duty carton wrapping. Delivered in modular sections. Professional installation available. Dispatch in 10–15 working days (custom finishes may vary).";

const materialsFromDescription = (description) => {
  if (!description || typeof description !== "object" || Array.isArray(description)) {
    return null;
  }

  const materials = {};
  for (const [key, value] of Object.entries(description)) {
    if (Array.isArray(value)) {
      materials[key] = value.map(cleanText).filter(Boolean).join("; ");
    } else if (value != null) {
      materials[key] = cleanText(value);
    }
  }
  return Object.keys(materials).length ? materials : null;
};

const collectImages = (raw, productName) => {
  const images = [];

  if (Array.isArray(raw.images)) {
    images.push(...raw.images);
  }

  Object.keys(raw)
    .filter((key) => /^image_?\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")))
    .forEach((key) => {
      if (raw[key]) images.push(raw[key]);
    });

  ["image", "imageUrl", "thumbnail"].forEach((key) => {
    if (raw[key]) images.push(raw[key]);
  });

  return [...new Set(images.map(String).filter(Boolean))].map((src, index) => ({
    src,
    alt: `${productName} — view ${index + 1}`,
    width: 1200,
    height: 1500,
  }));
};

const objectToSpecs = (value, labelPrefix = "") => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value)
    .map(([key, entryValue]) => ({
      label: labelPrefix ? `${labelPrefix} — ${humanizeKey(key)}` : humanizeKey(key),
      value: String(entryValue ?? "").trim(),
    }))
    .filter((spec) => spec.label && spec.value);
};

const parseDimensionSpecs = (dimensions) => {
  if (!dimensions) return [];
  if (typeof dimensions === "object") {
    return objectToSpecs(dimensions);
  }

  const specs = [];
  for (const line of linesFrom(dimensions)) {
    if (!line.includes(":")) continue;
    const [label, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (label && value) {
      specs.push({ label: label.trim(), value });
    }
  }
  return specs;
};

const normalizeCategory = (value = "sofas") => {
  const slug = slugify(value);
  return CATEGORY_MAP[slug] || (slug.endsWith("s") ? slug : `${slug}s`) || "sofas";
};

const normalizeProduct = (raw) => {
  // Explicitly ignore external ids like { id: 2 }
  const { id: _ignoredId, ...source } = raw || {};

  const name = String(
    source.productName ||
      source["Products Name"] ||
      source.name ||
      source.title ||
      ""
  ).trim();
  if (!name) {
    throw new Error("Product missing name / productName");
  }

  const slug = slugify(source.slug || name);
  const category = normalizeCategory(source.category || "sofas");
  const images = collectImages(source, name);
  if (images.length === 0) {
    throw new Error(`Product "${name}" has no images`);
  }

  const price = Number(String(source.price ?? source.Price ?? "").replace(/,/g, ""));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Product "${name}" needs a valid price`);
  }

  const mrp = Number(
    String(source.mrp ?? source.MRP ?? source.compareAtPrice ?? "").replace(/,/g, "")
  );
  const compareAtPrice = Number.isFinite(mrp) && mrp > price ? mrp : undefined;

  const packagingRaw =
    source.packaging ||
    source.packagingAndDelivery ||
    source["Packaging & Delivery"] ||
    "";

  const designFeatureLines = linesFrom(
    source.designFeatures || source["Design Features"]
  );
  let careLines = linesFrom(
    source.careInstructions || source["Care Instructions"]
  );
  let packagingLines = linesFrom(packagingRaw);

  if (!careLines.length && category === "beds") {
    careLines = DEFAULT_CARE;
  }
  if (!packagingLines.length && category === "beds") {
    packagingLines = [DEFAULT_PACKAGING];
  }

  const details = [
    ...(Array.isArray(source.features) ? source.features.map(String) : []),
    ...designFeatureLines,
    ...(packagingLines.length ? [packagingLines.join(". ")] : []),
    ...linesFrom(source.packageDetails),
    ...(Array.isArray(source.care) ? source.care.map((line) => `Care: ${line}`) : []),
    ...careLines.map((line) => `Care: ${line}`),
  ];

  if (Array.isArray(source.details)) {
    details.push(...source.details.map(String));
  }

  const fromDescriptionObject = materialsFromDescription(source.description);
  const sameAsAeris =
    typeof source.description === "string" &&
    /same structure|same materials|as aeris/i.test(source.description);

  const materials =
    source.materials ||
    fromDescriptionObject ||
    (sameAsAeris || (category === "beds" && !source.materials && !fromDescriptionObject)
      ? DEFAULT_BED_MATERIALS
      : null);

  // Sparse beds without materials still get defaults above when category is beds
  const resolvedMaterials =
    materials ||
    (category === "beds" ? DEFAULT_BED_MATERIALS : {});

  const materialDetails = objectToSpecs(resolvedMaterials, "Material").map(
    (spec) => `${spec.label.replace(/^Material — /, "")}: ${spec.value}`
  );

  const dimensionsRaw =
    source.dimensions ?? source["Dimensions "] ?? source.Dimensions ?? source.dimension;

  const specs = [
    ...parseDimensionSpecs(dimensionsRaw),
    ...objectToSpecs(resolvedMaterials),
    ...(source.weight || source.Weight
      ? [{ label: "Weight", value: String(source.weight || source.Weight).trim() }]
      : []),
    ...(Array.isArray(source.specs)
      ? source.specs
          .map((spec) => ({
            label: String(spec.label || spec.key || "").trim(),
            value: String(spec.value || "").trim(),
          }))
          .filter((spec) => spec.label && spec.value)
      : []),
  ];

  const rawDescription =
    typeof source.description === "string"
      ? cleanText(source.description)
      : "";
  const isStructureDump =
    /^internal structure/i.test(rawDescription) ||
    sameAsAeris ||
    typeof source.description === "object";
  const marketingLead = isStructureDump
    ? designFeatureLines.slice(0, 3).join(". ")
    : rawDescription;

  const descriptionParts = [
    marketingLead,
    ...(Array.isArray(source.features) ? source.features : []),
    ...materialDetails,
  ].filter(Boolean);

  const description =
    descriptionParts.join(". ").replace(/\.\s*\./g, ".") || `${name} by Furalto.`;

  const rooms =
    Array.isArray(source.rooms) && source.rooms.length
      ? source.rooms
      : category === "beds"
        ? ["bedroom"]
        : [];

  return {
    slug,
    name,
    category,
    subcategory: "",
    collection: category,
    price,
    compareAtPrice,
    description,
    details: [...new Set(details.filter(Boolean))],
    specs,
    images,
    fabrics: Array.isArray(source.fabrics) ? source.fabrics : [],
    finishes: Array.isArray(source.finishes) ? source.finishes : [],
    sizes: Array.isArray(source.sizes) ? source.sizes : [],
    relatedSlugs: Array.isArray(source.relatedSlugs) ? source.relatedSlugs : [],
    rooms,
    isActive: source.isActive !== false,
  };
};

async function ensureCategory(slug) {
  const name = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  await Category.updateOne(
    { slug },
    {
      $setOnInsert: {
        name,
        slug,
        sortOrder: 10,
        isActive: true,
        subcategories: [],
      },
    },
    { upsert: true }
  );
}

async function main() {
  const fileName = process.argv[2] || "sofas.import.json";
  const dataPath = path.isAbsolute(fileName)
    ? fileName
    : path.join(__dirname, "../src/data", fileName);
  if (!fs.existsSync(dataPath)) {
    console.error(`Missing file: ${dataPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const rows = Array.isArray(raw)
    ? raw
    : raw.products || raw.sofas || raw.beds || Object.values(raw);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`${path.basename(dataPath)} must be a non-empty array`);
  }

  const products = rows.map(normalizeProduct);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.name}`);
  console.log(`Importing ${products.length} products from ${path.basename(dataPath)}`);

  for (const product of products) {
    await ensureCategory(product.category);
  }

  const result = await Product.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { slug: product.slug },
        update: { $set: product },
        upsert: true,
      },
    }))
  );

  const total = await Product.countDocuments();
  console.log(
    `Imported: upserted=${result.upsertedCount} modified=${result.modifiedCount} totalProducts=${total}`
  );
  for (const product of products) {
    console.log(
      `- ${product.slug} | ${product.name} | ₹${product.price} | ${product.images.length} images | ${product.category}`
    );
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
