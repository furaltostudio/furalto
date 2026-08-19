import { categoryImages } from "@/config/images";

export const homeCustomStudioDefaults = {
  eyebrow: "Made for you",
  title: "Build it your way",
  lead:
    "Continue the workshop tradition — pick a piece, choose wood and fabric you love, and see a clear price in minutes.",
  ctaLabel: "Start designing",
  ctaHref: "/custom",
  imageSrc: categoryImages["living-room"].src,
  imageAlt: "Custom living room seating in warm neutrals",
  materialsLabel: "Sample materials",
  priceFrom: "₹65,000",
  timeNote: "About 2 minutes",
  steps: [
    { index: "01", title: "Pick a piece", detail: "Sofa, table, bed, chair" },
    { index: "02", title: "Choose materials", detail: "Wood, fabric, finish" },
    { index: "03", title: "See your price", detail: "Clear estimate, free" },
  ],
  materials: [
    {
      id: "oak",
      label: "Oak",
      tone: "linear-gradient(160deg, #f0d7b0, #c9a06a 45%, #8f6a3d)",
    },
    {
      id: "walnut",
      label: "Walnut",
      tone: "linear-gradient(160deg, #a56b42, #6b3d24 50%, #2d1810)",
    },
    {
      id: "linen",
      label: "Linen",
      tone: "linear-gradient(160deg, #f7f1e8, #e4d8c8 45%, #cbbba6)",
    },
    {
      id: "velvet",
      label: "Velvet",
      tone: "linear-gradient(160deg, #8a7a96, #4f425c 50%, #241c2a)",
    },
    {
      id: "brass",
      label: "Brass",
      tone: "linear-gradient(160deg, #f0d9a0, #c9a35a 45%, #8a6828)",
    },
  ],
} as const;

export type HomeCustomStudioContent = {
  eyebrow: string;
  title: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
  materialsLabel: string;
  priceFrom: string;
  timeNote: string;
  steps: ReadonlyArray<{ index: string; title: string; detail: string }>;
  materials: ReadonlyArray<{ id: string; label: string; tone: string }>;
};
