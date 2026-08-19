import type { PageImage } from "@/config/images";
import { categoryImages } from "@/config/images";

export const customerCareHub = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Product Care", href: "/care" },
] as const;

export const companyHub = [
  { label: "Blog", href: "/blog" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Trade Program", href: "/trade-program" },
  { label: "Showrooms", href: "/showrooms" },
  { label: "Client Stories", href: "/testimonials" },
  { label: "Careers", href: "/careers" },
] as const;

export type CareRoomItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  image: PageImage;
};

export const careRoomItems: CareRoomItem[] = [
  {
    id: "outdoor",
    title: "Outdoor",
    description: "Teak, performance fabrics, and terrace furniture care.",
    href: "/care/outdoor",
    image: categoryImages.outdoor,
  },
  {
    id: "living",
    title: "Living Room",
    description: "Upholstery, marble tables, and media console upkeep.",
    href: "/care/living",
    image: categoryImages["living-room"],
  },
  {
    id: "bedroom",
    title: "Bedroom",
    description: "Beds, nightstands, and wardrobe maintenance.",
    href: "/care/bedroom",
    image: categoryImages.bedroom,
  },
  {
    id: "dining",
    title: "Dining",
    description: "Stone, wood tables, and chair upholstery care.",
    href: "/care/dining",
    image: categoryImages.dining,
  },
  {
    id: "bath",
    title: "Bath",
    description: "Vanities, lacquer, and humidity protection.",
    href: "/care/bath",
    image: categoryImages.bath,
  },
  {
    id: "rugs",
    title: "Rugs",
    description: "Wool, natural fiber, and high-traffic maintenance.",
    href: "/care/rugs",
    image: categoryImages.rugs,
  },
];

export const careEssentials = [
  {
    title: "Blot, Don't Rub",
    description: "Lift spills gently with a clean cloth to protect delicate weaves and stone.",
  },
  {
    title: "Rotate & Refresh",
    description: "Turn cushions and rugs seasonally for even wear and lasting shape.",
  },
  {
    title: "Professional Care",
    description: "Schedule upholstery and rug cleaning annually in high-use rooms.",
  },
] as const;
