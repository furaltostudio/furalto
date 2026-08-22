import { PRIMARY_NAV_SLUGS, shopNavigation } from "@/config/navigation";
import type { PageImage } from "@/config/images";

export type CategoryShowcaseItem = {
  id: string;
  label: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

const unsplash = (id: string, alt: string, width = 1536, height = 1024): PageImage => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=85`,
  alt,
  width,
  height,
});

/** Homepage category cards — curated plates distinct from generic collection heroes. */
const showcaseImages: Partial<
  Record<(typeof PRIMARY_NAV_SLUGS)[number], PageImage>
> = {
  sofas: unsplash(
    "1776186243326-1d467b258232",
    "Italian-inspired curved designer sofa in a minimalist luxury living room",
  ),
  beds: unsplash(
    "1616594039964-ae9021a400a0",
    "Luxury upholstered bed in an elegant master suite with layered linens",
  ),
};

export const categoryShowcaseSection = {
  eyebrow: "Collections",
  title: "Explore by Category",
  lead: "Sofas, beds, chairs, and dining — crafted for rooms that feel quietly elevated.",
} as const;

/** Same furniture categories as the top nav (excludes Bespoke + Sale). */
const PRIMARY_SHOWCASE_SLUGS = PRIMARY_NAV_SLUGS;

/** Furniture-type cards for homepage / collections hub (excludes Design & Sale hub links). */
export const categoryShowcaseItems: CategoryShowcaseItem[] = PRIMARY_SHOWCASE_SLUGS.flatMap(
  (slug) => {
    const item = shopNavigation.find((nav) => nav.href === `/collections/${slug}`);
    if (!item?.featured) {
      return [];
    }

    return [
      {
        id: slug,
        label: item.label,
        href: item.href,
        cta: `Discover ${item.label}`,
        image: showcaseImages[slug]?.src ?? item.featured.image,
        imageAlt: showcaseImages[slug]?.alt ?? item.featured.imageAlt,
        imageWidth: showcaseImages[slug]?.width ?? 1536,
        imageHeight: showcaseImages[slug]?.height ?? 1024,
      },
    ];
  },
);

/**
 * Returns sibling furniture-type categories for the collection subnav —
 * primary shop categories other than the current one (keeps chips manageable).
 */
export function getCollectionSubcategoryItems(category: string): CategoryShowcaseItem[] {
  return categoryShowcaseItems
    .filter((item) => item.id !== category)
    .map((item) => ({
      ...item,
      cta: `Shop ${item.label}`,
    }));
}
