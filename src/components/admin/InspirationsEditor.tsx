"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { Button } from "@/components/ui/Button";
import {
  inspirationSlides as fallbackSlides,
  type InspirationHotspot,
  type InspirationSlide,
} from "@/config/inspirations";
import { formatInrPrice } from "@/lib/products/format";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { adminService, type AdminProduct } from "@/services/admin.service";

function cloneSlides(slides: InspirationSlide[]): InspirationSlide[] {
  return JSON.parse(JSON.stringify(slides)) as InspirationSlide[];
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugFromHref(href: string) {
  const match = href.match(/\/products\/([^/?#]+)/);
  return match?.[1] || "";
}

export function InspirationsEditor() {
  const [title, setTitle] = useState("Product Inspirations");
  const [slides, setSlides] = useState<InspirationSlide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState("");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<AdminProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [meta, setMeta] = useState<{
    contentTitle: string;
    type: string;
    description: string;
    isPublished: boolean;
    homepageData: Record<string, unknown>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeSlide = useMemo(
    () => slides.find((slide) => slide.id === activeSlideId) || slides[0],
    [slides, activeSlideId]
  );

  const selectedHotspot = useMemo(() => {
    if (!activeSlide || !selectedHotspotId) return null;
    return activeSlide.hotspots.find((spot) => spot.id === selectedHotspotId) || null;
  }, [activeSlide, selectedHotspotId]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminService.getContentItem("homepage");
      const content = response.data.content;
      const data = (content.data || {}) as Record<string, unknown>;
      const inspirations = (
        data.inspirations && typeof data.inspirations === "object"
          ? data.inspirations
          : {}
      ) as Record<string, unknown>;

      const cmsSlides = Array.isArray(inspirations.slides)
        ? (inspirations.slides as InspirationSlide[])
        : [];
      const nextSlides = cloneSlides(cmsSlides.length > 0 ? cmsSlides : fallbackSlides);

      setTitle(
        typeof inspirations.title === "string" && inspirations.title.trim()
          ? inspirations.title
          : "Product Inspirations"
      );
      setSlides(nextSlides);
      setActiveSlideId(nextSlides[0]?.id || "");
      setSelectedHotspotId(null);
      setMeta({
        contentTitle: content.title,
        type: content.type,
        description: content.description || "",
        isPublished: content.isPublished,
        homepageData: data,
      });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!productQuery.trim()) {
      setProductResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await adminService.getProducts({
          search: productQuery.trim(),
          category: "sofas,beds",
          limit: "8",
          page: "1",
          isActive: "true",
        });
        setProductResults(response.data.products || []);
      } catch {
        setProductResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [productQuery]);

  const updateActiveSlide = (patch: Partial<InspirationSlide>) => {
    if (!activeSlide) return;
    setSlides((current) =>
      current.map((slide) =>
        slide.id === activeSlide.id ? { ...slide, ...patch } : slide
      )
    );
  };

  const updateHotspot = (hotspotId: string, patch: Partial<InspirationHotspot>) => {
    if (!activeSlide) return;
    setSlides((current) =>
      current.map((slide) => {
        if (slide.id !== activeSlide.id) return slide;
        return {
          ...slide,
          hotspots: slide.hotspots.map((spot) =>
            spot.id === hotspotId
              ? {
                  ...spot,
                  ...patch,
                  product: { ...spot.product, ...(patch.product || {}) },
                }
              : spot
          ),
        };
      })
    );
  };

  const addSlide = () => {
    const slide: InspirationSlide = {
      id: newId("look"),
      label: "New look",
      image: "",
      imageAlt: "Shop the look",
      imageWidth: 1536,
      imageHeight: 1024,
      hotspots: [],
    };
    setSlides((current) => [...current, slide]);
    setActiveSlideId(slide.id);
    setSelectedHotspotId(null);
  };

  const removeSlide = (id: string) => {
    setSlides((current) => {
      const next = current.filter((slide) => slide.id !== id);
      if (activeSlideId === id) {
        setActiveSlideId(next[0]?.id || "");
      }
      return next;
    });
    setSelectedHotspotId(null);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!activeSlide?.image) return;
    if ((event.target as HTMLElement).closest("[data-hotspot]")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10;

    const hotspot: InspirationHotspot = {
      id: newId("pin"),
      x: Math.min(98, Math.max(2, x)),
      y: Math.min(98, Math.max(2, y)),
      product: {
        name: "Select a product",
        price: "",
        href: "",
        slug: "",
      },
    };

    setSlides((current) =>
      current.map((slide) =>
        slide.id === activeSlide.id
          ? { ...slide, hotspots: [...slide.hotspots, hotspot] }
          : slide
      )
    );
    setSelectedHotspotId(hotspot.id);
    setProductQuery("");
  };

  const removeHotspot = (hotspotId: string) => {
    if (!activeSlide) return;
    setSlides((current) =>
      current.map((slide) =>
        slide.id === activeSlide.id
          ? { ...slide, hotspots: slide.hotspots.filter((spot) => spot.id !== hotspotId) }
          : slide
      )
    );
    if (selectedHotspotId === hotspotId) setSelectedHotspotId(null);
  };

  const linkProduct = (product: AdminProduct) => {
    if (!selectedHotspotId) return;
    updateHotspot(selectedHotspotId, {
      product: {
        name: product.name,
        price: formatInrPrice(product.price),
        href: `/products/${product.slug}`,
        slug: product.slug,
      },
    });
    setProductQuery("");
    setProductResults([]);
  };

  const refreshLinkedProduct = async () => {
    if (!selectedHotspot) return;
    const slug =
      selectedHotspot.product.slug || slugFromHref(selectedHotspot.product.href);
    if (!slug) {
      setError("Link a catalogue product first.");
      return;
    }

    try {
      const response = await adminService.getProduct(slug);
      const product = response.data.product;
      updateHotspot(selectedHotspot.id, {
        product: {
          name: product.name,
          price: formatInrPrice(product.price),
          href: `/products/${product.slug}`,
          slug: product.slug,
        },
      });
      setSuccess("Product details refreshed from catalogue.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const handleSave = async () => {
    if (!meta) return;
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const unlinkedCount = slides.reduce(
        (count, slide) =>
          count +
          slide.hotspots.filter((spot) => !spot.product.href || !spot.product.name).length,
        0
      );

      const inspirations = {
        title: title.trim() || "Product Inspirations",
        slides: slides.map((slide) => ({
          id: slide.id,
          label: slide.label || "",
          image: slide.image,
          imageAlt: slide.imageAlt,
          imageWidth: slide.imageWidth,
          imageHeight: slide.imageHeight,
          hotspots: slide.hotspots.map((spot) => ({
            id: spot.id,
            x: spot.x,
            y: spot.y,
            product: {
              name: spot.product.name || "Select a product",
              price: spot.product.price || "",
              href: spot.product.href || "",
              slug: spot.product.slug || "",
            },
          })),
        })),
      };

      // Re-fetch homepage so we never wipe newer CMS sections (e.g. testimonials).
      const fresh = await adminService.getContentItem("homepage");
      const content = fresh.data.content;
      const homepageData = { ...((content.data || {}) as Record<string, unknown>) };

      // Stories are owned by page.testimonials — drop any stale homepage copy.
      if (
        homepageData.testimonials &&
        typeof homepageData.testimonials === "object" &&
        !Array.isArray(homepageData.testimonials)
      ) {
        const section = {
          ...(homepageData.testimonials as Record<string, unknown>),
        };
        delete section.items;
        if (!section.featuredCount) section.featuredCount = "5";
        homepageData.testimonials = section;
      }

      await adminService.saveContent("homepage", {
        title: content.title || meta.contentTitle,
        type: content.type || meta.type,
        description: content.description || meta.description,
        isPublished: content.isPublished ?? meta.isPublished,
        data: {
          ...homepageData,
          inspirations,
        },
      });

      // Bust Next.js content cache so the storefront updates immediately
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiClient.getAccessToken()
              ? { Authorization: `Bearer ${apiClient.getAccessToken()}` }
              : {}),
          },
          body: JSON.stringify({ paths: ["/", "/inspiration"] }),
        });
      } catch {
        // Non-blocking — content is already saved in the API
      }

      setMeta((current) =>
        current
          ? {
              ...current,
              contentTitle: content.title || current.contentTitle,
              type: content.type || current.type,
              description: content.description || current.description,
              isPublished: content.isPublished ?? current.isPublished,
              homepageData: {
                ...homepageData,
                inspirations,
              },
            }
          : current
      );

      const linkedNote =
        unlinkedCount > 0
          ? ` ${unlinkedCount} pin${unlinkedCount === 1 ? "" : "s"} still need a product link before they appear on the storefront.`
          : "";
      setSuccess(`Saved. Homepage Shop the Look is updated.${linkedNote}`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="admin-muted">Loading Shop the Look…</p>;
  }

  return (
    <div className="stl-editor">
      <div className="stl-toolbar">
        <label className="admin-field stl-title-field">
          <span className="admin-label">Section title</span>
          <input
            className="admin-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className="stl-toolbar-actions">
          <button type="button" className="admin-button" onClick={load}>
            Reload saved
          </button>
          <button
            type="button"
            className="admin-button"
            onClick={() => {
              const next = cloneSlides(fallbackSlides);
              setSlides(next);
              setActiveSlideId(next[0]?.id || "");
              setSelectedHotspotId(null);
              setSuccess("Loaded live sofa & bed defaults — save to publish.");
            }}
          >
            Load catalogue defaults
          </button>
          <Button
            type="button"
            className="admin-button admin-button-primary"
            isLoading={isSaving}
            loadingText="Saving…"
            onClick={handleSave}
          >
            Save & publish
          </Button>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {success ? <p className="admin-success">{success}</p> : null}

      <div className="stl-layout">
        <aside className="stl-sidebar">
          <div className="stl-sidebar-head">
            <h3>Looks</h3>
            <button type="button" className="admin-button" onClick={addSlide}>
              <Plus size={14} />
              Add look
            </button>
          </div>
          <ul className="stl-slide-list">
            {slides.map((slide, index) => (
              <li key={slide.id}>
                <button
                  type="button"
                  className={`stl-slide-item${slide.id === activeSlide?.id ? " is-active" : ""}`}
                  onClick={() => {
                    setActiveSlideId(slide.id);
                    setSelectedHotspotId(null);
                  }}
                >
                  <span className="stl-slide-index">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{slide.label || slide.id}</strong>
                    <em>
                      {slide.hotspots.length} pin
                      {slide.hotspots.length === 1 ? "" : "s"}
                    </em>
                  </span>
                </button>
                <button
                  type="button"
                  className="stl-slide-remove"
                  aria-label="Remove look"
                  onClick={() => removeSlide(slide.id)}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="stl-main">
          {!activeSlide ? (
            <p className="admin-muted">Add a look to begin.</p>
          ) : (
            <>
              <div className="stl-fields">
                <label className="admin-field">
                  <span className="admin-label">Look label</span>
                  <input
                    className="admin-input"
                    value={activeSlide.label || ""}
                    onChange={(event) => updateActiveSlide({ label: event.target.value })}
                    placeholder="Sofa Edit / Bedroom Edit"
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-label">Image alt text</span>
                  <input
                    className="admin-input"
                    value={activeSlide.imageAlt}
                    onChange={(event) => updateActiveSlide({ imageAlt: event.target.value })}
                  />
                </label>
              </div>

              <AdminImageUpload
                label="Lifestyle image"
                value={activeSlide.image}
                alt={activeSlide.imageAlt}
                folder="furalto/inspirations"
                onChange={(asset) =>
                  updateActiveSlide({
                    image: asset.src,
                    imageAlt: asset.alt || activeSlide.imageAlt,
                    imageWidth: asset.width || activeSlide.imageWidth,
                    imageHeight: asset.height || activeSlide.imageHeight,
                  })
                }
              />

              <div className="stl-canvas-wrap">
                <p className="stl-hint">
                  Click the image to drop a pin, then link a catalogue product on the right.
                </p>
                <div
                  className={`stl-canvas${activeSlide.image ? "" : " is-empty"}`}
                  onClick={handleCanvasClick}
                  role="presentation"
                >
                  {activeSlide.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeSlide.image}
                      alt={activeSlide.imageAlt}
                      className="stl-canvas-image"
                      draggable={false}
                    />
                  ) : (
                    <p>Upload an image first</p>
                  )}

                  {activeSlide.hotspots.map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      data-hotspot
                      className={`stl-pin${selectedHotspotId === spot.id ? " is-selected" : ""}`}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedHotspotId(spot.id);
                      }}
                      aria-label={spot.product.name}
                    >
                      <Plus size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="stl-inspector">
          <h3>Pin details</h3>
          {!selectedHotspot ? (
            <p className="admin-muted">Select or add a pin on the image.</p>
          ) : (
            <div className="stl-inspector-body">
              <div className="stl-coords">
                <label className="admin-field">
                  <span className="admin-label">X %</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={selectedHotspot.x}
                    onChange={(event) =>
                      updateHotspot(selectedHotspot.id, {
                        x: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-label">Y %</span>
                  <input
                    className="admin-input"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={selectedHotspot.y}
                    onChange={(event) =>
                      updateHotspot(selectedHotspot.id, {
                        y: Number(event.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <div className="stl-linked">
                <p className="admin-label">Linked product</p>
                {selectedHotspot.product.href ? (
                  <div className="stl-linked-card">
                    <strong>{selectedHotspot.product.name}</strong>
                    <span>{selectedHotspot.product.price}</span>
                    <Link href={selectedHotspot.product.href} target="_blank">
                      {selectedHotspot.product.slug ||
                        slugFromHref(selectedHotspot.product.href)}
                    </Link>
                    <button
                      type="button"
                      className="admin-button"
                      onClick={refreshLinkedProduct}
                    >
                      <RefreshCw size={14} />
                      Sync price / name
                    </button>
                  </div>
                ) : (
                  <p className="admin-muted">No product linked yet.</p>
                )}
              </div>

              <label className="admin-field">
                <span className="admin-label">Search catalogue</span>
                <input
                  className="admin-input"
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Search sofas & beds…"
                />
              </label>

              {isSearching ? <p className="admin-muted">Searching…</p> : null}

              {productResults.length > 0 ? (
                <ul className="stl-product-results">
                  {productResults.map((product) => (
                    <li key={product.slug}>
                      <button type="button" onClick={() => linkProduct(product)}>
                        <span>
                          <strong>{product.name}</strong>
                          <em>{formatInrPrice(product.price)}</em>
                        </span>
                        <small>{product.slug}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <button
                type="button"
                className="admin-button stl-remove-pin"
                onClick={() => removeHotspot(selectedHotspot.id)}
              >
                <Trash2 size={14} />
                Remove pin
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
