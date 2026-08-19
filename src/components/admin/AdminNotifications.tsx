"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Mail,
  MessageSquare,
  Newspaper,
  ShoppingBag,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { siteConfig } from "@/config/site";
import { apiClient } from "@/lib/api/client";
import {
  adminService,
  type AdminNotification,
} from "@/services/admin.service";
import styles from "./AdminNotifications.module.css";

const TYPE_META: Record<
  AdminNotification["type"],
  { label: string; Icon: typeof Bell }
> = {
  order: { label: "Order", Icon: ShoppingBag },
  appointment: { label: "Appointment", Icon: CalendarDays },
  contact: { label: "Enquiry", Icon: MessageSquare },
  custom_quote: { label: "Custom quote", Icon: Mail },
  newsletter: { label: "Newsletter", Icon: Newspaper },
};

function formatRelativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "Just now";
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.round(seconds / 86400)}d ago`;

  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function AdminNotifications() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [live, setLive] = useState(false);

  const mergeNotification = useCallback((incoming: AdminNotification) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === incoming.id)) return prev;
      return [incoming, ...prev].slice(0, 40);
    });
    if (!incoming.isRead) {
      setUnreadCount((count) => count + 1);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await adminService.getNotifications();
      setItems(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch {
      // Keep prior list if refresh fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      let token = apiClient.getAccessToken();
      if (!token) {
        await apiClient.refreshAccessToken();
        token = apiClient.getAccessToken();
      }
      if (!token || cancelled) return;

      const socket = io(siteConfig.apiUrl, {
        path: "/socket.io",
        auth: { token },
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1500,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        if (!cancelled) setLive(true);
      });

      socket.on("disconnect", () => {
        if (!cancelled) setLive(false);
      });

      socket.on("connect_error", async () => {
        if (cancelled) return;
        setLive(false);
        const refreshed = await apiClient.refreshAccessToken();
        if (refreshed) {
          socket.auth = { token: apiClient.getAccessToken() };
          socket.connect();
        }
      });

      socket.on("admin:notification", (payload: AdminNotification) => {
        if (!cancelled && payload?.id) {
          mergeNotification({ ...payload, isRead: false });
        }
      });
    };

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [mergeNotification]);

  const placePanel = useCallback(() => {
    const trigger = rootRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(384, window.innerWidth - 24);
    let left = rect.right - width;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const top = Math.min(rect.bottom + 10, window.innerHeight - 120);

    setPanelStyle({
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    placePanel();
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);
    return () => {
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
    };
  }, [open, placePanel]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleOpen = (notification: AdminNotification) => {
    setOpen(false);
    if (!notification.isRead) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      adminService.markNotificationRead(notification.id).catch(() => undefined);
    }
    router.push(notification.href);
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await adminService.markAllNotificationsRead();
    } catch {
      loadNotifications();
    }
  };

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            className={styles.panel}
            style={panelStyle}
            role="dialog"
            aria-label="Admin notifications"
          >
            <div className={styles.head}>
              <div>
                <p className={styles.kicker}>Live desk</p>
                <h2 className={styles.title}>Notifications</h2>
              </div>
              <div className={styles.headMeta}>
                <span className={`${styles.live}${live ? ` ${styles.liveOn}` : ""}`}>
                  {live ? "Live" : "Offline"}
                </span>
                {unreadCount > 0 ? (
                  <button type="button" className={styles.clear} onClick={handleMarkAll}>
                    Mark all read
                  </button>
                ) : null}
              </div>
            </div>

            <div className={styles.list}>
              {isLoading ? (
                <p className={styles.empty}>Loading…</p>
              ) : items.length === 0 ? (
                <p className={styles.empty}>No notifications yet.</p>
              ) : (
                items.map((item) => {
                  const meta = TYPE_META[item.type] || TYPE_META.contact;
                  const Icon = meta.Icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.item}${item.isRead ? "" : ` ${styles.itemUnread}`}`}
                      onClick={() => handleOpen(item)}
                    >
                      <span className={styles.icon} aria-hidden="true">
                        <Icon size={15} />
                      </span>
                      <span className={styles.copy}>
                        <span className={styles.itemTop}>
                          <span className={styles.type}>{meta.label}</span>
                          <time dateTime={item.createdAt}>
                            {formatRelativeTime(item.createdAt)}
                          </time>
                        </span>
                        <strong>{item.title}</strong>
                        <span className={styles.message}>{item.message}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className={styles.foot}>
              <Link href="/admin/orders" onClick={() => setOpen(false)}>
                Orders
              </Link>
              <Link href="/admin/appointments" onClick={() => setOpen(false)}>
                Appointments
              </Link>
              <Link href="/admin/contacts" onClick={() => setOpen(false)}>
                Enquiries
              </Link>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger}${open ? ` ${styles.triggerOpen}` : ""}`}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={16} strokeWidth={1.75} />
        {unreadCount > 0 ? <span className={styles.badge}>{badgeLabel}</span> : null}
      </button>
      {panel}
    </div>
  );
}
