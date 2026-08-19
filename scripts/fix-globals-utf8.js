const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "../src/app/globals.css");
const original = fs.readFileSync(cssPath);
const originalText = original.toString("utf8");

const marker = "Custom furniture studio";
const idx = originalText.indexOf(marker);
let head = originalText;

if (idx >= 0) {
  const commentStart = originalText.lastIndexOf("/*", idx);
  head = originalText.slice(0, commentStart);
}

head = head.replace(/\uFFFD/g, "").replace(/\s+$/, "") + "\n";

const css = `
/* -- Custom furniture studio -- */
.custom-studio-page {
  padding: 3rem 0 5rem;
  background:
    linear-gradient(180deg, rgba(248, 245, 240, 0.9), rgba(255, 255, 255, 1));
}

.custom-config-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.custom-config-step {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid rgba(28, 25, 23, 0.12);
  background: transparent;
  color: var(--color-muted, #6b6560);
  padding: 0.55rem 0.85rem;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.custom-config-step span {
  opacity: 0.55;
}

.custom-config-step.is-active,
.custom-config-step.is-done {
  border-color: rgba(28, 25, 23, 0.4);
  color: var(--color-ink, #1c1917);
}

.custom-config-layout {
  display: grid;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .custom-config-layout {
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
    align-items: start;
  }
}

.custom-config-main h2 {
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(1.75rem, 3vw, 2.4rem);
  font-weight: 400;
  margin: 0 0 0.65rem;
}

.custom-config-lead,
.custom-config-muted,
.custom-config-disclaimer {
  color: var(--color-muted, #6b6560);
  line-height: 1.6;
}

.custom-config-options {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

@media (min-width: 640px) {
  .custom-config-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.custom-config-option {
  text-align: left;
  border: 1px solid rgba(28, 25, 23, 0.12);
  background: #fff;
  padding: 1rem 1.1rem;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.custom-config-option:hover,
.custom-config-option.is-selected {
  border-color: rgba(28, 25, 23, 0.55);
}

.custom-config-option-label {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.35rem;
}

.custom-config-option-desc,
.custom-config-option-price {
  display: block;
  font-size: 0.86rem;
  color: var(--color-muted, #6b6560);
  line-height: 1.45;
}

.custom-config-option-price {
  margin-top: 0.55rem;
  color: var(--color-ink, #1c1917);
}

.custom-config-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.custom-config-primary,
.custom-config-secondary,
.custom-config-advice-btn,
.home-custom-studio-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.custom-config-primary,
.home-custom-studio-cta {
  background: var(--color-ink, #1c1917);
  color: #fff;
  padding: 0.9rem 1.25rem;
  font-size: 0.86rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.custom-config-secondary {
  background: transparent;
  border: 1px solid rgba(28, 25, 23, 0.2);
  color: var(--color-ink, #1c1917);
  padding: 0.9rem 1.25rem;
}

.custom-config-summary {
  border: 1px solid rgba(28, 25, 23, 0.1);
  background: #f7f3ed;
  padding: 1.5rem;
  position: sticky;
  top: 6rem;
}

.custom-config-eyebrow,
.home-custom-studio-eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted, #6b6560);
  margin: 0 0 0.75rem;
}

.custom-config-price {
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin: 0 0 0.75rem;
}

.custom-config-breakdown {
  list-style: none;
  padding: 0;
  margin: 1.25rem 0;
  display: grid;
  gap: 0.45rem;
}

.custom-config-breakdown li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.9rem;
}

.custom-config-selection {
  margin: 1rem 0;
  font-size: 0.92rem;
  line-height: 1.5;
}

.custom-config-advice-btn {
  width: 100%;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(28, 25, 23, 0.25);
  padding: 0.75rem 1rem;
  margin: 0.75rem 0;
}

.custom-config-advice {
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0.5rem 0 1rem;
}

.custom-config-disclaimer {
  font-size: 0.78rem;
  margin: 0;
}

.custom-config-form-grid {
  display: grid;
  gap: 0.9rem;
}

@media (min-width: 640px) {
  .custom-config-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .custom-config-span-2 {
    grid-column: 1 / -1;
  }
}

.custom-config-form label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.custom-config-form input,
.custom-config-form textarea {
  width: 100%;
  border: 1px solid rgba(28, 25, 23, 0.15);
  background: #fff;
  padding: 0.75rem 0.85rem;
  font: inherit;
}

.custom-config-error {
  color: #b42318;
  margin: 0.75rem 0;
}

.custom-config-success {
  max-width: 40rem;
  padding: 2rem 0 4rem;
}

.custom-config-success h2 {
  font-family: var(--font-display, Georgia, serif);
  font-weight: 400;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}

.home-custom-studio {
  padding: 4.5rem 0;
  background:
    radial-gradient(ellipse at top left, rgba(214, 196, 170, 0.35), transparent 55%),
    linear-gradient(180deg, #f8f5f0 0%, #fff 100%);
}

.home-custom-studio-grid {
  display: grid;
  gap: 2rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .home-custom-studio-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

.home-custom-studio-rule {
  display: block;
  width: 3rem;
  height: 1px;
  background: rgba(28, 25, 23, 0.35);
  margin: 0.85rem 0 1.1rem;
}

.home-custom-studio-title {
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  margin: 0 0 0.85rem;
}

.home-custom-studio-lead {
  color: var(--color-muted, #6b6560);
  max-width: 34rem;
  line-height: 1.65;
  margin: 0 0 1.25rem;
}

.home-custom-studio-points {
  margin: 0 0 1.75rem;
  padding-left: 1.1rem;
  color: var(--color-ink, #1c1917);
  line-height: 1.7;
}

.home-custom-studio-media {
  position: relative;
  min-height: 22rem;
  overflow: hidden;
}

.home-custom-studio-image {
  object-fit: cover;
}
`;

fs.writeFileSync(cssPath, head + css, "utf8");

const check = fs.readFileSync(cssPath);
function findInvalid(buf) {
  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    if (c <= 0x7f) continue;
    if (c >= 0xc2 && c <= 0xdf) {
      if (i + 1 >= buf.length || buf[i + 1] < 0x80 || buf[i + 1] > 0xbf) return i;
      i++;
      continue;
    }
    if (c >= 0xe0 && c <= 0xef) {
      if (
        i + 2 >= buf.length ||
        buf[i + 1] < 0x80 ||
        buf[i + 1] > 0xbf ||
        buf[i + 2] < 0x80 ||
        buf[i + 2] > 0xbf
      ) {
        return i;
      }
      i += 2;
      continue;
    }
    if (c >= 0xf0 && c <= 0xf4) {
      if (
        i + 3 >= buf.length ||
        buf[i + 1] < 0x80 ||
        buf[i + 1] > 0xbf ||
        buf[i + 2] < 0x80 ||
        buf[i + 2] > 0xbf ||
        buf[i + 3] < 0x80 ||
        buf[i + 3] > 0xbf
      ) {
        return i;
      }
      i += 3;
      continue;
    }
    return i;
  }
  return -1;
}

console.log("invalid at", findInvalid(check));
console.log("has custom studio", check.toString("utf8").includes(".custom-studio-page"));
console.log("bytes", check.length);
