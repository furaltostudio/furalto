const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "../src/app/globals.css");
let css = fs.readFileSync(cssPath, "utf8");

// Detach home CTA from dark primary button group
css = css.replace(
  `.custom-config-primary,
.custom-config-secondary,
.custom-config-advice-btn,
.home-custom-studio-cta {`,
  `.custom-config-primary,
.custom-config-secondary,
.custom-config-advice-btn {`
);

css = css.replace(
  `.custom-config-primary,
.home-custom-studio-cta {
  background: var(--navy);
  color: #fff;
  padding: 0.95rem 1.35rem;
}

.custom-config-primary:hover,
.home-custom-studio-cta:hover {
  background: var(--navy-light);
  transform: translateY(-1px);
}`,
  `.custom-config-primary {
  background: var(--navy);
  color: #fff;
  padding: 0.95rem 1.35rem;
}

.custom-config-primary:hover {
  background: var(--navy-light);
  transform: translateY(-1px);
}`
);

const start = css.indexOf("\n.home-custom-studio {");
if (start < 0) {
  console.error("block not found");
  process.exit(1);
}

const before = css.slice(0, start).replace(/\s+$/, "\n");

const replacement = `
.home-custom-studio {
  position: relative;
  padding: clamp(3.5rem, 8vw, 6rem) 0;
  background:
    radial-gradient(ellipse at 12% 20%, rgba(168, 148, 120, 0.16), transparent 42%),
    linear-gradient(180deg, #fff 0%, var(--cream) 55%, #f7f1e8 100%);
  overflow: hidden;
}

.home-custom-studio::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: min(8rem, 30vw);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
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
}

.home-custom-studio-eyebrow {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
}

.home-custom-studio-rule {
  display: block;
  width: 2.5rem;
  height: 1px;
  margin: 0.75rem 0 1rem;
  background: linear-gradient(90deg, var(--accent), transparent);
}

.home-custom-studio-title {
  margin: 0 0 0.9rem;
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 4.5vw, 3.15rem);
  font-weight: 500;
  line-height: 1.1;
  color: var(--foreground);
}

.home-custom-studio-lead {
  margin: 0 0 1.5rem;
  font-family: var(--font-display);
  font-size: 1.02rem;
  font-style: italic;
  line-height: 1.7;
  color: var(--muted);
}

.home-custom-studio-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.1rem;
  margin: 0 0 1.75rem;
}

.home-custom-studio-swatch {
  display: grid;
  gap: 0.4rem;
  justify-items: center;
}

.home-custom-studio-swatch span {
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid rgba(18, 26, 36, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.home-custom-studio-swatch em {
  font-style: normal;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.home-custom-studio-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.95rem 1.35rem;
  border: 1px solid rgba(18, 26, 36, 0.22);
  background: transparent;
  color: var(--foreground);
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
  background: var(--navy);
  border-color: var(--navy);
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
}

.home-custom-studio-frame {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--border-subtle);
}

@media (min-width: 640px) {
  .home-custom-studio-frame {
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
  color: var(--muted);
}

@media (max-width: 1023px) {
  .home-custom-studio-visual {
    order: -1;
  }

  .home-custom-studio-frame {
    aspect-ratio: 16 / 11;
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

fs.writeFileSync(cssPath, before + replacement, "utf8");
console.log("done", fs.statSync(cssPath).size);
