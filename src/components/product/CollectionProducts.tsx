"use client";

import {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";
import { ProductMosaicGallery, CollectionCloseCta } from "@/components/product/ProductMosaicGallery";
import { cn } from "@/lib/utils/cn";
import {
  COLLECTION_PAGE_SIZE,
  fetchProductsPage,
} from "@/lib/products/catalog";
import {
  buildCollectionFacets,
  matchesPriceBand,
  matchesProfileFilter,
  matchesSizeFilter,
  matchesStyleFilter,
  productHasStorage,
  productOnSale,
  type PriceBand,
} from "@/lib/products/collection-facets";

type SortId = "featured" | "price-asc" | "price-desc" | "name" | "newest-sale";

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price · Low to high" },
  { id: "price-desc", label: "Price · High to low" },
  { id: "name", label: "Name · A to Z" },
  { id: "newest-sale", label: "Offers first" },
];

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function sortProducts(products: Product[], sort: SortId) {
  const next = [...products];
  switch (sort) {
    case "price-asc":
      return next.sort((a, b) => a.price - b.price);
    case "price-desc":
      return next.sort((a, b) => b.price - a.price);
    case "name":
      return next.sort((a, b) => a.name.localeCompare(b.name));
    case "newest-sale":
      return next.sort((a, b) => {
        const aSale = productOnSale(a) ? 1 : 0;
        const bSale = productOnSale(b) ? 1 : 0;
        if (aSale !== bSale) return bSale - aSale;
        return a.name.localeCompare(b.name);
      });
    default:
      return next;
  }
}

type Chip = { id: string; label: string; onRemove: () => void };

type CollectionProductsProps = {
  category: string;
  initialProducts: Product[];
  initialTotal: number;
  pageSize?: number;
  collectionTitle?: string;
};

function mergeProducts(current: Product[], incoming: Product[]) {
  if (incoming.length === 0) return current;
  const seen = new Set(current.map((product) => product.slug));
  const next = [...current];
  for (const product of incoming) {
    if (seen.has(product.slug)) continue;
    seen.add(product.slug);
    next.push(product);
  }
  return next;
}

