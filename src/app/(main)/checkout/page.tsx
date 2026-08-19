import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Checkout",
  description: "Complete your Furalto order with secure checkout.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <RequireAuth message="Sign in to complete your purchase securely.">
      <CheckoutPageContent />
    </RequireAuth>
  );
}
