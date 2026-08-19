"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin/format";
import { adminService, type AdminCustomer } from "@/services/admin.service";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (search.trim()) params.search = search.trim();

      const response = await adminService.getCustomers(params);
      setCustomers(response.data.customers);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load customers.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <div className="admin-filters">
          <input
            className="admin-input"
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          <button type="button" className="admin-button" onClick={loadCustomers}>
            Refresh
          </button>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {isLoading ? <p className="admin-muted">Loading customers...</p> : null}

        {!isLoading && customers.length === 0 ? (
          <AdminEmptyState title="No customers found" description="Try a different search term." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Orders</th>
                  <th>Total spent</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>
                        {customer.firstName} {customer.lastName}
                      </strong>
                      <p className="admin-muted">{customer.email}</p>
                    </td>
                    <td>{customer.provider}</td>
                    <td>{customer.orderCount}</td>
                    <td>{formatAdminCurrency(customer.totalSpent)}</td>
                    <td>{formatAdminDate(customer.createdAt)}</td>
                    <td>
                      <Link href={`/admin/customers/${customer.id}`} className="admin-inline-link">
                        View profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} total={total} limit={15} onPageChange={setPage} />
      </section>
    </div>
  );
}
