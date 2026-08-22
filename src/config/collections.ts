import { PRODUCT_CATEGORIES, getProductCategoryLabel } from "@/config/product-categories";

export type CollectionMeta = {
  title: string;
  description: string;
  eyebrow: string;
};

const categoryDescriptions: Record<string, string> = {
  sofas: "Deep comfort and refined silhouettes for everyday luxury living.",
  sectionals: "Modular sectionals with deep seats and interchangeable components for generous living spaces.",
  "lounge-chairs": "Sculptural seating for quiet corners and conversational living rooms.",
  chairs: "Chairs crafted for comfort, proportion, and quiet architectural presence.",
  benches: "Benches crafted for entryways, bedrooms, and dining spaces alike.",
  stools: "Bar and counter stools finished for elevated everyday gatherings.",
  beds: "Upholstered and architectural beds composed for restorative master suites.",
  nightstands: "Nightstands designed to pair seamlessly with signature bed collections.",
  dressers: "Dressers and case goods finished for serene, tailored bedrooms.",
  storage: "Storage systems with integrated lighting and tailored interior fittings.",
  bookcases: "Bookcases and shelving composed for curated, tailored display.",
  sideboards: "Sideboards and buffets crafted for refined dining and entertaining.",
  "media-consoles": "Media consoles balancing storage with gallery-worthy presence.",
  tables: "Dining tables made for long-form entertaining and family gatherings.",
  "coffee-tables": "Low-profile coffee tables designed as the anchor piece for premium living rooms.",
  "side-tables": "Side tables composed for consoles, lounges, and layered vignettes.",
  dining: "Dining sets crafted for intimate dinners and grand gatherings alike.",
  bars: "Bar cabinets and consoles for elevated at-home entertaining.",
  desks: "Executive desks crafted for refined home offices and private studies.",
  vanities: "Vanities with spa-level materiality and calm, considered proportions.",
  mirrors: "Mirrors selected to add depth, reflection, and gallery-worthy character.",
  "wall-art": "Wall art selected to bring scale, character, and gallery-worthy presence.",
  pendants: "Suspended sculpture for dining rooms, entries, and open living spaces.",
  chandeliers: "Heirloom presence overhead — crystalline drama and architectural balance.",
  "floor-lamps": "Grounded light for reading corners, lounges, and layered evening atmospheres.",
  "table-lamps": "Intimate glow for consoles, nightstands, and composed vignettes.",
  sconces: "Wall-mounted light that frames corridors, baths, and gallery-like moments.",
  "area-rugs": "Hand-finished area rugs in natural textures and quiet patterns.",
  rugs: "Hand-finished rugs in natural textures and quiet patterns for every room.",
  objects: "Objects and accents that complete a room with intention and balance.",
  textiles: "Textiles finished with tactile, layered materiality.",
  pillows: "Throw pillows layered for texture, color, and everyday comfort.",
};

function buildCollectionMeta(): Record<string, CollectionMeta> {
  const meta: Record<string, CollectionMeta> = {};

  for (const category of PRODUCT_CATEGORIES) {
    meta[category.value] = {
      eyebrow: category.label,
      title: `${category.label} Collections`,
      description:
        categoryDescriptions[category.value] ||
        `A curated edit of ${category.label.toLowerCase()} — composed for atmosphere, proportion, and lasting presence.`,
    };
  }

  return meta;
}

const collectionMeta: Record<string, CollectionMeta> = buildCollectionMeta();

/**
 * Furniture-type collection metadata. `subcategory` is accepted for backward
 * compatibility with old two-segment URLs but is no longer used to resolve
 * a distinct meta — the category (furniture type) is the primary key.
 */
export function getCollectionMeta(category: string, _subcategory?: string): CollectionMeta {
  return (
    collectionMeta[category] ?? {
      eyebrow: "Collections",
      title: getProductCategoryLabel(category) || "All Collections",
      description: "Explore the complete Furalto furniture collection.",
    }
  );
}

export type CollectionEmptyState = {
  kicker: string;
  title: string;
  copy: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

const comingSoonEmptyStates: Record<string, CollectionEmptyState> = {
  chairs: {
    kicker: "Coming Soon",
    title: "Chairs collection",
    copy: "We're curating sculptural seating for living rooms, dining, and quiet corners. Visit our Rohini design studio or explore bespoke options in the meantime.",
    primaryCta: { label: "Explore Bespoke", href: "/custom" },
    secondaryCta: { label: "Browse Sofas", href: "/collections/sofas" },
  },
  dining: {
    kicker: "Coming Soon",
    title: "Dining sets collection",
    copy: "Tables and seating for intimate dinners and grand gatherings are on the way. Book a studio visit or start a bespoke dining commission.",
    primaryCta: { label: "Book a visit", href: "/appointments" },
    secondaryCta: { label: "Explore Bespoke", href: "/custom" },
  },
};

/** Rich empty state for categories without catalogue data yet. */
export function getCollectionEmptyState(category: string): CollectionEmptyState | null {
  return comingSoonEmptyStates[category] ?? null;
}

export const inspirationRooms: Record<
  string,
  { title: string; description: string; eyebrow: string }
> = {
  bedroom: {
    eyebrow: "Inspirational Gallery",
    title: "Bedroom Gallery",
    description:
      "Browse beds and bedroom essentials in a visual gallery — compare silhouettes, materials, and proportions at a glance.",
  },
  "living-room": {
    eyebrow: "Inspirational Gallery",
    title: "Living Room Ideas",
    description:
      "Explore sofas, chairs, and tables styled in immersive room settings for modern luxury living.",
  },
  outdoor: {
    eyebrow: "Inspirational Gallery",
    title: "Outdoor Living",
    description:
      "Terrace and garden furniture presented through atmospheric lifestyle imagery and shoppable edits.",
  },
  dining: {
    eyebrow: "Inspirational Gallery",
    title: "Dining Inspiration",
    description:
      "Tables, lighting, and seating curated for memorable dining experiences indoors and out.",
  },
  lighting: {
    eyebrow: "Inspirational Gallery",
    title: "Lighting Ideas",
    description:
      "Sculptural lighting compositions to layer warmth and drama throughout the home.",
  },
  bath: {
    eyebrow: "Inspirational Gallery",
    title: "Bath Inspiration",
    description:
      "Spa-inspired vanities, mirrors, and bath furnishings with calm, tactile finishes.",
  },
  decor: {
    eyebrow: "Inspirational Gallery",
    title: "Decor Styling",
    description:
      "Finishing touches and curated objects that elevate every interior composition.",
  },
  "art-mirrors": {
    eyebrow: "Inspirational Gallery",
    title: "Gallery Walls",
    description:
      "Art and mirrors arranged to bring scale, reflection, and personality to your walls.",
  },
  office: {
    eyebrow: "Inspirational Gallery",
    title: "Home Office Ideas",
    description:
      "Desks, chairs, and storage for workspaces with quiet sophistication.",
  },
};
