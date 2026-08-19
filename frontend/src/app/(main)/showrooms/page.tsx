import { ShowroomsPageContent } from "@/components/showrooms/ShowroomsPageContent";
import { showroomsHeroImage } from "@/config/showrooms";
import { getShowroomsPageContent } from "@/lib/content/siteContent";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Rohini Design Studio | Furalto Showroom",
  description:
    "Visit Furalto’s Rohini Design Studio in New Delhi. Explore materials, full-room vignettes, and book a private design consultation.",
  path: "/showrooms",
  ogImage: showroomsHeroImage.src,
  keywords: [
    "Furalto showroom",
    "furniture showroom Delhi",
    "furniture showroom Rohini",
    "luxury furniture store New Delhi",
    "design consultation Delhi",
  ],
});

export default async function ShowroomsPage() {
  const content = await getShowroomsPageContent();

  return (
    <ShowroomsPageContent
      title={content.title}
      description={content.lead}
      introEyebrow={content.eyebrow}
      introCopy={content.lead}
      locations={content.locations}
      services={content.services}
    />
  );
}
