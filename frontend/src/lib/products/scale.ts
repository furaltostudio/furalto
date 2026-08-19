import type { ProductSpec } from "@/types/product";

const MASCOT_HEIGHT_CM = 175;

export type MeasureUnit = "cm" | "mm" | "in" | "ft";

export type FeetInches = { feet: number; inches: number };

export function parseDimensionCm(value: string | undefined | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  // Unit may sit after a range ("500–520 mm") — don't require it next to the number.
  const unitMatch = trimmed.match(/\b(mm|cm|m)\b/i);
  const amountMatch = trimmed.match(/([\d]+(?:[.,]\d+)?)/);
  if (!amountMatch) return null;
  const amount = Number.parseFloat(amountMatch[1].replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const unit = (unitMatch?.[1] || "cm").toLowerCase();
  if (unit === "mm") return amount / 10;
  if (unit === "m") return amount * 100;
  return amount;
}

export function cmFromUnit(value: number, unit: MeasureUnit) {
  if (unit === "mm") return value / 10;
  if (unit === "in") return value * 2.54;
  if (unit === "ft") return value * 30.48;
  return value;
}

export function unitFromCm(cm: number, unit: MeasureUnit) {
  if (unit === "mm") return Math.round(cm * 10);
  if (unit === "in") return Math.round((cm / 2.54) * 10) / 10;
  if (unit === "ft") return Math.round((cm / 30.48) * 100) / 100;
  return Math.round(cm);
}

export function cmToFeetInches(cm: number): FeetInches {
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number) {
  const safeFeet = Math.max(0, feet);
  const safeInches = Math.min(11, Math.max(0, inches));
  return (safeFeet * 12 + safeInches) * 2.54;
}

function formatFeetInches(cm: number) {
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

export function formatLength(cm: number, unit: MeasureUnit) {
  if (unit === "mm") return `${Math.round(cm * 10)} mm`;
  if (unit === "in") {
    const inches = cm / 2.54;
    return `${inches.toFixed(inches >= 10 ? 0 : 1)} in`;
  }
  if (unit === "ft") return formatFeetInches(cm);
  return `${Math.round(cm)} cm`;
}

/** Compact ruler labels — whole feet as 5′, mixed as 5′3″. */
export function formatRulerMark(cm: number, unit: MeasureUnit) {
  if (unit === "ft") {
    const { feet, inches } = cmToFeetInches(cm);
    if (inches === 0) return `${feet}′`;
    return `${feet}′${inches}″`;
  }
  if (unit === "mm" || unit === "in") return String(unitFromCm(cm, unit));
  return String(Math.round(cm));
}

export function unitLabel(unit: MeasureUnit) {
  if (unit === "mm") return "mm";
  if (unit === "in") return "in";
  if (unit === "ft") return "ft";
  return "cm";
}

export function heightPresetsForUnit(unit: MeasureUnit) {
  return [155, 165, 175, 185].map((cm) => ({
    cm,
    label: unit === "ft" ? formatFeetInches(cm) : String(unitFromCm(cm, unit)),
  }));
}

/** Allowed “your height” range for the Size guide (~3′11″–7′7″). */
export const USER_HEIGHT_MIN_CM = 120;
export const USER_HEIGHT_MAX_CM = 230;

export function clampUserHeightCm(cm: number) {
  return Math.min(USER_HEIGHT_MAX_CM, Math.max(USER_HEIGHT_MIN_CM, cm));
}

export function heightBoundsForUnit(unit: MeasureUnit) {
  if (unit === "ft") {
    return {
      minFeet: cmToFeetInches(USER_HEIGHT_MIN_CM).feet,
      maxFeet: cmToFeetInches(USER_HEIGHT_MAX_CM).feet,
      minInches: 0,
      maxInches: 11,
    };
  }
  return {
    min: unitFromCm(USER_HEIGHT_MIN_CM, unit),
    max: unitFromCm(USER_HEIGHT_MAX_CM, unit),
  };
}

function findSpec(specs: ProductSpec[], ...tests: RegExp[]) {
  for (const test of tests) {
    const match = specs.find((s) => test.test(s.label));
    if (match) return match;
  }
  return undefined;
}

export function getProductScaleMeasures(specs: ProductSpec[]) {
  const isPartOnlyHeight = (label: string) =>
    /seat|back|arm|leg|platform|mattress|backrest|base height|bed height/i.test(
      label
    );

  // Overall product height: sofas use Height; beds usually Headboard / Overall Height.
  const heightSpec =
    findSpec(
      specs,
      /^height$/i,
      /overall.?height/i,
      /height\s*\(?\s*overall/i,
      /headboard height/i,
      /headboard height from floor/i
    ) ||
    specs.find(
      (s) => /^height\b/i.test(s.label) && !isPartOnlyHeight(s.label)
    );

  const widthSpec = findSpec(
    specs,
    /^width\b/i,
    /overall.?width/i,
    /^length$/i,
    /overall.?length/i,
    /curve.?span/i
  );

  const depthSpec = findSpec(
    specs,
    /^depth\b/i,
    /overall.?depth/i,
    /depth\s*\(?\s*main/i,
    /overall.?length/i
  );

  // Secondary reach line: seat (sofas) or mattress/platform (beds).
  const seatHeightSpec = findSpec(
    specs,
    /^seat height$/i,
    /seat.?height/i,
    /seating height/i,
    /mattress top height/i,
    /top of mattress/i,
    /bed height\s*\(?\s*top/i,
    /bed height top/i,
    /^bed height$/i,
    /platform height/i,
    /bed platform height/i,
    /bed base height/i
  );

  const heightCm = parseDimensionCm(heightSpec?.value);
  const widthCm = parseDimensionCm(widthSpec?.value);
  const depthCm = parseDimensionCm(depthSpec?.value);
  const seatHeightCm = parseDimensionCm(seatHeightSpec?.value);

  const isBed = specs.some((s) =>
    /headboard|mattress|platform height|bed height|bed platform|bed base/i.test(
      s.label
    )
  );

  const seatLabel = (() => {
    const label = seatHeightSpec?.label || "";
    if (isBed) {
      if (/platform|base height/i.test(label)) return "Platform";
      return "Mattress";
    }
    if (/mattress|top of mattress|bed height/i.test(label)) return "Mattress";
    if (/platform|base height/i.test(label)) return "Platform";
    return "Seat";
  })();

  return {
    heightCm,
    widthCm,
    depthCm,
    seatHeightCm,
    seatLabel,
    kind: isBed ? ("bed" as const) : ("furniture" as const),
    mascotHeightCm: MASCOT_HEIGHT_CM,
    // Show Size guide whenever we can read overall / headboard height from specs.
    canCompare: heightCm != null && heightCm > 0 && heightCm < 250,
  };
}

/**
 * Preferred gallery image index (0-based) for the Size guide.
 * Defaults to 1 (2nd image) when a product isn’t listed.
 */
const SCALE_IMAGE_INDEX: Record<string, number> = {
  "arcella-sofa": 1,
  // Straight scale shot stays gallery #5 (index 4) after promoting #4 to primary.
  "aura-veil-sofa": 4,
  // Clean frontal studio shot (gallery #2).
  "arc-curve-sofa": 1,
  "arc-curved-sofa": 1,
  // Straight product cutout (gallery #4).
  "cloud-embrace-lounge-set": 3,
  // Full sofa hero (gallery #1) — not the cropped detail shot.
  "cloud-wave-sofa": 0,
  // Full product shot for Size (gallery file 6_) — 5th slot is lifestyle crop with table.
  "cloud-curve-sofa": 5,
  // Curated cutout asset for Size guide.
  "luna-cloud-curve-sofa": 0,
  "flowline-sofa": 0,
  // 5th gallery image (index 4).
  "mono-block-sofa": 4,
  "serene-curve-sofa": 0,
  "urban-loft-sofa": 4,
  // Front studio shot (gallery #4 / 04).
  "aeris-bed": 3,
  "aura-softline-bed": 3,
  "aurelia-wing-bed": 3,
  "aurelio-panel-bed": 3,
  "aurelio-wing-bed": 3,
  "aurelle-bed": 3,
  "aurum-soft-edge-bed": 3,
  "duo-arc-bed": 3,
  "gridlounge-bed": 3,
  "linear-edge-bed": 3,
  // Front elevation (gallery #4) — arched headboard studio shot.
  "lumina-arc-bed": 3,
  // Front elevation (gallery #3) — oversized curved headboard.
  "luna-orbit-bed": 2,
  // Front elevation (gallery #4) — structured headboard, floating base.
  "montero-bed": 3,
  // Front elevation (gallery #4) — curved wing headboard.
  "noir-haven-bed": 3,
  // Front elevation (gallery #4) — radial channel-tufted headboard.
  "nova-radiant-bed": 3,
  // Front elevation (gallery #4) — wrap-around shell headboard.
  "noir-shell-bed": 3,
  // Front elevation (gallery #4) — fluted panel headboard.
  "novara-panel-bed": 3,
  // Front elevation (gallery #4) — sculpted block headboard.
  "obsidian-block-bed": 3,
  // Front elevation (gallery #4) — segmented block headboard.
  "terra-block-bed": 3,
  // Front elevation (gallery #4) — triple-layer headboard.
  "velora-layer-bed": 3,
  // Front elevation (gallery #4) — soft-edge padded headboard.
  "verda-softedge-bed": 3,
};

/**
 * Curated transparent cutouts for the Size guide (local brand assets).
 * Prefer these over gallery photos when present — cleaner than live knockout.
 */
const SCALE_CUTOUT_SRC: Record<string, string> = {
  "cloud-wave-sofa": "/brand/products/scale/cloud-wave-sofa-scale.png?v=6",
  "cloud-curve-sofa": "/brand/products/scale/cloud-curve-sofa-scale.png?v=3",
  "luna-cloud-curve-sofa": "/brand/products/scale/luna-cloud-curve-sofa-scale.png?v=1",
  "flowline-sofa": "/brand/products/scale/flowline-sofa-scale.png?v=1",
  "serene-curve-sofa": "/brand/products/scale/serene-curve-sofa-scale.png?v=1",
};

export function getScaleImageIndex(
  productSlug?: string | null,
  override?: number | null
) {
  if (typeof override === "number" && Number.isInteger(override) && override >= 0) {
    return override;
  }
  if (!productSlug) return 1;
  return SCALE_IMAGE_INDEX[productSlug] ?? 1;
}

/** Local transparent cutout path for a product, if curated. */
export function getScaleCutoutSrc(productSlug?: string | null) {
  if (!productSlug) return null;
  return SCALE_CUTOUT_SRC[productSlug] ?? null;
}

/** Where the product top lands on a standing person. */
export function bodyLandmarkForRatio(ratio: number) {
  if (ratio < 0.22) return { id: "shin", label: "shin" };
  if (ratio < 0.3) return { id: "knee", label: "knee" };
  if (ratio < 0.4) return { id: "thigh", label: "mid-thigh" };
  if (ratio < 0.48) return { id: "upper-thigh", label: "upper thigh" };
  if (ratio < 0.56) return { id: "hip", label: "hip" };
  if (ratio < 0.66) return { id: "waist", label: "waist" };
  if (ratio < 0.78) return { id: "torso", label: "mid-torso" };
  return { id: "chest", label: "chest" };
}
