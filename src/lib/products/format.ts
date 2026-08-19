export function formatInrPrice(amount: number): string {
  const abs = Math.round(Math.abs(amount));
  const sign = amount < 0 ? "-" : "";
  const digits = String(abs);

  if (digits.length <= 3) {
    return `₹${sign}${digits}`;
  }

  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${sign}${rest},${lastThree}`;
}

/** Soften ALL-CAPS catalog names (whole string or individual tokens). */
export function formatProductName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed === trimmed.toUpperCase()) {
    return trimmed.toLowerCase().replace(/\b([a-z])/g, (char) => char.toUpperCase());
  }

  return trimmed.replace(/\b([A-Z]{2,})\b/g, (word) =>
    word.toLowerCase().replace(/^[a-z]/, (char) => char.toUpperCase()),
  );
}

/** Title-case a slug or category label (`sofas` → `Sofas`). */
export function formatCategoryLabel(value: string): string {
  return value
    .trim()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b([a-z])/g, (char) => char.toUpperCase());
}

/** Short buy-box lede — prefer design copy before construction specs. */
export function getProductLede(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    return "";
  }

  const frameSplit = trimmed.search(/\bFrame\s*:/i);
  if (frameSplit > 24) {
    return trimmed.slice(0, frameSplit).trim().replace(/[.\s]+$/, "") + ".";
  }

  const sentence = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  return sentence?.[1] || trimmed;
}

/** Design highlights for chips — skip care / delivery logistics lines. */
export function getProductHighlights(details: string[], limit = 4): string[] {
  return details
    .filter((detail) => {
      const value = detail.trim();
      return value && !/^care\s*:/i.test(value) && !/^delivered\b/i.test(value);
    })
    .slice(0, limit);
}
