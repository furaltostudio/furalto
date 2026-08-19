export type FooterLink = {
  label: string;
  href: string;
  highlight?: boolean;
};

export type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

export const footerShop: FooterLinkGroup = {
  title: "Shop",
  links: [
    { label: "Sofas", href: "/collections/sofas" },
    { label: "Beds", href: "/collections/beds" },
    { label: "Dining Sets", href: "/collections/dining" },
    { label: "Lighting", href: "/collections/pendants" },
    { label: "Rugs", href: "/collections/rugs" },
    { label: "Sale", href: "/collections/clearance" },
    { label: "View All", href: "/collections", highlight: true },
  ],
};

export const footerCustomerCare: FooterLinkGroup = {
  title: "Customer Care",
  links: [
    { label: "Design Your Piece", href: "/custom" },
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Product Care", href: "/care" },
  ],
};

export const footerCompany: FooterLinkGroup = {
  title: "Our Company",
  links: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Trade Program", href: "/trade-program" },
    { label: "Showrooms", href: "/showrooms" },
    { label: "Client Stories", href: "/testimonials" },
    { label: "Careers", href: "/careers" },
  ],
};

export const footerLegalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Sale Terms", href: "/sale-terms" },
] as const;
