const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "../src/app/globals.css");
const originalText = fs.readFileSync(cssPath, "utf8");
const marker = "Custom furniture studio";
const idx = originalText.indexOf(marker);
let head = originalText;

if (idx >= 0) {
  const commentStart = originalText.lastIndexOf("/*", idx);
  head = originalText.slice(0, commentStart).replace(/\s+$/, "") + "\n";
}

const css = `
/* -- Custom furniture studio -- */
.custom-studio-page {
  padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 8vw, 6rem);
  background:
    radial-gradient(ellipse at top, rgba(168, 148, 120, 0.12), transparent 55%),
    linear-gradient(180deg, rgba(254, 247, 239, 0.95) 0%, #fff 42%, var(--cream) 100%);
}

.custom-config-loading,
.custom-config-success {
  max-width: 36rem;
  padding: 2rem 0 3rem;
}

.custom-config-rule {
  display: block;
  width: 2.5rem;
  height: 1px;
  margin: 0.75rem 0 1rem;
  background: linear-gradient(90deg, var(--accent), transparent);
}

.custom-config-success h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.85rem, 3.5vw, 2.6rem);
  line-height: 1.2;
  margin: 0 0 1rem;
}

.custom-config-success p {
  color: var(--muted);
  line-height: 1.7;
  font-size: 0.98rem;
}

.custom-config-progress {
  height: 1px;
  background: rgba(18, 26, 36, 0.08);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.custom-config-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  transition: width 0.45s var(--ease-premium);
}

.custom-config-steps {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.25rem;
  margin-bottom: clamp(1.75rem, 4vw, 2.5rem);
  overflow-x: auto;
  padding-bottom: 0.35rem;
  scrollbar-width: thin;
}

.custom-config-step {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  min-width: 4.5rem;
  border: none;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  padding: 0.45rem 0.65rem 0.7rem;
  cursor: pointer;
  transition:
    color 0.3s var(--ease-premium),
    border-color 0.3s var(--ease-premium);
}

.custom-config-step-index {
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  opacity: 0.7;
}

.custom-config-step-label {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.custom-config-step.is-active,
.custom-config-step.is-done {
  color: var(--foreground);
  border-bottom-color: var(--accent);
}

.custom-config-layout {
  display: grid;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .custom-config-layout {
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.85fr);
    gap: 2.5rem;
    align-items: start;
  }
}

.custom-config-kicker {
  margin: 0 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
}

.custom-config-main h2 {
  font-family: var(--font-display);
  font-size: clamp(1.85rem, 3.4vw, 2.55rem);
  font-weight: 500;
  line-height: 1.15;
  margin: 0 0 0.75rem;
}

.custom-config-lead {
  max-width: 34rem;
  margin: 0 0 1.75rem;
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-style: italic;
  line-height: 1.7;
  color: var(--muted);
}

.custom-config-muted,
.custom-config-disclaimer,
.custom-config-summary-note,
.custom-config-summary-hint {
  color: var(--muted);
  line-height: 1.6;
}

.custom-config-options {
  display: grid;
  gap: 0.9rem;
}

@media (min-width: 640px) {
  .custom-config-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.custom-config-option {
  display: grid;
  grid-template-columns: 4.25rem minmax(0, 1fr);
  gap: 0.95rem;
  text-align: left;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.62);
  padding: 0.9rem;
  cursor: pointer;
  transition:
    border-color 0.35s var(--ease-premium),
    transform 0.35s var(--ease-premium),
    box-shadow 0.35s var(--ease-premium),
    background 0.35s var(--ease-premium);
}

.custom-config-option:hover {
  transform: translateY(-2px);
  border-color: rgba(168, 148, 120, 0.45);
  box-shadow: 0 12px 28px rgba(9, 14, 22, 0.06);
}

.custom-config-option.is-selected {
  border-color: rgba(168, 148, 120, 0.7);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 32px rgba(9, 14, 22, 0.07);
}

.custom-config-swatch {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid rgba(18, 26, 36, 0.08);
}

.custom-config-option-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.custom-config-option-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.custom-config-option-label {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.25;
}

.custom-config-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  background: var(--navy);
  color: #fff;
  flex-shrink: 0;
}

.custom-config-option-desc {
  margin-top: 0.35rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--muted);
}

.custom-config-option-price {
  margin-top: auto;
  padding-top: 0.7rem;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--foreground);
}

.custom-config-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(18, 26, 36, 0.08);
}

.custom-config-primary,
.custom-config-secondary,
.custom-config-advice-btn,
.home-custom-studio-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition:
    background 0.3s var(--ease-premium),
    color 0.3s var(--ease-premium),
    border-color 0.3s var(--ease-premium),
    transform 0.3s var(--ease-premium);
}

.custom-config-primary,
.home-custom-studio-cta {
  background: var(--navy);
  color: #fff;
  padding: 0.95rem 1.35rem;
}

.custom-config-primary:hover,
.home-custom-studio-cta:hover {
  background: var(--navy-light);
  transform: translateY(-1px);
}

.custom-config-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.custom-config-secondary {
  background: transparent;
  border: 1px solid rgba(18, 26, 36, 0.18);
  color: var(--foreground);
  padding: 0.95rem 1.25rem;
}

.custom-config-secondary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.custom-config-summary {
  border: 1px solid rgba(168, 148, 120, 0.28);
  background:
    linear-gradient(165deg, rgba(13, 21, 32, 0.97), rgba(24, 36, 51, 0.98));
  color: #f4efe8;
  padding: 1.6rem 1.5rem 1.5rem;
  position: sticky;
  top: calc(var(--site-header-offset) + 1rem);
}

.custom-config-summary .custom-config-eyebrow {
  color: var(--accent-light);
}

.custom-config-price {
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 4vw, 2.85rem);
  font-weight: 500;
  line-height: 1;
  margin: 0.35rem 0 0.85rem;
  color: #fff;
}

.custom-config-summary-note {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(244, 239, 232, 0.62);
}

.custom-config-breakdown {
  list-style: none;
  padding: 1.15rem 0;
  margin: 1.15rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  gap: 0.55rem;
}

.custom-config-breakdown li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.84rem;
  color: rgba(244, 239, 232, 0.72);
}

.custom-config-breakdown strong {
  color: #fff;
  font-weight: 500;
}

.custom-config-selection {
  margin: 0 0 1.1rem;
  font-size: 0.88rem;
  line-height: 1.55;
  color: rgba(244, 239, 232, 0.72);
}

.custom-config-selection-swatches {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.custom-config-selection-swatches span {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.custom-config-selection-title {
  margin: 0 0 0.25rem;
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: #fff;
}

.custom-config-selection p {
  margin: 0;
}

.custom-config-advice-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(212, 196, 181, 0.4);
  color: var(--champagne);
  padding: 0.8rem 1rem;
  margin: 0.25rem 0 0.85rem;
}

.custom-config-advice-btn:hover {
  border-color: var(--champagne);
  color: #fff;
}

.custom-config-advice {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-style: italic;
  line-height: 1.65;
  color: rgba(244, 239, 232, 0.88);
}

.custom-config-summary-hint {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: rgba(244, 239, 232, 0.5);
}

.custom-config-disclaimer {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.55;
  color: rgba(244, 239, 232, 0.42);
}

.custom-config-form-grid {
  display: grid;
  gap: 0.95rem;
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
  gap: 0.4rem;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.custom-config-form input,
.custom-config-form textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.8);
  padding: 0.85rem 0.95rem;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: normal;
  text-transform: none;
  color: var(--foreground);
  transition: border-color 0.25s var(--ease-premium);
}

.custom-config-form input:focus,
.custom-config-form textarea:focus {
  outline: none;
  border-color: rgba(168, 148, 120, 0.7);
}

.custom-config-error {
  color: #b42318;
  margin: 0.85rem 0;
}

.custom-config-eyebrow {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
}

.home-custom-studio {
  position: relative;
  isolation: isolate;
}

.home-custom-studio-inner {
  position: relative;
  min-height: clamp(28rem, 62vw, 36rem);
  overflow: hidden;
}

.home-custom-studio-media {
  position: absolute;
  inset: 0;
}

.home-custom-studio-media > span,
.home-custom-studio-image {
  object-fit: cover;
}

.home-custom-studio-image {
  transform: scale(1.02);
  transition: transform 1.2s var(--ease-premium);
}

.home-custom-studio-inner:hover .home-custom-studio-image {
  transform: scale(1.06);
}

.home-custom-studio-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      105deg,
      rgba(9, 14, 22, 0.78) 0%,
      rgba(9, 14, 22, 0.55) 42%,
      rgba(9, 14, 22, 0.22) 100%
    );
}

.home-custom-studio-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-height: inherit;
  padding-block: clamp(3rem, 8vw, 5.5rem);
}

.home-custom-studio-panel {
  max-width: 34rem;
  color: #f7f2eb;
}

.home-custom-studio-eyebrow {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-light);
}

.home-custom-studio-rule {
  display: block;
  width: 2.5rem;
  height: 1px;
  margin: 0.85rem 0 1rem;
  background: linear-gradient(90deg, var(--accent-light), transparent);
}

.home-custom-studio-title {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 500;
  line-height: 1.1;
  color: #fff;
}

.home-custom-studio-lead {
  margin: 0 0 1.75rem;
  max-width: 30rem;
  font-family: var(--font-display);
  font-size: 1.02rem;
  font-style: italic;
  line-height: 1.7;
  color: rgba(247, 242, 235, 0.78);
}

.home-custom-studio-cta svg {
  transition: transform 0.3s var(--ease-premium);
}

.home-custom-studio-cta:hover svg {
  transform: translateX(3px);
}

@media (max-width: 767px) {
  .custom-config-option {
    grid-template-columns: 3.5rem minmax(0, 1fr);
    gap: 0.75rem;
  }

  .custom-config-summary {
    position: static;
  }

  .home-custom-studio-inner {
    min-height: 26rem;
  }
}
`;

fs.writeFileSync(cssPath, head + css, "utf8");
console.log("css updated", fs.statSync(cssPath).size);
