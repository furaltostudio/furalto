"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { formatInrPrice, formatProductName } from "@/lib/products/format";
import { mosaicImageSrc } from "@/lib/images/catalog";
import {
  pickListingImages,
  pickListingImagesSync,
} from "@/lib/images/pickListingImage";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

const FALLBACK_IMAGE = "/home/furnitures_five.jpeg";
const FRAME_W = 1800;
const FRAME_H = 1350;

type ProductMosaicGalleryProps = {
  products: Product[];
  collectionTitle?: string;
  layout?: "default" | "sidebar";
};

/** Editorial rhythm: hero, then pairs, with an occasional wide break. */
function tileVariant(
  index: number,
  layout: "default" | "sidebar",
): "feature" | "wide" | "standard" {
  if (layout === "sidebar") {
    // Keep an even 2-col rhythm beside the filter rail.
    return "standard";
  }
  if (index === 0) return "feature";
  if (index > 0 && index % 5 === 0) return "wide";
  return "standard";
}

function ListingImage({
  src,
  alt,
  priority,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className: string;
  sizes: string;
}) {
  const [errorSrc, setErrorSrc] = useState<string | null>(null);
  const displaySrc = errorSrc === src ? FALLBACK_IMAGE : src;

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={FRAME_W}
      height={FRAME_H}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      unoptimized
      onError={() => setErrorSrc(src)}
      sizes={sizes}
      className={className}
    />
  );
}

function useListingFrames(product: Product) {
  const imageKey = (product.images ?? []).map((img) => img.src).join("|");
  const sync = useMemo(
    () => pickListingImagesSync(product),
    // product fields read inside; key captures gallery identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.slug, imageKey],
  );
  const [frames, setFrames] = useState(sync);

  useEffect(() => {
    setFrames(sync);
    let cancelled = false;

    void pickListingImages(product).then((best) => {
      if (cancelled || !best.primary) return;
      setFrames(best);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug, imageKey, sync]);

  return frames;
}

function ListingTile({
  product,
  priority,
  variant,
}: {
  product: Product;
  priority?: boolean;
  variant: "feature" | "wide" | "standard";
}) {
  const { primary, secondary } = useListingFrames(product);
  const displayName = formatProductName(product.name);

  if (!primary?.src) {
    return null;
  }

  const dims =
    variant === "feature"
      ? { width: 2200, height: 1200 }
      : variant === "wide"
        ? { width: 2000, height: 1100 }
        : { width: FRAME_W, height: FRAME_H };
  const primarySrc = mosaicImageSrc(primary.src, dims);
  const secondarySrc = secondary?.src
    ? mosaicImageSrc(secondary.src, dims)
    : null;

  const sizes =
    variant === "feature" || variant === "wide"
      ? "(min-width: 900px) 84rem, 100vw"
      : "(min-width: 900px) 42rem, 100vw";

  const showCompare =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  return (
    <article className={`listing-tile listing-tile--${variant}`}>
      <Link href={`/products/${product.slug}`} className="listing-tile-link">
        <div
          className={
            secondarySrc ? "listing-tile-stage has-alt" : "listing-tile-stage"
          }
        >
          <ListingImage
            src={primarySrc}
            alt={primary.alt || displayName}
            priority={priority}
            sizes={sizes}
            className="listing-tile-image listing-tile-image--primary"
          />
          {secondarySrc ? (
            <ListingImage
              src={secondarySrc}
              alt={`${displayName} — alternate view`}
              sizes={sizes}
              className="listing-tile-image listing-tile-image--alt"
            />
          ) : null}
        </div>

        <div className="listing-tile-meta">
          <div className="listing-tile-copy">
            <h3 className="listing-tile-title">{displayName}</h3>
          </div>
          <div
            className={
              showCompare
                ? "listing-tile-pricing is-sale"
                : "listing-tile-pricing"
            }
          >
            {showCompare ? (
              <span className="listing-tile-compare">
                {formatInrPrice(product.compareAtPrice!)}
              </span>
            ) : null}
            <p className="listing-tile-price">
              {formatInrPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>

      <WishlistButton
        slug={product.slug}
        productName={displayName}
        variant="card"
      />
    </article>
  );
}

export function ProductMosaicGallery({
  products,
  layout = "default",
}: ProductMosaicGalleryProps) {
  return (
    <Reveal
      className={cn(
        "product-listing product-listing--gallery reveal-stagger",
        layout === "sidebar" && "product-listing--with-sidebar",
      )}
    >
      {products.map((product, index) => (
        <ListingTile
          key={product.slug}
          product={product}
          priority={index < 4}
          variant={tileVariant(index, layout)}
        />
      ))}
    </Reveal>
  );
}

export function CollectionCloseCta({
  collectionTitle,
}: {
  collectionTitle?: string;
}) {
  const closeLabel = collectionTitle
    ? `Explore ${collectionTitle.toLowerCase()} in person`
    : "See the piece in person";

  return (
    <Reveal className="collections-close" delay={140}>
      <p className="collections-close-kicker">Private viewing</p>
      <h2 className="collections-close-title">{closeLabel}</h2>
      <p className="collections-close-copy">
        Materials, scale, and finish — guided in our showroom, then delivered
        white-glove.
      </p>
      <div className="collections-close-actions">
        <Link href="/appointments" className="collections-close-primary">
          Book a visit
        </Link>
        <Link href="/contact" className="collections-close-secondary">
          Speak with us
        </Link>
      </div>
    </Reveal>
  );
}
