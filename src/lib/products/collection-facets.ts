import type { Product } from "@/types/product";

export type PriceBand = {
  id: string;
  label: string;
  min: number;
  max: number;
};

export type FacetOption = {
  id: string;
  label: string;
  count: number;
};

const COARSE_PRICE_BANDS: PriceBand[] = [
  { id: "under-50", label: "Under ₹50,000", min: 0, max: 50_000 },
  { id: "50-100", label: "₹50,000 – ₹1L", min: 50_000, max: 100_000 },
  { id: "100-200", label: "₹1L – ₹2L", min: 100_000, max: 200_000 },
  { id: "200-350", label: "₹2L – ₹3.5L", min: 200_000, max: 350_000 },
  { id: "350-plus", label: "₹3.5L & above", min: 350_000, max: Number.POSITIVE_INFINITY },
];

const STYLE_RULES: { id: string; label: string; pattern: RegExp }[] = [
  { id: "wing", label: "Wing", pattern: /\bwing\b/i },
  { id: "panel", label: "Panel", pattern: /\bpanel\b/i },
  { id: "arc", label: "Arc & curve", pattern: /\b(arc|orbit|shell)\b/i },
  { id: "soft-edge", label: "Soft edge", pattern: /soft[\s-]?edge|softline|softedge/i },
  { id: "block", label: "Block", pattern: /\bblock\b/i },
  { id: "frame", label: "Frame", pattern: /\bframe\b/i },
  { id: "lounge", label: "Lounge", pattern: /\blounge\b|gridlounge/i },
  { id: "layer", label: "Layered", pattern: /\blayer\b/i },
  { id: "edge", label: "Linear edge", pattern: /\bedge\b/i },
  { id: "haven", label: "Haven", pattern: /\bhaven\b/i },
  { id: "radiant", label: "Radiant", pattern: /\bradiant\b/i },
];

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function productText(product: Product) {
  return [
    product.name,
    product.description,
    ...(product.details ?? []),
    ...(product.specs ?? []).map((spec) => `${spec.label} ${spec.value}`),
  ].join(" ");
}

function parseMm(value: string) {
  const match = value.replace(/,/g, "").match(/(\d{3,4})\s*(?:mm)?/i);
  return match ? Number(match[1]) : null;
}

