import { notFound } from "next/navigation";
import { StaticPageLayout } from "@/components/shared/StaticPageLayout";
import { allGuideTopics, getGuidePage } from "@/config/static-pages";
import { mergeStaticPageWithCms } from "@/lib/content/mergeStaticPage";
import { createMetadata } from "@/lib/seo/metadata";

type GuidePageProps = {
  params: Promise<{ topic: string }>;
};

export async function generateStaticParams() {
  return allGuideTopics.map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { topic } = await params;
  const fallback = getGuidePage(topic);

  if (!fallback) {
    return createMetadata({ title: "Guide", noIndex: true });
  }

  const content = await mergeStaticPageWithCms(`page.guides.${topic}`, fallback);

  return createMetadata({
    title: content.title,
    description: content.description,
    path: `/guides/${topic}`,
    ogImage: content.heroImage.src,
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { topic } = await params;
  const fallback = getGuidePage(topic);

  if (!fallback) {
    notFound();
  }

  const content = await mergeStaticPageWithCms(`page.guides.${topic}`, fallback);
  return <StaticPageLayout content={content} />;
}
