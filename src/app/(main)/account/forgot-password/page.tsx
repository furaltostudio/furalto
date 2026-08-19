import { Suspense } from "react";
import { ForgotPasswordContent } from "@/components/account/ForgotPasswordContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Forgot Password",
  description: "Reset your Furalto account password.",
  path: "/account/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <section className="account-page">
      <div className="container-app account-page-wrap">
        <Suspense fallback={<p className="account-form-lead">Loading...</p>}>
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </section>
  );
}
