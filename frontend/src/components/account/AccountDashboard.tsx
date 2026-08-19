"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  LogOut,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { isStaffRole } from "@/lib/auth/roles";
import { formatInrPrice } from "@/lib/products/format";
import { orderService } from "@/services/commerce.service";
import type { AuthUser } from "@/types";
import type { UserOrderSummary } from "@/types/order";

const quickLinks = [
  {
    href: "/track-order",
    label: "Track Order",
    description: "Follow deliveries and order status",
    icon: Package,
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    description: "View saved pieces and room edits",
    icon: Heart,
  },
  {
    href: "/appointments",
    label: "Appointments",
    description: "Book or manage design consultations",
    icon: CalendarDays,
  },
] as const;

function getDisplayName(user: AuthUser) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}

function getInitials(user: AuthUser) {
  const first = user.firstName?.charAt(0) ?? "";
  const last = user.lastName?.charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();

  if (initials) {
    return initials;
  }

  return user.email.charAt(0).toUpperCase();
}

function formatMemberSince(value?: string) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function AccountProfileAvatar({ user, displayName }: { user: AuthUser; displayName: string }) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(user.avatar) && !imageError;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={displayName}
        width={80}
        height={80}
        className="account-dashboard-avatar"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <span className="account-dashboard-avatar account-dashboard-avatar-fallback" aria-hidden="true">
      {getInitials(user)}
    </span>
  );
}

export function AccountDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<UserOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let active = true;

    orderService
      .list()
      .then((response) => {
        if (!active) return;
        setOrders(response.data.orders || []);
      })
      .catch(() => {
        if (!active) return;
        setOrdersError("Unable to load your orders right now.");
      })
      .finally(() => {
        if (!active) return;
        setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(user);
  const providerLabel = user.provider === "google" ? "Google account" : "Email account";

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <div className="account-form-panel account-dashboard-panel">
      <div className="account-panel-header account-dashboard-header">
        <p className="account-panel-eyebrow">Account Overview</p>
        <h2>Welcome back, {user.firstName || displayName.split(" ")[0]}</h2>
        <p className="account-form-lead">
          Manage your profile, orders, and design appointments from one place.
        </p>
      </div>

      <section className="account-dashboard-profile" aria-label="Profile summary">
        <AccountProfileAvatar user={user} displayName={displayName} />

        <div className="account-dashboard-profile-copy">
          <h3>{displayName}</h3>
          <p className="account-dashboard-email">{user.email}</p>
          <div className="account-dashboard-badges">
            <span className="account-dashboard-badge">{providerLabel}</span>
            {user.isEmailVerified ? (
              <span className="account-dashboard-badge account-dashboard-badge-verified">
                <ShieldCheck strokeWidth={1.5} aria-hidden="true" />
                Verified
              </span>
            ) : (
              <span className="account-dashboard-badge account-dashboard-badge-pending">Email pending</span>
            )}
            {isStaffRole(user.role) ? (
              <span className="account-dashboard-badge account-dashboard-badge-verified">{user.role}</span>
            ) : null}
          </div>
        </div>
      </section>

      {isStaffRole(user.role) ? (
        <section className="account-dashboard-admin-banner" aria-label="Admin console">
          <div className="account-dashboard-admin-banner-copy">
            <p className="account-dashboard-admin-banner-eyebrow">Staff access</p>
            <h3>Open the operations console</h3>
            <p>
              You are signed in as {user.role}. Manage orders, catalogue, and studio enquiries —
              or keep using this account to shop the storefront.
            </p>
          </div>
          <Link href="/admin" className="account-dashboard-admin-banner-cta">
            Go to Admin
            <ArrowRight strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      <section className="account-dashboard-section" aria-label="Order history">
        <div className="account-dashboard-section-head">
          <h3>Your Orders</h3>
          <p>Recent purchases linked to this account.</p>
        </div>

        {ordersLoading ? <p className="account-form-lead">Loading orders...</p> : null}

        {ordersError ? (
          <p className="account-form-error" role="alert">
            {ordersError}
          </p>
        ) : null}

        {!ordersLoading && !ordersError && orders.length === 0 ? (
          <div className="account-dashboard-orders-empty">
            <p>No orders yet. When you place an order, it will appear here.</p>
            <Link href="/collections" className="account-dashboard-continue">
              Browse Collections
            </Link>
          </div>
        ) : null}

        {orders.length > 0 ? (
          <ul className="account-dashboard-orders">
            {orders.map((order) => (
              <li key={order._id || order.orderNumber} className="account-dashboard-order">
                <div className="account-dashboard-order-main">
                  <h4>{order.orderNumber}</h4>
                  <p>
                    {formatOrderDate(order.createdAt)} · {order.items?.length || 0} item
                    {(order.items?.length || 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="account-dashboard-order-meta">
                  <span>{formatLabel(order.status)}</span>
                  <span>{formatLabel(order.paymentStatus)}</span>
                  <strong>{formatInrPrice(order.total)}</strong>
                </div>
                <Link
                  href={`/track-order?orderNumber=${encodeURIComponent(
                    order.orderNumber
                  )}&email=${encodeURIComponent(user.email)}`}
                  className="account-dashboard-order-link"
                >
                  Track
                  <ArrowRight strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="account-dashboard-section" aria-label="Quick actions">
        <div className="account-dashboard-section-head">
          <h3>Quick Actions</h3>
          <p>Jump to the parts of your account you use most.</p>
        </div>

        <div className="account-dashboard-actions-grid">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="account-dashboard-action-card">
                <span className="account-dashboard-action-icon" aria-hidden="true">
                  <Icon strokeWidth={1.5} />
                </span>
                <div className="account-dashboard-action-copy">
                  <h4>{item.label}</h4>
                  <p>{item.description}</p>
                </div>
                <ArrowRight className="account-dashboard-action-arrow" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="account-dashboard-section" aria-label="Profile details">
        <div className="account-dashboard-section-head">
          <h3>Profile Details</h3>
          <p>Your account information on file with Furalto.</p>
        </div>

        <div className="account-dashboard-details-grid">
          <div className="account-dashboard-detail">
            <span className="account-dashboard-detail-label">
              <User strokeWidth={1.5} aria-hidden="true" />
              Full name
            </span>
            <span className="account-dashboard-detail-value">{displayName}</span>
          </div>
          <div className="account-dashboard-detail">
            <span className="account-dashboard-detail-label">
              <Mail strokeWidth={1.5} aria-hidden="true" />
              Email
            </span>
            <span className="account-dashboard-detail-value">{user.email}</span>
          </div>
          <div className="account-dashboard-detail">
            <span className="account-dashboard-detail-label">
              <Phone strokeWidth={1.5} aria-hidden="true" />
              Phone
            </span>
            <span className="account-dashboard-detail-value">{user.phone || "Not added"}</span>
          </div>
          <div className="account-dashboard-detail">
            <span className="account-dashboard-detail-label">
              <CalendarDays strokeWidth={1.5} aria-hidden="true" />
              Member since
            </span>
            <span className="account-dashboard-detail-value">{formatMemberSince(user.createdAt)}</span>
          </div>
        </div>
      </section>

      <div className="account-dashboard-footer">
        {isStaffRole(user.role) ? (
          <Link href="/admin" className="account-dashboard-continue">
            Open Admin Console
          </Link>
        ) : (
          <Link href="/" className="account-dashboard-continue">
            Continue Shopping
          </Link>
        )}
        <button type="button" className="account-dashboard-signout" onClick={handleLogout}>
          <LogOut strokeWidth={1.5} aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
