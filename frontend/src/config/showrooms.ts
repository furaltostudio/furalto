import type { PageImage } from "@/config/images";
import { categoryImages } from "@/config/images";
import { businessContact } from "@/config/contact";

export type ShowroomLocation = {
  id: string;
  city: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
  highlights: string[];
  image: PageImage;
};

export const showroomsHeroImage: PageImage = categoryImages.inspiration;

export const showroomLocations: ShowroomLocation[] = [
  {
    id: "delhi",
    city: "New Delhi",
    name: "Rohini Design Studio",
    address: businessContact.address,
    hours: businessContact.hours,
    phone: businessContact.phone,
    email: businessContact.email,
    highlights: [
      "Complete bedroom galleries",
      "In-house styling team",
      "Trade & project consultations",
    ],
    image: categoryImages.bedroom,
  },
];

export const showroomServices = [
  {
    title: "Private Consultations",
    description:
      "One-on-one sessions with design specialists to review floor plans, fabrics, and finish selections.",
  },
  {
    title: "Material Libraries",
    description:
      "Explore hundreds of upholstery fabrics, wood stains, stone samples, and metal finishes in person.",
  },
  {
    title: "White-Glove Planning",
    description:
      "Coordinate delivery routes, room placement, and installation timelines before you purchase.",
  },
] as const;
