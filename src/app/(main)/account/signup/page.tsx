import { AccountSignupPageContent } from "@/components/account/AccountSignupPageContent";
import { getGoogleClientId } from "@/config/env";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Create Account",
  description: "Create your Furalto account to track orders, save wishlists, and book appointments.",
  path: "/account/signup",
  noIndex: true,
});

export default function AccountSignupPage() {
  const googleClientId = getGoogleClientId();

  return <AccountSignupPageContent googleClientId={googleClientId} />;
}
