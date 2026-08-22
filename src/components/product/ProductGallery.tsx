"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Ruler, ZoomIn, ZoomOut } from "lucide-react";
import type { ProductImage, ProductSpec } from "@/types/product";
import { ProductScaleCompare } from "@/components/product/ProductScaleCompare";
import { catalogImageSrc, galleryCutoutImageSrc, scaleCompareImageSrc } from "@/lib/images/catalog";
import { getProductScaleMeasures, getScaleImageIndex } from "@/lib/products/scale";
import { cn } from "@/lib/utils/cn";

const FALLBACK_IMAGE = "/home/furnitures_five.jpeg";
const CUTOUT_MAIN = { width: 1600, height: 1200 } as const;
const CUTOUT_THUMB = { width: 400, height: 300 } as const;
const CATALOG_MAIN = { width: 2000, height: 1500 } as const;
const CATALOG_THUMB = { width: 480, height: 360 } as const;

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  productSlug?: string;
  specs?: ProductSpec[];
  scaleImageIndex?: number | null;
};

function preloadImage(url: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("preload failed"));
    img.decoding = "async";
    img.src = url;
  });
}

export function ProductGallery({
  images,
  productName,
  productSlug,
  specs = [],
  scaleImageIndex = null,
}: ProductGalleryProps) {
  const galleryImages = images;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [failedSrcs, setFailedSrcs] = useState<Record<string, true>>({});
  /** Cutout failed → keep fast catalog mat. */
  const [cutoutFailed, setCutoutFailed] = useState<Record<string, true>>({});
  /** Cutout URL ready in browser cache / decoded. */
  const [cutoutReady, setCutoutReady] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());

  const scale = getProductScaleMeasures(specs);
  const scaleEnabled = scale.canCompare;
  const photoCount = galleryImages.length;
  const slideCount = photoCount + (scaleEnabled ? 1 : 0);
  const isScaleSlide = scaleEnabled && activeIndex === photoCount;
  const activeImage = !isScaleSlide
    ? galleryImages[activeIndex] ?? galleryImages[0]
    : undefined;

  const goTo = useCallback(
    (index: number) => {
      if (slideCount < 1) return;
      const next = ((index % slideCount) + slideCount) % slideCount;
      setActiveIndex(next);
      setIsZoomed(false);
    },
    [slideCount]
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current || !isZoomed || isScaleSlide) return;

    const rect = frameRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      if (!frameRef.current) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(activeIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goTo, isZoomed]);

  const activeSrc = activeImage?.src;

  const fastSrc = useMemo(() => {
    if (!activeSrc) return FALLBACK_IMAGE;
    if (failedSrcs[activeSrc]) return FALLBACK_IMAGE;
    return catalogImageSrc(activeSrc, CATALOG_MAIN);
  }, [activeSrc, failedSrcs]);

  const wantsCutout =
    !isScaleSlide &&
    activeIndex > 0 &&
    Boolean(activeSrc) &&
    !cutoutFailed[activeSrc!] &&
    !failedSrcs[activeSrc!];

  const cutoutSrc = useMemo(() => {
    if (!wantsCutout || !activeSrc) return null;
    return galleryCutoutImageSrc(activeSrc, CUTOUT_MAIN);
  }, [wantsCutout, activeSrc]);

  const markImageError = useCallback((src: string, index: number) => {
    if (index > 0 && !cutoutFailed[src]) {
      setCutoutFailed((current) => ({ ...current, [src]: true }));
      return;
    }
    setFailedSrcs((current) => ({ ...current, [src]: true }));
  }, [cutoutFailed]);

  // Progressive: show fast catalog instantly, swap to cutout when decoded.
  useEffect(() => {
    if (!cutoutSrc || !activeSrc) {
      setCutoutReady(false);
      return;
    }

    let cancelled = false;
    setCutoutReady(false);

    preloadImage(cutoutSrc)
      .then(() => {
        if (!cancelled) setCutoutReady(true);
      })
      .catch(() => {
        if (!cancelled) markImageError(activeSrc, activeIndex);
      });

    return () => {
      cancelled = true;
    };
  }, [cutoutSrc, activeSrc, activeIndex, markImageError]);

  // Prefetch neighbors immediately; warm remaining cutouts when idle.
  useEffect(() => {
    const urlsFor = (indices: number[]) => {
      const urls: string[] = [];
      for (const index of indices) {
        if (index <= 0 || index >= photoCount) continue;
        const src = galleryImages[index]?.src;
        if (!src || cutoutFailed[src] || failedSrcs[src]) continue;
        const url = galleryCutoutImageSrc(src, CUTOUT_MAIN);
        if (prefetchedRef.current.has(url)) continue;
        prefetchedRef.current.add(url);
        urls.push(url);
      }
      return urls;
    };

    const fire = (urls: string[]) => {
      urls.forEach((url) => {
        void preloadImage(url).catch(() => undefined);
      });
    };

    fire(urlsFor([activeIndex + 1, activeIndex - 1, activeIndex]));

    const warmRest = () => {
      const rest: number[] = [];
      for (let i = 1; i < photoCount; i += 1) rest.push(i);
      fire(urlsFor(rest));

      // Warm scale cutout early — AI removal is the slow path when Size opens.
      if (scaleEnabled) {
        const scaleIdx = getScaleImageIndex(productSlug, scaleImageIndex);
        const scaleSrc =
          galleryImages[scaleIdx]?.src ||
          galleryImages[1]?.src ||
          galleryImages[0]?.src;
        if (scaleSrc) {
          const scaleUrl = scaleCompareImageSrc(scaleSrc, { width: 1400, height: 1100 });
          if (!prefetchedRef.current.has(scaleUrl)) {
            prefetchedRef.current.add(scaleUrl);
            void preloadImage(scaleUrl).catch(() => undefined);
          }
        }
      }
    };

    const canIdle =
      typeof window !== "undefined" &&
      typeof window.requestIdleCallback === "function";
    const idleId = canIdle
      ? window.requestIdleCallback(warmRest, { timeout: 2500 })
      : window.setTimeout(warmRest, 900);

    return () => {
      if (canIdle && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [activeIndex, photoCount, galleryImages, cutoutFailed, failedSrcs, scaleEnabled, productSlug, scaleImageIndex]);

  const showThumbs = slideCount > 1;
  const zoomStyle = isZoomed
    ? {
        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
        transform: "scale(2)",
      }
    : undefined;

  return (
    <div className={cn("product-gallery", showThumbs && "has-thumbs")}>
      {showThumbs ? (
        <div className="product-gallery-thumbs" role="tablist" aria-label={`${productName} images`}>
          {galleryImages.map((image, index) => {
            const useCutoutThumb = index > 0 && !cutoutFailed[image.src] && !failedSrcs[image.src];
            const thumbSrc = failedSrcs[image.src]
              ? FALLBACK_IMAGE
              : useCutoutThumb
                ? galleryCutoutImageSrc(image.src, CUTOUT_THUMB)
                : catalogImageSrc(image.src, CATALOG_THUMB);
            return (
              <button
                key={`${image.src}-${index}`}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`View image ${index + 1}`}
                className={cn(
                  "product-gallery-thumb",
                  index === activeIndex && "product-gallery-thumb-active",
                  useCutoutThumb && "is-cutout"
                )}
                onClick={() => goTo(index)}
              >
                <Image
                  src={thumbSrc}
                  alt=""
                  width={320}
                  height={240}
                  sizes="96px"
                  unoptimized
                  loading={index <= 2 ? "eager" : "lazy"}
                  className="product-gallery-thumb-image"
                  onError={() => {
                    if (useCutoutThumb) {
                      setCutoutFailed((current) => ({ ...current, [image.src]: true }));
                      return;
                    }
                    setFailedSrcs((current) => ({ ...current, [image.src]: true }));
                  }}
                />
              </button>
            );
          })}

          {scaleEnabled ? (
            <button
              type="button"
              role="tab"
              aria-selected={isScaleSlide}
              aria-label="Size measurement guide"
              className={cn(
                "product-gallery-thumb product-gallery-thumb-scale",
                isScaleSlide && "product-gallery-thumb-active"
              )}
              onClick={() => goTo(photoCount)}
            >
              <span className="product-gallery-thumb-scale-inner">
                <Ruler strokeWidth={1.5} aria-hidden="true" />
                <span>Size</span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="product-gallery-stage">
        <div
          ref={frameRef}
          className={cn(
            "product-gallery-main",
            isZoomed && !isScaleSlide && "product-gallery-main-zoomed",
            isScaleSlide && "product-gallery-main-scale",
            wantsCutout && "product-gallery-main-cutout",
            wantsCutout && cutoutReady && "is-cutout-ready"
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => {
            if (isScaleSlide) return;
            setIsZoomed((current) => !current);
          }}
          role="img"
          aria-label={
            isScaleSlide ? `${productName} size measurement` : activeImage?.alt || productName
          }
        >
          {isScaleSlide && scale.heightCm ? (
            <ProductScaleCompare
              productName={productName}
              productSlug={productSlug}
              images={galleryImages}
              heightCm={scale.heightCm}
              widthCm={scale.widthCm}
              depthCm={scale.depthCm}
              seatHeightCm={scale.seatHeightCm}
              seatLabel={scale.seatLabel}
              kind={scale.kind}
              scaleImageIndex={scaleImageIndex}
            />
          ) : wantsCutout && cutoutSrc ? (
            <div className="product-gallery-cutout-stage" key={activeImage?.src}>
              {/* Fast studio mat first — always instant */}
              <Image
                src={fastSrc}
                alt=""
                width={CATALOG_MAIN.width}
                height={CATALOG_MAIN.height}
                sizes="(min-width: 1024px) 52vw, 100vw"
                className={cn(
                  "product-gallery-image product-gallery-image-preview",
                  cutoutReady && "is-hidden"
                )}
                unoptimized
                priority={activeIndex === 1}
                style={zoomStyle}
              />
              {/* AI cutout — contact shadow via drop-shadow follows silhouette */}
              <Image
                src={cutoutSrc}
                alt={activeImage?.alt || productName}
                width={CUTOUT_MAIN.width}
                height={CUTOUT_MAIN.height}
                sizes="(min-width: 1024px) 52vw, 100vw"
                className={cn(
                  "product-gallery-image product-gallery-image-cutout",
                  cutoutReady && "is-ready"
                )}
                unoptimized
                style={zoomStyle}
                onError={() => {
                  if (activeImage?.src) markImageError(activeImage.src, activeIndex);
                }}
              />
            </div>
          ) : (
            <Image
              src={fastSrc}
              alt={activeImage?.alt || productName}
              width={CATALOG_MAIN.width}
              height={CATALOG_MAIN.height}
              priority={activeIndex === 0}
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="product-gallery-image"
              unoptimized
              onError={() => {
                if (activeImage?.src) {
                  setFailedSrcs((current) => ({ ...current, [activeImage.src]: true }));
                }
              }}
              style={zoomStyle}
            />
          )}

          {!isScaleSlide ? (
            <button
              type="button"
              className="product-gallery-zoom-btn"
              onClick={(event) => {
                event.stopPropagation();
                setIsZoomed((current) => !current);
              }}
              aria-pressed={isZoomed}
              aria-label={isZoomed ? "Disable image zoom" : "Enable image zoom"}
            >
              {isZoomed ? (
                <ZoomOut strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <ZoomIn strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          ) : null}

          {slideCount > 1 && !isScaleSlide ? (
            <>
              <button
                type="button"
                className="product-gallery-nav product-gallery-nav-prev"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(activeIndex - 1);
                }}
              >
                <ChevronLeft strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="product-gallery-nav product-gallery-nav-next"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(activeIndex + 1);
                }}
              >
                <ChevronRight strokeWidth={1.5} aria-hidden="true" />
              </button>
              <p className="product-gallery-counter">
                {String(activeIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
