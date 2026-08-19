// Flat furniture-type taxonomy. This is the single source of truth for
// storefront category labels — the old room -> furniture-type -> product
// hierarchy has been flattened to furniture-type -> product.
export const PRODUCT_CATEGORIES = [
  { value: "sofas", label: "Sofas" },
  { value: "sectionals", label: "Sectionals" },
  { value: "lounge-chairs", label: "Lounge Chairs" },
  { value: "chairs", label: "Chairs" },
  { value: "benches", label: "Benches" },
  { value: "stools", label: "Stools" },
  { value: "beds", label: "Beds" },
  { value: "nightstands", label: "Nightstands" },
  { value: "dressers", label: "Dressers" },
  { value: "storage", label: "Storage" },
  { value: "bookcases", label: "Bookcases" },
  { value: "sideboards", label: "Sideboards" },
  { value: "media-consoles", label: "Media Consoles" },
  { value: "tables", label: "Dining Tables" },
  { value: "coffee-tables", label: "Coffee Tables" },
  { value: "side-tables", label: "Side Tables" },
  { value: "dining", label: "Dining Sets" },
  { value: "bars", label: "Bars" },
  { value: "desks", label: "Desks" },
  { value: "vanities", label: "Vanities" },
  { value: "mirrors", label: "Mirrors" },
  { value: "wall-art", label: "Wall Art" },
  { value: "pendants", label: "Pendant Lights" },
  { value: "chandeliers", label: "Chandeliers" },
  { value: "floor-lamps", label: "Floor Lamps" },
  { value: "table-lamps", label: "Table Lamps" },
  { value: "sconces", label: "Wall Sconces" },
  { value: "area-rugs", label: "Area Rugs" },
  { value: "rugs", label: "Rugs" },
  { value: "objects", label: "Objects" },
  { value: "textiles", label: "Textiles" },
  { value: "pillows", label: "Pillows" },
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["value"];

export function getProductCategoryLabel(slug: string) {
  return PRODUCT_CATEGORIES.find((category) => category.value === slug)?.label || slug;
}

/** Subcategories were removed with the room/furniture-type/product hierarchy flatten. */
export function getProductSubcategoryOptions(_category: string) {
  return [] as { value: string; label: string }[];
}
