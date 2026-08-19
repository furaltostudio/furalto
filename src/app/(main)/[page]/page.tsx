import { notFound } from "next/navigation";
import { StaticPageLayout } from "@/components/shared/StaticPageLayout";
import { getAllStaticPageSlugs, getStaticPage } from "@/config/static-pages";
import { mergeStaticPageWithCms } from "@/lib/content/mergeStaticPage";
import { createMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ page: string }>;
};

export async function generateStaticParams() {
  return getAllStaticPageSlugs()
    .filter((page) => page !== "about")
    .map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps) {
  const { page } = await params;
  const content = getStaticPage(page);

  if (!content) {
    return createMetadata({ title: "Page Not Found", noIndex: true });
  }

  const merged = await mergeStaticPageWithCms(`page.${page}`, content);

  return createMetadata({
    title: merged.title,
    description: merged.description,
    path: `/${page}`,
    ogImage: merged.heroImage.src,
  });
}

export default async function StaticPage({ params }: PageProps) {
  const { page } = await params;
  if (page === "about") {
    notFound();
  }
  const content = getStaticPage(page);

  if (!content) {
    notFound();
  }

  const merged = await mergeStaticPageWithCms(`page.${page}`, content);

  return <StaticPageLayout content={merged} />;
}
