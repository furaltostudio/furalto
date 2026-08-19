import { ContactPageContent } from "@/components/contact/ContactPageContent";
import { contactHeroImage } from "@/config/contact";
import { getContactPageContent } from "@/lib/content/siteContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Contact Furalto",
  description:
    "Contact Furalto for orders, product guidance, custom furniture, and trade support. Call, WhatsApp, email, or visit our New Delhi design studio.",
  path: "/contact",
  ogImage: contactHeroImage.src,
  keywords: [
    "contact Furalto",
    "furniture customer care India",
    "custom furniture inquiry",
    "Furalto Delhi studio",
  ],
});

export default async function ContactPage() {
  const content = await getContactPageContent();

  return (
    <ContactPageContent
      heroTitle={content.title}
      heroDescription={content.lead}
      reasons={content.reasons}
      channels={{
        email: content.settings.email,
        phone: content.settings.phone,
        whatsapp: content.settings.whatsapp,
        address: content.settings.address,
        hours: content.settings.hours,
      }}
    />
  );
}