/** Infer mattress size label from specs / copy. */
export function deriveMattressSize(product: Product): string | null {
  const text = productText(product);
  if (/\bqueen\b/i.test(text)) return "Queen";
  if (/\bking\b/i.test(text)) return "King";

  const mattressSpec = (product.specs ?? []).find((spec) =>
    /mattress\s*(size|width)/i.test(spec.label),
  );
  if (mattressSpec) {
    const nums = [...mattressSpec.value.matchAll(/(\d{3,4})/g)].map((m) =>
      Number(m[1]),
    );
    const width = nums.find((n) => n >= 1400 && n <= 2200);
    if (width != null) {
      if (width >= 1800) return "King";
      if (width >= 1500) return "Queen";
    }
    if (/72\s*["”]?\s*[x×]\s*78/i.test(mattressSpec.value)) return "King";
  }

  const overallWidth = (product.specs ?? []).find((spec) =>
    /overall\s*width|^width$/i.test(spec.label),
  );
  if (overallWidth) {
    const width = parseMm(overallWidth.value);
    if (width != null && width >= 1900 && width < 2500) return "King";
  }

  return null;
}

/** First matching silhouette style from product name. */
export function deriveStyle(product: Product): string | null {
  for (const rule of STYLE_RULES) {
    if (rule.pattern.test(product.name)) return rule.label;
  }
  return null;
}

/** Compact vs extended footprint from overall width. */
export function deriveProfile(product: Product): string | null {
  const widthSpec = (product.specs ?? []).find((spec) =>
    /overall\s*width|^width|extended/i.test(spec.label),
  );
  if (!widthSpec) return null;
  const width = parseMm(widthSpec.value);
  if (width == null) return null;
  if (width >= 2500) return "Extended";
  if (width >= 1800) return "Standard";
  return "Compact";
}

export function productHasStorage(product: Product): boolean {
  return /hydraulic|storage/i.test(productText(product));
}

export function productOnSale(product: Product): boolean {
  return Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
}

export function adaptivePriceBands(products: Product[]): PriceBand[] {
  if (products.length === 0) return [];

  const prices = uniqueSorted(products.map((p) => String(p.price))).map(Number);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const coarseHits = COARSE_PRICE_BANDS.filter((band) =>
    products.some((p) => p.price >= band.min && p.price < band.max),
  );

  // Narrow catalog (e.g. beds): expose exact price tiers so filters actually split.
  if (coarseHits.length <= 1 && prices.length >= 2 && max - min <= 80_000) {
    return prices.map((price) => ({
      id: `exact-${price}`,
      label: formatInr(price),
      min: price,
      max: price + 1,
    }));
  }

  return coarseHits;
}

function countBy(
  products: Product[],
  getValue: (product: Product) => string | null,
): FacetOption[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const value = getValue(product);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ id: label, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export type CollectionFacets = {
  rooms: FacetOption[];
  collections: string[];
  fabrics: FacetOption[];
  finishes: FacetOption[];
  sizes: FacetOption[];
  styles: FacetOption[];
  profiles: FacetOption[];
  bands: PriceBand[];
  saleCount: number;
  reviewCount: number;
  storageCount: number;
  /** True when every product is on sale — hide the offer toggle. */
  allOnSale: boolean;
};

export function buildCollectionFacets(products: Product[]): CollectionFacets {
  const roomValues = uniqueSorted(products.flatMap((p) => p.rooms ?? []));
  const collectionValues = uniqueSorted(
    products.map((p) => p.collection).filter(Boolean),
  );

  const optionSizes = uniqueSorted(
    products.flatMap((p) => (p.sizes ?? []).map((s) => s.label)),
  );
  const derivedSizes = countBy(products, deriveMattressSize);
  const sizes =
    optionSizes.length > 0
      ? optionSizes.map((label) => ({
          id: label,
          label,
          count: products.filter((p) =>
            (p.sizes ?? []).some((s) => s.label === label),
          ).length,
        }))
      : derivedSizes;

  const fabrics = uniqueSorted(
    products.flatMap((p) => (p.fabrics ?? []).map((f) => f.label)),
  ).map((label) => ({
    id: label,
    label,
    count: products.filter((p) =>
      (p.fabrics ?? []).some((f) => f.label === label),
    ).length,
  }));

  const finishes = uniqueSorted(
    products.flatMap((p) => (p.finishes ?? []).map((f) => f.label)),
  ).map((label) => ({
    id: label,
    label,
    count: products.filter((p) =>
      (p.finishes ?? []).some((f) => f.label === label),
    ).length,
  }));

  const saleCount = products.filter(productOnSale).length;
  const reviewCount = products.filter(
    (p) => (p.reviewCount ?? 0) > 0 || (p.averageRating ?? 0) > 0,
  ).length;
  const storageCount = products.filter(productHasStorage).length;

  return {
    rooms: roomValues.map((room) => ({
      id: room,
      label: room
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      count: products.filter((p) => (p.rooms ?? []).includes(room)).length,
    })),
    collections: collectionValues,
    fabrics,
    finishes,
    sizes,
    styles: countBy(products, deriveStyle),
    profiles: countBy(products, deriveProfile),
    bands: adaptivePriceBands(products),
    saleCount,
    reviewCount,
    storageCount,
    allOnSale: saleCount > 0 && saleCount === products.length,
  };
}

export function matchesPriceBand(product: Product, band: PriceBand) {
  return product.price >= band.min && product.price < band.max;
}

export function matchesSizeFilter(product: Product, selected: string[]) {
  if (selected.length === 0) return true;
  const fromOptions = (product.sizes ?? []).map((s) => s.label);
  if (fromOptions.length > 0) {
    return fromOptions.some((label) => selected.includes(label));
  }
  const derived = deriveMattressSize(product);
  return derived != null && selected.includes(derived);
}

export function matchesStyleFilter(product: Product, selected: string[]) {
  if (selected.length === 0) return true;
  const style = deriveStyle(product);
  return style != null && selected.includes(style);
}

export function matchesProfileFilter(product: Product, selected: string[]) {
  if (selected.length === 0) return true;
  const profile = deriveProfile(product);
  return profile != null && selected.includes(profile);
}
