"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FooterAccordionProps = {
  title: string;
  links?: { label: string; href: string; highlight?: boolean }[];
  children?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
};

export function FooterAccordion({
  title,
  links,
  children,
  isOpen,
  onToggle,
}: FooterAccordionProps) {
  return (
    <div className={cn("footer-accordion", isOpen && "is-open")}>
      <button
        type="button"
        onClick={onToggle}
        className="footer-accordion-trigger"
        aria-expanded={isOpen}
        suppressHydrationWarning
      >
        <span>{title}</span>
        <ChevronDown
          className={cn("footer-accordion-icon", isOpen && "is-open")}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      <div className={cn("footer-accordion-panel", isOpen && "is-open")}>
        <div className="footer-accordion-inner">
          {links && links.length > 0 && (
            <ul className="footer-accordion-links">
              {links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className={cn("footer-link", link.highlight && "footer-link-accent")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
