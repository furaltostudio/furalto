type AdminBadgeProps = {
  status: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

const toneMap: Record<string, AdminBadgeProps["tone"]> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  completed: "success",
  resolved: "success",
  verified: "success",
  paid: "success",
  active: "success",
  cancelled: "danger",
  failed: "danger",
  refunded: "danger",
  new: "warning",
  in_progress: "info",
  inactive: "default",
};

export function AdminBadge({ status, tone }: AdminBadgeProps) {
  const resolvedTone = tone || toneMap[status] || "default";

  return <span className={`admin-badge admin-badge-${resolvedTone}`}>{status.replace(/_/g, " ")}</span>;
}
