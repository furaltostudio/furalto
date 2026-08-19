import { siteConfig } from "@/config/site";
import type { ApiResponse } from "@/types";
import type { Product, ProductReviewsResult } from "@/types/product";

export const COLLECTION_PAGE_SIZE = 12;

export type ProductListResult = {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

function getApiBaseUrl() {
  return siteConfig.apiUrl || "http://localhost:5000";
}

const emptyProductPage = (page = 1, limit = COLLECTION_PAGE_SIZE): ProductListResult => ({
  items: [],
  pagination: { page, limit, total: 0, pages: 0 },
});

async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, getApiBaseUrl());

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...(process.env.NODE_ENV === "development"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60 } }),
  });

  if (!response.ok) {
    throw new Error(`Product API error: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export async function fetchProductsPage(params?: {
  category?: string;
  subcategory?: string;
  room?: string;
  q?: string;
  limit?: number;
  page?: number;
}): Promise<ProductListResult> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? COLLECTION_PAGE_SIZE;

  try {
    return await fetchApi<ProductListResult>("/api/v1/products", {
      category: params?.category || "",
      subcategory: params?.subcategory || "",
      room: params?.room || "",
      q: params?.q || "",
      limit: String(limit),
      page: String(page),
    });
  } catch (error) {
    // Vercel/CI builds have no local API — don't fail prerender when unreachable.
    console.warn(
      "[catalog] fetchProductsPage failed:",
      error instanceof Error ? error.message : error
    );
    return emptyProductPage(page, limit);
  }
}

export async function fetchProducts(params?: {
  category?: string;
  subcategory?: string;
  room?: string;
  q?: string;
  limit?: number;
  page?: number;
}): Promise<Product[]> {
  const data = await fetchProductsPage(params);
  return data.items;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await fetchApi<{ product: Product }>(`/api/v1/products/${slug}`);
    return data.product;
  } catch {
    return null;
  }
}

export async function fetchRelatedProducts(slug: string): Promise<Product[]> {
  try {
    const data = await fetchApi<{ products: Product[] }>(
      `/api/v1/products/${slug}/related`,
      { limit: "8" },
    );
    if (data.products?.length) {
      return data.products;
    }
  } catch {
    // Fall through to category-based similar pieces.
  }

  try {
    const product = await fetchProductBySlug(slug);
    if (!product) return [];

    const siblings = await fetchProducts({
      category: product.category,
      limit: 16,
    });

    return siblings.filter((item) => item.slug !== slug).slice(0, 8);
  } catch {
    return [];
  }
}

export async function fetchProductSlugs(): Promise<string[]> {
  try {
    const products = await fetchProducts({ limit: 500 });
    return products.map((product) => product.slug);
  } catch {
    return [];
  }
}

export async function searchProductsApi(q: string, limit = 20): Promise<Product[]> {
  if (!q.trim()) {
    return [];
  }

  try {
    const data = await fetchApi<{ products: Product[] }>("/api/v1/products/search", {
      q,
      limit: String(limit),
    });
    return data.products;
  } catch {
    return [];
  }
}

export async function fetchProductReviews(
  slug: string,
  limit = 48
): Promise<ProductReviewsResult | null> {
  try {
    return await fetchApi<ProductReviewsResult>(`/api/v1/reviews/product/${slug}`, {
      limit: String(limit),
      page: "1",
    });
  } catch {
    return null;
  }
}
