import { CartPageContent } from "@/components/cart/CartPageContent";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Shopping Cart",
  description: "Review your selected Furalto pieces before checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return (
    <RequireAuth message="Sign in to view your cart and continue shopping.">
      <CartPageContent />
    </RequireAuth>
  );
}
