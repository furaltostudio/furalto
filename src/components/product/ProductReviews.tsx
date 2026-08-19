"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { ProductReview, RatingDistribution } from "@/types/product";
import { formatProductName } from "@/lib/products/format";
import { cn } from "@/lib/utils/cn";

type ProductReviewsProps = {
  productName: string;
  averageRating?: number;
  reviewCount?: number;
  recommendPercent?: number;
  ratingDistribution?: RatingDistribution;
  featuredReview?: ProductReview | null;
  reviews: ProductReview[];
};

type SortMode = "newest" | "highest" | "lowest";
type RatingFilter = 0 | 1 | 2 | 3 | 4 | 5;

function Stars({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <span
      className={cn("product-review-stars", `product-review-stars-${size}`)}
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, clamped - index));
        return (
          <span key={index} className="product-review-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="product-review-star-svg">
              <path
                className="product-review-star-base"
                d="M12 2.6l2.7 6.2 6.7.6-5.1 4.4 1.5 6.5L12 16.9 6.2 20.3l1.5-6.5L2.6 9.4l6.7-.6L12 2.6z"
              />
              {fill > 0 ? (
                <path
                  className="product-review-star-fill"
                  d="M12 2.6l2.7 6.2 6.7.6-5.1 4.4 1.5 6.5L12 16.9 6.2 20.3l1.5-6.5L2.6 9.4l6.7-.6L12 2.6z"
                  style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
                />
              ) : null}
            </svg>
          </span>
        );
      })}
    </span>
  );
}

function formatReviewDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function ratingLabel(average: number) {
  if (average >= 4.8) return "Exceptional";
  if (average >= 4.5) return "Excellent";
  if (average >= 4.0) return "Very good";
  if (average >= 3.0) return "Good";
  return "Rated";
}

