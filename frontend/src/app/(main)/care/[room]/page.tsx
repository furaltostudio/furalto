import { notFound } from "next/navigation";
import { StaticPageLayout } from "@/components/shared/StaticPageLayout";
import { allCareRooms, getCarePage } from "@/config/static-pages";
import { mergeStaticPageWithCms } from "@/lib/content/mergeStaticPage";
import { createMetadata } from "@/lib/seo/metadata";

type CareRoomPageProps = {
  params: Promise<{ room: string }>;
};

export async function generateStaticParams() {
  return allCareRooms.map((room) => ({ room }));
}

export async function generateMetadata({ params }: CareRoomPageProps) {
  const { room } = await params;
  const content = await mergeStaticPageWithCms(`page.care.${room}`, getCarePage(room));

  return createMetadata({
    title: content.title,
    description: content.description,
    path: `/care/${room}`,
    ogImage: content.heroImage.src,
  });
}

export default async function CareRoomPage({ params }: CareRoomPageProps) {
  const { room } = await params;

  if (!allCareRooms.includes(room)) {
    notFound();
  }

  const content = await mergeStaticPageWithCms(`page.care.${room}`, getCarePage(room));
  return <StaticPageLayout content={content} />;
}
