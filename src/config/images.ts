export type PageImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const unsplash = (id: string, alt: string, width = 1600, height = 1000): PageImage => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=85`,
  alt,
  width,
  height,
});

const local = (path: string, alt: string, width: number, height: number): PageImage => ({
  src: path,
  alt,
  width,
  height,
});

/** Shared atmosphere plates — reused across related furniture types. */
const livingRoom = local(
  "/home/furnitures_five.jpeg",
  "Premium living room with cream upholstered seating",
  1536,
  1024,
);
const bedroom = local(
  "/home/furnitures_two.jpeg",
  "Serene bedroom with upholstered bed and warm lighting",
  1536,
  1024,
);
/** Dining-forward plate — table + chairs, not sofa-led open plan. */
const diningRoom = unsplash(
  "1517248135467-4c7edcad34c4",
  "Luxury dining tables and chairs styled for refined entertaining",
  1600,
  1000,
);
/** Chair-forward landscape plate — fits category card aspect ratios without clipping. */
const chairsRoom = unsplash(
  "1586023492125-27b2c045efd7",
  "Designer accent chair styled in a modern living interior",
  1600,
  1000,
);
const outdoor = local(
  "/home/furnitures_one.jpeg",
  "Luxury outdoor patio with sofa set at dusk",
  1536,
  1024,
);
const bath = local(
  "/home/bath_showroom.jpeg",
  "Luxury marble bathroom with freestanding tub and vanity",
  1600,
  1200,
);
const lighting = unsplash(
  "1513506003901-1e6a229e2d15",
  "Designer pendant lighting over dining table",
  1600,
  1000,
);
const decor = local(
  "/home/decor_showcase.jpeg",
  "Curated vases and decor objects on sideboard",
  1200,
  1500,
);
const artMirrors = unsplash(
  "1565814636199-ae8133055c1c",
  "Gallery wall with framed art and mirrors",
  1600,
  1000,
);
const rugs = unsplash(
  "1600607687939-ce8a6c25118c",
  "Handwoven area rug in light-filled living room",
  1600,
  1000,
);
const office = unsplash(
  "1497366216548-37526070297c",
  "Premium home office with wood desk and shelving",
  1600,
  1000,
);
const inspiration = local(
  "/home/furnitures_six.jpeg",
  "Grand hotel lobby with curved seating",
  1402,
  1122,
);
const sale = unsplash(
  "1760611656148-063d3b9a8dbc",
  "Luxury furniture pieces in a premium showroom",
  1600,
  1000,
);

function withAlt(image: PageImage, alt: string): PageImage {
  return { ...image, alt };
}

/**
 * Collection / room heroes keyed by URL slug.
 * Furniture types map to the matching atmosphere plate (beds → bedroom, sofas → living room, …).
 */
export const categoryImages: Record<string, PageImage> = {
  // Rooms / themes
  outdoor,
  "living-room": livingRoom,
  dining: diningRoom,
  bedroom,
  bath,
  lighting,
  decor,
  "art-mirrors": artMirrors,
  rugs,
  office,
  sale,
  inspiration,

  // Living seating
  sofas: withAlt(livingRoom, "Luxury sofas styled in a modern living room"),
  sectionals: withAlt(livingRoom, "Modular sectional seating in a refined living room"),
  "lounge-chairs": withAlt(chairsRoom, "Lounge chairs composed for quiet living spaces"),
  chairs: withAlt(chairsRoom, "Designer chairs crafted for comfort and quiet presence"),
  benches: withAlt(livingRoom, "Upholstered benches for living and entry spaces"),
  stools: withAlt(diningRoom, "Bar and counter stools for elevated gatherings"),

  // Bedroom
  beds: withAlt(bedroom, "Upholstered bed in a serene master suite"),
  nightstands: withAlt(bedroom, "Nightstands styled beside a luxury bed"),
  dressers: withAlt(bedroom, "Bedroom dressers in a tailored suite"),
  storage: withAlt(bedroom, "Storage systems for composed interiors"),

  // Case goods / tables
  bookcases: withAlt(office, "Bookcases and shelving for curated display"),
  sideboards: withAlt(diningRoom, "Sideboards for refined dining rooms"),
  "media-consoles": withAlt(livingRoom, "Media consoles with gallery-worthy presence"),
  tables: withAlt(diningRoom, "Dining tables set for modern entertaining"),
  "coffee-tables": withAlt(livingRoom, "Coffee tables anchoring a premium living room"),
  "side-tables": withAlt(livingRoom, "Side tables layered in a living vignette"),
  bars: withAlt(diningRoom, "Bar cabinets for elevated at-home entertaining"),

  // Bath / work
  desks: withAlt(office, "Executive desks for refined home offices"),
  vanities: withAlt(bath, "Spa-level vanities in a marble bath"),

  // Lighting
  pendants: withAlt(lighting, "Pendant lighting over a composed dining table"),
  chandeliers: withAlt(lighting, "Chandelier presence over a refined interior"),
  "floor-lamps": withAlt(livingRoom, "Floor lamps layered in a living lounge"),
  "table-lamps": withAlt(bedroom, "Table lamps styled on nightstands and consoles"),
  sconces: withAlt(bath, "Wall sconces framing a calm interior moment"),

  // Soft goods / objects
  mirrors: withAlt(artMirrors, "Mirrors adding depth and gallery character"),
  "wall-art": withAlt(artMirrors, "Wall art composed for gallery-worthy presence"),
  "area-rugs": withAlt(rugs, "Handwoven area rugs grounding a light-filled room"),
  objects: withAlt(decor, "Curated objects and accents for composed interiors"),
  textiles: withAlt(bedroom, "Textiles layered for tactile bedroom comfort"),
  pillows: withAlt(livingRoom, "Throw pillows layered across luxury seating"),
};

export const roomImages: Record<string, PageImage> = {
  bedroom: categoryImages.bedroom,
  "living-room": categoryImages["living-room"],
  outdoor: categoryImages.outdoor,
  dining: categoryImages.dining,
  lighting: categoryImages.lighting,
  bath: categoryImages.bath,
  decor: categoryImages.decor,
  "art-mirrors": categoryImages["art-mirrors"],
  office: categoryImages.office,
};

export function getCategoryImage(category: string, title?: string): PageImage {
  const matched = categoryImages[category];
  if (matched) {
    return matched;
  }

  return {
    src: categoryImages["living-room"].src,
    alt: title ? `${title} collection` : "Furalto furniture collection",
    width: 1536,
    height: 1024,
  };
}

export function getRoomImage(room: string, title?: string): PageImage {
  return roomImages[room] ?? getCategoryImage(room, title);
}
