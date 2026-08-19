import { Suspense } from "react";
import { VerifyEmailContent } from "@/components/account/VerifyEmailContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Verify Email",
  description: "Verify your Furalto account email address.",
  path: "/account/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return (
    <section className="account-page">
      <div className="container-app account-page-wrap">
        <Suspense fallback={<p className="account-form-lead">Loading verification...</p>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </section>
  );
}
