"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { newsletterService } from "@/services/commerce.service";
import { getAuthErrorMessage } from "@/providers/AuthProvider";

type FooterNewsletterProps = {
  variant?: "default" | "accordion";
};

export function FooterNewsletter({ variant = "default" }: FooterNewsletterProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await newsletterService.subscribe(email);
      setMessage(response.message);
      setEmail("");
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "footer-newsletter",
        variant === "accordion" && "footer-newsletter-accordion"
      )}
    >
      {variant === "default" && (
        <>
          <h3 className="footer-heading">Join the List</h3>
          <p className="footer-newsletter-text">
            Curated styling tips, new arrivals, and exclusive offers.
          </p>
        </>
      )}

      {variant === "accordion" && (
        <p className="footer-newsletter-text footer-newsletter-text-compact">
          Curated styling tips, new arrivals, and exclusive offers.
        </p>
      )}

      <form onSubmit={handleSubmit} className="footer-newsletter-form">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email Address"
          required
          className="footer-newsletter-input"
          suppressHydrationWarning
        />
        <button
          type="submit"
          className={cn("footer-newsletter-submit", isSubmitting && "is-loading")}
          aria-label={isSubmitting ? "Subscribing" : "Subscribe to newsletter"}
          aria-busy={isSubmitting || undefined}
          disabled={isSubmitting}
          suppressHydrationWarning
        >
          {isSubmitting ? (
            <Loader2 className="ui-button-spinner h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </form>
      {message ? <p className="footer-newsletter-message">{message}</p> : null}
    </div>
  );
}
