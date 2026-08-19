"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Package,
  ShoppingBag,
  Store,
  Users,
  UserCog,
  FileText,
  X,
  ExternalLink,
  Images,
} from "lucide-react";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { useAuth } from "@/providers/AuthProvider";
import { ADMIN_NAV, getAdminPageMeta } from "@/lib/admin/navigation";

const NAV_ICONS: Record<string, typeof LayoutDashboard> = {
  "/admin": LayoutDashboard,
  "/admin/content": FileText,
  "/admin/inspirations": Images,
  "/admin/products": Package,
  "/admin/categories": FolderTree,
  "/admin/orders": ShoppingBag,
  "/admin/customers": Users,
  "/admin/appointments": CalendarDays,
  "/admin/contacts": MessageSquare,
  "/admin/custom-quotes": Mail,
  "/admin/newsletter": Newspaper,
  "/admin/staff": UserCog,
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageMeta = getAdminPageMeta(pathname);

  const sections = useMemo(() => {
    const visible = ADMIN_NAV.filter((item) => hasRole(...item.roles));

    return visible.reduce<Array<{ section: string; items: typeof visible }>>((groups, item) => {
      const key = item.section || "General";
      const existing = groups.find((group) => group.section === key);

      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ section: key, items: [item] });
      }

      return groups;
    }, []);
  }, [hasRole]);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || "A";

  return (
    <div className="admin-shell">
      <aside className={mobileOpen ? "admin-sidebar is-open" : "admin-sidebar"}>
        <div className="admin-sidebar-brand">
          <Link href="/admin" onClick={() => setMobileOpen(false)} className="admin-sidebar-brand-link">
            <span className="admin-sidebar-brand-mark">F</span>
            <span className="admin-sidebar-brand-copy">
              <strong>Furalto</strong>
              <em>Studio Console</em>
            </span>
          </Link>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {sections.map(({ section, items }) => (
            <div key={section} className="admin-nav-section">
              <p className="admin-nav-section-label">{section}</p>
              {items.map((item) => {
                const Icon = NAV_ICONS[item.href] || LayoutDashboard;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={isActive(item.href) ? "admin-nav-link is-active" : "admin-nav-link"}
                  >
                    <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <span className="admin-user-avatar" aria-hidden="true">
              {initials}
            </span>
            <div className="admin-user-meta">
              <p className="admin-user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="admin-user-role">{user?.role}</p>
            </div>
          </div>
          <div className="admin-sidebar-actions">
            <Link href="/" className="admin-footer-link" onClick={() => setMobileOpen(false)} title="View store">
              <Store size={14} />
              <span>Store</span>
            </Link>
            <Link href="/account" className="admin-footer-link" onClick={() => setMobileOpen(false)} title="Customer account">
              <Users size={14} />
              <span>Account</span>
            </Link>
            <button type="button" className="admin-footer-link" onClick={() => logout()} title="Sign out">
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <button
              type="button"
              className="admin-mobile-toggle"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <p className="admin-eyebrow">Furalto Studio</p>
              <h1 className="admin-title">{pageMeta.title}</h1>
              <p className="admin-topbar-description">{pageMeta.description}</p>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <AdminNotifications />
            <Link href="/" className="admin-store-link">
              <ExternalLink size={14} />
              View store
            </Link>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
