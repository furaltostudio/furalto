"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

type RequireAuthProps = {
  children: ReactNode;
  message?: string;
};

export function RequireAuth({
  children,
  message = "Sign in to continue.",
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/account?next=${next}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <section className="checkout-empty">
        <div className="container-app py-16 sm:py-24">
          <h1 className="checkout-empty-title">Checking your account…</h1>
          <p className="checkout-empty-copy">{message}</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
