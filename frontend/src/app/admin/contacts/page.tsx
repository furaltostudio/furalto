"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { formatAdminDateTime } from "@/lib/admin/format";
import { adminService } from "@/services/admin.service";

const CONTACT_STATUSES = ["new", "in_progress", "resolved"] as const;

type ContactRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (statusFilter) params.status = statusFilter;

      const response = await adminService.getContacts(params);
      setContacts(response.data.contacts as ContactRow[]);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load contact messages.");
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await adminService.updateContact(id, { status });
      await loadContacts();
    } catch {
      setError("Unable to update contact message.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <div className="admin-filters">
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            className="admin-select"
          >
            <option value="">All statuses</option>
            {CONTACT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-contact-list">
          {contacts.map((contact) => (
            <article key={contact._id} className="admin-contact-card">
              <div className="admin-contact-card-header">
                <div>
                  <h3>
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <p className="admin-muted">
                    {contact.email}
                    {contact.phone ? ` · ${contact.phone}` : ""}
                  </p>
                </div>
                <AdminBadge status={contact.status} />
              </div>
              <p className="admin-label">{contact.subject}</p>
              <p>{contact.message}</p>
              <div className="admin-contact-card-footer">
                <p className="admin-muted">{formatAdminDateTime(contact.createdAt)}</p>
                <select
                  value={contact.status}
                  onChange={(event) => updateStatus(contact._id, event.target.value)}
                  className={`admin-select${busyId === contact._id ? " is-loading" : ""}`}
                  disabled={busyId === contact._id}
                  aria-busy={busyId === contact._id || undefined}
                >
                  {CONTACT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>

        <AdminPagination page={page} total={total} limit={10} onPageChange={setPage} />
      </section>
    </div>
  );
}
