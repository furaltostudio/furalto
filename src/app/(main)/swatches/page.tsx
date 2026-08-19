import { StaticPageLayout } from "@/components/shared/StaticPageLayout";
import { getSwatchPage } from "@/config/static-pages";
import { mergeStaticPageWithCms } from "@/lib/content/mergeStaticPage";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const content = await mergeStaticPageWithCms("page.swatches", getSwatchPage());

  return createMetadata({
    title: content.title,
    description: content.description,
    path: "/swatches",
    ogImage: content.heroImage.src,
  });
}

export default async function SwatchesIndexPage() {
  const content = await mergeStaticPageWithCms("page.swatches", getSwatchPage());
  return <StaticPageLayout content={content} />;
}
