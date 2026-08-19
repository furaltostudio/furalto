import type { Product } from "@/types/product";

export const POPULAR_SEARCHES = [
  { label: "Sofas", query: "sofa", href: "/collections/sofas" },
  { label: "Beds", query: "bed", href: "/collections/beds" },
  { label: "Chairs", query: "chair", href: "/collections/chairs" },
  { label: "Tables", query: "table", href: "/collections/tables" },
  { label: "Sectionals", query: "sectional", href: "/collections/sectionals" },
  { label: "Dining", query: "dining", href: "/collections/dining" },
] as const;

export async function searchProducts(term: string, limit?: number): Promise<Product[]> {
  const normalized = term.trim();
  if (!normalized) {
    return [];
  }

  const { catalogService } = await import("@/services/catalog.service");
  const response = await catalogService.search(normalized, limit ?? 40);
  return response.data.products ?? [];
}
