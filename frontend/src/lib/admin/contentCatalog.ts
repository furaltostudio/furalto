/** Friendly catalogue for Admin → Website (client-facing labels + live paths). */

export type ContentCatalogItem = {
  key: string;
  title: string;
  group:
    | "Site-wide"
    | "Homepage"
    | "Pages"
    | "Care & guides"
    | "Collections & inspiration"
    | "Showrooms & visits";
  path: string;
  blurb: string;
};

export const CONTENT_CATALOG: ContentCatalogItem[] = [
  {
    key: "site.settings",
    title: "Site Settings",
    group: "Site-wide",
    path: "/",
    blurb: "Announcement bar, contact details, footer text, and social links.",
  },
  {
    key: "site.navigation",
    title: "Main Navigation",
    group: "Site-wide",
    path: "/",
    blurb: "Label overrides for the live header menu (Sofas, Beds, Chairs, Dining Sets, Bespoke, Sale).",
  },
  {
    key: "homepage",
    title: "Homepage",
    group: "Homepage",
    path: "/",
    blurb: "Hero, craft story, categories, and Bespoke studio. Shop the Look pins are under Website → Shop the Look.",
  },
  {
    key: "page.about",
    title: "About",
    group: "Pages",
    path: "/about",
    blurb: "Our story and brand page.",
  },
  {
    key: "page.testimonials",
    title: "Client Stories",
    group: "Pages",
    path: "/testimonials",
    blurb: "Testimonials hero, intro copy, and client story list.",
  },
  {
    key: "page.promotions",
    title: "Promotions",
    group: "Pages",
    path: "/promotions",
    blurb: "Current offers and seasonal promotions.",
  },
  {
    key: "page.trade-program",
    title: "Trade Program",
    group: "Pages",
    path: "/trade-program",
    blurb: "Trade benefits and partner information.",
  },
  {
    key: "page.shipping",
    title: "Shipping & Delivery",
    group: "Pages",
    path: "/shipping",
    blurb: "Delivery and white-glove service copy.",
  },
  {
    key: "page.returns",
    title: "Returns & Exchanges",
    group: "Pages",
    path: "/returns",
    blurb: "Returns policy and process.",
  },
  {
    key: "page.privacy",
    title: "Privacy Policy",
    group: "Pages",
    path: "/privacy",
    blurb: "Privacy policy content.",
  },
  {
    key: "page.terms",
    title: "Terms of Use",
    group: "Pages",
    path: "/terms",
    blurb: "Website terms of use.",
  },
  {
    key: "page.sale-terms",
    title: "Sale Terms",
    group: "Pages",
    path: "/sale-terms",
    blurb: "Sale and promotion terms.",
  },
  {
    key: "page.sustainability",
    title: "Sustainability",
    group: "Pages",
    path: "/sustainability",
    blurb: "Sustainability story and commitments.",
  },
  {
    key: "page.careers",
    title: "Careers",
    group: "Pages",
    path: "/careers",
    blurb: "Careers page and hiring message.",
  },
  {
    key: "page.lookbooks",
    title: "Lookbooks",
    group: "Pages",
    path: "/lookbooks",
    blurb: "Lookbooks and editorial collections.",
  },
  {
    key: "page.design-consultation",
    title: "Design Consultation",
    group: "Pages",
    path: "/design/consultation",
    blurb: "Design consultation service page.",
  },
  {
    key: "page.care",
    title: "Care & Maintenance",
    group: "Care & guides",
    path: "/care",
    blurb: "Product care hub page.",
  },
  {
    key: "page.care.outdoor",
    title: "Care: Outdoor",
    group: "Care & guides",
    path: "/care/outdoor",
    blurb: "Outdoor furniture care guide.",
  },
  {
    key: "page.care.living",
    title: "Care: Living",
    group: "Care & guides",
    path: "/care/living",
    blurb: "Living room care guide.",
  },
  {
    key: "page.care.bedroom",
    title: "Care: Bedroom",
    group: "Care & guides",
    path: "/care/bedroom",
    blurb: "Bedroom furniture care guide.",
  },
  {
    key: "page.care.dining",
    title: "Care: Dining",
    group: "Care & guides",
    path: "/care/dining",
    blurb: "Dining furniture care guide.",
  },
  {
    key: "page.care.bath",
    title: "Care: Bath",
    group: "Care & guides",
    path: "/care/bath",
    blurb: "Bath furniture care guide.",
  },
  {
    key: "page.care.rugs",
    title: "Care: Rugs",
    group: "Care & guides",
    path: "/care/rugs",
    blurb: "Rug care guide.",
  },
  {
    key: "page.guides.bulbs",
    title: "Guide: Bulbs",
    group: "Care & guides",
    path: "/guides/bulbs",
    blurb: "Lighting bulb guide.",
  },
  {
    key: "page.guides.materials",
    title: "Guide: Materials",
    group: "Care & guides",
    path: "/guides/materials",
    blurb: "Materials guide.",
  },
  {
    key: "page.guides.rug-sizes",
    title: "Guide: Rug Sizes",
    group: "Care & guides",
    path: "/guides/rug-sizes",
    blurb: "Rug sizing guide.",
  },
  {
    key: "page.guides.gifts",
    title: "Guide: Gifts",
    group: "Care & guides",
    path: "/guides/gifts",
    blurb: "Gift guide.",
  },
  {
    key: "page.guides.framing",
    title: "Guide: Framing",
    group: "Care & guides",
    path: "/guides/framing",
    blurb: "Framing guide.",
  },
  {
    key: "page.guides.ergonomics",
    title: "Guide: Ergonomics",
    group: "Care & guides",
    path: "/guides/ergonomics",
    blurb: "Ergonomics guide.",
  },
  {
    key: "page.swatches",
    title: "Swatches",
    group: "Care & guides",
    path: "/swatches",
    blurb: "Swatch request hub page.",
  },
  {
    key: "page.swatches.outdoor",
    title: "Swatches: Outdoor",
    group: "Care & guides",
    path: "/swatches/outdoor",
    blurb: "Outdoor fabric swatches page.",
  },
  {
    key: "page.swatches.living",
    title: "Swatches: Living",
    group: "Care & guides",
    path: "/swatches/living",
    blurb: "Living room fabric swatches page.",
  },
  {
    key: "page.swatches.bedroom",
    title: "Swatches: Bedroom",
    group: "Care & guides",
    path: "/swatches/bedroom",
    blurb: "Bedroom fabric swatches page.",
  },
  {
    key: "page.swatches.dining",
    title: "Swatches: Dining",
    group: "Care & guides",
    path: "/swatches/dining",
    blurb: "Dining finish swatches page.",
  },
  {
    key: "page.swatches.bath",
    title: "Swatches: Bath",
    group: "Care & guides",
    path: "/swatches/bath",
    blurb: "Bath finish swatches page.",
  },
  {
    key: "page.collections",
    title: "Collections Hub",
    group: "Collections & inspiration",
    path: "/collections",
    blurb: "All Collections hub headline and furniture-type browsing copy.",
  },
  {
    key: "page.collections.meta",
    title: "Collection Category Copy",
    group: "Collections & inspiration",
    path: "/collections",
    blurb: "Titles for sofas, beds, dining, lighting, and other furniture-type pages.",
  },
  {
    key: "page.inspiration",
    title: "Inspiration Hub",
    group: "Collections & inspiration",
    path: "/inspiration",
    blurb: "Inspiration hub headline for sofa and bedroom lookbooks.",
  },
  {
    key: "page.inspiration.rooms",
    title: "Inspiration Room Copy",
    group: "Collections & inspiration",
    path: "/inspiration",
    blurb: "Titles for bedroom, living, dining, and other inspiration galleries.",
  },
  {
    key: "page.contact",
    title: "Contact",
    group: "Showrooms & visits",
    path: "/contact",
    blurb: "Contact page intro and reason cards.",
  },
  {
    key: "page.showrooms",
    title: "Showrooms",
    group: "Showrooms & visits",
    path: "/showrooms",
    blurb: "Showroom locations, hours, and services.",
  },
  {
    key: "page.appointments",
    title: "Appointments",
    group: "Showrooms & visits",
    path: "/appointments",
    blurb: "Appointments page headline and benefits.",
  },
];

export const CONTENT_CATALOG_BY_KEY = Object.fromEntries(
  CONTENT_CATALOG.map((item) => [item.key, item])
) as Record<string, ContentCatalogItem>;
