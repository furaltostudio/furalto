"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Button } from "@/components/ui/Button";
import { formatAdminDate } from "@/lib/admin/format";
import { adminService, type NewsletterSubscriber } from "@/services/admin.service";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadSubscribers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await adminService.getNewsletter({ page: String(page), limit: "20" });
      setSubscribers(response.data.subscribers);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load newsletter subscribers.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const toggleSubscriber = async (subscriber: NewsletterSubscriber) => {
    setBusyId(subscriber._id);
    try {
      await adminService.updateNewsletterSubscriber(subscriber._id, !subscriber.isActive);
      await loadSubscribers();
    } catch {
      setError("Unable to update subscriber.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        {error ? <p className="admin-error">{error}</p> : null}
        {isLoading ? <p className="admin-muted">Loading subscribers...</p> : null}

        {!isLoading && subscribers.length === 0 ? (
          <AdminEmptyState title="No subscribers yet" description="New signups from the footer will appear here." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td>{subscriber.email}</td>
                    <td>{subscriber.source}</td>
                    <td>
                      <AdminBadge status={subscriber.isActive ? "active" : "inactive"} />
                    </td>
                    <td>{formatAdminDate(subscriber.createdAt)}</td>
                    <td>
                      <Button
                        type="button"
                        className="admin-link-button"
                        isLoading={busyId === subscriber._id}
                        loadingText={subscriber.isActive ? "Updating…" : "Updating…"}
                        onClick={() => void toggleSubscriber(subscriber)}
                      >
                        {subscriber.isActive ? "Unsubscribe" : "Reactivate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} total={total} limit={20} onPageChange={setPage} />
      </section>
    </div>
  );
}
