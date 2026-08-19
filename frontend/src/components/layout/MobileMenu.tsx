"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { mainNavigation, navItemHasDropdown } from "@/config/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  AccountIcon,
  CartIcon,
  HeartIcon,
  LocationIcon,
  SearchIcon,
  TruckIcon,
} from "@/components/layout/HeaderIcons";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  navigation?: typeof mainNavigation;
};

const utilityLinks = [
  { label: "Search", href: "/search", icon: SearchIcon },
  { label: "Stores", href: "/showrooms", icon: LocationIcon },
  { label: "Account", href: "/account", icon: AccountIcon },
  { label: "Track", href: "/track-order", icon: TruckIcon },
  { label: "Wishlist", href: "/wishlist", icon: HeartIcon },
  { label: "Cart", href: "/cart", icon: CartIcon },
];

export function MobileMenu({ isOpen, onClose, navigation = mainNavigation }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isStaff } = useAuth();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [mobileQuery, setMobileQuery] = useState("");

  const lockScroll = useCallback((lock: boolean) => {
    document.body.style.overflow = lock ? "hidden" : "";
    document.documentElement.style.overflow = lock ? "hidden" : "";
  }, []);

  const handleClose = useCallback(() => {
    setExpandedItem(null);
    setMobileQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    lockScroll(isOpen);
    return () => lockScroll(false);
  }, [isOpen, lockScroll]);

  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      handleClose();
    }
  }, [pathname, handleClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, handleClose]);

  const toggleItem = (label: string) => {
    setExpandedItem((current) => (current === label ? null : label));
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = mobileQuery.trim();
    if (!term) {
      router.push("/search");
      handleClose();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(term)}`);
    handleClose();
  };

  return (
    <>
      <div
        className={cn("mobile-menu-overlay", isOpen && "is-open")}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className={cn("mobile-menu-panel", isOpen && "is-open")}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobile-menu-header">
          <Logo />
          <button
            type="button"
            onClick={handleClose}
            className="mobile-menu-close"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <form className="mobile-menu-search" onSubmit={handleSearchSubmit} role="search">
          <SearchIcon />
          <label htmlFor="mobile-menu-search-input" className="sr-only">
            Search products
          </label>
          <input
            id="mobile-menu-search-input"
            type="search"
            value={mobileQuery}
            onChange={(event) => setMobileQuery(event.target.value)}
            placeholder="Search sofas, beds, tables…"
            enterKeyHint="search"
            autoComplete="off"
          />
          <button type="submit">Go</button>
        </form>

        <div className="mobile-menu-promo">
          <p className="mobile-menu-promo-text">
            {siteConfig.announcement.text}{" "}
            <Link
              href={siteConfig.announcement.href}
              onClick={handleClose}
              className="mobile-menu-promo-link"
            >
              {siteConfig.announcement.cta}
            </Link>
          </p>
        </div>

        <nav className="mobile-menu-nav" aria-label="Shop categories">
          <ul>
            {navigation.map((item) => {
              const hasSubmenu = navItemHasDropdown(item);
              const isExpanded = expandedItem === item.label;

              return (
                <li key={item.id} className="mobile-menu-item">
                  {hasSubmenu ? (
                    <>
                      <div className="mobile-menu-item-row">
                        <Link
                          href={item.href}
                          onClick={handleClose}
                          className={cn(
                            "mobile-menu-nav-link",
                            item.highlight && "mobile-menu-nav-link-highlight"
                          )}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleItem(item.label)}
                          className="mobile-menu-expand"
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.label} submenu`}
                        >
                          <svg
                            className={cn("mobile-menu-expand-icon", isExpanded && "is-open")}
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 4.5L6 7.5L9 4.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      <div
                        className={cn("mobile-menu-submenu", isExpanded && "is-open")}
                      >
                        <div className="mobile-menu-submenu-inner">
                          {item.columns?.map((column) => (
                            <div key={column.title} className="mobile-menu-column">
                              <p className="mobile-menu-column-title">{column.title}</p>
                              <ul>
                                {column.links.map((link) => (
                                  <li key={`${link.label}-${link.href}`}>
                                    <Link
                                      href={link.href}
                                      onClick={handleClose}
                                      className="mobile-menu-sub-link"
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}

                          <Link
                            href={item.href}
                            onClick={handleClose}
                            className="mobile-menu-featured-cta"
                          >
                            {item.featured?.ctaLabel || `View more ${item.label}`}
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        "mobile-menu-nav-link mobile-menu-nav-link-standalone",
                        item.highlight && "mobile-menu-nav-link-highlight"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mobile-menu-utils-links">
          {isStaff ? (
            <Link href="/admin" onClick={handleClose} className="mobile-menu-utils-link">
              Admin Console
            </Link>
          ) : null}
          {siteConfig.headerUtilityLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleClose}
              className="mobile-menu-utils-link"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mobile-menu-utility">
          {isStaff ? (
            <Link href="/admin" onClick={handleClose} className="mobile-menu-utility-link">
              <AccountIcon />
              <span>Admin Console</span>
            </Link>
          ) : null}
          {utilityLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={handleClose}
              className="mobile-menu-utility-link"
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