export function CollectionProducts({
  category,
  initialProducts,
  initialTotal,
  pageSize = COLLECTION_PAGE_SIZE,
  collectionTitle,
}: CollectionProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sort, setSort] = useState<SortId>("featured");
  const [priceBand, setPriceBand] = useState<string | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [hasReviews, setHasReviews] = useState(false);
  const [storageOnly, setStorageOnly] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const railInnerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialTotal);
    setPage(1);
    setLoadError("");
  }, [category, initialProducts, initialTotal]);

  const hasMore = products.length < total;
  const facets = useMemo(() => buildCollectionFacets(products), [products]);

  const priceBands: PriceBand[] = facets.bands;

  const filtered = useMemo(() => {
    let list = products;

    if (priceBand) {
      const band = priceBands.find((b) => b.id === priceBand);
      if (band) list = list.filter((p) => matchesPriceBand(p, band));
    }

    if (onSaleOnly) list = list.filter(productOnSale);

    if (hasReviews) {
      list = list.filter(
        (p) => (p.reviewCount ?? 0) > 0 || (p.averageRating ?? 0) > 0,
      );
    }

    if (storageOnly) list = list.filter(productHasStorage);

    if (rooms.length > 0) {
      list = list.filter((p) =>
        (p.rooms ?? []).some((room) => rooms.includes(room)),
      );
    }

    if (collections.length > 0) {
      list = list.filter((p) => collections.includes(p.collection));
    }

    if (fabrics.length > 0) {
      list = list.filter((p) =>
        (p.fabrics ?? []).some((fabric) => fabrics.includes(fabric.label)),
      );
    }

    if (finishes.length > 0) {
      list = list.filter((p) =>
        (p.finishes ?? []).some((finish) => finishes.includes(finish.label)),
      );
    }

    list = list.filter((p) => matchesSizeFilter(p, sizes));
    list = list.filter((p) => matchesStyleFilter(p, styles));
    list = list.filter((p) => matchesProfileFilter(p, profiles));

    return sortProducts(list, sort);
  }, [
    products,
    priceBand,
    priceBands,
    onSaleOnly,
    hasReviews,
    storageOnly,
    rooms,
    collections,
    fabrics,
    finishes,
    sizes,
    styles,
    profiles,
    sort,
  ]);

  const filterActiveCount =
    (priceBand ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (hasReviews ? 1 : 0) +
    (storageOnly ? 1 : 0) +
    rooms.length +
    collections.length +
    fabrics.length +
    finishes.length +
    sizes.length +
    styles.length +
    profiles.length;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setIsLoadingMore(true);
    setLoadError("");

    try {
      const nextPage = page + 1;
      const result = await fetchProductsPage({
        category,
        limit: pageSize,
        page: nextPage,
      });

      setProducts((current) => mergeProducts(current, result.items));
      setTotal(result.pagination.total);
      setPage(nextPage);
    } catch {
      setLoadError("Couldn't load more pieces. Try again.");
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [category, hasMore, page, pageSize]);

  // Keep filter facets accurate: when filters are on, finish loading the catalog.
  useEffect(() => {
    if (filterActiveCount === 0 || !hasMore || isLoadingMore) return;
    void loadMore();
  }, [filterActiveCount, hasMore, isLoadingMore, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, filtered.length]);

  const activeCount =
    (sort !== "featured" ? 1 : 0) + filterActiveCount;

  const clearFilters = () => {
    setSort("featured");
    setPriceBand(null);
    setRooms([]);
    setCollections([]);
    setFabrics([]);
    setFinishes([]);
    setSizes([]);
    setStyles([]);
    setProfiles([]);
    setOnSaleOnly(false);
    setHasReviews(false);
    setStorageOnly(false);
  };

  const chips: Chip[] = useMemo(() => {
    const next: Chip[] = [];
    if (sort !== "featured") {
      const label = SORT_OPTIONS.find((o) => o.id === sort)?.label ?? sort;
      next.push({ id: `sort-${sort}`, label, onRemove: () => setSort("featured") });
    }
    if (priceBand) {
      const band = priceBands.find((b) => b.id === priceBand);
      if (band) {
        next.push({
          id: `price-${priceBand}`,
          label: band.label,
          onRemove: () => setPriceBand(null),
        });
      }
    }
    if (onSaleOnly) {
      next.push({
        id: "sale",
        label: "On offer",
        onRemove: () => setOnSaleOnly(false),
      });
    }
    if (hasReviews) {
      next.push({
        id: "reviews",
        label: "With reviews",
        onRemove: () => setHasReviews(false),
      });
    }
    if (storageOnly) {
      next.push({
        id: "storage",
        label: "With storage",
        onRemove: () => setStorageOnly(false),
      });
    }
    for (const room of rooms) {
      const meta = facets.rooms.find((r) => r.id === room);
      next.push({
        id: `room-${room}`,
        label: meta?.label ?? room,
        onRemove: () => setRooms((current) => toggleValue(current, room)),
      });
    }
    for (const name of collections) {
      next.push({
        id: `collection-${name}`,
        label: name,
        onRemove: () =>
          setCollections((current) => toggleValue(current, name)),
      });
    }
    for (const label of fabrics) {
      next.push({
        id: `fabric-${label}`,
        label,
        onRemove: () => setFabrics((current) => toggleValue(current, label)),
      });
    }
    for (const label of finishes) {
      next.push({
        id: `finish-${label}`,
        label,
        onRemove: () => setFinishes((current) => toggleValue(current, label)),
      });
    }
    for (const label of sizes) {
      next.push({
        id: `size-${label}`,
        label,
        onRemove: () => setSizes((current) => toggleValue(current, label)),
      });
    }
    for (const label of styles) {
      next.push({
        id: `style-${label}`,
        label,
        onRemove: () => setStyles((current) => toggleValue(current, label)),
      });
    }
    for (const label of profiles) {
      next.push({
        id: `profile-${label}`,
        label,
        onRemove: () => setProfiles((current) => toggleValue(current, label)),
      });
    }
    return next;
  }, [
    sort,
    priceBand,
    priceBands,
    onSaleOnly,
    hasReviews,
    storageOnly,
    rooms,
    collections,
    fabrics,
    finishes,
    sizes,
    styles,
    profiles,
    facets.rooms,
  ]);

  const showSaleToggle = facets.saleCount > 0 && !facets.allOnSale;
  const showStorageToggle =
    facets.storageCount > 0 && facets.storageCount < products.length;
  const showRooms = facets.rooms.length > 1;
  const showSizes = facets.sizes.length > 1;
  const showStyles = facets.styles.length > 1;
  const showProfiles = facets.profiles.length > 1;
  const showPrice = priceBands.length > 1;
  const showAvailability =
    showSaleToggle || facets.reviewCount > 0 || showStorageToggle;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const layout = layoutRef.current;
    const slot = railRef.current;
    const rail = railInnerRef.current;
    if (!layout || !slot || !rail) return;

    const media = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    const readHeaderOffset = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--site-header-offset")
        .trim();
      const probe = document.createElement("div");
      probe.style.height = raw || "0px";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      document.body.appendChild(probe);
      const value = probe.getBoundingClientRect().height;
      probe.remove();
      return value + 8;
    };

    const clearStuck = () => {
      rail.classList.remove("is-stuck");
      slot.style.removeProperty("min-height");
      rail.style.removeProperty("--filter-rail-top");
      rail.style.removeProperty("--filter-rail-left");
      rail.style.removeProperty("--filter-rail-width");
      rail.style.removeProperty("--filter-rail-max-height");
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!media.matches) {
          clearStuck();
          return;
        }

        const top = readHeaderOffset();
        const layoutRect = layout.getBoundingClientRect();
        const slotRect = slot.getBoundingClientRect();
        const naturalHeight = rail.classList.contains("is-stuck")
          ? rail.scrollHeight
          : rail.offsetHeight;

        // Stop sticking once the product grid has scrolled past.
        const shouldStick =
          slotRect.top <= top && layoutRect.bottom > top + 120;

        if (!shouldStick) {
          clearStuck();
          return;
        }

        // Cap height to remaining layout space so the scrollbar never bleeds into the footer.
        const availableInViewport = Math.max(160, window.innerHeight - top - 16);
        const availableInLayout = Math.max(120, layoutRect.bottom - top - 16);
        const maxHeight = Math.min(availableInViewport, availableInLayout);
        const pinnedTop = top;

        slot.style.minHeight = `${Math.max(naturalHeight, maxHeight)}px`;
        rail.classList.add("is-stuck");
        rail.style.setProperty("--filter-rail-top", `${pinnedTop}px`);
        rail.style.setProperty("--filter-rail-left", `${slotRect.left}px`);
        rail.style.setProperty("--filter-rail-width", `${slotRect.width}px`);
        rail.style.setProperty("--filter-rail-max-height", `${maxHeight}px`);
      });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    media.addEventListener("change", sync);

    const resizeObserver = new ResizeObserver(() => sync());
    resizeObserver.observe(layout);
    resizeObserver.observe(rail);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      media.removeEventListener("change", sync);
      resizeObserver.disconnect();
      clearStuck();
    };
  }, []);

  // Filtering shortens the page; keep the collection grid in view instead of jumping to the footer.
  useLayoutEffect(() => {
    const layout = layoutRef.current;
    if (!layout) return;

    const rect = layout.getBoundingClientRect();
    if (rect.bottom >= 160) return;

    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--site-header-offset")
      .trim();
    const probe = document.createElement("div");
    probe.style.height = raw || "0px";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    const headerOffset = probe.getBoundingClientRect().height + 8;
    probe.remove();

    const nextTop = window.scrollY + rect.top - headerOffset;
    window.scrollTo({ top: Math.max(0, nextTop), behavior: "auto" });
  }, [
    sort,
    priceBand,
    onSaleOnly,
    hasReviews,
    storageOnly,
    rooms,
    collections,
    fabrics,
    finishes,
    sizes,
    styles,
    profiles,
    filtered.length,
  ]);

  const sidebar = (
    <aside className="collections-filter-sidebar" aria-label="Collection filters">
      <div className="collections-filter-sidebar-head">
        <div className="collections-filter-sidebar-heading">
          <p className="collections-filter-sidebar-title">Refine</p>
          <p className="collections-filter-sidebar-count">
            {filtered.length === 0
              ? "No pieces"
              : `${filtered.length} of ${total}`}
          </p>
        </div>
        {activeCount > 0 ? (
          <button
            type="button"
            className="collections-filter-clear"
            onClick={clearFilters}
          >
            Clear
          </button>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div className="collections-filter-chips" aria-label="Active filters">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className="collections-filter-chip"
              onClick={chip.onRemove}
            >
              <span>{chip.label}</span>
              <span className="collections-filter-chip-x" aria-hidden="true">
                ×
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="collections-filter-sidebar-body">
        <FilterGroup title="Sort" defaultOpen>
          {SORT_OPTIONS.map((option) => (
            <FilterCheck
              key={option.id}
              label={option.label}
              checked={sort === option.id}
              onChange={() => setSort(option.id)}
              radio
            />
          ))}
        </FilterGroup>

        {showPrice ? (
          <FilterGroup title="Price" defaultOpen>
            <FilterCheck
              label="All prices"
              checked={priceBand === null}
              onChange={() => setPriceBand(null)}
              radio
            />
            {priceBands.map((band) => {
              const count = products.filter((p) =>
                matchesPriceBand(p, band),
              ).length;
              return (
                <FilterCheck
                  key={band.id}
                  label={band.label}
                  count={count}
                  checked={priceBand === band.id}
                  onChange={() => setPriceBand(band.id)}
                  radio
                />
              );
            })}
          </FilterGroup>
        ) : null}

        {showStyles ? (
          <FilterGroup title="Silhouette" defaultOpen>
            {facets.styles.map((option) => (
              <FilterCheck
                key={option.id}
                label={option.label}
                count={option.count}
                checked={styles.includes(option.label)}
                onChange={() =>
                  setStyles((current) => toggleValue(current, option.label))
                }
              />
            ))}
          </FilterGroup>
        ) : null}

        {showSizes ? (
          <FilterGroup title="Mattress size" defaultOpen>
            {facets.sizes.map((option) => (
              <FilterCheck
                key={option.id}
                label={option.label}
                count={option.count}
                checked={sizes.includes(option.label)}
                onChange={() =>
                  setSizes((current) => toggleValue(current, option.label))
                }
              />
            ))}
          </FilterGroup>
        ) : null}

        {showProfiles ? (
          <FilterGroup title="Footprint">
            {facets.profiles.map((option) => (
              <FilterCheck
                key={option.id}
                label={option.label}
                count={option.count}
                checked={profiles.includes(option.label)}
                onChange={() =>
                  setProfiles((current) => toggleValue(current, option.label))
                }
              />
            ))}
          </FilterGroup>
        ) : null}

        {showAvailability ? (
          <FilterGroup title="Features">
            {showSaleToggle ? (
              <FilterCheck
                label="On offer"
                count={facets.saleCount}
                checked={onSaleOnly}
                onChange={() => setOnSaleOnly((value) => !value)}
              />
            ) : null}
            {showStorageToggle ? (
              <FilterCheck
                label="With storage"
                count={facets.storageCount}
                checked={storageOnly}
                onChange={() => setStorageOnly((value) => !value)}
              />
            ) : null}
            {facets.reviewCount > 0 ? (
              <FilterCheck
                label="With reviews"
                count={facets.reviewCount}
                checked={hasReviews}
                onChange={() => setHasReviews((value) => !value)}
              />
            ) : null}
          </FilterGroup>
        ) : null}

        {showRooms ? (
          <FilterGroup title="Room">
            {facets.rooms.map((room) => (
              <FilterCheck
                key={room.id}
                label={room.label}
                count={room.count}
                checked={rooms.includes(room.id)}
                onChange={() =>
                  setRooms((current) => toggleValue(current, room.id))
                }
              />
            ))}
          </FilterGroup>
        ) : null}

        {facets.collections.length > 1 ? (
          <FilterGroup title="Collection">
            {facets.collections.map((name) => (
              <FilterCheck
                key={name}
                label={name}
                checked={collections.includes(name)}
                onChange={() =>
                  setCollections((current) => toggleValue(current, name))
                }
              />
            ))}
          </FilterGroup>
        ) : null}

        {facets.fabrics.length > 0 ? (
          <FilterGroup title="Fabric">
            {facets.fabrics.map((option) => (
              <FilterCheck
                key={option.id}
                label={option.label}
                count={option.count}
                checked={fabrics.includes(option.label)}
                onChange={() =>
                  setFabrics((current) => toggleValue(current, option.label))
                }
              />
            ))}
          </FilterGroup>
        ) : null}

        {facets.finishes.length > 0 ? (
          <FilterGroup title="Finish">
            {facets.finishes.map((option) => (
              <FilterCheck
                key={option.id}
                label={option.label}
                count={option.count}
                checked={finishes.includes(option.label)}
                onChange={() =>
                  setFinishes((current) => toggleValue(current, option.label))
                }
              />
            ))}
          </FilterGroup>
        ) : null}
      </div>

      <div className="collections-filter-sidebar-mobile-actions">
        <button
          type="button"
          className="collections-filter-apply"
          onClick={() => setMobileOpen(false)}
        >
          Show {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="collections-products-inner">
      <div className="collections-mobile-filter-bar">
        <button
          type="button"
          className={cn(
            "collections-mobile-filter-btn",
            activeCount > 0 && "is-active",
          )}
          onClick={() => setMobileOpen(true)}
        >
          Filter
          {activeCount > 0 ? (
            <span className="collections-filter-badge">{activeCount}</span>
          ) : null}
        </button>
        <span className="collections-studio-count">
          {filtered.length === 1 ? "1 piece" : `${filtered.length} pieces`}
        </span>
      </div>

      <div className="collections-layout" ref={layoutRef}>
        <div className="collections-filter-desktop" ref={railRef}>
          <div className="collections-filter-rail" ref={railInnerRef}>
            {sidebar}
          </div>
        </div>

        <div className="collections-layout-main">
          {filtered.length === 0 && !isLoadingMore && !hasMore ? (
            <p className="collections-empty">
              No pieces match these filters.{" "}
              <button
                type="button"
                className="collections-empty-clear"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </p>
          ) : filtered.length === 0 && (isLoadingMore || hasMore) ? (
            <p className="collections-empty collections-empty--loading">
              Finding matching pieces…
            </p>
          ) : (
            <>
              <ProductMosaicGallery
                products={filtered}
                collectionTitle={collectionTitle}
                layout="sidebar"
              />

              <div
                ref={sentinelRef}
                className="collections-infinite-sentinel"
                aria-hidden={!hasMore}
              >
                {isLoadingMore ? (
                  <p className="collections-infinite-status">Loading more pieces…</p>
                ) : loadError ? (
                  <button
                    type="button"
                    className="collections-infinite-retry"
                    onClick={() => void loadMore()}
                  >
                    {loadError}
                  </button>
                ) : hasMore ? (
                  <p className="collections-infinite-status">Scroll for more</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {!hasMore && !isLoadingMore && filtered.length > 0 ? (
        <CollectionCloseCta collectionTitle={collectionTitle} />
      ) : null}

      {mobileOpen ? (
        <div className="collections-filter-drawer" role="dialog" aria-modal="true">
          <button
            type="button"
            className="collections-filter-drawer-backdrop"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
          />
          <div className="collections-filter-drawer-panel">{sidebar}</div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("collections-filter-group", open && "is-open")}>
      <button
        type="button"
        className="collections-filter-heading"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <span className="collections-filter-heading-icon" aria-hidden="true" />
      </button>
      {open ? (
        <div className="collections-filter-checks">{children}</div>
      ) : null}
    </div>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
  radio = false,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  radio?: boolean;
  count?: number;
}) {
  return (
    <label className={cn("collections-filter-check", checked && "is-checked")}>
      <input
        type={radio ? "radio" : "checkbox"}
        checked={checked}
        onChange={onChange}
      />
      <span className="collections-filter-check-mark" aria-hidden="true" />
      <span className="collections-filter-check-label">
        <span>{label}</span>
        {typeof count === "number" ? (
          <span className="collections-filter-check-count">{count}</span>
        ) : null}
      </span>
    </label>
  );
}
