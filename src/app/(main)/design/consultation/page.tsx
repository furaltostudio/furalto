import { StaticPageLayout } from "@/components/shared/StaticPageLayout";
import { designConsultationPage } from "@/config/static-pages";
import { mergeStaticPageWithCms } from "@/lib/content/mergeStaticPage";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const content = await mergeStaticPageWithCms(
    "page.design-consultation",
    designConsultationPage
  );

  return createMetadata({
    title: content.title,
    description: content.description,
    path: "/design/consultation",
    ogImage: content.heroImage.src,
  });
}

export default async function DesignConsultationPage() {
  const content = await mergeStaticPageWithCms(
    "page.design-consultation",
    designConsultationPage
  );

  return <StaticPageLayout content={content} />;
}
