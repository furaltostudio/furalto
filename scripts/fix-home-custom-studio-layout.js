const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "../src/app/globals.css");
const css = fs.readFileSync(cssPath, "utf8");
const start = css.indexOf("\n.home-custom-studio {");

if (start < 0) {
  console.error("block not found");
  process.exit(1);
}

const before = css.slice(0, start).replace(/\s+$/, "") + "\n";

const block = `
.home-custom-studio {
  position: relative;
  padding: clamp(3.5rem, 8vw, 6rem) 0;
  background:
    radial-gradient(ellipse at 12% 20%, rgba(168, 148, 120, 0.16), transparent 42%),
    linear-gradient(180deg, #ffffff 0%, #fef7ef 55%, #f7f1e8 100%);
  overflow: clip;
  color: #121a24;
}

.home-custom-studio::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: min(8rem, 30vw);
  height: 1px;
  background: linear-gradient(90deg, transparent, #a89478, transparent);
  transform: translateX(-50%);
}

.home-custom-studio-grid {
  display: grid;
  gap: clamp(2rem, 5vw, 3.5rem);
  align-items: center;
}

@media (min-width: 1024px) {
  .home-custom-studio-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: clamp(2.5rem, 5vw, 4.5rem);
  }
}

.home-custom-studio-copy {
  max-width: 34rem;
  color: #121a24;
}

.home-custom-studio-eyebrow {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a89478;
}

.home-custom-studio-rule {
  display: block;
  width: 2.5rem;
  height: 1px;
  margin: 0.75rem 0 1rem;
  background: linear-gradient(90deg, #a89478, transparent);
}

.home-custom-studio-title {
  margin: 0 0 0.9rem;
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 4.5vw, 3.15rem);
  font-weight: 500;
  line-height: 1.1;
  color: #121a24 !important;
}

.home-custom-studio-lead {
  margin: 0 0 1.5rem;
  font-family: var(--font-display);
  font-size: 1.02rem;
  font-style: italic;
  line-height: 1.7;
  color: #7a756e !important;
}

.home-custom-studio-swatches {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.9rem 1.15rem;
  margin: 0 0 1.75rem;
  padding: 0;
  list-style: none;
}

.home-custom-studio-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  min-width: 2.5rem;
}

.home-custom-studio-swatch-chip {
  display: block;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border: 1px solid rgba(18, 26, 36, 0.12);
  background-color: #d4c4b5;
  background-size: cover;
}

.home-custom-studio-swatch-label {
  display: block;
  font-family: var(--font-sans);
  font-style: normal;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a756e;
}

.home-custom-studio-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.95rem 1.35rem;
  border: 1px solid rgba(18, 26, 36, 0.22);
  background: transparent;
  color: #121a24;
  text-decoration: none;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition:
    background 0.3s var(--ease-premium),
    color 0.3s var(--ease-premium),
    border-color 0.3s var(--ease-premium),
    transform 0.3s var(--ease-premium);
}

.home-custom-studio-cta:hover {
  background: #0d1520;
  border-color: #0d1520;
  color: #fff;
  transform: translateY(-1px);
}

.home-custom-studio-cta svg {
  transition: transform 0.3s var(--ease-premium);
}

.home-custom-studio-cta:hover svg {
  transform: translateX(3px);
}

.home-custom-studio-visual {
  position: relative;
  width: 100%;
  min-width: 0;
}

.home-custom-studio-frame {
  position: relative;
  width: 100%;
  min-height: 18rem;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #f3ebe2;
}

@media (min-width: 640px) {
  .home-custom-studio-frame {
    min-height: 22rem;
    aspect-ratio: 5 / 6;
  }
}

.home-custom-studio-image {
  object-fit: cover;
  transition: transform 1.1s var(--ease-premium);
}

.home-custom-studio-visual:hover .home-custom-studio-image {
  transform: scale(1.04);
}

.home-custom-studio-caption {
  margin: 0.85rem 0 0;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7a756e;
}

@media (max-width: 1023px) {
  .home-custom-studio-visual {
    order: -1;
  }

  .home-custom-studio-frame {
    min-height: 14rem;
    aspect-ratio: 16 / 10;
  }
}

@media (max-width: 767px) {
  .custom-config-option {
    grid-template-columns: 3.5rem minmax(0, 1fr);
    gap: 0.75rem;
  }

  .custom-config-summary {
    position: static;
  }
}
`;

fs.writeFileSync(cssPath, before + block, "utf8");
console.log("fixed", fs.statSync(cssPath).size);
