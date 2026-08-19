"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@/types";

type RequireRoleProps = {
  roles: UserRole[];
  children: ReactNode;
  redirectTo?: string;
};

export function RequireRole({ roles, children, redirectTo = "/account" }: RequireRoleProps) {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user || !hasRole(...roles)) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, hasRole, roles, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!user || !hasRole(...roles)) {
    return null;
  }

  return children;
}
