import { PRIMARY_NAV_SLUGS, shopNavigation } from "@/config/navigation";

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
        image: item.featured.image,
        imageAlt: item.featured.imageAlt,
        imageWidth: 1536,
        imageHeight: 1024,
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
