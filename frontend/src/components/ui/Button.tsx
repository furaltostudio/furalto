"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  /** Shown while loading; defaults to children */
  loadingText?: ReactNode;
  /** Hide children/icons and show only spinner + loadingText */
  spinnerOnly?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    isLoading = false,
    loadingText,
    spinnerOnly = false,
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref
) {
  const busy = Boolean(isLoading);

  return (
    <button
      ref={ref}
      type={type}
      className={cn(className, busy && "is-loading")}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy ? (
        <>
          <Loader2 className="ui-button-spinner" aria-hidden size={16} />
          {spinnerOnly ? null : loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
});
