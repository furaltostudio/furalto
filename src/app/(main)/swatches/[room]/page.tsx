import { StaticPageLayout } from "@/components/shared/StaticPageLayout";
import { allSwatchRooms, getSwatchPage } from "@/config/static-pages";
import { mergeStaticPageWithCms } from "@/lib/content/mergeStaticPage";
import { createMetadata } from "@/lib/seo/metadata";

type SwatchRoomPageProps = {
  params: Promise<{ room: string }>;
};

export async function generateStaticParams() {
  return allSwatchRooms.map((room) => ({ room }));
}

export async function generateMetadata({ params }: SwatchRoomPageProps) {
  const { room } = await params;
  const content = await mergeStaticPageWithCms(`page.swatches.${room}`, getSwatchPage(room));

  return createMetadata({
    title: content.title,
    description: content.description,
    path: `/swatches/${room}`,
    ogImage: content.heroImage.src,
  });
}

export default async function SwatchRoomPage({ params }: SwatchRoomPageProps) {
  const { room } = await params;
  const content = await mergeStaticPageWithCms(`page.swatches.${room}`, getSwatchPage(room));
  return <StaticPageLayout content={content} />;
}
