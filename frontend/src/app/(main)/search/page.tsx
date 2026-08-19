import { Suspense } from "react";
import { SearchPageContent } from "@/components/search/SearchPageContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Search Luxury Furniture",
  description:
    "Search Furalto’s luxury furniture catalogue — sofas, beds, dining, outdoor, lighting, and custom pieces for Indian homes.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-app py-20 text-center text-muted">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