const EMPTY_DISTRIBUTION: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export function ProductReviews({
  productName,
  averageRating = 0,
  reviewCount = 0,
  recommendPercent = 0,
  ratingDistribution = EMPTY_DISTRIBUTION,
  featuredReview = null,
  reviews,
}: ProductReviewsProps) {
  const [sort, setSort] = useState<SortMode>("newest");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(0);
  const [visibleCount, setVisibleCount] = useState(6);

  const highlight = useMemo(() => {
    if (featuredReview) return featuredReview;
    return (
      [...reviews]
        .filter((r) => r.rating >= 5 && r.comment.length > 40)
        .sort((a, b) => b.comment.length - a.comment.length)[0] ?? null
    );
  }, [featuredReview, reviews]);

  const filtered = useMemo(() => {
    let list = [...reviews];

    if (ratingFilter > 0) {
      list = list.filter((review) => review.rating === ratingFilter);
    }

    if (highlight && ratingFilter === 0) {
      list = list.filter((review) => review._id !== highlight._id);
    }

    list.sort((a, b) => {
      if (sort === "highest") {
        return b.rating - a.rating || +new Date(b.createdAt) - +new Date(a.createdAt);
      }
      if (sort === "lowest") {
        return a.rating - b.rating || +new Date(b.createdAt) - +new Date(a.createdAt);
      }
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });

    return list;
  }, [reviews, ratingFilter, sort, highlight]);

  const visible = filtered.slice(0, visibleCount);
  const hasReviews = reviewCount > 0 && reviews.length > 0;
  const displayName = formatProductName(productName);

  return (
    <section className="product-reviews" id="product-reviews" aria-labelledby="product-reviews-heading">
      <header className="product-reviews-hero">
        <p className="product-reviews-kicker">From our clients</p>
        <h2 id="product-reviews-heading" className="product-reviews-title">
          Reviews
        </h2>
        <div className="product-reviews-rule" aria-hidden="true" />
        <p className="product-reviews-lede">
          Quiet notes from homes where the {displayName} now lives.
        </p>
      </header>

      {!hasReviews ? (
        <div className="product-reviews-empty">
          <p className="product-reviews-empty-title">No reviews yet</p>
          <p>
            After delivery, verified buyers can share how {displayName} feels in their space.
          </p>
        </div>
      ) : (
        <>
          <div className="product-reviews-overview">
            <div className="product-reviews-score">
              <p className="product-reviews-score-value">{averageRating.toFixed(1)}</p>
              <Stars rating={averageRating} size="lg" />
              <p className="product-reviews-score-label">{ratingLabel(averageRating)}</p>
              <p className="product-reviews-score-caption">
                {reviewCount.toLocaleString("en-IN")} verified review
                {reviewCount === 1 ? "" : "s"}
                {recommendPercent > 0 ? (
                  <>
                    <span className="product-reviews-score-dot" aria-hidden="true">
                      ·
                    </span>
                    {recommendPercent}% recommend
                  </>
                ) : null}
              </p>
            </div>

            <div className="product-reviews-bars" aria-label="Rating breakdown">
              {[5, 4, 3, 2, 1].map((star, index) => {
                const count = ratingDistribution[star as keyof RatingDistribution] || 0;
                const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                return (
                  <button
                    key={star}
                    type="button"
                    className={cn(
                      "product-reviews-bar-row",
                      ratingFilter === star && "is-active"
                    )}
                    style={{ "--bar-delay": `${index * 55}ms` } as CSSProperties}
                    onClick={() => {
                      setRatingFilter((current) =>
                        current === star ? 0 : (star as RatingFilter)
                      );
                      setVisibleCount(6);
                    }}
                    aria-pressed={ratingFilter === star}
                  >
                    <span className="product-reviews-bar-label">
                      {star}
                      <span aria-hidden="true">★</span>
                    </span>
                    <span className="product-reviews-bar-track">
                      <span
                        className="product-reviews-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="product-reviews-bar-pct">{pct}%</span>
                  </button>
                );
              })}
              {ratingFilter > 0 ? (
                <button
                  type="button"
                  className="product-reviews-clear-filter"
                  onClick={() => {
                    setRatingFilter(0);
                    setVisibleCount(6);
                  }}
                >
                  Show all ratings
                </button>
              ) : null}
            </div>
          </div>

          {highlight && ratingFilter === 0 ? (
            <figure className="product-reviews-featured">
              <p className="product-reviews-featured-label">A note we loved</p>
              <blockquote className="product-reviews-featured-quote">
                <p>{highlight.comment}</p>
              </blockquote>
              <figcaption className="product-reviews-featured-caption">
                <span className="product-reviews-featured-line" aria-hidden="true" />
                <span>
                  {highlight.authorName}
                  <span className="product-reviews-featured-meta">
                    Verified purchase
                    <span aria-hidden="true"> · </span>
                    <time dateTime={highlight.createdAt}>
                      {formatReviewDate(highlight.createdAt)}
                    </time>
                  </span>
                </span>
              </figcaption>
            </figure>
          ) : null}

          <div className="product-reviews-toolbar">
            <p className="product-reviews-toolbar-count">
              {ratingFilter > 0
                ? `${filtered.length} · ${ratingFilter}-star`
                : `${filtered.length} review${filtered.length === 1 ? "" : "s"}`}
            </p>
            <label className="product-reviews-sort">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as SortMode);
                  setVisibleCount(6);
                }}
              >
                <option value="newest">Most recent</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="product-reviews-empty product-reviews-empty-compact">
              No reviews for this rating.
            </p>
          ) : (
            <>
              <ul className="product-reviews-list">
                {visible.map((review) => (
                  <li key={review._id} className="product-review-entry">
                    <div className="product-review-entry-top">
                      <Stars rating={review.rating} size="sm" />
                      <time dateTime={review.createdAt}>
                        {formatReviewDate(review.createdAt)}
                      </time>
                    </div>
                    {review.title ? (
                      <h3 className="product-review-entry-title">{review.title}</h3>
                    ) : null}
                    <p className="product-review-entry-comment">{review.comment}</p>
                    <p className="product-review-entry-author">
                      <span>{review.authorName}</span>
                      <span className="product-review-verified">Verified purchase</span>
                    </p>
                  </li>
                ))}
              </ul>

              {filtered.length > visibleCount ? (
                <div className="product-reviews-more">
                  <button
                    type="button"
                    className="product-reviews-more-btn"
                    onClick={() => setVisibleCount((count) => count + 6)}
                  >
                    View more reviews
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
}
