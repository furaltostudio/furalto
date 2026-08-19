"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { reviewService } from "@/services/commerce.service";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import type { ReviewInvite } from "@/types/product";
import { cn } from "@/lib/utils/cn";

type FormStatus = "loading" | "ready" | "submitting" | "success" | "error";

export function FeedbackPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<FormStatus>("loading");
  const [invite, setInvite] = useState<ReviewInvite | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submittedSlug, setSubmittedSlug] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInvite() {
      if (!token) {
        setStatus("error");
        setErrorMessage("This feedback link is missing a token.");
        return;
      }

      try {
        const response = await reviewService.getInvite(token);
        if (cancelled) return;
        const data = response.data.invite;
        setInvite(data);
        const firstOpen = data.items.find((item) => !item.alreadyReviewed);
        setProductSlug(firstOpen?.slug || data.items[0]?.slug || "");
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(getAuthErrorMessage(error));
      }
    }

    void loadInvite();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const pendingItems = invite?.items.filter((item) => !item.alreadyReviewed) || [];
  const selected = invite?.items.find((item) => item.slug === productSlug);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !productSlug) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      await reviewService.submit({
        token,
        productSlug,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });

      setSubmittedSlug(productSlug);
      setTitle("");
      setComment("");
      setRating(5);

      const refreshed = await reviewService.getInvite(token);
      setInvite(refreshed.data.invite);
      const nextOpen = refreshed.data.invite.items.find((item) => !item.alreadyReviewed);
      setProductSlug(nextOpen?.slug || "");
      setStatus(nextOpen ? "ready" : "success");
    } catch (error) {
      setStatus("ready");
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  if (status === "loading") {
    return <p className="feedback-lead">Loading your feedback form…</p>;
  }

  if (status === "error") {
    return (
      <div className="feedback-panel">
        <h1 className="feedback-title">Feedback unavailable</h1>
        <p className="feedback-lead">{errorMessage || "This link is invalid or expired."}</p>
        <Link href="/collections" className="feedback-link">
          Browse collections
        </Link>
      </div>
    );
  }

  if (status === "success" || (invite && pendingItems.length === 0)) {
    return (
      <div className="feedback-panel">
        <p className="feedback-kicker">Thank you</p>
        <h1 className="feedback-title">Your feedback is in</h1>
        <p className="feedback-lead">
          {submittedSlug
            ? "We’ve shared your review on the product page for other customers."
            : "You’ve already reviewed every piece in this order."}
        </p>
        {invite?.items[0] ? (
          <Link href={`/products/${invite.items[0].slug}`} className="feedback-link">
            View product page
          </Link>
        ) : (
          <Link href="/collections" className="feedback-link">
            Continue shopping
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-panel">
      <p className="feedback-kicker">Order {invite?.orderNumber}</p>
      <h1 className="feedback-title">How was your delivery?</h1>
      <p className="feedback-lead">
        Hi {invite?.customerName || "there"} — tell us what you loved. Your review helps other
        customers choose with confidence.
      </p>

      <form className="feedback-form" onSubmit={handleSubmit}>
        {pendingItems.length > 1 ? (
          <label className="feedback-field">
            <span>Product</span>
            <select
              value={productSlug}
              onChange={(event) => setProductSlug(event.target.value)}
              required
            >
              {pendingItems.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : selected ? (
          <div className="feedback-product">
            {selected.image ? (
              <Image
                src={selected.image}
                alt={selected.name}
                width={72}
                height={72}
                className="feedback-product-image"
              />
            ) : null}
            <p>{selected.name}</p>
          </div>
        ) : null}

        <fieldset className="feedback-rating">
          <legend>Rating</legend>
          <div className="feedback-rating-options">
            {[5, 4, 3, 2, 1].map((value) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "feedback-rating-btn",
                  rating === value && "feedback-rating-btn-active"
                )}
                onClick={() => setRating(value)}
                aria-pressed={rating === value}
              >
                {value} ★
              </button>
            ))}
          </div>
        </fieldset>

        <label className="feedback-field">
          <span>Title (optional)</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="A short headline for your review"
          />
        </label>

        <label className="feedback-field">
          <span>Your feedback</span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            placeholder="How does it look and feel in your home?"
          />
        </label>

        {errorMessage ? <p className="feedback-error">{errorMessage}</p> : null}

        <button type="submit" className="feedback-submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}
