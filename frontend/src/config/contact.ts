import type { PageImage } from "@/config/images";
import { categoryImages } from "@/config/images";

/** Canonical Furalto studio contact — used across storefront, CMS fallbacks, and SEO. */
export const businessContact = {
  email: "furaltostudio@gmail.com",
  phone: "+91 93114 87655",
  whatsapp: "+91 93114 87655",
  address:
    "Office No. 103–104, First Floor, Pocket 5, Sector 24, Rohini, New Delhi 110085",
  hours: "Monday – Saturday · 9am – 7pm IST",
  gstin: "07AAICG5542Q1Z0",
} as const;

export const contactChannels = businessContact;

export const contactHeroImage: PageImage = categoryImages.inspiration;

export const contactSubjects = [
  { value: "general", label: "General Inquiry" },
  { value: "order", label: "Order Support" },
  { value: "product", label: "Product Question" },
  { value: "delivery", label: "Delivery & Installation" },
  { value: "trade", label: "Trade Program" },
  { value: "other", label: "Other" },
] as const;

export const contactReasons = [
  {
    title: "Design Guidance",
    description: "Fabric, scale, and finish recommendations for your project.",
  },
  {
    title: "Order Assistance",
    description: "Tracking, modifications, and delivery scheduling support.",
  },
  {
    title: "Trade & Projects",
    description: "Dedicated support for interior designers and architects.",
  },
] as const;
