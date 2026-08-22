"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Product } from "@/types/product";
import {
  formatCategoryLabel,
  formatInrPrice,
  formatProductName,
} from "@/lib/products/format";
import { catalogImageSrc, carouselImageSrc } from "@/lib/images/catalog";
import {
  pickListingImages,
  pickListingImagesSync,
} from "@/lib/images/pickListingImage";
import {
  sampleStudioStageColor,
  WHITE_STAGE_CSS,
} from "@/lib/images/sampleStudioStageColor";
import { WishlistButton } from "@/components/product/WishlistButton";

const FALLBACK_IMAGE = "/home/furnitures_five.jpeg";

type ProductCardProps = {
  product: Product;
  variant?: "gallery" | "grid" | "carousel";
  priority?: boolean;
  loading?: "eager" | "lazy";
};

function resolveCardImage(src: string, variant: ProductCardProps["variant"]) {
  if (variant === "carousel") {
    // No white pad — keeps the real studio plate so we can match the mat color.
    return carouselImageSrc(src, { width: 1800, height: 1200 });
  }
  return catalogImageSrc(src, { width: 1600, height: 1200 });
}

export function ProductCard({
  product,
  variant = "grid",
  priority = false,
  loading,
}: ProductCardProps) {
  const imageKey = (product.images ?? []).map((img) => img.src).join("|");
  const syncPrimary = useMemo(
    () => pickListingImagesSync(product).primary,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.slug, imageKey],
  );
  const [primary, setPrimary] = useState(syncPrimary);

  useEffect(() => {
    setPrimary(syncPrimary);
    let cancelled = false;
    void pickListingImages(product).then((best) => {
      if (cancelled || !best.primary) return;
      setPrimary(best.primary);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug, imageKey, syncPrimary]);

  const resolved = primary?.src
    ? resolveCardImage(primary.src, variant)
    : FALLBACK_IMAGE;
  const [src, setSrc] = useState(resolved);
  const [stageColor, setStageColor] = useState(WHITE_STAGE_CSS);
  const loadingMode = loading ?? (priority ? "eager" : "lazy");

  useEffect(() => {
    let active = true;
    const next = primary?.src
      ? resolveCardImage(primary.src, variant)
      : FALLBACK_IMAGE;

    setSrc(next);
    setStageColor(WHITE_STAGE_CSS);

    if (variant !== "carousel" || !primary?.src || next === FALLBACK_IMAGE) {
      return () => {
        active = false;
      };
    }

    void (async () => {
      const color = await sampleStudioStageColor(next);
      if (!active || !color) return;
      setStageColor(color);
    })();

    return () => {
      active = false;
    };
  }, [primary?.src, variant]);

  if (!primary) {
    return null;
  }

  const articleClass =
    variant === "gallery"
      ? "gallery-card"
      : variant === "carousel"
        ? "product-card product-card--carousel"
        : "product-card";

  const mediaStyle: CSSProperties | undefined =
    variant === "carousel"
      ? { backgroundColor: stageColor }
      : undefined;

  return (
    <article className={articleClass}>
      <div className="product-card-media-wrap">
        <Link href={`/products/${product.slug}`} className="product-card-link">
          <div className="product-card-media" style={mediaStyle}>
            <Image
              src={src}
              alt={primary.alt || formatProductName(product.name)}
              width={1600}
              height={variant === "carousel" ? 1067 : 1200}
              priority={priority}
              loading={loadingMode}
              unoptimized
              onError={() => {
                if (src !== FALLBACK_IMAGE) {
                  setSrc(FALLBACK_IMAGE);
                }
              }}
              sizes={
                variant === "carousel"
                  ? "(min-width: 1024px) 31vw, (min-width: 700px) 46vw, 78vw"
                  : variant === "gallery"
                    ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              }
              className="product-card-image"
            />
          </div>
        </Link>
        <WishlistButton
          slug={product.slug}
          productName={formatProductName(product.name)}
          variant="card"
        />
      </div>
      <Link
        href={`/products/${product.slug}`}
        className="product-card-link product-card-body-link"
      >
        <div className="product-card-body">
          <p className="product-card-collection">
            {formatCategoryLabel(product.collection)}
          </p>
          <h3 className="product-card-title">
            {formatProductName(product.name)}
          </h3>
          <p className="product-card-price">{formatInrPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
