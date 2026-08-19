"use client";

import { useEffect, useState } from "react";
import {
  footerCompany,
  footerCustomerCare,
  footerShop,
} from "@/config/footer";
import { FooterAccordion } from "@/components/layout/FooterAccordion";
import { FooterNewsletter } from "@/components/layout/FooterNewsletter";

const menuSections = [
  { id: "shop", title: footerShop.title, links: footerShop.links },
  { id: "care", title: footerCustomerCare.title, links: footerCustomerCare.links },
  { id: "company", title: footerCompany.title, links: footerCompany.links },
] as const;

export function FooterMobileMenus() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (id: string) => {
    setOpenSection((current) => (current === id ? null : id));
  };

  if (!mounted) {
    return <div className="footer-mobile-menus md:hidden" suppressHydrationWarning />;
  }

  return (
    <div className="footer-mobile-menus md:hidden">
      {menuSections.map((section) => (
        <FooterAccordion
          key={section.id}
          title={section.title}
          links={section.links}
          isOpen={openSection === section.id}
          onToggle={() => toggleSection(section.id)}
        />
      ))}

      <FooterAccordion
        title="Join the List"
        isOpen={openSection === "newsletter"}
        onToggle={() => toggleSection("newsletter")}
      >
        <FooterNewsletter variant="accordion" />
      </FooterAccordion>
    </div>
  );
}
