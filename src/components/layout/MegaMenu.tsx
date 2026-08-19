"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { NavItem } from "@/config/navigation";
import { getCollectionSlugFromHref } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { catalogImageSrc, editorialImageSrc } from "@/lib/images/catalog";
import { pickListingImagesSync } from "@/lib/images/pickListingImage";
import { formatInrPrice, formatProductName } from "@/lib/products/format";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils/cn";

/** Enough pieces for a quiet nav carousel without pulling the full catalog. */
const NAV_PRODUCT_LIMIT = 12;

type MegaMenuProps = {
  item: NavItem;
};

type NavProductCacheEntry = {
  items: Product[];
  total: number;
};

const productCache = new Map<string, NavProductCacheEntry>();

function cacheKey(category: string) {
  return `${category}:${NAV_PRODUCT_LIMIT}`;
}

async function fetchCategoryProducts(category: string): Promise<NavProductCacheEntry> {
  const key = cacheKey(category);
  const cached = productCache.get(key);
  if (cached) {
    return cached;
  }

  const url = new URL("/api/v1/products", siteConfig.apiUrl);
  url.searchParams.set("category", category);
  url.searchParams.set("limit", String(NAV_PRODUCT_LIMIT));
  url.searchParams.set("page", "1");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`);
  }

  const payload = (await response.json()) as {
    data?: {
      items?: Product[];
      pagination?: { total?: number };
    };
  };

  const entry: NavProductCacheEntry = {
    items: payload.data?.items || [],
    total: payload.data?.pagination?.total ?? payload.data?.items?.length ?? 0,
  };

  productCache.set(key, entry);
  return entry;
}

export function MegaMenu({ item }: MegaMenuProps) {
  const collectionSlug = getCollectionSlugFromHref(item.href);
  const hasLinkColumns = Boolean(item.columns?.length);

  if (!collectionSlug && !hasLinkColumns) {
    return null;
  }

  if (collectionSlug && !hasLinkColumns) {
    return <ProductMegaMenu item={item} category={collectionSlug} />;
  }

  return (
    <div className="mega-menu-panel" role="region" aria-label={`${item.label} menu`}>
      <div className="container-app mega-menu-inner">
        <div className="mega-menu-columns">
          {item.columns?.map((column, index) => (
            <div
              key={column.title}
              className="mega-menu-column"
              style={{ animationDelay: `${index * 60 + 40}ms` }}
            >
              <h3 className="mega-menu-column-title">{column.title}</h3>
              <ul className="mega-menu-links">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link href={link.href} className="mega-menu-link">
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {item.featured ? <FeaturedPanel item={item} columnCount={item.columns?.length || 0} /> : null}
      </div>
    </div>
  );
}

function ProductMegaMenu({ item, category }: { item: NavItem; category: string }) {
  const key = cacheKey(category);
  const [products, setProducts] = useState<Product[]>(() => productCache.get(key)?.items || []);
  const [total, setTotal] = useState(() => productCache.get(key)?.total || 0);
  const [isLoading, setIsLoading] = useState(!productCache.has(key));
  const [error, setError] = useState("");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isEditorialReady, setIsEditorialReady] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (productCache.has(key)) {
      const cached = productCache.get(key)!;
      setProducts(cached.items);
      setTotal(cached.total);
      setIsLoading(false);
      setSpotlightIndex(0);
      return;
    }

    setIsLoading(true);
    setError("");
    setSpotlightIndex(0);

    fetchCategoryProducts(category)
      .then((entry) => {
        if (cancelled) return;
        setProducts(entry.items);
        setTotal(entry.total);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load products right now.");
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category, key]);

  const syncCarousel = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 8);
    setCanNext(maxScroll > 8 && track.scrollLeft < maxScroll - 8);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || products.length === 0) return;

    syncCarousel();
    track.addEventListener("scroll", syncCarousel, { passive: true });
    window.addEventListener("resize", syncCarousel);

    const observer = new ResizeObserver(() => syncCarousel());
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", syncCarousel);
      window.removeEventListener("resize", syncCarousel);
      observer.disconnect();
    };
  }, [products.length, syncCarousel, isLoading]);

  const scrollBySlide = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.querySelector<HTMLElement>("[data-mega-slide]");
    const amount = slide ? slide.offsetWidth + 24 : track.clientWidth * 0.75;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const remaining = Math.max(total - products.length, 0);
  const shopLabel = remaining > 0 ? `Shop all ${item.label}` : `Explore ${item.label}`;
  const countLabel = total > 0 ? `${total} piece${total === 1 ? "" : "s"}` : "Collection";
  const showCarouselNav = products.length > 4;

  const spotlight = products[spotlightIndex] || products[0] || null;
  const spotlightListing = spotlight
    ? pickListingImagesSync(spotlight).primary
    : null;
  const primaryImage = spotlightListing || spotlight?.images?.[0] || null;
  const editorialSrc = primaryImage?.src
    ? editorialImageSrc(primaryImage.src)
    : item.featured?.image || null;
  const editorialAlt =
    primaryImage?.alt ||
    (spotlight ? `${formatProductName(spotlight.name)} — ${item.label}` : item.featured?.imageAlt) ||
    item.label;
  const editorialHref = spotlight ? `/products/${spotlight.slug}` : item.href;

  useEffect(() => {
    if (!editorialSrc) {
      return;
    }

    setIsEditorialReady(false);
    const timer = window.setTimeout(() => setIsEditorialReady(true), 320);
    return () => window.clearTimeout(timer);
  }, [editorialSrc]);

  const showSpotlight = (index: number) => {
    if (index === spotlightIndex) {
      return;
    }
    setIsEditorialReady(false);
    setSpotlightIndex(index);
  };

  return (
    <div className="mega-menu-panel mega-menu-panel--products" role="region" aria-label={`${item.label} products`}>
      <div className="container-app mega-menu-inner mega-menu-inner--products">
        <div className="mega-menu-products">
          <header className="mega-menu-products-head">
            <div className="mega-menu-products-heading">
              <p className="mega-menu-products-kicker">Collection</p>
              <h3 className="mega-menu-products-title">{item.label}</h3>
            </div>
            <div className="mega-menu-products-head-aside">
              <p className="mega-menu-products-meta">{countLabel}</p>
              {showCarouselNav && !isLoading && !error ? (
                <div className="mega-menu-carousel-nav">
                  <button
                    type="button"
                    className="mega-menu-carousel-btn"
                    onClick={() => scrollBySlide(-1)}
                    disabled={!canPrev}
                    aria-label={`Previous ${item.label}`}
                  >
                    <ArrowLeft strokeWidth={1.25} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="mega-menu-carousel-btn"
                    onClick={() => scrollBySlide(1)}
                    disabled={!canNext}
                    aria-label={`Next ${item.label}`}
                  >
                    <ArrowRight strokeWidth={1.25} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          {isLoading ? (
            <ul className="mega-menu-product-grid mega-menu-product-grid--skeleton" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <li key={`skeleton-${index}`} className="mega-menu-product-skeleton" />
              ))}
            </ul>
          ) : error ? (
            <p className="mega-menu-products-status">{error}</p>
          ) : products.length === 0 ? (
            <div className="mega-menu-products-empty">
              <p className="mega-menu-products-status">New pieces are arriving soon.</p>
              <Link href={item.href} className="mega-menu-view-more">
                Browse {item.label}
              </Link>
            </div>
          ) : (
            <>
              <div className="mega-menu-carousel">
                <ul
                  ref={trackRef}
                  className="mega-menu-carousel-track"
                  data-count={Math.min(products.length, 4)}
                  aria-label={`${item.label} pieces`}
                >
                  {products.map((product, index) => {
                    const listingImage =
                      pickListingImagesSync(product).primary ||
                      product.images?.[0];
                    const imageSrc = listingImage?.src
                      ? catalogImageSrc(listingImage.src, { width: 1200, height: 900 })
                      : null;

                    return (
                      <li
                        key={product.slug}
                        className={cn(
                          "mega-menu-product-card",
                          index === spotlightIndex && "is-spotlight",
                        )}
                        data-mega-slide
                        style={{ animationDelay: `${Math.min(index, 4) * 55 + 70}ms` }}
                        onMouseEnter={() => showSpotlight(index)}
                        onFocusCapture={() => showSpotlight(index)}
                      >
                        <Link href={`/products/${product.slug}`} className="mega-menu-product-link">
                          <div className="mega-menu-product-media">
                            <div className="mega-menu-product-stage">
                              {imageSrc ? (
                                <Image
                                  src={imageSrc}
                                  alt={listingImage?.alt || product.name}
                                  fill
                                  sizes="(max-width: 900px) 42vw, 16rem"
                                  unoptimized
                                  className="mega-menu-product-image"
                                />
                              ) : null}
                            </div>
                          </div>
                          <div className="mega-menu-product-body">
                            <span className="mega-menu-product-name">{formatProductName(product.name)}</span>
                            <span className="mega-menu-product-price">{formatInrPrice(product.price)}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mega-menu-products-foot">
                <Link href={item.href} className="mega-menu-atelier-cta">
                  <span>View the full collection</span>
                  <svg className="mega-menu-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
            </>
          )}
        </div>

        {editorialSrc ? (
          <aside className="mega-menu-featured mega-menu-featured--editorial">
            <div className="mega-menu-showcase">
              <Link href={editorialHref} className="mega-menu-showcase-media">
                <Image
                  key={editorialSrc}
                  src={editorialSrc}
                  alt={editorialAlt}
                  fill
                  sizes="(max-width: 1280px) 20rem, 22rem"
                  unoptimized={editorialSrc.includes("res.cloudinary.com")}
                  className={
                    isEditorialReady
                      ? "mega-menu-featured-image is-ready"
                      : "mega-menu-featured-image"
                  }
                  onLoad={() => setIsEditorialReady(true)}
                />
              </Link>

              <div className="mega-menu-showcase-meta" key={spotlight?.slug || "collection"}>
                <p className="mega-menu-showcase-kicker">Atelier edit</p>
                {spotlight ? (
                  <Link href={editorialHref} className="mega-menu-showcase-title">
                    {formatProductName(spotlight.name)}
                  </Link>
                ) : (
                  <p className="mega-menu-showcase-title">{item.label}</p>
                )}
                {spotlight ? (
                  <p className="mega-menu-showcase-price">{formatInrPrice(spotlight.price)}</p>
                ) : null}
                <div className="mega-menu-showcase-actions">
                  {spotlight ? (
                    <Link href={editorialHref} className="mega-menu-showcase-secondary">
                      View piece
                      <svg className="mega-menu-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3 8H13M13 8L9 4M13 8L9 12"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  ) : null}
                  <Link href={item.href} className="mega-menu-showcase-cta">
                    <span>{shopLabel}</span>
                    <svg className="mega-menu-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
              </div>
            </div>
          </aside>
        ) : (
          <div className="mega-menu-products-aside-cta">
            <Link href={item.href} className="mega-menu-view-more">
              {shopLabel}
              <svg className="mega-menu-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
    </div>
  );
}

function FeaturedPanel({ item, columnCount }: { item: NavItem; columnCount: number }) {
  if (!item.featured) {
    return null;
  }

  return (
    <div
      className="mega-menu-featured"
      style={{ animationDelay: `${columnCount * 60 + 80}ms` }}
    >
      <Link href={item.featured.ctaHref} className="mega-menu-featured-link">
        <div className="mega-menu-featured-image-wrap">
          <Image
            src={item.featured.image}
            alt={item.featured.imageAlt}
            fill
            sizes="(max-width: 1280px) 20rem, 22.5rem"
            className="mega-menu-featured-image"
          />
          <div className="mega-menu-featured-overlay" aria-hidden="true" />
        </div>
        <span className="mega-menu-featured-cta">
          {item.featured.ctaLabel}
          <svg className="mega-menu-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8H13M13 8L9 4M13 8L9 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}
