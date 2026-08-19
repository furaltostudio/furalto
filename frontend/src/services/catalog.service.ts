import { API_ROUTES } from "@/constants";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types";
import type { CartItem, Product } from "@/types/product";

type BackendCartItem = {
  itemId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  fabric?: string;
  finish?: string;
  size?: string;
};

function mapCartItems(items: BackendCartItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.itemId,
    slug: item.slug,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    fabric: item.fabric,
    finish: item.finish,
    size: item.size,
  }));
}

export const cartService = {
  async get(): Promise<CartItem[]> {
    const response = await apiClient.get<ApiResponse<{ items: BackendCartItem[] }>>(
      API_ROUTES.cart.root
    );
    return mapCartItems(response.data.items || []);
  },

  async addItem(item: {
    itemId: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    quantity?: number;
    fabric?: string;
    finish?: string;
    size?: string;
  }): Promise<CartItem[]> {
    const response = await apiClient.post<ApiResponse<{ items: BackendCartItem[] }>>(
      API_ROUTES.cart.items,
      item
    );
    return mapCartItems(response.data.items || []);
  },

  async updateItem(itemId: string, quantity: number): Promise<CartItem[]> {
    const response = await apiClient.put<ApiResponse<{ items: BackendCartItem[] }>>(
      API_ROUTES.cart.item(itemId),
      { quantity }
    );
    return mapCartItems(response.data.items || []);
  },

  async removeItem(itemId: string): Promise<CartItem[]> {
    const response = await apiClient.delete<ApiResponse<{ items: BackendCartItem[] }>>(
      API_ROUTES.cart.item(itemId)
    );
    return mapCartItems(response.data.items || []);
  },

  async clear(): Promise<CartItem[]> {
    const response = await apiClient.delete<ApiResponse<{ items: BackendCartItem[] }>>(
      API_ROUTES.cart.root
    );
    return mapCartItems(response.data.items || []);
  },
};

export const wishlistService = {
  get() {
    return apiClient.get<ApiResponse<{ products: Product[] }>>(API_ROUTES.wishlist.root);
  },

  add(slug: string) {
    return apiClient.post<ApiResponse<{ products: Product[] }>>(API_ROUTES.wishlist.root, {
      slug,
    });
  },

  remove(slug: string) {
    return apiClient.delete<ApiResponse<{ products: Product[] }>>(API_ROUTES.wishlist.item(slug));
  },
};

export const catalogService = {
  list(params?: Record<string, string>) {
    return apiClient.get<
      ApiResponse<{
        items: Product[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>
    >(API_ROUTES.products.list, { params, auth: false });
  },

  getBySlug(slug: string) {
    return apiClient.get<ApiResponse<{ product: Product }>>(API_ROUTES.products.detail(slug), {
      auth: false,
    });
  },

  related(slug: string) {
    return apiClient.get<ApiResponse<{ products: Product[] }>>(API_ROUTES.products.related(slug), {
      auth: false,
    });
  },

  search(q: string, limit = 8) {
    return apiClient.get<ApiResponse<{ products: Product[] }>>(API_ROUTES.products.search, {
      params: { q, limit: String(limit) },
      auth: false,
    });
  },
};
