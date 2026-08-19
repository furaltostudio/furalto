import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SiteAssistant } from "@/components/layout/SiteAssistant";
import { PageScrollProgress } from "@/components/ui/PageScrollProgress";
import { mainNavigation } from "@/config/navigation";
import { getNavigationLabels, getSiteSettings } from "@/lib/content/siteContent";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, navLabels] = await Promise.all([
    getSiteSettings(),
    getNavigationLabels(),
  ]);

  // Match CMS label overrides by nav order (More + Sale share /collections href).
  const navigation = mainNavigation.map((item, index) => {
    const byIndex = navLabels[index];
    if (byIndex?.label && byIndex.href === item.href) {
      return { ...item, label: byIndex.label };
    }
    const hrefMatches = navLabels.filter((entry) => entry.href === item.href);
    if (hrefMatches.length === 1 && hrefMatches[0].label) {
      return { ...item, label: hrefMatches[0].label };
    }
    return item;
  });

  return (
    <>
      <PageScrollProgress />
      <Header
        announcement={{
          text: settings.announcementText,
          cta: settings.announcementCta,
          href: settings.announcementHref,
        }}
        navigation={navigation}
      />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      <Footer
        footerDescription={settings.footerDescription}
        contact={{
          email: settings.email,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          address: settings.address,
          gstin: settings.gstin,
        }}
        social={{
          instagram: settings.instagram,
          pinterest: settings.pinterest,
          facebook: settings.facebook,
          youtube: settings.youtube,
        }}
      />
      <SiteAssistant />
      <WhatsAppFloat phone={settings.whatsapp || settings.phone} />
    </>
  );
}
