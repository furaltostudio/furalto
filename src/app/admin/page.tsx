"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FolderTree,
  IndianRupee,
  MessageSquare,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin/format";
import { useAuth } from "@/providers/AuthProvider";
import { adminService } from "@/services/admin.service";
import type { AdminStats } from "@/services/admin.service";

const quickActions = [
  { href: "/admin/orders", label: "Manage orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Edit catalogue", icon: Package },
  { href: "/admin/categories", label: "Manage categories", icon: FolderTree },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/contacts", label: "Enquiries", icon: MessageSquare },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getStats()
      .then((response) => setStats(response.data))
      .catch(() => setError("Unable to load dashboard stats."));
  }, []);

  const maxMonthlyRevenue = useMemo(() => {
    if (!stats?.revenueMonthly?.length) {
      return 1;
    }
    return Math.max(...stats.revenueMonthly.map((item) => item.revenue), 1);
  }, [stats]);

  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  if (!stats) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loading-pulse" />
        <p className="admin-muted">Loading studio dashboard…</p>
      </div>
    );
  }

  const monthChange =
    stats.revenueLastMonth > 0
      ? Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)
      : null;

  return (
    <div className="admin-stack">
      <section className="admin-welcome">
        <div>
          <p className="admin-welcome-eyebrow">Operations overview</p>
          <h2>Welcome back, {user?.firstName || "team"}</h2>
          <p>Track paid revenue, catalogue health, and what needs attention today.</p>
        </div>
        <div className="admin-welcome-meta">
          <span>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
        </div>
      </section>

      <div className="admin-stat-grid admin-stat-grid-4">
        <AdminStatCard
          label="This month"
          value={formatAdminCurrency(stats.revenueThisMonth)}
          hint={
            monthChange === null
              ? `${stats.paidOrdersThisMonth} paid orders`
              : `${monthChange >= 0 ? "+" : ""}${monthChange}% vs last month`
          }
          icon={<TrendingUp size={16} />}
          tone="accent"
        />
        <AdminStatCard
          label="This year"
          value={formatAdminCurrency(stats.revenueThisYear)}
          hint={`${new Date().getFullYear()} paid revenue`}
          icon={<IndianRupee size={16} />}
          tone="success"
        />
        <AdminStatCard
          label="All-time revenue"
          value={formatAdminCurrency(stats.revenueAllTime ?? stats.revenue)}
          hint={`${stats.paidOrders} paid orders`}
          icon={<ShoppingBag size={16} />}
        />
        <AdminStatCard
          label="Avg order value"
          value={formatAdminCurrency(stats.averageOrderValue || 0)}
          hint="Paid orders only"
          icon={<IndianRupee size={16} />}
        />
      </div>

      <div className="admin-stat-grid admin-stat-grid-4">
        <AdminStatCard
          label="Active products"
          value={stats.products}
          hint="Visible on storefront"
          icon={<Package size={16} />}
        />
        <AdminStatCard
          label="Categories"
          value={stats.categoryCount || 0}
          hint="Catalogue taxonomy"
          icon={<FolderTree size={16} />}
        />
        <AdminStatCard
          label="Customers"
          value={stats.customers}
          hint={`${stats.newsletterSubscribers} newsletter signups`}
          icon={<Users size={16} />}
        />
        <AdminStatCard
          label="In fulfilment"
          value={stats.processingOrders}
          hint="Confirmed to shipped"
          icon={<ShoppingBag size={16} />}
          tone="warning"
        />
      </div>

      <div className="admin-stat-grid admin-stat-grid-4">
        <AdminStatCard label="Pending appointments" value={stats.pendingAppointments} icon={<CalendarDays size={16} />} />
        <AdminStatCard label="New enquiries" value={stats.newContacts} icon={<MessageSquare size={16} />} />
        <AdminStatCard label="Total orders" value={stats.orders} icon={<ShoppingBag size={16} />} />
        <AdminStatCard label="Active staff" value={stats.staffCount} icon={<Users size={16} />} />
      </div>

      <section className="admin-panel admin-panel-elevated">
        <div className="admin-panel-header">
          <div>
            <h2>Revenue last 12 months</h2>
            <p className="admin-panel-subtitle">Paid orders only · GST-inclusive totals</p>
          </div>
        </div>
        <div className="admin-revenue-chart" role="img" aria-label="Monthly revenue chart">
          {(stats.revenueMonthly || []).map((item) => {
            const height = Math.max(10, Math.round((item.revenue / maxMonthlyRevenue) * 150));
            return (
              <div key={item.key} className="admin-revenue-bar-wrap">
                <span className="admin-revenue-bar-value">
                  {item.revenue > 0 ? formatAdminCurrency(item.revenue).replace("₹", "₹") : "—"}
                </span>
                <div
                  className="admin-revenue-bar"
                  style={{ height: `${height}px` }}
                  title={`${item.label}: ${formatAdminCurrency(item.revenue)} · ${item.orders} orders`}
                />
                <span className="admin-revenue-bar-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>Quick actions</h2>
        </div>
        <div className="admin-quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="admin-quick-action">
                <span className="admin-quick-action-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Recent orders</h2>
            <Link href="/admin/orders" className="admin-inline-link">
              View all
            </Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td>
                      <Link href={`/admin/orders?order=${order.orderNumber}`}>{order.orderNumber}</Link>
                    </td>
                    <td>
                      {order.contact.firstName} {order.contact.lastName}
                    </td>
                    <td>
                      <AdminBadge status={order.status} />
                    </td>
                    <td>
                      <AdminBadge status={order.paymentStatus || "pending"} />
                    </td>
                    <td>{formatAdminCurrency(order.total)}</td>
                    <td>{formatAdminDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>New enquiries</h2>
            <Link href="/admin/contacts" className="admin-inline-link">
              View all
            </Link>
          </div>

          <div className="admin-enquiry-list">
            {stats.recentContacts.length === 0 ? (
              <p className="admin-muted">No new enquiries right now.</p>
            ) : (
              stats.recentContacts.map((contact) => (
                <article key={contact._id} className="admin-enquiry-item">
                  <div>
                    <strong>
                      {contact.firstName} {contact.lastName}
                    </strong>
                    <p className="admin-muted">{contact.email}</p>
                  </div>
                  <div className="admin-enquiry-meta">
                    <AdminBadge status={contact.status} />
                    <span className="admin-muted">{contact.subject}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
