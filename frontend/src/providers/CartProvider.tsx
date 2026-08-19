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
import { cartService } from "@/services/catalog.service";
import type { CartItem } from "@/types/product";

type AddToCartInput = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  fabric?: string;
  finish?: string;
  size?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (input: AddToCartInput) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function buildCartItemId(input: AddToCartInput): string {
  return [input.slug, input.fabric ?? "", input.finish ?? "", input.size ?? ""].join(":");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const nextItems = await cartService.get();
      setItems(nextItems);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshCart();
  }, [isAuthLoading, refreshCart]);

  const requireLogin = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const next = encodeURIComponent(window.location.pathname);
    router.push(`/account?next=${next}`);
    return false;
  }, [router]);

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      if (!isAuthenticated) {
        requireLogin();
        return;
      }

      const nextItems = await cartService.addItem({
        itemId: buildCartItemId(input),
        slug: input.slug,
        name: input.name,
        price: input.price,
        image: input.image,
        quantity: input.quantity ?? 1,
        fabric: input.fabric,
        finish: input.finish,
        size: input.size,
      });
      setItems(nextItems);
    },
    [isAuthenticated, requireLogin]
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        requireLogin();
        return;
      }

      const nextItems = await cartService.removeItem(id);
      setItems(nextItems);
    },
    [isAuthenticated, requireLogin]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (!isAuthenticated) {
        requireLogin();
        return;
      }

      const nextItems = await cartService.updateItem(id, quantity);
      setItems(nextItems);
    },
    [isAuthenticated, requireLogin]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    const nextItems = await cartService.clear();
    setItems(nextItems);
  }, [isAuthenticated]);

  const value = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      isLoading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refreshCart,
    };
  }, [items, isLoading, addItem, removeItem, updateQuantity, clearCart, refreshCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
