export type InspirationHotspot = {
  id: string;
  x: number;
  y: number;
  product: {
    name: string;
    price: string;
    href: string;
    /** Catalogue slug — source of truth when linking from admin */
    slug?: string;
  };
};

export type InspirationSlide = {
  id: string;
  label?: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  hotspots: InspirationHotspot[];
};

export const inspirationSection = {
  title: "Product Inspirations",
  eyebrow: "Shop The Look",
} as const;

function asNumber(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/** Normalize CMS / API slide payloads; returns [] if nothing usable. */
export function parseInspirationSlides(raw: unknown): InspirationSlide[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const slides: InspirationSlide[] = [];

  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const row = item as Record<string, unknown>;
    const image = asString(row.image);
    if (!image) return;

    const hotspotsRaw = Array.isArray(row.hotspots) ? row.hotspots : [];
    const hotspots: InspirationHotspot[] = [];

    hotspotsRaw.forEach((spot, spotIndex) => {
      if (!spot || typeof spot !== "object") return;
      const h = spot as Record<string, unknown>;
      const productRaw =
        h.product && typeof h.product === "object"
          ? (h.product as Record<string, unknown>)
          : {};
      const slug = asString(productRaw.slug || h.productSlug);
      const href = asString(productRaw.href, slug ? `/products/${slug}` : "");
      const name = asString(productRaw.name);
      if (!name || !href) return;

      hotspots.push({
        id: asString(h.id, `hotspot-${index}-${spotIndex}`),
        x: Math.min(100, Math.max(0, asNumber(h.x, 50))),
        y: Math.min(100, Math.max(0, asNumber(h.y, 50))),
        product: {
          name,
          price: asString(productRaw.price, ""),
          href,
          slug: slug || undefined,
        },
      });
    });

    const label = asString(row.label);
    slides.push({
      id: asString(row.id, `slide-${index + 1}`),
      ...(label ? { label } : {}),
      image,
      imageAlt: asString(row.imageAlt, "Inspiration look"),
      imageWidth: asNumber(row.imageWidth, 1536),
      imageHeight: asNumber(row.imageHeight, 1024),
      hotspots,
    });
  });

  return slides;
}

/** Pin only when a live catalogue product matches the furniture in frame. */
function pin(
  id: string,
  x: number,
  y: number,
  slug: string,
  name: string,
  price: string,
): InspirationHotspot {
  return {
    id,
    x,
    y,
    product: {
      name,
      price,
      href: `/products/${slug}`,
      slug,
    },
  };
}

/**
 * Original multi-furniture room plates.
 * Hotspots only where a live sofa/bed is a real visual match.
 * Prefer one honest pin over forced multi-pins. Outdoor woven set has no catalog match.
 */
export const inspirationSlides: InspirationSlide[] = [
  {
    id: "living-room",
    label: "Living Room Edit",
    image: "/home/furnitures_five.jpeg",
    imageAlt:
      "Luxury living room with cream upholstered seating and warm ambient lighting",
    imageWidth: 1536,
    imageHeight: 1024,
    // Cream low block sofa with thick track arms — closest live match is Linea Lounge.
    // Loveseat + gold-base barrel chair are not separate matching SKUs in catalogue.
    hotspots: [
      pin(
        "living-main-sofa",
        50,
        56,
        "linea-lounge-modular-sofa",
        "Linea Lounge Modular Sofa",
        "₹1,05,000",
      ),
    ],
  },
  {
    id: "bedroom",
    label: "Bedroom Retreat",
    image: "/home/furnitures_two.jpeg",
    imageAlt: "Serene bedroom with upholstered bed, layered pillows, and soft light",
    imageWidth: 1536,
    imageHeight: 1024,
    // Tall beige vertical-channel headboard → Aura Softline.
    hotspots: [
      pin(
        "bedroom-bed",
        50,
        48,
        "aura-softline-bed",
        "Aura Softline Bed",
        "₹65,000",
      ),
    ],
  },
  {
    id: "dining",
    label: "Open Living Edit",
    image: "/home/furnitures_four.jpeg",
    imageAlt:
      "Open-plan living and dining space with curved cream seating and warm lighting",
    imageWidth: 1402,
    imageHeight: 1122,
    // Soft cream cloud/bean modular curve — Cloud Curve (not bubbly Luna Cloud / green Verde).
    hotspots: [
      pin(
        "open-curve-sofa",
        42,
        60,
        "cloud-curve-sofa",
        "Cloud Curve Sofa",
        "₹60,000",
      ),
    ],
  },
  {
    id: "outdoor",
    label: "Terrace Edit",
    image: "/home/furnitures_one.jpeg",
    imageAlt:
      "Luxury outdoor patio with lounge seating, dining area, and garden views at dusk",
    imageWidth: 1536,
    imageHeight: 1024,
    // Woven rope + light wood outdoor set — no matching sofa/bed in live catalogue.
    hotspots: [],
  },
  {
    id: "rooftop",
    label: "Rooftop Lounge",
    image: "/home/furnitures_three.jpeg",
    imageAlt:
      "Rooftop terrace with curved outdoor seating and city views at sunset",
    imageWidth: 1536,
    imageHeight: 1024,
    // Cream 3-segment C-curve lounge — Lunara Arc (not green Verde Orbit).
    hotspots: [
      pin(
        "rooftop-curve",
        52,
        58,
        "lunara-arc-sofa",
        "Lunara Arc Sofa",
        "₹1,20,000",
      ),
    ],
  },
  {
    id: "lobby",
    label: "Grand Lobby",
    image: "/home/furnitures_six.jpeg",
    imageAlt:
      "Grand hotel lobby with curved cream seating, marble coffee table, and warm ambient lighting",
    imageWidth: 1402,
    imageHeight: 1122,
    // Cream organic sofa + matching round chairs — Cloud Embrace Lounge Set.
    hotspots: [
      pin(
        "lobby-lounge-set",
        48,
        58,
        "cloud-embrace-lounge-set",
        "Cloud Embrace Lounge Set",
        "₹2,00,000",
      ),
    ],
  },
];
