import { Suspense } from "react";
import { AcceptInviteContent } from "@/components/account/AcceptInviteContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Accept Invite",
  description: "Activate your Furalto staff account.",
  path: "/account/accept-invite",
  noIndex: true,
});

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<p className="account-form-lead">Loading invite...</p>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
