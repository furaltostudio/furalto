import { notFound } from "next/navigation";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { InspirationalGallery } from "@/components/gallery/InspirationalGallery";
import { inspirationRooms } from "@/config/collections";
import { getRoomImage } from "@/config/images";
import { getInspirationRoomMeta } from "@/lib/content/siteContent";
import { fetchProducts } from "@/lib/products/catalog";
import { createMetadata } from "@/lib/seo/metadata";

type InspirationPageProps = {
  params: Promise<{ room: string }>;
};

export async function generateStaticParams() {
  return Object.keys(inspirationRooms).map((room) => ({ room }));
}

export async function generateMetadata({ params }: InspirationPageProps) {
  const { room } = await params;
  const fallback = inspirationRooms[room];

  if (!fallback) {
    return createMetadata({ title: "Inspiration", noIndex: true });
  }

  const cms = await getInspirationRoomMeta(room);
  const meta = {
    title: cms?.title || fallback.title,
    description: cms?.description || fallback.description,
  };

  return createMetadata({
    title: meta.title,
    description: meta.description,
    path: `/inspiration/${room}`,
  });
}

export default async function InspirationPage({ params }: InspirationPageProps) {
  const { room } = await params;
  const fallback = inspirationRooms[room];

  if (!fallback) {
    notFound();
  }

  const cms = await getInspirationRoomMeta(room);
  const meta = {
    eyebrow: cms?.eyebrow || fallback.eyebrow,
    title: cms?.title || fallback.title,
    description: cms?.description || fallback.description,
  };

  const products = await fetchProducts({ room, limit: 100 });
  const heroImage = getRoomImage(room, meta.title);

  return (
    <>
      <PageHeroWithImage
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        image={heroImage}
      />
      <InspirationalGallery products={products} />
    </>
  );
}
