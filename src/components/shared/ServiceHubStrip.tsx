"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type HubLink = {
  label: string;
  href: string;
};

type ServiceHubStripProps = {
  links: readonly HubLink[];
  label: string;
};

export function ServiceHubStrip({ links, label }: ServiceHubStripProps) {
  const pathname = usePathname();

  return (
    <nav className="service-hub-strip" aria-label={label}>
      <div className="container-app">
        <p className="service-hub-strip-label">{label}</p>
        <ul className="service-hub-strip-list">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn("service-hub-strip-link", isActive && "service-hub-strip-link-active")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
