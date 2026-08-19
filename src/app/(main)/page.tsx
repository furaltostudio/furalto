import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { CustomServicesBanner } from "@/components/home/CustomServicesBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeBrandStrip } from "@/components/home/HomeBrandStrip";
import { HomeCraftTeaser } from "@/components/home/HomeCraftTeaser";
import { HomeCustomStudio } from "@/components/home/HomeCustomStudio";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { ProductInspirations } from "@/components/home/ProductInspirations";
import { categoryShowcaseItems } from "@/config/category-showcase";
import { getHomepageContent } from "@/lib/content/siteContent";
import { createMetadata } from "@/lib/seo/metadata";

/** Fresh CMS on each request so Shop the Look / content edits show immediately */
export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "Luxury Furniture for Modern Indian Homes",
  description:
    "Furalto transforms true Indian craftsmanship into designer furniture — a legacy begun in 1979. Shop sofas, beds, dining, and lighting with white-glove delivery across India. Visit our Rohini Design Studio in New Delhi.",
  path: "/",
  ogImage: "/home/furnitures_one.jpeg",
});

export default async function HomePage() {
  const content = await getHomepageContent();

  // Furniture-type nav is source of truth. CMS may only override matching ids
  // (avoids old room labels like Outdoor/Living overwriting Sofas by index).
  const cmsById = new Map(
    content.categoryShowcase.items.map((item) => [item.id, item] as const)
  );

  const showcaseItems = categoryShowcaseItems.map((item) => {
    const cmsItem = cmsById.get(item.id);
    if (!cmsItem) return item;
    return {
      ...item,
      label: cmsItem.label || item.label,
      cta: cmsItem.cta || item.cta,
    };
  });

  return (
    <>
      <HeroSection content={content.hero} />
      <HomeBrandStrip items={content.brandStrip} />
      <div id="content">
        <ProductInspirations
          title={content.inspirationsTitle}
          slides={content.inspirationSlides}
        />
        <CategoryShowcase
          eyebrow={content.categoryShowcase.eyebrow}
          title={content.categoryShowcase.title}
          lead={content.categoryShowcase.lead}
          items={showcaseItems}
        />
        <HomeCustomStudio content={content.customStudio} />
        <HomeCraftTeaser content={content.craftStory} />
        <HomeTestimonials
          eyebrow={content.testimonials.eyebrow}
          title={content.testimonials.title}
          lead={content.testimonials.lead}
          ctaLabel={content.testimonials.ctaLabel}
          ctaHref={content.testimonials.ctaHref}
          items={content.testimonials.items}
        />
        <CustomServicesBanner content={content.customServices} />
      </div>
    </>
  );
}
