"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/config/navigation";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { CategoryNav } from "@/components/layout/CategoryNav";
import {
  AccountIcon,
  CartIcon,
  HeaderIconLink,
  HeartIcon,
  LocationIcon,
  TruckIcon,
} from "@/components/layout/HeaderIcons";
import { cn } from "@/lib/utils/cn";
import { usesHeroOverlayHeader } from "@/components/layout/ScrollToTop";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useAuth } from "@/providers/AuthProvider";

const ANNOUNCEMENT_DISMISS_KEY = "furalto-announcement-dismissed-v2";

type HeaderAnnouncement = {
  text: string;
  cta: string;
  href: string;
};

export function Header({
  announcement = {
    text: siteConfig.announcement.text,
    cta: siteConfig.announcement.cta,
    href: siteConfig.announcement.href,
  },
  navigation = mainNavigation,
}: {
  announcement?: HeaderAnnouncement;
  navigation?: typeof mainNavigation;
}) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isStaff } = useAuth();
  const isHome = pathname === "/";
  const usesHeroOverlay = usesHeroOverlayHeader(pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) === "1") {
        setShowAnnouncement(false);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const SCROLL_DOWN_THRESHOLD = 72;
    const SCROLL_UP_THRESHOLD = 16;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        setIsScrolled((previous) => {
          if (!previous && scrollY > SCROLL_DOWN_THRESHOLD) {
            return true;
          }

          if (previous && scrollY < SCROLL_UP_THRESHOLD) {
            return false;
          }

          return previous;
        });

        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const dismissAnnouncement = useCallback(() => {
    setShowAnnouncement(false);
    try {
      window.localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <>
      <header
        className={cn(
          "site-header z-50 w-full",
          usesHeroOverlay ? "site-header-overlay" : "sticky top-0",
          isHome && !isScrolled && "site-header-transparent",
          isHome && isScrolled && "site-header-scrolled",
          !showAnnouncement && "site-header-announcement-dismissed"
        )}
      >
        {/* Announcement Bar */}
        {showAnnouncement ? (
          <div className="header-announcement">
            <span className="header-announcement-fabric" aria-hidden="true" />
            <div className="container-app header-announcement-inner">
              <div className="header-announcement-message">
                <span className="header-announcement-badge" aria-hidden="true">
                  Furalto
                </span>
                <p className="header-announcement-text">
                  <span className="hidden min-[480px]:inline">{announcement.text}</span>
                  <span className="min-[480px]:hidden">
                    ₹2,000 off prepaid · Pan India
                  </span>
                </p>
                <Link href={announcement.href} className="header-announcement-cta">
                  {announcement.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="header-announcement-actions">
                <div className="header-announcement-utils hidden lg:flex">
                  {isStaff ? (
                    <span className="flex items-center">
                      <Link
                        href="/admin"
                        className="header-announcement-util-link header-announcement-admin-link"
                      >
                        Admin
                      </Link>
                      <span className="header-announcement-divider" aria-hidden="true" />
                    </span>
                  ) : null}
                  {siteConfig.headerUtilityLinks.map((link, index) => (
                    <span key={link.href} className="flex items-center">
                      {index > 0 && (
                        <span className="header-announcement-divider" aria-hidden="true" />
                      )}
                      <Link href={link.href} className="header-announcement-util-link">
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="header-announcement-close"
                  onClick={dismissAnnouncement}
                  aria-label="Dismiss announcement"
                >
                  <X size={13} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Header Row */}
        <div className="header-main">
          <div className="container-app">
            <div className="header-main-inner">
              {/* Mobile only: menu button | Tablet+: search field */}
              <div className="header-left">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="header-menu-btn"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </button>

                <HeaderSearch />
              </div>

              <div className="header-center">
                <Logo />
              </div>

              {/* Icons hidden on mobile — available in mobile menu */}
              <div className="header-right">
                <HeaderIconLink
                  href="/showrooms"
                  label="Store Locator"
                  className="hidden lg:inline-flex"
                >
                  <LocationIcon />
                </HeaderIconLink>
                <HeaderIconLink
                  href="/account"
                  label="Account"
                  className="inline-flex"
                >
                  <AccountIcon />
                </HeaderIconLink>
                {isStaff ? (
                  <HeaderIconLink
                    href="/admin"
                    label="Admin Console"
                    className="hidden md:inline-flex"
                  >
                    <span className="header-admin-text">Admin</span>
                  </HeaderIconLink>
                ) : null}
                <HeaderIconLink
                  href="/track-order"
                  label="Track Order"
                  className="hidden lg:inline-flex"
                >
                  <TruckIcon />
                </HeaderIconLink>
                <HeaderIconLink
                  href="/wishlist"
                  label="Wishlist"
                  className="inline-flex"
                  badge={wishlistCount}
                >
                  <HeartIcon />
                </HeaderIconLink>
                <HeaderIconLink href="/cart" label="Cart" badge={itemCount}>
                  <CartIcon />
                </HeaderIconLink>
              </div>

              <div className="header-right-spacer" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Tablet Category Scroll */}
        <div className="header-tablet-nav hidden md:block lg:hidden">
          <div className="container-app">
            <nav className="header-category-scroll" aria-label="Category navigation">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "category-nav-link",
                    item.highlight && "category-nav-link-highlight"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop Category Navigation + Mega Menu */}
        <div className="header-category-nav">
          <CategoryNav items={navigation} />
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} navigation={navigation} />
    </>
  );
}
