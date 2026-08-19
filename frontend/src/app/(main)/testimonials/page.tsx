import { TestimonialsPageContent } from "@/components/testimonials/TestimonialsPageContent";
import { getTestimonialsPageContent } from "@/lib/content/siteContent";
import { createMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const content = await getTestimonialsPageContent();
  return createMetadata({
    title: content.title || "Client Stories",
    description:
      content.description ||
      "Read honest client stories about living with Furalto furniture — deliveries, daily use, and lasting craftsmanship across India.",
    path: "/testimonials",
    ogImage: content.heroImage.src,
    keywords: [
      "Furalto reviews",
      "luxury furniture client stories",
      "furniture testimonials India",
    ],
  });
}

export default async function TestimonialsPage() {
  const content = await getTestimonialsPageContent();
  return <TestimonialsPageContent content={content} />;
}
