"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/providers/WishlistProvider";
import { cn } from "@/lib/utils/cn";

type WishlistButtonProps = {
  slug: string;
  productName?: string;
  variant?: "card" | "detail";
  className?: string;
};

export function WishlistButton({
  slug,
  productName,
  variant = "card",
  className,
}: WishlistButtonProps) {
  const { isSaved, toggle } = useWishlist();
  const [isBusy, setIsBusy] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const saved = hasMounted ? isSaved(slug) : false;
  const label = saved
    ? `Remove ${productName || "item"} from wishlist`
    : `Save ${productName || "item"} to wishlist`;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isBusy) {
      return;
    }

    setIsBusy(true);
    try {
      await toggle(slug);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "wishlist-toggle",
        variant === "card" ? "wishlist-toggle-card" : "wishlist-toggle-detail",
        saved && "is-saved",
        isBusy && "is-loading",
        className,
      )}
      aria-label={label}
      aria-pressed={saved}
      aria-busy={isBusy || undefined}
      title={saved ? "Saved to wishlist" : "Save to wishlist"}
      disabled={isBusy}
      onClick={handleClick}
    >
      {isBusy ? (
        <Loader2 className="ui-button-spinner" aria-hidden size={16} />
      ) : (
        <Heart
          strokeWidth={1.5}
          fill={saved ? "currentColor" : "none"}
          aria-hidden="true"
        />
      )}
      {variant === "detail" ? (
        <span>{isBusy ? "Saving…" : saved ? "Saved to Wishlist" : "Save to Wishlist"}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </button>
  );
}
