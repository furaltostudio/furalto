import { Suspense } from "react";
import { NewsletterUnsubscribeContent } from "@/components/newsletter/NewsletterUnsubscribeContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Unsubscribe",
  description: "Manage your Furalto newsletter subscription.",
  path: "/newsletter/unsubscribe",
  noIndex: true,
});

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={<p className="account-form-lead">Loading...</p>}>
      <NewsletterUnsubscribeContent />
    </Suspense>
  );
}
