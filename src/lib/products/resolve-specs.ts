import type { Product, ProductOption, ProductSpec } from "@/types/product";

export type ProductSelection = {
  fabricId: string;
  finishId: string;
  sizeId: string;
};

export type SpecGroup = {
  id: "configuration" | "dimensions" | "materials" | "build";
  title: string;
  items: Array<ProductSpec & { emphasis?: boolean }>;
};

const DIMENSION_RE = /width|depth|height|seat|diameter|length|clearance/i;
const MATERIAL_RE = /fabric|finish|upholstery|material|wood|metal|leather|veneer|stone/i;
const BUILD_RE = /frame|fill|foam|suspension|base|construction|weight|capacity|modules/i;

/** Fallback specs by option id when API/product data has no embedded option.specs yet */
const OPTION_SPEC_FALLBACKS: Record<string, ProductSpec[]> = {
  "cream-linen": [
    { label: "Upholstery", value: "Cream linen blend" },
    { label: "Fabric care", value: "Professional clean" },
  ],
  "taupe-boucle": [
    { label: "Upholstery", value: "Taupe bouclé wool-blend" },
    { label: "Fabric care", value: "Spot clean / professional clean" },
  ],
  "espresso-velvet": [
    { label: "Upholstery", value: "Espresso cotton velvet" },
    { label: "Fabric care", value: "Vacuum soft brush · professional clean" },
  ],
  "sand-performance": [
    { label: "Upholstery", value: "Sand performance weave" },
    { label: "Fabric care", value: "Stain-resistant · wipe clean" },
  ],
  "warm-oak": [{ label: "Leg finish", value: "Warm oak stain" }],
  walnut: [{ label: "Leg finish", value: "Dark walnut stain" }],
  extended: [
    { label: "Width", value: "320 cm" },
    { label: "Depth", value: "112 cm" },
    { label: "Seat Height", value: "44 cm" },
    { label: "Seat Depth", value: "62 cm" },
    { label: "Modules", value: "4-piece modular" },
  ],
  standard: [
    { label: "Width", value: "280 cm" },
    { label: "Depth", value: "108 cm" },
    { label: "Seat Height", value: "44 cm" },
    { label: "Seat Depth", value: "60 cm" },
    { label: "Modules", value: "3-piece modular" },
  ],
};

function findOption(options: ProductOption[], id: string) {
  return options.find((option) => option.id === id);
}

function getOptionSpecs(option?: ProductOption): ProductSpec[] {
  if (!option) return [];
  if (option.specs?.length) return option.specs;
  return OPTION_SPEC_FALLBACKS[option.id] || [];
}

function applyOptionSpecs(map: Map<string, string>, option?: ProductOption) {
  for (const spec of getOptionSpecs(option)) {
    map.set(spec.label, spec.value);
  }
}

/** Merge base product specs with the currently selected fabric / finish / size. */
export function resolveProductSpecs(
  product: Product,
  selection: ProductSelection
): ProductSpec[] {
  const fabric = findOption(product.fabrics, selection.fabricId);
  const finish = findOption(product.finishes, selection.finishId);
  const size = findOption(product.sizes, selection.sizeId);

  const map = new Map<string, string>();
  for (const spec of product.specs) {
    map.set(spec.label, spec.value);
  }

  applyOptionSpecs(map, size);
  applyOptionSpecs(map, fabric);
  applyOptionSpecs(map, finish);

  if (fabric) map.set("Fabric", fabric.label);
  if (finish) map.set("Finish", finish.label);
  if (size) map.set("Size", size.label);

  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

export function groupProductSpecs(
  specs: ProductSpec[],
  previousSpecs?: ProductSpec[]
): SpecGroup[] {
  const previous = new Map((previousSpecs || []).map((spec) => [spec.label, spec.value]));

  const withEmphasis = specs.map((spec) => ({
    ...spec,
    emphasis: previous.has(spec.label) && previous.get(spec.label) !== spec.value,
  }));

  const dimensions: SpecGroup["items"] = [];
  const materials: SpecGroup["items"] = [];
  const build: SpecGroup["items"] = [];
  const configuration: SpecGroup["items"] = [];

  for (const spec of withEmphasis) {
    if (/^(fabric|finish|size)$/i.test(spec.label)) {
      configuration.push(spec);
      continue;
    }
    if (DIMENSION_RE.test(spec.label)) {
      dimensions.push(spec);
      continue;
    }
    if (MATERIAL_RE.test(spec.label)) {
      materials.push(spec);
      continue;
    }
    if (BUILD_RE.test(spec.label)) {
      build.push(spec);
      continue;
    }
    build.push(spec);
  }

  const groups: SpecGroup[] = [
    { id: "configuration", title: "Your selection", items: configuration },
    { id: "dimensions", title: "Dimensions", items: dimensions },
    { id: "materials", title: "Materials", items: materials },
    { id: "build", title: "Build", items: build },
  ];

  return groups.filter((group) => group.items.length > 0);
}

export function getDefaultSelection(product: Product): ProductSelection {
  return {
    fabricId: product.fabrics[0]?.id ?? "",
    finishId: product.finishes[0]?.id ?? "",
    sizeId: product.sizes[0]?.id ?? "",
  };
}
