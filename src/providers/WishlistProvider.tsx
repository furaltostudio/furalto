"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { wishlistService } from "@/services/catalog.service";
import type { Product } from "@/types/product";

type WishlistContextValue = {
  products: Product[];
  slugs: string[];
  itemCount: number;
  isLoading: boolean;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => Promise<boolean>;
  add: (slug: string) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await wishlistService.get();
      setProducts(response.data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refresh();
  }, [isAuthLoading, refresh]);

  const requireLogin = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const next = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/account?next=${next}`);
  }, [router]);

  const slugs = useMemo(() => products.map((product) => product.slug), [products]);

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const add = useCallback(
    async (slug: string) => {
      if (!isAuthenticated) {
        requireLogin();
        return;
      }

      const response = await wishlistService.add(slug);
      setProducts(response.data.products || []);
    },
    [isAuthenticated, requireLogin]
  );

  const remove = useCallback(
    async (slug: string) => {
      if (!isAuthenticated) {
        requireLogin();
        return;
      }

      const response = await wishlistService.remove(slug);
      setProducts(response.data.products || []);
    },
    [isAuthenticated, requireLogin]
  );

  const toggle = useCallback(
    async (slug: string) => {
      if (!isAuthenticated) {
        requireLogin();
        return false;
      }

      if (isSaved(slug)) {
        await remove(slug);
        return false;
      }

      await add(slug);
      return true;
    },
    [add, isAuthenticated, isSaved, remove, requireLogin]
  );

  const value = useMemo(
    () => ({
      products,
      slugs,
      itemCount: products.length,
      isLoading,
      isSaved,
      toggle,
      add,
      remove,
      refresh,
    }),
    [products, slugs, isLoading, isSaved, toggle, add, remove, refresh]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
