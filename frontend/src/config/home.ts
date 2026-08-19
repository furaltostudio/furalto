import type { PageImage } from "@/config/images";
import { categoryImages } from "@/config/images";

export const homeBrandStrip = [
  {
    id: "craft",
    label: "Made in India",
    detail: "Skilled artisan craft",
    href: "/about",
  },
  {
    id: "showrooms",
    label: "Rohini Design Studio",
    detail: "Sector 24 · New Delhi",
    href: "/showrooms",
  },
  {
    id: "delivery",
    label: "White-Glove Delivery",
    detail: "In-room placement",
    href: "/track-order",
  },
  {
    id: "consult",
    label: "Design Consultation",
    detail: "In-store or virtual",
    href: "/appointments",
  },
] as const;

export type HomeDiscoverItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  image: PageImage;
};

export const homeDiscoverItems: HomeDiscoverItem[] = [
  {
    id: "collections",
    title: "All Collections",
    description: "Explore every room and category in one curated index.",
    href: "/collections",
    cta: "View Collections",
    image: categoryImages["living-room"],
  },
  {
    id: "inspiration",
    title: "Inspiration",
    description: "Shop the look with immersive room galleries and shoppable edits.",
    href: "/inspiration",
    cta: "Browse Galleries",
    image: categoryImages.bedroom,
  },
  {
    id: "showrooms",
    title: "Showrooms",
    description: "Experience materials, silhouettes, and finishes in person.",
    href: "/showrooms",
    cta: "Find a Showroom",
    image: categoryImages.outdoor,
  },
  {
    id: "appointments",
    title: "Design Services",
    description: "Book a private consultation with a Furalto design specialist.",
    href: "/appointments",
    cta: "Book Appointment",
    image: categoryImages.inspiration,
  },
];
