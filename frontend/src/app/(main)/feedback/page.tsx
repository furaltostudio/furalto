import { Suspense } from "react";
import { FeedbackPageContent } from "@/components/feedback/FeedbackPageContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Share Your Feedback",
  description: "Leave a verified buyer review for your Furalto delivery.",
  path: "/feedback",
  noIndex: true,
});

export default function FeedbackPage() {
  return (
    <section className="feedback-page">
      <div className="container-app feedback-page-wrap">
        <Suspense fallback={<p className="feedback-lead">Loading your feedback form…</p>}>
          <FeedbackPageContent />
        </Suspense>
      </div>
    </section>
  );
}
