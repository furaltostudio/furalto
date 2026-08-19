export type CraftTrustPoint = {
  id: string;
  title: string;
  detail: string;
};

export type CraftProcessStep = {
  id: string;
  title: string;
  detail: string;
  imageSrc: string;
  imageAlt: string;
};

export type CraftStoryContent = {
  mastheadLeft: string;
  mastheadCenter: string;
  mastheadRight: string;
  brandMark: string;
  brandTagline: string;
  titleLine1: string;
  titleAccent1: string;
  titleLine2: string;
  titleAccent2: string;
  subtitle: string;
  body: string;
  heroImageSrc: string;
  heroImageAlt: string;
  trustPoints: CraftTrustPoint[];
  processEyebrow: string;
  steps: CraftProcessStep[];
  indiaLabel: string;
  quote: string;
  quoteAccent: string;
  siteUrl: string;
  ctaLabel: string;
  ctaHref: string;
};

export const craftStoryDefaults: CraftStoryContent = {
  mastheadLeft: "Est. 1979",
  mastheadCenter: "Furalto India",
  mastheadRight: "Legacy",
  brandMark: "Furalto",
  brandTagline: "Crafted with heart. Built on legacy.",
  titleLine1: "Heritage",
  titleAccent1: "skill.",
  titleLine2: "Modern",
  titleAccent2: "living.",
  subtitle: "From a master’s workshop to homes across India",
  body:
    "Furalto continues a craft begun in 1979 by Late Ramchandar — a master carpenter who led more than 100 skilled hands. Today his daughter Gayatri carries that promise forward, uniting India’s finest artisans to create designer furniture with integrity, heritage, and modern luxury.",
  heroImageSrc: "/home/furnitures_four.jpeg",
  heroImageAlt: "Artisan-crafted furniture in a warm Furalto interior",
  trustPoints: [
    {
      id: "legacy",
      title: "Workshop since 1979",
      detail: "A lifetime of joinery, carving, and finishing discipline.",
    },
    {
      id: "artisans",
      title: "Artisan partnership",
      detail: "India’s finest makers under one atelier standard.",
    },
  ],
  processEyebrow: "From workshop to home",
  steps: [
    {
      id: "makers",
      title: "Expert makers",
      detail: "Seasoned hands shape timber, joinery, and silhouette.",
      imageSrc: "/home/furnitures_one.jpeg",
      imageAlt: "Crafted outdoor furniture shaped with care",
    },
    {
      id: "materials",
      title: "Premium materials",
      detail: "Hardwoods, fabrics, and finishes chosen to age with grace.",
      imageSrc: "/home/decor_showcase.jpeg",
      imageAlt: "Premium materials and finishes",
    },
    {
      id: "precision",
      title: "Precision work",
      detail: "Stitching, sanding, and fitting — measured to the millimetre.",
      imageSrc: "/home/furnitures_two.jpeg",
      imageAlt: "Refined upholstery and detailing",
    },
    {
      id: "delivered",
      title: "Masterpiece delivered",
      detail: "Finished pieces, white-glove placed in your room.",
      imageSrc: "/home/furnitures_five.jpeg",
      imageAlt: "Finished luxury seating in a living room",
    },
  ],
  indiaLabel: "Made in India. Built on legacy.",
  quote: "Every piece is a continuation of a life spent shaping wood into homes people love.",
  quoteAccent: "Crafted with heart. Choose Furalto.",
  siteUrl: "www.furalto.com",
  ctaLabel: "Our story",
  ctaHref: "/about",
};
