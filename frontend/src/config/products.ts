import type { Product } from "@/types/product";

const fabricOptions = [
  {
    id: "cream-linen",
    label: "Cream Linen",
    swatch: "#f5efe6",
    specs: [
      { label: "Upholstery", value: "Cream linen blend" },
      { label: "Fabric care", value: "Professional clean" },
    ],
  },
  {
    id: "taupe-boucle",
    label: "Taupe Bouclé",
    swatch: "#c8b9a8",
    specs: [
      { label: "Upholstery", value: "Taupe bouclé wool-blend" },
      { label: "Fabric care", value: "Spot clean / professional clean" },
    ],
  },
  {
    id: "espresso-velvet",
    label: "Espresso Velvet",
    swatch: "#4a3428",
    specs: [
      { label: "Upholstery", value: "Espresso cotton velvet" },
      { label: "Fabric care", value: "Vacuum soft brush · professional clean" },
    ],
  },
  {
    id: "sand-performance",
    label: "Sand Performance",
    swatch: "#d8cdbf",
    specs: [
      { label: "Upholstery", value: "Sand performance weave" },
      { label: "Fabric care", value: "Stain-resistant · wipe clean" },
    ],
  },
];

const finishOptions = [
  {
    id: "warm-oak",
    label: "Warm Oak",
    swatch: "#b8956f",
    specs: [{ label: "Leg finish", value: "Warm oak stain" }],
  },
  {
    id: "walnut",
    label: "Walnut",
    swatch: "#5c4033",
    specs: [{ label: "Leg finish", value: "Dark walnut stain" }],
  },
  { id: "brass", label: "Brushed Brass", swatch: "#c9a96e" },
  { id: "marble-white", label: "Calacatta Marble", swatch: "#ece7df" },
];

const sizeOptions = [
  {
    id: "standard",
    label: "Standard",
    specs: [
      { label: "Width", value: "280 cm" },
      { label: "Depth", value: "108 cm" },
      { label: "Seat Height", value: "44 cm" },
      { label: "Seat Depth", value: "60 cm" },
      { label: "Modules", value: "3-piece modular" },
    ],
  },
  { id: "queen", label: "Queen" },
  { id: "king", label: "King" },
  {
    id: "extended",
    label: "Extended",
    specs: [
      { label: "Width", value: "320 cm" },
      { label: "Depth", value: "112 cm" },
      { label: "Seat Height", value: "44 cm" },
      { label: "Seat Depth", value: "62 cm" },
      { label: "Modules", value: "4-piece modular" },
    ],
  },
];

const unsplash = (id: string, w = 1200, h = 1500) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

