import { AccountPageContent } from "@/components/account/AccountPageContent";
import { getGoogleClientId } from "@/config/env";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "My Account",
  description: "Manage your Furalto account, orders, and preferences.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  const googleClientId = getGoogleClientId();

  return <AccountPageContent googleClientId={googleClientId} />;
}
