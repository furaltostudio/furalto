"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

type RelatedProductsCarouselProps = {
  products: Product[];
  categoryLabel: string;
};

export function RelatedProductsCarousel({
  products,
  categoryLabel,
}: RelatedProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 8);
    setCanNext(track.scrollLeft < maxScroll - 8);

    const slides = [...track.querySelectorAll<HTMLElement>("[data-related-slide]")];
    if (slides.length === 0) return;

    const trackMid = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const center = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(center - trackMid);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncControls();
    track.addEventListener("scroll", syncControls, { passive: true });
    window.addEventListener("resize", syncControls);

    return () => {
      track.removeEventListener("scroll", syncControls);
      window.removeEventListener("resize", syncControls);
    };
  }, [products.length, syncControls]);

  const scrollBySlide = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.querySelector<HTMLElement>("[data-related-slide]");
    const amount = slide ? slide.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (products.length === 0) {
    return null;
  }

  const total = products.length;
  const counterCurrent = String(Math.min(activeIndex + 1, total)).padStart(2, "0");
  const counterTotal = String(total).padStart(2, "0");

  return (
    <section className="related-products">
      <div className="related-products-shell">
        <Reveal className="related-products-top">
          <div className="related-products-header">
            <p className="related-products-kicker">Continue exploring</p>
            <h2 className="related-products-title">You May Also Like</h2>
            <p className="related-products-copy">
              Pieces curated to complete the {categoryLabel} composition.
            </p>
          </div>

          <div className="related-products-controls">
            <div className="related-products-counter" aria-hidden="true">
              <span className="related-products-counter-current">{counterCurrent}</span>
              <span className="related-products-counter-line" />
              <span className="related-products-counter-total">{counterTotal}</span>
            </div>

            <div className="related-products-nav">
              <button
                type="button"
                className="related-products-nav-btn"
                onClick={() => scrollBySlide(-1)}
                disabled={!canPrev}
                aria-label="Previous similar pieces"
              >
                <ArrowLeft strokeWidth={1.25} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="related-products-nav-btn"
                onClick={() => scrollBySlide(1)}
                disabled={!canNext}
                aria-label="Next similar pieces"
              >
                <ArrowRight strokeWidth={1.25} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>

        <div className="related-products-viewport">
          <div
            ref={trackRef}
            className="related-products-track"
            role="list"
            aria-label="Similar pieces"
          >
            {products.map((product, index) => (
              <div
                key={product.slug}
                className={cn(
                  "related-products-slide",
                  index === activeIndex && "is-active",
                )}
                data-related-slide
                role="listitem"
              >
                <ProductCard product={product} variant="carousel" />
              </div>
            ))}
          </div>
        </div>

        <div className="related-products-progress" aria-hidden="true">
          <span
            className="related-products-progress-bar"
            style={{
              width: `${((activeIndex + 1) / total) * 100}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
