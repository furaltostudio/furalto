"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Ruler, ZoomIn, ZoomOut } from "lucide-react";
import type { ProductImage, ProductSpec } from "@/types/product";
import { ProductScaleCompare } from "@/components/product/ProductScaleCompare";
import { catalogImageSrc } from "@/lib/images/catalog";
import { getProductScaleMeasures } from "@/lib/products/scale";
import { cn } from "@/lib/utils/cn";

const FALLBACK_IMAGE = "/home/furnitures_five.jpeg";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  productSlug?: string;
  specs?: ProductSpec[];
  scaleImageIndex?: number | null;
};

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
  const frameRef = useRef<HTMLDivElement>(null);

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

  const resolveSrc = (src: string, size: "main" | "thumb") => {
    if (failedSrcs[src]) return FALLBACK_IMAGE;
    return size === "main"
      ? catalogImageSrc(src, { width: 1800, height: 1350 })
      : catalogImageSrc(src, { width: 400, height: 300 });
  };

  const activeSrc = activeImage ? resolveSrc(activeImage.src, "main") : FALLBACK_IMAGE;
  const showThumbs = slideCount > 1;

  return (
    <div className={cn("product-gallery", showThumbs && "has-thumbs")}>
      {showThumbs ? (
        <div className="product-gallery-thumbs" role="tablist" aria-label={`${productName} images`}>
          {galleryImages.map((image, index) => {
            const thumbSrc = resolveSrc(image.src, "thumb");
            return (
              <button
                key={`${image.src}-${index}`}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`View image ${index + 1}`}
                className={cn(
                  "product-gallery-thumb",
                  index === activeIndex && "product-gallery-thumb-active"
                )}
                onClick={() => goTo(index)}
              >
                <Image
                  src={thumbSrc}
                  alt=""
                  width={320}
                  height={320}
                  sizes="96px"
                  unoptimized
                  className="product-gallery-thumb-image"
                  onError={() => {
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
            isScaleSlide && "product-gallery-main-scale"
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
          ) : (
            <Image
              src={activeSrc}
              alt={activeImage?.alt || productName}
              width={1800}
              height={1350}
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="product-gallery-image"
              unoptimized
              onError={() => {
                if (activeImage?.src) {
                  setFailedSrcs((current) => ({ ...current, [activeImage.src]: true }));
                }
              }}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transform: "scale(2)",
                    }
                  : undefined
              }
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
