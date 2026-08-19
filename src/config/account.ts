import type { PageImage } from "@/config/images";
import { categoryImages } from "@/config/images";

export const accountSignInHero: PageImage = categoryImages.bedroom;

export const accountSignUpHero: PageImage = categoryImages.inspiration;

export const accountBenefits = [
  {
    id: "orders",
    title: "Order Tracking",
    description: "View purchase history and follow deliveries in one place.",
  },
  {
    id: "wishlist",
    title: "Saved Wishlists",
    description: "Curate rooms and revisit your favorite pieces anytime.",
  },
  {
    id: "appointments",
    title: "Priority Booking",
    description: "Reserve design consultations at our Rohini studio or virtually.",
  },
] as const;

export const accountStats = [
  { value: "1", label: "Design Studio" },
  { value: "500+", label: "Curated Pieces" },
  { value: "24/7", label: "Online Support" },
] as const;

export const accountAsideContent = {
  signin: {
    imageKey: "bedroom" as const,
    eyebrow: "Welcome Back",
    title: "Pick up where your home story left off",
    quote:
      "My Furalto account makes it effortless to track orders and revisit the pieces I love.",
    author: "Priya M., Mumbai",
  },
  signup: {
    imageKey: "inspiration" as const,
    eyebrow: "Join Furalto",
    title: "Start curating spaces that feel unmistakably yours",
    quote:
      "Creating an account gave me one place for wishlists, appointments, and order updates.",
    author: "Arjun K., Bengaluru",
  },
  account: {
    imageKey: "bedroom" as const,
    eyebrow: "Your Space",
    title: "Everything you need for a beautifully managed home",
    quote:
      "Having my orders, wishlists, and appointments in one account makes decorating so much easier.",
    author: "Rahul S., Delhi",
  },
} as const;
