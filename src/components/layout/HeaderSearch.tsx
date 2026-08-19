"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchIcon } from "@/components/layout/HeaderIcons";
import { formatCategoryLabel, formatInrPrice, formatProductName } from "@/lib/products/format";
import { POPULAR_SEARCHES } from "@/lib/products/search";
import { catalogService } from "@/services/catalog.service";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";

const RESULT_LIMIT = 6;
const FALLBACK_IMAGE = "/home/furnitures_five.jpeg";

export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const [previewResults, setPreviewResults] = useState<Product[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    setPortalTarget(document.querySelector<HTMLElement>(".site-header"));
  }, []);

  useEffect(() => {
    if (!trimmedQuery) {
      setPreviewResults([]);
      setResultCount(0);
      setIsSearching(false);
      setHasError(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setHasError(false);

    const timer = window.setTimeout(async () => {
      try {
        const response = await catalogService.search(trimmedQuery, 24);
        if (cancelled) return;
        const products = response.data.products || [];
        setResultCount(products.length);
        setPreviewResults(products.slice(0, RESULT_LIMIT));
      } catch {
        if (cancelled) return;
        setPreviewResults([]);
        setResultCount(0);
        setHasError(true);
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePanelPosition = () => {
      const headerMain = document.querySelector(".header-main");
      const siteHeader = document.querySelector(".site-header");

      if (!headerMain || !siteHeader) {
        return;
      }

      const mainRect = headerMain.getBoundingClientRect();
      const headerRect = siteHeader.getBoundingClientRect();
      setPanelTop(mainRect.bottom - headerRect.top);
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition);
    };
  }, [isOpen]);

  useEffect(() => {
    closeSearch();
    setQuery("");
  }, [pathname, closeSearch]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (wrapperRef.current?.contains(target)) {
        return;
      }

      if (panelRef.current?.contains(target)) {
        return;
      }

      closeSearch();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeSearch]);

  const navigateToSearch = (value: string) => {
    const nextQuery = value.trim();
    if (!nextQuery) {
      return;
    }

    closeSearch();
    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(query);
  };

  const handleResultClick = () => {
    closeSearch();
    setQuery("");
  };

  const dropdown =
    mounted && isOpen && portalTarget
      ? createPortal(
          <div
            ref={panelRef}
            id="header-search-panel"
            className="header-search-panel"
            style={{ top: panelTop }}
            role="dialog"
            aria-label="Search suggestions"
          >
            <div className="container-app header-search-panel-inner">
              {!trimmedQuery ? (
                <div className="header-search-suggestions-block">
                  <p className="header-search-panel-eyebrow">Popular Searches</p>
                  <div className="header-search-suggestion-links">
                    {POPULAR_SEARCHES.map((item) => (
                      <Link
                        key={item.query}
                        href={item.href}
                        className="header-search-suggestion-link"
                        onClick={handleResultClick}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/collections"
                    className="header-search-panel-cta"
                    onClick={handleResultClick}
                  >
                    Browse all collections
                    <svg className="header-search-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 8H13M13 8L9 4M13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              ) : isSearching ? (
                <div className="header-search-empty">
                  <p>Searching for &ldquo;{trimmedQuery}&rdquo;…</p>
                </div>
              ) : hasError ? (
                <div className="header-search-empty">
                  <p>Search is unavailable right now. Try again in a moment.</p>
                  <button
                    type="button"
                    className="header-search-panel-cta"
                    onClick={() => navigateToSearch(trimmedQuery)}
                  >
                    Open search page
                  </button>
                </div>
              ) : previewResults.length > 0 ? (
                <div className="header-search-results-block">
                  <p className="header-search-panel-eyebrow">
                    {resultCount} result{resultCount === 1 ? "" : "s"}
                  </p>
                  <ul className="header-search-results">
                    {previewResults.map((product, index) => {
                      const image = product.images?.[0];
                      return (
                        <li
                          key={product.slug}
                          className="header-search-result-item"
                          style={{ animationDelay: `${index * 45 + 40}ms` }}
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="header-search-result"
                            onClick={handleResultClick}
                          >
                            <div className="header-search-result-image-wrap">
                              <Image
                                src={image?.src || FALLBACK_IMAGE}
                                alt={image?.alt || formatProductName(product.name)}
                                fill
                                sizes="4.5rem"
                                unoptimized
                                className="header-search-result-image"
                              />
                            </div>
                            <div className="header-search-result-copy">
                              <span className="header-search-result-collection">
                                {formatCategoryLabel(product.collection || product.category)}
                              </span>
                              <span className="header-search-result-name">
                                {formatProductName(product.name)}
                              </span>
                              <span className="header-search-result-price">
                                {formatInrPrice(product.price)}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                    className="header-search-panel-cta"
                    onClick={handleResultClick}
                  >
                    {resultCount > RESULT_LIMIT
                      ? `View all ${resultCount} results`
                      : "View search page"}
                    <svg className="header-search-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 8H13M13 8L9 4M13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="header-search-empty">
                  <p>No products matched &ldquo;{trimmedQuery}&rdquo;.</p>
                  <Link href="/collections" className="header-search-panel-cta" onClick={handleResultClick}>
                    Browse collections
                    <svg className="header-search-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 8H13M13 8L9 4M13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>,
          portalTarget,
        )
      : null;

  return (
    <>
      <div
        ref={wrapperRef}
        className={cn("header-search-wrapper", isOpen && "header-search-open")}
      >
        <form
          onSubmit={handleSubmit}
          className="header-search"
          role="search"
          aria-label="Site search"
          onClick={openSearch}
        >
          <button
            type="submit"
            className="header-search-trigger"
            aria-label="Search products"
            aria-expanded={isOpen}
            onClick={(event) => {
              if (!trimmedQuery) {
                event.preventDefault();
                openSearch();
                inputRef.current?.focus();
              }
            }}
          >
            <SearchIcon />
          </button>
          <label htmlFor="header-search-input" className="sr-only">
            Search products and collections
          </label>
          <input
            ref={inputRef}
            id="header-search-input"
            type="search"
            name="q"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              openSearch();
            }}
            onFocus={openSearch}
            onClick={openSearch}
            placeholder="Search"
            className="header-search-input"
            autoComplete="off"
            enterKeyHint="search"
            aria-controls={isOpen ? "header-search-panel" : undefined}
          />
        </form>
      </div>
      {dropdown}
    </>
  );
}
