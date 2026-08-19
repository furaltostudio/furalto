"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Package, Plus, RefreshCw, Search } from "lucide-react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/Button";
import { formatAdminCurrency } from "@/lib/admin/format";
import { adminService, type AdminCategory, type AdminProduct } from "@/services/admin.service";

const FALLBACK_IMAGE = "/home/furnitures_five.jpeg";

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setCurrentSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className="apc-image"
      loading="lazy"
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE) {
          setCurrentSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalHidden, setTotalHidden] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    adminService
      .getCategories()
      .then((response) => setCategories(response.data.categories || []))
      .catch(() => undefined);
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const [active, hidden] = await Promise.all([
        adminService.getProducts({ page: "1", limit: "1", isActive: "true" }),
        adminService.getProducts({ page: "1", limit: "1", isActive: "false" }),
      ]);
      setTotalActive(active.data.total || 0);
      setTotalHidden(hidden.data.total || 0);
    } catch {
      // Non-blocking for catalogue browsing
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params: Record<string, string> = { page: String(page), limit: "12" };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.isActive = statusFilter;

      const response = await adminService.getProducts(params);
      setProducts(response.data.products);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load products.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const toggleStatus = async (product: AdminProduct) => {
    setBusySlug(product.slug);
    try {
      await adminService.toggleProductStatus(product.slug, !product.isActive);
      await Promise.all([loadProducts(), loadSummary()]);
    } catch {
      setError("Unable to update product visibility.");
    } finally {
      setBusySlug(null);
    }
  };

  const categoryLabel = (slug: string) =>
    categories.find((category) => category.slug === slug)?.name || slug.replace(/-/g, " ");

  const catalogueTotal = totalActive + totalHidden;
  const resultLabel = useMemo(() => {
    if (isLoading) return "Loading catalogue…";
    if (total === 0) return "No matching pieces";
    if (total === 1) return "1 piece in view";
    return `${total} pieces in view`;
  }, [isLoading, total]);

  return (
    <div className="admin-page apc-page">
      <div className="apc-hero">
        <div className="apc-hero-copy">
          <p className="apc-kicker">Studio catalogue</p>
          <p className="apc-hero-text">
            Curate storefront pieces, manage visibility, and keep the gallery publication-ready.
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-button admin-button-primary apc-add">
          <Plus size={16} />
          Add product
        </Link>
      </div>

      <div className="admin-stat-grid admin-stat-grid-4 apc-stats">
        <AdminStatCard
          label="Catalogue"
          value={catalogueTotal}
          hint="All products"
          icon={<Package size={16} />}
          tone="accent"
        />
        <AdminStatCard
          label="Live"
          value={totalActive}
          hint="Visible on storefront"
          icon={<Eye size={16} />}
          tone="success"
        />
        <AdminStatCard
          label="Hidden"
          value={totalHidden}
          hint="Not published"
          icon={<EyeOff size={16} />}
          tone="warning"
        />
        <AdminStatCard label="Filtered" value={total} hint={resultLabel} tone="default" />
      </div>

      <section className="apc-panel">
        <div className="apc-toolbar">
          <div className="apc-toolbar-copy">
            <p className="apc-kicker">Studio edit</p>
            <h3 className="apc-panel-title">{resultLabel}</h3>
          </div>

          <div className="apc-filters">
            <label className="apc-search">
              <Search size={15} aria-hidden="true" />
              <input
                className="apc-search-input"
                placeholder="Search by name or slug"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </label>
            <select
              className="admin-select apc-select"
              value={categoryFilter}
              onChange={(event) => {
                setPage(1);
                setCategoryFilter(event.target.value);
              }}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="admin-select apc-select"
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
            >
              <option value="">All visibility</option>
              <option value="true">Live only</option>
              <option value="false">Hidden only</option>
            </select>
            <Button
              type="button"
              className="admin-button apc-refresh"
              isLoading={isRefreshing}
              loadingText="Refreshing…"
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await Promise.all([loadProducts(), loadSummary()]);
                } finally {
                  setIsRefreshing(false);
                }
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {isLoading ? <p className="admin-muted apc-loading">Loading products…</p> : null}

        {!isLoading && products.length === 0 ? (
          <AdminEmptyState
            title="No products found"
            description="Try adjusting filters, or add a new piece to the catalogue."
          />
        ) : (
          <div className="apc-grid">
            {products.map((product) => {
              const imageCount = product.images?.length || 0;
              return (
                <article
                  key={product.slug}
                  className={`apc-card${product.isActive ? "" : " is-hidden"}`}
                >
                  <div className="apc-media">
                    {product.images?.[0]?.src ? (
                      <ProductThumb
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                      />
                    ) : (
                      <div className="apc-placeholder">No image</div>
                    )}
                    <div className="apc-media-meta">
                      <AdminBadge status={product.isActive ? "active" : "inactive"} />
                      {imageCount > 0 ? (
                        <span className="apc-image-count">
                          {imageCount} {imageCount === 1 ? "image" : "images"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="apc-body">
                    <p className="apc-category">
                      {categoryLabel(product.category)}
                      {product.subcategory ? ` · ${product.subcategory.replace(/-/g, " ")}` : ""}
                    </p>
                    <h3 className="apc-name">{product.name}</h3>
                    <p className="apc-price">{formatAdminCurrency(product.price)}</p>

                    <div className="apc-actions">
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="admin-button admin-button-primary"
                      >
                        Edit
                      </Link>
                      <Button
                        type="button"
                        className="admin-button"
                        isLoading={busySlug === product.slug}
                        loadingText={product.isActive ? "Hiding…" : "Publishing…"}
                        onClick={() => void toggleStatus(product)}
                      >
                        {product.isActive ? "Hide" : "Publish"}
                      </Button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="apc-view"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View store
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="apc-pagination">
          <AdminPagination page={page} total={total} limit={12} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
}
