"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { formatAdminCurrency, formatAdminDateTime } from "@/lib/admin/format";
import { adminService } from "@/services/admin.service";

const QUOTE_STATUSES = ["new", "contacted", "quoted", "closed"] as const;

type QuoteRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  message?: string;
  status: string;
  createdAt: string;
  configuration: {
    pieceLabel: string;
    woodLabel: string;
    fabricLabel: string;
    finishLabel: string;
    sizeLabel: string;
  };
  estimate: {
    amount: number;
    currency: string;
  };
  advice?: string;
};

export default function AdminCustomQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), limit: "10" };
      if (statusFilter) params.status = statusFilter;

      const response = await adminService.getCustomQuotes(params);
      setQuotes(response.data.quotes as QuoteRow[]);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load custom quotes.");
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await adminService.updateCustomQuote(id, { status });
      await loadQuotes();
    } catch {
      setError("Unable to update quote status.");
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
            {QUOTE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-contact-list">
          {quotes.map((quote) => (
            <article key={quote._id} className="admin-contact-card">
              <div className="admin-contact-card-header">
                <div>
                  <h3>
                    {quote.firstName} {quote.lastName}
                  </h3>
                  <p className="admin-muted">
                    {quote.email} · {quote.phone}
                    {quote.city ? ` · ${quote.city}` : ""}
                  </p>
                </div>
                <AdminBadge status={quote.status} />
              </div>

              <p className="admin-label">
                {quote.configuration.pieceLabel} ·{" "}
                {formatAdminCurrency(quote.estimate.amount)}
              </p>
              <p>
                {quote.configuration.woodLabel} · {quote.configuration.fabricLabel} ·{" "}
                {quote.configuration.finishLabel} · {quote.configuration.sizeLabel}
              </p>
              {quote.message ? <p>{quote.message}</p> : null}
              {quote.advice ? (
                <p className="admin-muted">
                  <strong>AI note:</strong> {quote.advice}
                </p>
              ) : null}

              <div className="admin-contact-card-footer">
                <p className="admin-muted">{formatAdminDateTime(quote.createdAt)}</p>
                <select
                  value={quote.status}
                  onChange={(event) => updateStatus(quote._id, event.target.value)}
                  className={`admin-select${busyId === quote._id ? " is-loading" : ""}`}
                  disabled={busyId === quote._id}
                  aria-busy={busyId === quote._id || undefined}
                >
                  {QUOTE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>

        <AdminPagination
          page={page}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
