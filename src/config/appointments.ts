import type { PageImage } from "@/config/images";
import { categoryImages } from "@/config/images";
import { showroomLocations } from "@/config/showrooms";

export const appointmentHeroImage: PageImage = categoryImages.office;

export const appointmentTypes = [
  { value: "in-showroom", label: "In-Showroom Consultation" },
  { value: "virtual", label: "Virtual Design Session" },
  { value: "trade", label: "Trade & Project Review" },
  { value: "swatches", label: "Swatch & Material Review" },
] as const;

export const appointmentTimes = [
  { value: "morning", label: "Morning · 10am – 12pm" },
  { value: "afternoon", label: "Afternoon · 12pm – 4pm" },
  { value: "evening", label: "Evening · 4pm – 7pm" },
] as const;

export const appointmentInterests = [
  { value: "living", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "dining", label: "Dining" },
  { value: "outdoor", label: "Outdoor" },
  { value: "office", label: "Home Office" },
  { value: "full-home", label: "Full Home Project" },
] as const;

export const showroomOptions = [
  { value: "virtual", label: "Virtual Session" },
  ...showroomLocations.map((location) => ({
    value: location.id,
    label: `${location.city} — ${location.name}`,
  })),
] as const;

export const appointmentBenefits = [
  {
    title: "Personalized Guidance",
    description: "Work with a specialist on layout, scale, and material pairings.",
  },
  {
    title: "Material Libraries",
    description: "Compare fabrics, woods, and finishes in person or via video.",
  },
  {
    title: "Project Planning",
    description: "Receive a curated edit and timeline within 48 hours of your visit.",
  },
] as const;
