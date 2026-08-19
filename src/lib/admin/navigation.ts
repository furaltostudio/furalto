import type { UserRole } from "@/types";
import { STAFF_ROLES, USER_ROLES } from "@/lib/auth/roles";

export type AdminNavItem = {
  href: string;
  label: string;
  roles: UserRole[];
  section?: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", roles: STAFF_ROLES, section: "Overview" },
  { href: "/admin/content", label: "Website", roles: STAFF_ROLES, section: "Website" },
  { href: "/admin/inspirations", label: "Shop the Look", roles: STAFF_ROLES, section: "Website" },
  { href: "/admin/blog", label: "Blog", roles: STAFF_ROLES, section: "Website" },
  { href: "/admin/products", label: "Products", roles: STAFF_ROLES, section: "Commerce" },
  { href: "/admin/categories", label: "Categories", roles: STAFF_ROLES, section: "Commerce" },
  { href: "/admin/orders", label: "Orders", roles: STAFF_ROLES, section: "Commerce" },
  { href: "/admin/customers", label: "Customers", roles: STAFF_ROLES, section: "Customers" },
  { href: "/admin/appointments", label: "Appointments", roles: STAFF_ROLES, section: "Customers" },
  { href: "/admin/contacts", label: "Enquiries", roles: STAFF_ROLES, section: "Customers" },
  { href: "/admin/custom-quotes", label: "Bespoke Quotes", roles: STAFF_ROLES, section: "Customers" },
  { href: "/admin/newsletter", label: "Newsletter", roles: STAFF_ROLES, section: "Customers" },
  { href: "/admin/staff", label: "Team", roles: [USER_ROLES.ADMIN], section: "Team" },
];

export const ADMIN_PAGE_META: Record<string, { title: string; description: string }> = {
  "/admin": {
    title: "Dashboard",
    description: "Overview of store performance and recent activity.",
  },
  "/admin/content": {
    title: "Website Content",
    description: "Edit every page like a form — save and it updates the live website.",
  },
  "/admin/inspirations": {
    title: "Shop the Look",
    description:
      "Pin live sofa and bed products on lifestyle images for the homepage inspirations carousel.",
  },
  "/admin/blog": {
    title: "Blog",
    description: "Write and publish posts for the Furalto blog.",
  },
  "/admin/products": {
    title: "Products",
    description: "Curate the catalogue — publish, hide, and refine every piece.",
  },
  "/admin/categories": {
    title: "Categories",
    description: "Manage furniture types used in the product form and storefront collections.",
  },
  "/admin/orders": {
    title: "Orders",
    description: "Track fulfilment, payments, and internal notes.",
  },
  "/admin/customers": {
    title: "Customers",
    description: "View registered customers and their order history.",
  },
  "/admin/appointments": {
    title: "Appointments",
    description: "Manage showroom and virtual design consultations.",
  },
  "/admin/contacts": {
    title: "Enquiries",
    description: "Respond to customer messages and support requests.",
  },
  "/admin/custom-quotes": {
    title: "Bespoke Quotes",
    description: "Review made-for-you furniture configuration requests and estimates.",
  },
  "/admin/newsletter": {
    title: "Newsletter",
    description: "View and manage email subscribers.",
  },
  "/admin/staff": {
    title: "Team",
    description: "Invite staff and manage team access.",
  },
};

export function getAdminPageMeta(pathname: string) {
  if (pathname.startsWith("/admin/blog/")) {
    return pathname.endsWith("/new")
      ? { title: "Write Blog Post", description: "Create a new article for the website blog." }
      : { title: "Edit Blog Post", description: "Update article content, cover, and publish status." };
  }

  if (pathname.startsWith("/admin/content/")) {
    return {
      title: "Edit Content",
      description: "Update website text and settings. Changes appear on the live site after save.",
    };
  }

  if (pathname.startsWith("/admin/products/")) {
    return pathname.endsWith("/new")
      ? { title: "Add Product", description: "Create a new catalogue item." }
      : { title: "Edit Product", description: "Update product details and visibility." };
  }

  if (pathname.startsWith("/admin/customers/")) {
    return { title: "Customer Profile", description: "View customer details and activity." };
  }

  return ADMIN_PAGE_META[pathname] || { title: "Admin", description: "Furalto operations console." };
}
