"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { NavItem } from "@/config/navigation";
import { mainNavigation, navItemHasDropdown } from "@/config/navigation";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { cn } from "@/lib/utils/cn";

const CLOSE_DELAY = 160;

function isNavPathActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }
  // Exact hub routes like /collections must not match every /collections/... child
  if (href === "/collections" || href === "/inspiration") {
    return false;
  }
  return pathname.startsWith(`${href}/`);
}

export function CategoryNav({ items = mainNavigation }: { items?: NavItem[] }) {
  const pathname = usePathname();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeItem = items.find((item) => item.label === activeMenu);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setActiveMenu(null);
      setHoveredLabel(null);
    }, CLOSE_DELAY);
  }, [clearCloseTimer]);

  const handleItemEnter = (label: string, hasDropdown: boolean) => {
    clearCloseTimer();
    setHoveredLabel(label);
    if (hasDropdown) {
      setActiveMenu(label);
    } else {
      setActiveMenu(null);
    }
  };

  return (
    <div
      className={cn("category-nav-wrapper", activeMenu && "category-nav-open")}
      onMouseLeave={scheduleClose}
      onMouseEnter={clearCloseTimer}
    >
      <nav
        className="container-app header-category-nav-inner"
        aria-label="Category navigation"
      >
        {items.map((item) => {
          const hasDropdown = navItemHasDropdown(item);
          const isHovered = hoveredLabel === item.label;
          const isPathActive = isNavPathActive(pathname, item.href);
          // While hovering the nav, only the hovered item stays highlighted
          const isHighlighted = hoveredLabel ? isHovered : isPathActive;

          return (
            <div
              key={item.id}
              onMouseEnter={() => handleItemEnter(item.label, hasDropdown)}
            >
              <Link
                href={item.href}
                className={cn(
                  "category-nav-link",
                  item.highlight && "category-nav-link-highlight",
                  isHighlighted && "category-nav-link-active"
                )}
                aria-haspopup={hasDropdown ? "true" : undefined}
                aria-expanded={hasDropdown ? isHovered && activeMenu === item.label : undefined}
              >
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {activeItem && navItemHasDropdown(activeItem) ? (
        <MegaMenu key={activeItem.label} item={activeItem} />
      ) : null}
    </div>
  );
}
