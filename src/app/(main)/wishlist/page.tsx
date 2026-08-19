import { RequireAuth } from "@/components/auth/RequireAuth";
import { WishlistPageContent } from "@/components/wishlist/WishlistPageContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Wishlist",
  description: "Save your favorite Furalto pieces for later.",
  path: "/wishlist",
  noIndex: true,
});

export default function WishlistPage() {
  return (
    <RequireAuth message="Sign in to view and manage your wishlist.">
      <WishlistPageContent />
    </RequireAuth>
  );
}
