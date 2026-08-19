import { categoryImages, type PageImage } from "@/config/images";

export type MegaMenuLink = {
  label: string;
  href: string;
};

export type MegaMenuColumn = {
  title: string;
  links: MegaMenuLink[];
};

export type MegaMenuFeatured = {
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

export type NavItem = {
  /** Stable identity for React keys (labels/hrefs can collide, e.g. More + Sale). */
  id: string;
  label: string;
  href: string;
  highlight?: boolean;
  columns?: MegaMenuColumn[];
  featured?: MegaMenuFeatured;
  /** When true (or inferred from /collections/{slug}), hover shows product dropdown */
  productMenu?: boolean;
};

export function getCollectionSlugFromHref(href: string): string | null {
  const match = href.match(/^\/collections\/([^/?#]+)$/);
  return match?.[1] ?? null;
}

export function navItemHasDropdown(item: NavItem): boolean {
  if (item.columns?.length) {
    return true;
  }
  if (item.productMenu === false) {
    return false;
  }
  return Boolean(getCollectionSlugFromHref(item.href));
}

const getFeatured = (image: PageImage, ctaLabel: string, ctaHref: string): MegaMenuFeatured => ({
  image: image.src,
  imageAlt: image.alt,
  ctaLabel,
  ctaHref,
});

type ShopCategory = {
  label: string;
  slug: string;
  image: PageImage;
};

/** Full furniture-type catalogue (chips, grids, lookups). */
export const shopCategories: ShopCategory[] = [
  { label: "Sofas", slug: "sofas", image: categoryImages.sofas },
  { label: "Sectionals", slug: "sectionals", image: categoryImages.sectionals },
  { label: "Beds", slug: "beds", image: categoryImages.beds },
  { label: "Chairs", slug: "chairs", image: categoryImages.chairs },
  { label: "Tables", slug: "tables", image: categoryImages.tables },
  { label: "Coffee Tables", slug: "coffee-tables", image: categoryImages["coffee-tables"] },
  { label: "Dining Sets", slug: "dining", image: categoryImages.dining },
  { label: "Lighting", slug: "pendants", image: categoryImages.pendants },
  { label: "Nightstands", slug: "nightstands", image: categoryImages.nightstands },
  { label: "Desks", slug: "desks", image: categoryImages.desks },
  { label: "Rugs", slug: "rugs", image: categoryImages.rugs },
  { label: "Mirrors", slug: "mirrors", image: categoryImages.mirrors },
  { label: "Vanities", slug: "vanities", image: categoryImages.vanities },
  { label: "Wall Art", slug: "wall-art", image: categoryImages["wall-art"] },
  { label: "Objects", slug: "objects", image: categoryImages.objects },
];

/** Shown directly in the top nav — keep short. Also drives homepage “Explore by Category”. */
export const PRIMARY_NAV_SLUGS = ["sofas", "beds", "chairs", "dining"] as const;

function toNavItem(category: ShopCategory): NavItem {
  const href = `/collections/${category.slug}`;
  return {
    id: category.slug,
    label: category.label,
    href,
    featured: getFeatured(category.image, `Shop All ${category.label}`, href),
  };
}

const primaryCategories = PRIMARY_NAV_SLUGS.map((slug) => {
  const category = shopCategories.find((item) => item.slug === slug);
  if (!category) {
    throw new Error(`Missing shop category for primary nav slug: ${slug}`);
  }
  return toNavItem(category);
});

// Compact top nav: core furniture + Bespoke + Sale
export const mainNavigation: NavItem[] = [
  ...primaryCategories,
  {
    id: "bespoke",
    label: "Bespoke",
    href: "/custom",
    productMenu: false,
    featured: getFeatured(
      categoryImages["living-room"],
      "Start designing",
      "/custom",
    ),
  },
  {
    id: "sale",
    label: "Sale",
    href: "/collections",
    highlight: true,
    productMenu: false,
    featured: getFeatured(categoryImages.sale, "Shop All Sale", "/collections"),
  },
];

/** Flat list of shop collection nav items for chips / grids. */
export const shopNavigation: NavItem[] = shopCategories.map(toNavItem);

export const utilityNavigation = [
  { label: "Store Locator", href: "/showrooms", icon: "location" },
  { label: "Account", href: "/account", icon: "account" },
  { label: "Track Order", href: "/track-order", icon: "truck" },
  { label: "Wishlist", href: "/wishlist", icon: "heart" },
  { label: "Cart", href: "/cart", icon: "cart" },
] as const;
