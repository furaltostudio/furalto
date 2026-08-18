const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(
  path.join(__dirname, "../../frontend/src/config/static-pages.ts"),
  "utf8"
);

function extractNamedObject(marker) {
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
  return m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n") : "";
}

function pickSections(block) {
  const sections = [];
  const sectionBlocks = block.split(/\n\s*{\s*\n\s*title:/).slice(1);
  for (const part of sectionBlocks) {
    const chunk = `title:${part}`;
    const title = pickString(chunk, "title");
    const body = pickString(chunk, "body");
    if (title && body) {
      sections.push({ title, body });
    }
    if (sections.length >= 10) break;
  }
  // fallback regex if split failed
  if (sections.length === 0) {
    const re = /title:\s*"((?:\\.|[^"\\])*)"[\s\S]*?body:\s*"((?:\\.|[^"\\])*)"/g;
    let match;
    while ((match = re.exec(block))) {
      sections.push({
        title: match[1].replace(/\\"/g, '"'),
        body: match[2].replace(/\\"/g, '"'),
      });
      if (sections.length >= 10) break;
    }
  }
  return sections;
}

function entryFor(key, title, pagePath, block) {
  return {
    key,
    title,
    type: "page",
    description: `Edit the ${title} page content shown on the website.`,
    path: pagePath,
    data: {
      pagePath,
      eyebrow: pickString(block, "eyebrow"),
      title: pickString(block, "title"),
      description: pickString(block, "description"),
      sections: pickSections(block),
    },
  };
}

function extractChildren(parentMarker, labelPrefix, pathPrefix, keyPrefix) {
  const parent = extractNamedObject(parentMarker);
  if (!parent) {
    console.error("Missing parent", parentMarker);
    return [];
  }
  const entries = [];
  const keyRe = /\n\s+(?:\"([^\"]+)\"|([A-Za-z0-9_-]+))\s*:\s*\{/g;
  let match;
  const keys = [];
  while ((match = keyRe.exec(parent))) {
    const slug = match[1] || match[2];
    if (!slug || slug === "slug") continue;
    // avoid matching nested object keys like title/body inside sections by requiring indentation of 2 spaces under parent... rough filter:
    if (match[0].startsWith("\n    ") || match[0].startsWith("\n  ")) {
      // top-level keys in carePages etc are indented with 2 spaces
      if (match[0].match(/^\n  (?:\"|[A-Za-z])/)) {
        keys.push({ slug, index: match.index });
      }
    }
  }

  // Better: find top-level keys only at 2-space indent
  const topKeyRe = /\n  (?:\"([^\"]+)\"|([A-Za-z0-9_-]+))\s*:\s*\{/g;
  const tops = [];
  while ((match = topKeyRe.exec(parent))) {
    tops.push({ slug: match[1] || match[2], index: match.index + match[0].length - 1 });
  }

  for (const { slug, index } of tops) {
    let depth = 0;
    let end = index;
    for (let i = index; i < parent.length; i += 1) {
      if (parent[i] === "{") depth += 1;
      else if (parent[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    const block = parent.slice(index, end);
    const pageSlug = slug === "index" ? pathPrefix.replace(/\/$/, "") || pathPrefix : `${pathPrefix}/${slug}`;
    const pagePath = pageSlug.startsWith("/") ? pageSlug : `/${pageSlug}`;
    const label =
      slug === "index"
        ? `${labelPrefix} (hub)`
        : `${labelPrefix}: ${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;
    const key = slug === "index" ? keyPrefix : `${keyPrefix}.${slug}`;
    entries.push(entryFor(key, label, pagePath === "//" ? pathPrefix : pagePath, block));
  }

  return entries;
}

const care = extractChildren("export const carePages", "Care", "/care", "page.care");
const guides = extractChildren("export const guidePages", "Guide", "/guides", "page.guides");
const swatches = extractChildren("export const swatchPages", "Swatches", "/swatches", "page.swatches");

// Avoid duplicating page.care / page.swatches hubs already in default-content —
// keep room/topic entries and overwrite hubs with richer extracted copy.
const all = [...care, ...guides, ...swatches];

const outPath = path.join(__dirname, "../src/data/cms-extra-pages.json");
fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
console.log(`Wrote ${all.length} entries`);
all.forEach((e) => console.log(e.key, "|", e.data.title, "| sections:", e.data.sections.length));
