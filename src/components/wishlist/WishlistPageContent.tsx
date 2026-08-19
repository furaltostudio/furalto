"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { categoryImages } from "@/config/images";
import { useWishlist } from "@/providers/WishlistProvider";

export function WishlistPageContent() {
  const { products, isLoading, remove } = useWishlist();

  return (
    <>
      <PageHeroWithImage
        eyebrow="Saved Pieces"
        title="Your Wishlist"
        description="Pieces you love, saved to revisit with your design specialist."
        image={categoryImages.bedroom}
        className="utility-hero"
      />

      <section className="wishlist-page">
        <div className="container-app utility-page-inner">
          {isLoading ? (
            <Reveal className="utility-empty-card">
              <p>Loading your saved pieces…</p>
            </Reveal>
          ) : products.length === 0 ? (
            <Reveal className="utility-empty-card">
              <span className="utility-empty-icon" aria-hidden="true">
                <Heart strokeWidth={1.5} />
              </span>
              <div className="utility-empty-media">
                <Image
                  src={categoryImages.bedroom.src}
                  alt="Bedroom furniture wishlist inspiration"
                  width={categoryImages.bedroom.width}
                  height={categoryImages.bedroom.height}
                  className="utility-empty-image"
                />
              </div>
              <h2>No saved items yet</h2>
              <p>
                Browse collections and tap the heart on any piece to save it here.
              </p>
              <div className="utility-empty-actions">
                <Link href="/inspiration/bedroom" className="utility-empty-cta">
                  Bedroom Gallery
                </Link>
                <Link href="/collections" className="utility-empty-link">
                  View All Collections
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.slug} className="wishlist-product-wrap">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    className="utility-empty-link"
                    onClick={() => void remove(product.slug)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
