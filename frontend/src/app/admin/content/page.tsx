"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { CONTENT_CATALOG, CONTENT_CATALOG_BY_KEY } from "@/lib/admin/contentCatalog";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { adminService } from "@/services/admin.service";

type ContentItem = {
  key: string;
  title: string;
  type: string;
  description?: string;
  isPublished: boolean;
  updatedAt?: string;
  data?: Record<string, unknown>;
};

const GROUP_ORDER = [
  "Site-wide",
  "Homepage",
  "Pages",
  "Care & guides",
  "Collections & inspiration",
  "Showrooms & visits",
] as const;

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await adminService.getContent();
        if (!cancelled) {
          setItems(response.data.items || []);
        }
      } catch (err) {
        attempts += 1;
        // Backend may be restarting (nodemon) — retry once after a short wait.
        if (attempts < 2 && err instanceof Error && err.message === "Failed to fetch") {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (!cancelled) {
            return load();
          }
        }
        if (!cancelled) {
          setError(getAuthErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const byKey = useMemo(() => {
    return Object.fromEntries(items.map((item) => [item.key, item])) as Record<string, ContentItem>;
  }, [items]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONTENT_CATALOG.filter((entry) => {
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.path.toLowerCase().includes(q) ||
        entry.blurb.toLowerCase().includes(q) ||
        entry.key.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      entries: rows.filter((row) => row.group === group),
    })).filter((section) => section.entries.length > 0);
  }, [rows]);

  return (
    <div className="admin-page">
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-filters" style={{ marginBottom: "1.25rem" }}>
        <input
          className="admin-input"
          placeholder="Search pages (About, Shipping, Contact…)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="admin-muted">Loading website pages…</p>
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No matching pages"
          description="Try a different search, or clear the search box to see all pages."
        />
      ) : (
        grouped.map(({ group, entries }) => (
          <section key={group} className="admin-section" style={{ marginBottom: "2rem" }}>
            <h2 className="admin-section-title">{group}</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>What you can edit</th>
                    <th>Live URL</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const db = byKey[entry.key];
                    const status = db
                      ? db.isPublished
                        ? "Live"
                        : "Draft"
                      : "Needs seed";
                    return (
                      <tr key={entry.key}>
                        <td>
                          <strong>{entry.title}</strong>
                          <div className="admin-muted">{entry.key}</div>
                        </td>
                        <td>{entry.blurb}</td>
                        <td>
                          <a
                            href={entry.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-inline-link"
                          >
                            {entry.path}
                            <ExternalLink
                              size={12}
                              style={{ display: "inline", marginLeft: 4, verticalAlign: "middle" }}
                            />
                          </a>
                        </td>
                        <td>{status}</td>
                        <td>
                          <Link
                            href={`/admin/content/${encodeURIComponent(entry.key)}`}
                            className="admin-button admin-button-primary"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                          >
                            <Pencil size={14} />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      {items.some((item) => !CONTENT_CATALOG_BY_KEY[item.key]) ? (
        <section className="admin-section">
          <h2 className="admin-section-title">Other content</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <tbody>
                {items
                  .filter((item) => !CONTENT_CATALOG_BY_KEY[item.key])
                  .map((item) => (
                    <tr key={item.key}>
                      <td>
                        <strong>{item.title}</strong>
                        <div className="admin-muted">{item.key}</div>
                      </td>
                      <td>{item.description || "Custom content block"}</td>
                      <td>
                        <Link href={`/admin/content/${encodeURIComponent(item.key)}`}>Edit</Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
