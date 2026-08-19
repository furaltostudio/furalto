import { businessContact } from "./contact";

export const siteConfig = {
  name: "Furalto",
  tagline: "Elevate Every Detail",
  subtagline: "Luxury Furniture",
  description:
    "Furalto transforms true Indian craftsmanship into designer furniture for modern homes — a tribute begun in a master’s workshop in 1979. Sofas, beds, dining, and lighting, with white-glove delivery across India and a design studio in Rohini, New Delhi.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  locale: "en_IN",
  keywords: [
    "luxury furniture India",
    "premium furniture Delhi",
    "handcrafted furniture India",
    "Indian craftsmanship furniture",
    "designer furniture New Delhi",
    "living room furniture",
    "bedroom furniture",
    "dining furniture",
    "outdoor furniture",
    "custom furniture India",
    "designer lighting",
    "white glove furniture delivery",
    "Furalto furniture",
    "heritage furniture India",
    "bespoke sofa India",
  ],
  announcement: {
    text: "₹2,000 off on prepaid orders · Pan India",
    cta: "Shop now",
    href: "/collections",
  },
  headerUtilityLinks: [
    { label: "Trade", href: "/trade-program" },
    { label: "Make An Appointment", href: "/appointments" },
    { label: "Showrooms", href: "/showrooms" },
  ],
  footerDescription:
    "Furalto — designer furniture from true Indian craftsmanship. A legacy begun in 1979, carried forward with heart.",
  contact: {
    email: businessContact.email,
    phone: businessContact.phone,
    whatsapp: businessContact.whatsapp,
    address: businessContact.address,
    gstin: businessContact.gstin,
  },
  social: {
    instagram: "https://instagram.com/furalto",
    facebook: "https://facebook.com/furalto",
    pinterest: "",
    youtube: "",
  },
  /** Prefer a real lifestyle image for social shares (not the favicon). */
  ogImage: "/home/furnitures_one.jpeg",
  hero: {
    eyebrow: "Luxury Furniture · Est. 1979",
    subtitle: "Handcrafted pieces of quiet distinction.",
    video: "/home/hero_video.mp4",
    primaryCta: {
      label: "View Collections",
      href: "/collections",
    },
    secondaryCta: {
      label: "Our Showrooms",
      href: "/showrooms",
    },
  },
} as const;