export const products: Product[] = [
  {
    slug: "milano-sectional",
    name: "Milano Modular Sectional",
    category: "sectionals",
    subcategory: "",
    collection: "sectionals",
    price: 745000,
    description:
      "A sculptural modular sectional with deep seats, refined tailoring, and interchangeable components designed for generous living spaces.",
    details: [
      "Removable cushion covers",
      "Kiln-dried hardwood frame",
      "High-resilience foam core",
      "Modular configuration options",
    ],
    specs: [
      { label: "Width", value: "320 cm" },
      { label: "Depth", value: "112 cm" },
      { label: "Seat Height", value: "44 cm" },
      { label: "Frame", value: "Hardwood & engineered ply" },
    ],
    images: [
      { src: unsplash("1555041469-a586c61ea9bc"), alt: "Milano sectional side angle", width: 1200, height: 1500 },
      { src: unsplash("1586023492125-27b2c045efd7"), alt: "Milano sectional fabric detail", width: 1200, height: 1500 },
      { src: unsplash("1586023492125-27b2c045efd7"), alt: "Milano sectional in open living space", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions,
    finishes: finishOptions.slice(0, 2),
    sizes: [sizeOptions[3], sizeOptions[0]],
    relatedSlugs: ["palermo-accent-chair", "aria-coffee-table", "monarch-sideboard"],
    rooms: ["living-room"],
  },
  {
    slug: "palermo-accent-chair",
    name: "Palermo Accent Chair",
    category: "lounge-chairs",
    subcategory: "",
    collection: "lounge-chairs",
    price: 205000,
    description:
      "A rounded swivel accent chair with enveloping backrest and quiet luxury upholstery for conversational seating zones.",
    details: ["360° swivel base", "Feather-wrapped seat cushion", "Brass-finished pedestal"],
    specs: [
      { label: "Width", value: "86 cm" },
      { label: "Depth", value: "82 cm" },
      { label: "Height", value: "78 cm" },
    ],
    images: [
      { src: unsplash("1555041469-a586c61ea9bc"), alt: "Palermo chair profile", width: 1200, height: 1500 },
      { src: unsplash("1555041469-a586c61ea9bc"), alt: "Palermo chair upholstery detail", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions,
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["milano-sectional", "aria-coffee-table"],
    rooms: ["living-room"],
  },
  {
    slug: "aria-coffee-table",
    name: "Aria Marble Coffee Table",
    category: "coffee-tables",
    subcategory: "",
    collection: "coffee-tables",
    price: 189000,
    compareAtPrice: 219000,
    description:
      "A low-profile coffee table pairing honed marble with fluted oak, designed as the anchor piece for premium living rooms.",
    details: ["Natural marble top", "Fluted oak base", "Felt floor protectors"],
    specs: [
      { label: "Diameter", value: "110 cm" },
      { label: "Height", value: "38 cm" },
      { label: "Top", value: "Marble" },
    ],
    images: [
      { src: unsplash("1618220179428-22790b461013"), alt: "Aria coffee table top detail", width: 1200, height: 1500 },
      { src: unsplash("1618220179428-22790b461013"), alt: "Aria coffee table base detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[3], finishOptions[0]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["milano-sectional", "monarch-sideboard"],
    rooms: ["living-room", "dining"],
  },
  {
    slug: "monarch-sideboard",
    name: "Monarch Sideboard",
    category: "media-consoles",
    subcategory: "",
    collection: "media-consoles",
    price: 323000,
    description:
      "A ribbed walnut sideboard with soft-close drawers and integrated lighting, balancing storage with gallery-worthy presence.",
    details: ["Soft-close drawers", "Integrated LED lighting", "Cable management"],
    specs: [
      { label: "Width", value: "220 cm" },
      { label: "Depth", value: "48 cm" },
      { label: "Height", value: "72 cm" },
    ],
    images: [
      { src: unsplash("1598300042247-d088f8ab3a91"), alt: "Monarch sideboard detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[1], finishOptions[0]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["milano-sectional", "aria-coffee-table"],
    rooms: ["living-room"],
  },
  {
    slug: "sienna-bed",
    name: "Sienna Upholstered Bed",
    category: "beds",
    subcategory: "",
    collection: "beds",
    price: 465000,
    description:
      "A channel-tufted upholstered bed with a tall headboard and layered comfort, designed for serene master suites.",
    details: ["Channel-tufted headboard", "Slat support system", "Optional storage base"],
    specs: [
      { label: "Widths", value: "Queen / King" },
      { label: "Headboard Height", value: "132 cm" },
      { label: "Frame", value: "Engineered hardwood" },
    ],
    images: [
      { src: unsplash("1505693416388-ac5ce068fe85"), alt: "Sienna bed headboard detail", width: 1200, height: 1500 },
      { src: unsplash("1631049307264-da0ec9d70304"), alt: "Sienna bed side profile", width: 1200, height: 1500 },
      { src: unsplash("1616594039964-ae9021a400a0"), alt: "Sienna bed styled bedroom", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions,
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[1], sizeOptions[2]],
    relatedSlugs: ["calais-nightstand", "vela-table-lamp", "heritage-wardrobe"],
    rooms: ["bedroom"],
  },
  {
    slug: "vela-table-lamp",
    name: "Vela Table Lamp",
    category: "table-lamps",
    subcategory: "",
    collection: "table-lamps",
    price: 34900,
    description:
      "A refined table lamp with a champagne metal stem and drum shade, casting warm ambient light for bedside and lounge tables.",
    details: ["Dimmer-compatible", "Linen shade", "Weighted base"],
    specs: [
      { label: "Height", value: "58 cm" },
      { label: "Shade", value: "Linen drum" },
      { label: "Bulb", value: "E27 max 60W" },
    ],
    images: [
      { src: unsplash("1507652313519-d4e9174996dd"), alt: "Vela table lamp on nightstand", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["calais-nightstand", "sienna-bed"],
    rooms: ["bedroom", "living-room"],
  },
  {
    slug: "calais-nightstand",
    name: "Calais Nightstand",
    category: "nightstands",
    subcategory: "",
    collection: "nightstands",
    price: 81500,
    description:
      "A two-drawer nightstand with brass hardware and soft edges, designed to pair seamlessly with the Sienna collection.",
    details: ["Soft-close drawers", "Brass hardware", "Felt-lined top"],
    specs: [
      { label: "Width", value: "56 cm" },
      { label: "Depth", value: "42 cm" },
      { label: "Height", value: "54 cm" },
    ],
    images: [
      { src: unsplash("1598300042247-d088f8ab3a91"), alt: "Calais nightstand detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[0], finishOptions[2]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["sienna-bed", "vela-table-lamp"],
    rooms: ["bedroom"],
  },
  {
    slug: "heritage-wardrobe",
    name: "Heritage Wardrobe System",
    category: "storage",
    subcategory: "",
    collection: "storage",
    price: 515000,
    description:
      "A floor-to-ceiling wardrobe system with integrated lighting, glass display cabinets, and tailored internal fittings.",
    details: ["Integrated LED lighting", "Soft-close doors", "Customizable interiors"],
    specs: [
      { label: "Width", value: "280 cm modular" },
      { label: "Height", value: "248 cm" },
      { label: "Depth", value: "62 cm" },
    ],
    images: [
      { src: unsplash("1505693416388-ac5ce068fe85"), alt: "Heritage wardrobe interior", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[0], finishOptions[1]],
    sizes: [sizeOptions[3]],
    relatedSlugs: ["sienna-bed", "calais-nightstand"],
    rooms: ["bedroom"],
  },
  {
    slug: "heritage-dining-table",
    name: "Heritage Dining Table",
    category: "tables",
    subcategory: "",
    collection: "tables",
    price: 349000,
    description:
      "A substantial dining table with a stone top and architectural base, made for long-form entertaining and family gatherings.",
    details: ["Seats 8–10", "Stone top with sealed finish", "Sculptural pedestal base"],
    specs: [
      { label: "Length", value: "260 cm" },
      { label: "Width", value: "110 cm" },
      { label: "Height", value: "76 cm" },
    ],
    images: [
      { src: unsplash("1600607687939-ce8a6c25118c"), alt: "Heritage dining table detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[3], finishOptions[1]],
    sizes: [sizeOptions[0], sizeOptions[3]],
    relatedSlugs: ["arc-pendant", "milano-sectional"],
    rooms: ["dining"],
  },
  {
    slug: "arc-pendant",
    name: "Arc Pendant Light",
    category: "pendants",
    subcategory: "",
    collection: "pendants",
    price: 95500,
    description:
      "A linear pendant with frosted globes and a brushed brass structure, creating soft, layered light over dining tables.",
    details: ["Dimmable", "Adjustable drop height", "Hand-blown glass globes"],
    specs: [
      { label: "Length", value: "140 cm" },
      { label: "Finish", value: "Brushed brass" },
      { label: "Bulbs", value: "G9 LED included" },
    ],
    images: [
      { src: unsplash("1513506003901-1e6a229e2d15"), alt: "Arc pendant detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["heritage-dining-table"],
    rooms: ["dining", "living-room"],
  },
  {
    slug: "riviera-outdoor-sofa",
    name: "Riviera Outdoor Sofa",
    category: "sofas",
    subcategory: "",
    collection: "sofas",
    price: 449000,
    description:
      "A weather-resistant outdoor sofa with woven sides, deep cushions, and a refined teak frame built for terrace living.",
    details: ["Weather-resistant fabric", "Teak frame", "Quick-dry cushions"],
    specs: [
      { label: "Width", value: "220 cm" },
      { label: "Depth", value: "96 cm" },
      { label: "Frame", value: "Solid teak" },
    ],
    images: [
      { src: unsplash("1600585154340-be6161a56a0c"), alt: "Riviera outdoor sofa detail", width: 1200, height: 1500 },
    ],
    fabrics: [fabricOptions[3], fabricOptions[0]],
    finishes: [finishOptions[0]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["coastal-lounge-chair", "marble-outdoor-table"],
    rooms: ["outdoor"],
  },
  {
    slug: "coastal-lounge-chair",
    name: "Coastal Lounge Chair",
    category: "chairs",
    subcategory: "",
    collection: "chairs",
    price: 139500,
    description:
      "An outdoor lounge chair with woven cord detailing and plush cushions, designed for relaxed patio seating.",
    details: ["All-weather weave", "Removable cushion covers", "Stackable frame"],
    specs: [
      { label: "Width", value: "78 cm" },
      { label: "Depth", value: "82 cm" },
      { label: "Height", value: "78 cm" },
    ],
    images: [
      { src: unsplash("1555041469-a586c61ea9bc"), alt: "Coastal lounge chair profile", width: 1200, height: 1500 },
      { src: unsplash("1555041469-a586c61ea9bc"), alt: "Coastal lounge chair detail", width: 1200, height: 1500 },
    ],
    fabrics: [fabricOptions[3]],
    finishes: [finishOptions[0]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["riviera-outdoor-sofa", "arc-outdoor-sectional"],
    rooms: ["outdoor"],
  },
  {
    slug: "marble-outdoor-table",
    name: "Marble Outdoor Coffee Table",
    category: "tables",
    subcategory: "",
    collection: "tables",
    price: 186000,
    description:
      "A substantial outdoor coffee table with a honed stone top and sculptural base, anchoring open-air lounge arrangements.",
    details: ["Sealed stone surface", "UV-resistant finish", "Drainage channel base"],
    specs: [
      { label: "Length", value: "130 cm" },
      { label: "Width", value: "80 cm" },
      { label: "Height", value: "38 cm" },
    ],
    images: [
      { src: unsplash("1618220179428-22790b461013"), alt: "Marble outdoor coffee table", width: 1200, height: 1500 },
      { src: unsplash("1618220179428-22790b461013"), alt: "Outdoor table base detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[3]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["riviera-outdoor-sofa", "coastal-lounge-chair"],
    rooms: ["outdoor"],
  },
  {
    slug: "terrace-dining-set",
    name: "Terrace Dining Set",
    category: "dining",
    subcategory: "",
    collection: "dining",
    price: 649000,
    description:
      "A complete outdoor dining set with an extending teak table and eight woven armchairs for alfresco entertaining.",
    details: ["Seats 8", "Extending table", "Performance upholstery"],
    specs: [
      { label: "Table Length", value: "240–300 cm" },
      { label: "Chairs", value: "8 included" },
      { label: "Material", value: "Teak & woven cord" },
    ],
    images: [
      { src: unsplash("1600585154340-be6161a56a0c"), alt: "Terrace dining set detail", width: 1200, height: 1500 },
    ],
    fabrics: [fabricOptions[3]],
    finishes: [finishOptions[0]],
    sizes: [sizeOptions[3]],
    relatedSlugs: ["riviera-outdoor-sofa", "coastal-lounge-chair"],
    rooms: ["outdoor"],
  },
  {
    slug: "arc-outdoor-sectional",
    name: "Arc Outdoor Sectional",
    category: "sectionals",
    subcategory: "",
    collection: "sectionals",
    price: 765000,
    description:
      "A curved outdoor sectional with deep seats and performance fabric, designed for rooftop lounges and poolside terraces.",
    details: ["Modular curved layout", "Performance fabric", "Rust-resistant frame"],
    specs: [
      { label: "Configuration", value: "U-shaped modular" },
      { label: "Seat Depth", value: "68 cm" },
      { label: "Frame", value: "Powder-coated aluminum" },
    ],
    images: [
      { src: unsplash("1600585154340-be6161a56a0c"), alt: "Arc outdoor sectional on patio", width: 1200, height: 1500 },
      { src: unsplash("1600585154340-be6161a56a0c"), alt: "Outdoor sectional seating detail", width: 1200, height: 1500 },
    ],
    fabrics: [fabricOptions[3], fabricOptions[0]],
    finishes: [finishOptions[0]],
    sizes: [sizeOptions[3]],
    relatedSlugs: ["coastal-lounge-chair", "marble-outdoor-table", "skyline-outdoor-bar"],
    rooms: ["outdoor"],
  },
  {
    slug: "skyline-outdoor-bar",
    name: "Skyline Outdoor Bar",
    category: "bars",
    subcategory: "",
    collection: "bars",
    price: 382000,
    description:
      "An outdoor bar with marble counter, integrated refrigeration space, and backlit shelving for elevated terrace entertaining.",
    details: ["Marble counter", "Weather-sealed cabinetry", "Integrated lighting"],
    specs: [
      { label: "Width", value: "180 cm" },
      { label: "Depth", value: "62 cm" },
      { label: "Height", value: "110 cm" },
    ],
    images: [
      { src: unsplash("1600607687939-ce8a6c25118c"), alt: "Skyline outdoor bar detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[3], finishOptions[1]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["arc-outdoor-sectional", "marble-outdoor-table"],
    rooms: ["outdoor"],
  },
  {
    slug: "arc-curved-sofa",
    name: "Arc Curved Sofa",
    category: "sofas",
    subcategory: "",
    collection: "sofas",
    price: 615000,
    description:
      "A crescent-shaped sofa with soft architectural lines and premium upholstery, ideal for hotel lobbies and grand living spaces.",
    details: ["Curved silhouette", "Bench seat cushion", "Brass base detail"],
    specs: [
      { label: "Width", value: "280 cm" },
      { label: "Depth", value: "108 cm" },
      { label: "Height", value: "76 cm" },
    ],
    images: [
      { src: unsplash("1555041469-a586c61ea9bc"), alt: "Arc curved sofa in living room", width: 1200, height: 1500 },
      { src: unsplash("1586023492125-27b2c045efd7"), alt: "Arc curved sofa fabric detail", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions,
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[0], sizeOptions[3]],
    relatedSlugs: ["milano-sectional", "palermo-accent-chair", "aria-coffee-table"],
    rooms: ["living-room"],
  },
  {
    slug: "avalon-panel-bed",
    name: "Avalon Panel Bed",
    category: "beds",
    subcategory: "",
    collection: "beds",
    price: 398000,
    description:
      "A low-profile panel bed with oak framing and an upholstered headboard, offering quiet luxury for contemporary bedrooms.",
    details: ["Upholstered headboard", "Oak frame", "Optional lift storage"],
    specs: [
      { label: "Widths", value: "Queen / King" },
      { label: "Headboard Height", value: "118 cm" },
      { label: "Clearance", value: "14 cm" },
    ],
    images: [
      { src: unsplash("1616594039964-ae9021a400a0"), alt: "Avalon panel bed styled bedroom", width: 1200, height: 1500 },
      { src: unsplash("1505693416388-ac5ce068fe85"), alt: "Avalon panel bed detail", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions,
    finishes: [finishOptions[0]],
    sizes: [sizeOptions[1], sizeOptions[2]],
    relatedSlugs: ["sienna-bed", "calais-nightstand"],
    rooms: ["bedroom"],
  },
  {
    slug: "lucerne-canopy-bed",
    name: "Lucerne Canopy Bed",
    category: "beds",
    subcategory: "",
    collection: "beds",
    price: 892000,
    description:
      "A statement canopy bed with brass accents and flowing lines, designed for dramatic master bedroom compositions.",
    details: ["Hand-finished brass frame", "Upholstered headboard", "Optional drapery kit"],
    specs: [
      { label: "Widths", value: "King only" },
      { label: "Overall Height", value: "220 cm" },
      { label: "Frame", value: "Brass & hardwood" },
    ],
    images: [
      { src: unsplash("1631049307264-da0ec9d70304"), alt: "Lucerne canopy bed in bedroom", width: 1200, height: 1500 },
      { src: unsplash("1631049307264-da0ec9d70304"), alt: "Lucerne canopy bed detail", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions.slice(0, 3),
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[2]],
    relatedSlugs: ["sienna-bed", "heritage-wardrobe"],
    rooms: ["bedroom"],
  },
  {
    slug: "noir-platform-bed",
    name: "Noir Platform Bed",
    category: "beds",
    subcategory: "",
    collection: "beds",
    price: 312000,
    description:
      "A minimalist platform bed with a wide headboard shelf and matte walnut finish for refined, architectural bedrooms.",
    details: ["Integrated headboard shelf", "Platform base", "Matte walnut veneer"],
    specs: [
      { label: "Widths", value: "Queen / King" },
      { label: "Height", value: "92 cm" },
      { label: "Clearance", value: "10 cm" },
    ],
    images: [
      { src: unsplash("1505693416388-ac5ce068fe85"), alt: "Noir platform bed", width: 1200, height: 1500 },
      { src: unsplash("1505693416388-ac5ce068fe85"), alt: "Noir platform bed styled room", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[1]],
    sizes: [sizeOptions[1], sizeOptions[2]],
    relatedSlugs: ["avalon-panel-bed", "calais-nightstand"],
    rooms: ["bedroom"],
  },
  {
    slug: "spa-double-vanity",
    name: "Spa Double Vanity",
    category: "vanities",
    subcategory: "",
    collection: "vanities",
    price: 428000,
    description:
      "A wall-mounted double vanity with honed travertine top, soft-close drawers, and integrated brass hardware.",
    details: ["Travertine top", "Soft-close drawers", "Brushed brass pulls"],
    specs: [
      { label: "Width", value: "180 cm" },
      { label: "Depth", value: "52 cm" },
      { label: "Height", value: "85 cm" },
    ],
    images: [
      { src: unsplash("1552321554-5fefe8c9ef14"), alt: "Spa double vanity in marble bathroom", width: 1200, height: 1500 },
      { src: unsplash("1552321554-5fefe8c9ef14"), alt: "Bathroom vanity brass hardware", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[2], finishOptions[3]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["trellis-bath-mirror"],
    rooms: ["bath"],
  },
  {
    slug: "trellis-bath-mirror",
    name: "Trellis Bath Mirror",
    category: "mirrors",
    subcategory: "",
    collection: "mirrors",
    price: 89000,
    description:
      "An arched bath mirror with antiqued brass frame and beveled edge for spa-inspired powder rooms.",
    details: ["Antiqued brass frame", "Beveled mirror", "Wall-mount hardware included"],
    specs: [
      { label: "Width", value: "76 cm" },
      { label: "Height", value: "102 cm" },
    ],
    images: [
      { src: unsplash("1584622650111-993a426fbf0a"), alt: "Trellis arched bath mirror", width: 1200, height: 1500 },
      { src: unsplash("1507652313519-d4e9174996dd"), alt: "Bath mirror above vanity", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["spa-double-vanity"],
    rooms: ["bath"],
  },
  {
    slug: "atlas-area-rug",
    name: "Atlas Handwoven Rug",
    category: "area-rugs",
    subcategory: "",
    collection: "area-rugs",
    price: 156000,
    description:
      "A hand-finished wool rug in a tonal grid pattern, designed to ground living and dining spaces with quiet texture.",
    details: ["Hand-finished wool", "Low pile", "Natural latex backing"],
    specs: [
      { label: "Sizes", value: "8' × 10' / 9' × 12'" },
      { label: "Pile Height", value: "12 mm" },
    ],
    images: [
      { src: unsplash("1600607687939-ce8a6c25118c"), alt: "Atlas handwoven rug in living room", width: 1200, height: 1500 },
      { src: unsplash("1505693416388-ac5ce068fe85"), alt: "Atlas rug texture detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [],
    sizes: [sizeOptions[0], sizeOptions[3]],
    relatedSlugs: ["milano-sectional", "heritage-dining-table"],
    rooms: ["living-room", "dining", "bedroom"],
  },
  {
    slug: "archive-executive-desk",
    name: "Archive Executive Desk",
    category: "desks",
    subcategory: "",
    collection: "desks",
    price: 298000,
    description:
      "A solid walnut executive desk with leather inlay, cable management, and soft-close drawers for refined home offices.",
    details: ["Leather writing surface", "Integrated cable tray", "Soft-close drawers"],
    specs: [
      { label: "Width", value: "180 cm" },
      { label: "Depth", value: "80 cm" },
      { label: "Height", value: "76 cm" },
    ],
    images: [
      { src: unsplash("1497366216548-37526070297c"), alt: "Archive executive desk in home office", width: 1200, height: 1500 },
      { src: unsplash("1497366216548-37526070297c"), alt: "Archive desk leather inlay detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[1]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["studio-task-chair"],
    rooms: ["office"],
  },
  {
    slug: "studio-task-chair",
    name: "Studio Task Chair",
    category: "chairs",
    subcategory: "",
    collection: "chairs",
    price: 142000,
    description:
      "An upholstered task chair with adjustable height, tilt mechanism, and brushed aluminum base for all-day comfort.",
    details: ["Adjustable height", "Tilt mechanism", "Aluminum five-star base"],
    specs: [
      { label: "Seat Height", value: "44–54 cm" },
      { label: "Width", value: "62 cm" },
    ],
    images: [
      { src: unsplash("1497366216548-37526070297c"), alt: "Studio task chair at executive desk", width: 1200, height: 1500 },
      { src: unsplash("1497366216548-37526070297c"), alt: "Studio task chair profile", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions.slice(0, 2),
    finishes: [finishOptions[2]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["archive-executive-desk"],
    rooms: ["office"],
  },
  {
    slug: "luna-vessel-set",
    name: "Luna Vessel Set",
    category: "objects",
    subcategory: "",
    collection: "objects",
    price: 48000,
    description:
      "A trio of hand-glazed ceramic vessels in graduated heights, styled for consoles, shelves, and dining tables.",
    details: ["Hand-glazed ceramic", "Set of three", "Felt base pads"],
    specs: [
      { label: "Heights", value: "18 / 28 / 38 cm" },
      { label: "Finish", value: "Matte cream glaze" },
    ],
    images: [
      { src: unsplash("1618220179428-22790b461013"), alt: "Luna vessel glaze detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["monarch-sideboard", "riviera-throw"],
    rooms: ["living-room", "dining", "decor"],
  },
  {
    slug: "riviera-throw",
    name: "Riviera Cashmere Throw",
    category: "textiles",
    subcategory: "",
    collection: "textiles",
    price: 36000,
    description:
      "A lightweight cashmere-blend throw in champagne tones, finished with hand-rolled edges for layered living rooms.",
    details: ["Cashmere blend", "Hand-rolled edges", "Dry clean recommended"],
    specs: [
      { label: "Size", value: "140 × 200 cm" },
      { label: "Weight", value: "420 g" },
    ],
    images: [
      { src: unsplash("1505693416388-ac5ce068fe85"), alt: "Riviera throw styled on sofa", width: 1200, height: 1500 },
      { src: unsplash("1618220179428-22790b461013"), alt: "Riviera throw textile detail", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions.slice(0, 1),
    finishes: [],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["milano-sectional", "luna-vessel-set"],
    rooms: ["living-room", "bedroom", "decor"],
  },
  {
    slug: "galleria-wall-art",
    name: "Galleria Framed Art Pair",
    category: "wall-art",
    subcategory: "",
    collection: "wall-art",
    price: 124000,
    description:
      "A pair of abstract framed works on archival paper, float-mounted in warm oak frames for gallery-style walls.",
    details: ["Archival giclée print", "Float-mounted oak frames", "Ready to hang"],
    specs: [
      { label: "Frame Size", value: "76 × 102 cm each" },
      { label: "Set", value: "Pair" },
    ],
    images: [
      { src: unsplash("1565814636199-ae8133055c1c"), alt: "Galleria framed art pair on gallery wall", width: 1200, height: 1500 },
      { src: unsplash("1618220179428-22790b461013"), alt: "Galleria art frame detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[0]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["trellis-bath-mirror"],
    rooms: ["living-room", "dining", "art-mirrors"],
  },
  {
    slug: "milano-sectional-sale",
    name: "Milano Modular Sectional",
    category: "sofas",
    subcategory: "",
    collection: "sofas",
    price: 596000,
    compareAtPrice: 745000,
    description:
      "Limited-time offer on our signature Milano modular sectional — deep seats and interchangeable components for generous living spaces.",
    details: ["Removable cushion covers", "Modular configuration options", "Sale pricing through season end"],
    specs: [
      { label: "Width", value: "320 cm" },
      { label: "Depth", value: "112 cm" },
      { label: "Seat Height", value: "44 cm" },
    ],
    images: [
      { src: unsplash("1555041469-a586c61ea9bc"), alt: "Milano sectional side angle", width: 1200, height: 1500 },
    ],
    fabrics: fabricOptions,
    finishes: finishOptions.slice(0, 2),
    sizes: [sizeOptions[3]],
    relatedSlugs: ["aria-coffee-table", "palermo-accent-chair"],
    rooms: ["living-room", "sale"],
  },
  {
    slug: "heritage-dining-table-sale",
    name: "Heritage Dining Table",
    category: "tables",
    subcategory: "",
    collection: "tables",
    price: 384000,
    compareAtPrice: 480000,
    description:
      "Seasonal savings on the Heritage dining table — honed marble top with sculpted walnut base for refined gatherings.",
    details: ["Honed marble top", "Sculpted walnut base", "Limited sale allocation"],
    specs: [
      { label: "Length", value: "240 cm" },
      { label: "Width", value: "110 cm" },
      { label: "Height", value: "76 cm" },
    ],
    images: [
      { src: unsplash("1618220179428-22790b461013"), alt: "Heritage dining table marble detail", width: 1200, height: 1500 },
    ],
    fabrics: [],
    finishes: [finishOptions[3], finishOptions[1]],
    sizes: [sizeOptions[0]],
    relatedSlugs: ["aria-coffee-table"],
    rooms: ["dining", "sale"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return products.map((product) => product.slug);
}

export function getProductsByCategory(category: string, _subcategory?: string): Product[] {
  return products.filter((product) => product.category === category);
}

export function getProductsByRoom(room: string): Product[] {
  return products.filter((product) => product.rooms.includes(room));
}

export function getRelatedProducts(slug: string, limit = 8): Product[] {
  const product = getProductBySlug(slug);
  if (!product) {
    return [];
  }

  const curated = product.relatedSlugs
    .map((relatedSlug) => getProductBySlug(relatedSlug))
    .filter((item): item is Product => Boolean(item));

  if (curated.length >= limit) {
    return curated.slice(0, limit);
  }

  const exclude = new Set([product.slug, ...curated.map((item) => item.slug)]);
  const fallback = products
    .filter(
      (item) => item.category === product.category && !exclude.has(item.slug),
    )
    .sort((a, b) => {
      const aScore =
        (a.collection === product.collection ? 3 : 0) +
        a.rooms.filter((room) => product.rooms.includes(room)).length;
      const bScore =
        (b.collection === product.collection ? 3 : 0) +
        b.rooms.filter((room) => product.rooms.includes(room)).length;
      return bScore - aScore || a.name.localeCompare(b.name);
    });

  return [...curated, ...fallback].slice(0, limit);
}
