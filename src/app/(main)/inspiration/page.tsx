import Image from "next/image";
import Link from "next/link";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { inspirationRooms } from "@/config/collections";
import { categoryImages, getRoomImage } from "@/config/images";
import {
  getInspirationHubContent,
  getInspirationRoomMeta,
} from "@/lib/content/siteContent";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const hub = await getInspirationHubContent();
  return createMetadata({
    title: hub.title || "Room Inspiration",
    description:
      hub.description ||
      "Browse Furalto room inspiration — living, bedroom, dining, and outdoor spaces styled with handcrafted luxury furniture.",
    path: "/inspiration",
    keywords: [
      "furniture inspiration",
      "luxury living room ideas",
      "bedroom furniture inspiration India",
      "Furalto lookbook",
    ],
  });
}

export default async function InspirationIndexPage() {
  const hub = await getInspirationHubContent();
  const rooms = Object.entries(inspirationRooms);

  const roomMeta = await Promise.all(
    rooms.map(async ([room, fallback]) => {
      const cms = await getInspirationRoomMeta(room);
      return {
        room,
        meta: {
          eyebrow: cms?.eyebrow || fallback.eyebrow,
          title: cms?.title || fallback.title,
          description: cms?.description || fallback.description,
        },
      };
    })
  );

  return (
    <>
      <PageHeroWithImage
        eyebrow={hub.eyebrow}
        title={hub.title}
        description={hub.description}
        image={categoryImages.inspiration}
      />

      <section className="inspiration-index">
        <div className="container-app pb-14 sm:pb-20">
          <div className="inspiration-index-grid">
            {roomMeta.map(({ room, meta }) => {
              const image = getRoomImage(room, meta.title);
              return (
                <article key={room} className="inspiration-index-card">
                  <Link href={`/inspiration/${room}`} className="inspiration-index-link">
                    <div className="inspiration-index-media">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="inspiration-index-image"
                      />
                    </div>
                    <div className="inspiration-index-body">
                      <p>{meta.eyebrow}</p>
                      <h2>{meta.title}</h2>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
