import { Suspense } from "react";
import { TrackOrderPageContent } from "@/components/track/TrackOrderPageContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Track Order",
  description: "Track your Furalto order status and delivery schedule.",
  path: "/track-order",
});

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container-app py-20 text-center text-muted">Loading...</div>}>
      <TrackOrderPageContent />
    </Suspense>
  );
}
