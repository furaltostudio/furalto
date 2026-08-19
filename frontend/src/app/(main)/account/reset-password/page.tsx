import { Suspense } from "react";
import { ResetPasswordContent } from "@/components/account/ResetPasswordContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Reset Password",
  description: "Choose a new password for your Furalto account.",
  path: "/account/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <section className="account-page">
      <div className="container-app account-page-wrap">
        <Suspense fallback={<p className="account-form-lead">Loading reset form...</p>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </section>
  );
}
