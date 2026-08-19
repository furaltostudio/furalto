import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "accent" | "success" | "warning";
};

export function AdminStatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: AdminStatCardProps) {
  return (
    <article className={cn("admin-stat-card", `admin-stat-card-${tone}`)}>
      <div className="admin-stat-card-top">
        <p>{label}</p>
        {icon ? <span className="admin-stat-icon">{icon}</span> : null}
      </div>
      <strong>{value}</strong>
      {hint ? <span className="admin-stat-hint">{hint}</span> : null}
    </article>
  );
}
