const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(
  path.join(__dirname, "../../frontend/src/config/static-pages.ts"),
  "utf8"
);

function extractObjectAfter(marker) {
  const idx = src.indexOf(marker);
  if (idx < 0) return null;
  const start = src.indexOf("{", idx);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < src.length; i += 1) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

function pickString(block, key) {
  const re = new RegExp(`${key}:\\s*"((?:\\\\.|[^"\\\\])*)"`);
  const m = block.match(re);
  return m ? m[1].replace(/\\"/g, '"') : "";
}

function pickSections(block) {
  const sections = [];
  const re = /title:\s*"((?:\\.|[^"\\])*)"[\s\S]*?body:\s*"((?:\\.|[^"\\])*)"/g;
  let match;
  while ((match = re.exec(block))) {
    sections.push({
      title: match[1].replace(/\\"/g, '"'),
      body: match[2].replace(/\\"/g, '"'),
    });
    if (sections.length >= 8) break;
  }
  return sections;
}

function pageEntry(slug, group, label, block) {
  return {
    key: `page.${slug.replace(/\//g, ".")}`,
    title: label,
    type: "page",
    description: `Edit the ${label} page content shown on the website.`,
    path: `/${slug === "index" ? "" : slug}`.replace(/\/+/g, "/") || "/",
    data: {
      eyebrow: pickString(block, "eyebrow"),
      title: pickString(block, "title"),
      description: pickString(block, "description"),
      sections: pickSections(block),
    },
  };
}

const staticSlugs = [
  ["about", "About"],
  ["promotions", "Promotions"],
  ["trade-program", "Trade Program"],
  ["shipping", "Shipping & Delivery"],
  ["returns", "Returns & Exchanges"],
  ["privacy", "Privacy Policy"],
  ["terms", "Terms of Use"],
  ["sustainability", "Sustainability"],
  ["careers", "Careers"],
  ["sale-terms", "Sale Terms"],
  ["lookbooks", "Lookbooks"],
];

const entries = [];

for (const [slug, label] of staticSlugs) {
  const marker = slug.includes("-") ? `"${slug}":` : `${slug}:`;
  // Prefer quoted key for hyphenated; for plain keys use `slug:`
  let block = null;
  if (slug.includes("-")) {
    block = extractObjectAfter(`"${slug}":`);
  } else {
    block = extractObjectAfter(`\n  ${slug}:`);
  }
  if (!block) {
    console.error("Missing block", slug);
    continue;
  }
  entries.push(pageEntry(slug, "pages", label, block));
}

// design consultation
const designBlock = extractObjectAfter("export const designConsultationPage");
if (designBlock) {
  entries.push({
    key: "page.design-consultation",
    title: "Design Consultation",
    type: "page",
    description: "Edit the design consultation page.",
    path: "/design/consultation",
    data: {
      eyebrow: pickString(designBlock, "eyebrow"),
      title: pickString(designBlock, "title"),
      description: pickString(designBlock, "description"),
      sections: pickSections(designBlock),
    },
  });
}

const outPath = path.join(__dirname, "generated-page-content.json");
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
console.log(`Wrote ${entries.length} pages to ${outPath}`);
entries.forEach((e) => console.log(e.key, e.data.title || "(no title)", e.data.sections.length));
