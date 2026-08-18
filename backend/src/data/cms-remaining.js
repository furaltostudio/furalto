/**
 * Remaining CMS defaults: collections, inspiration, navigation.
 * Keep in sync with frontend/src/config/navigation.ts + product-categories.ts.
 */
const PRODUCT_CATEGORIES = [
  { value: "sofas", label: "Sofas" },
  { value: "sectionals", label: "Sectionals" },
  { value: "lounge-chairs", label: "Lounge Chairs" },
  { value: "chairs", label: "Chairs" },
  { value: "benches", label: "Benches" },
  { value: "stools", label: "Stools" },
  { value: "beds", label: "Beds" },
  { value: "nightstands", label: "Nightstands" },
  { value: "dressers", label: "Dressers" },
  { value: "storage", label: "Storage" },
  { value: "bookcases", label: "Bookcases" },
  { value: "sideboards", label: "Sideboards" },
  { value: "media-consoles", label: "Media Consoles" },
  { value: "tables", label: "Dining Tables" },
  { value: "coffee-tables", label: "Coffee Tables" },
  { value: "side-tables", label: "Side Tables" },
  { value: "dining", label: "Dining Sets" },
  { value: "bars", label: "Bars" },
  { value: "desks", label: "Desks" },
  { value: "vanities", label: "Vanities" },
  { value: "mirrors", label: "Mirrors" },
  { value: "wall-art", label: "Wall Art" },
  { value: "pendants", label: "Pendant Lights" },
  { value: "chandeliers", label: "Chandeliers" },
  { value: "floor-lamps", label: "Floor Lamps" },
  { value: "table-lamps", label: "Table Lamps" },
  { value: "sconces", label: "Wall Sconces" },
  { value: "area-rugs", label: "Area Rugs" },
  { value: "rugs", label: "Rugs" },
  { value: "objects", label: "Objects" },
  { value: "textiles", label: "Textiles" },
  { value: "pillows", label: "Pillows" },
];

const categoryDescriptions = {
  sofas: "Deep comfort and refined silhouettes for everyday luxury living.",
  sectionals:
    "Modular sectionals with deep seats and interchangeable components for generous living spaces.",
  "lounge-chairs":
    "Sculptural seating for quiet corners and conversational living rooms.",
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
  "coffee-tables":
    "Low-profile coffee tables designed as the anchor piece for premium living rooms.",
  "side-tables": "Side tables composed for consoles, lounges, and layered vignettes.",
  dining: "Dining sets crafted for intimate dinners and grand gatherings alike.",
  bars: "Bar cabinets and consoles for elevated at-home entertaining.",
  desks: "Executive desks crafted for refined home offices and private studies.",
  vanities: "Vanities with spa-level materiality and calm, considered proportions.",
  mirrors: "Mirrors selected to add depth, reflection, and gallery-worthy character.",
  "wall-art":
    "Wall art selected to bring scale, character, and gallery-worthy presence.",
  pendants: "Suspended sculpture for dining rooms, entries, and open living spaces.",
  chandeliers:
    "Heirloom presence overhead — crystalline drama and architectural balance.",
  "floor-lamps":
    "Grounded light for reading corners, lounges, and layered evening atmospheres.",
  "table-lamps": "Intimate glow for consoles, nightstands, and composed vignettes.",
  sconces: "Wall-mounted light that frames corridors, baths, and gallery-like moments.",
  "area-rugs": "Hand-finished area rugs in natural textures and quiet patterns.",
  rugs: "Hand-finished rugs in natural textures and quiet patterns for every room.",
  objects: "Objects and accents that complete a room with intention and balance.",
  textiles: "Textiles finished with tactile, layered materiality.",
  pillows: "Throw pillows layered for texture, color, and everyday comfort.",
};

module.exports = [
  {
    key: "page.collections",
    title: "Collections Hub",
    type: "page",
    description: "All Collections page headline.",
    data: {
      pagePath: "/collections",
      eyebrow: "Shop",
      title: "All Collections",
      description:
        "Browse Furalto by furniture type — sofas, beds, dining, lighting, and more.",
    },
  },
  {
    key: "page.collections.meta",
    title: "Collection Category Copy",
    type: "page",
    description: "Titles and descriptions for each furniture-type collection page.",
    data: {
      pagePath: "/collections",
      categories: PRODUCT_CATEGORIES.map((category) => ({
        id: category.value,
        eyebrow: category.label,
        title: `${category.label} Collections`,
        description:
          categoryDescriptions[category.value] ||
          `A curated edit of ${category.label.toLowerCase()} — composed for atmosphere, proportion, and lasting presence.`,
      })),
    },
  },
  {
    key: "page.inspiration",
    title: "Inspiration Hub",
    type: "page",
    description: "Inspiration index page headline.",
    data: {
      pagePath: "/inspiration",
      eyebrow: "Design",
      title: "Inspirational Galleries",
      description:
        "Browse shoppable looks styled around our sofas, beds, and signature pieces.",
    },
  },
  {
    key: "page.inspiration.rooms",
    title: "Inspiration Room Copy",
    type: "page",
    description: "Titles and descriptions for each inspiration gallery.",
    data: {
      pagePath: "/inspiration",
      rooms: [
        {
          id: "bedroom",
          eyebrow: "Inspirational Gallery",
          title: "Bedroom Gallery",
          description:
            "Browse beds and bedroom essentials in a visual gallery — compare silhouettes, materials, and proportions at a glance.",
        },
        {
          id: "living-room",
          eyebrow: "Inspirational Gallery",
          title: "Living Room Ideas",
          description:
            "Explore sofas and lounge seating styled in immersive room settings for modern luxury living.",
        },
        {
          id: "dining",
          eyebrow: "Inspirational Gallery",
          title: "Dining Inspiration",
          description:
            "Tables, lighting, and seating curated for memorable dining experiences.",
        },
        {
          id: "lighting",
          eyebrow: "Inspirational Gallery",
          title: "Lighting Ideas",
          description:
            "Sculptural lighting compositions to layer warmth and drama throughout the home.",
        },
        {
          id: "office",
          eyebrow: "Inspirational Gallery",
          title: "Home Office Ideas",
          description:
            "Desks, chairs, and storage for workspaces with quiet sophistication.",
        },
      ],
    },
  },
  {
    key: "site.navigation",
    title: "Main Navigation",
    type: "navigation",
    description:
      "Label overrides for the live top menu (Sofas, Beds, Chairs, Dining Sets, Bespoke, Sale). Links follow the storefront navigation config.",
    data: {
      pagePath: "/",
      items: [
        { label: "Sofas", href: "/collections/sofas" },
        { label: "Beds", href: "/collections/beds" },
        { label: "Chairs", href: "/collections/chairs" },
        { label: "Dining Sets", href: "/collections/dining" },
        { label: "Bespoke", href: "/custom" },
        { label: "Sale", href: "/collections" },
      ],
    },
  },
];
