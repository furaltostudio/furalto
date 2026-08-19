"use client";

import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { WishlistProvider } from "@/providers/WishlistProvider";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ScrollToTop />
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
