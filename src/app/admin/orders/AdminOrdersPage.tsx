"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Button } from "@/components/ui/Button";
import { formatAdminCurrency } from "@/lib/admin/format";
import { adminService, type AdminAssignee, type AdminOrder } from "@/services/admin.service";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [assignees, setAssignees] = useState<AdminAssignee[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    status: "",
    paymentStatus: "",
    internalNotes: "",
    assignedTo: "",
  });

  useEffect(() => {
    adminService
      .getAssignees()
      .then((response) => setAssignees(response.data.assignees))
      .catch(() => {
        // Assignee list is optional for rendering the page.
      });
  }, []);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const response = await adminService.getOrders(params);
      setOrders(response.data.orders);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const orderNumber = searchParams.get("order");
    if (!orderNumber) {
      return;
    }

    adminService
      .getOrder(orderNumber)
      .then((response) => {
        setSelectedOrder(response.data.order);
        setForm({
          status: response.data.order.status,
          paymentStatus: response.data.order.paymentStatus,
          internalNotes: response.data.order.internalNotes || "",
          assignedTo: response.data.order.assignedTo?._id || "",
        });
      })
      .catch(() => setError("Unable to load selected order."));
  }, [searchParams]);

  const openOrder = async (orderNumber: string) => {
    try {
      const response = await adminService.getOrder(orderNumber);
      setSelectedOrder(response.data.order);
      setForm({
        status: response.data.order.status,
        paymentStatus: response.data.order.paymentStatus,
        internalNotes: response.data.order.internalNotes || "",
        assignedTo: response.data.order.assignedTo?._id || "",
      });
    } catch {
      setError("Unable to load order details.");
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedOrder) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await adminService.updateOrder(selectedOrder.orderNumber, {
        ...form,
        assignedTo: form.assignedTo || null,
      });
      setSelectedOrder(response.data.order);
      await loadOrders();
    } catch {
      setError("Unable to update order.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-stack">
      <div className={selectedOrder ? "admin-orders-layout has-detail" : "admin-orders-layout"}>
        <section className="admin-panel">
        <div className="admin-filters">
          <input
            type="search"
            placeholder="Search order or customer"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="admin-input"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            className="admin-select"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="button" className="admin-button" onClick={loadOrders}>
            Refresh
          </button>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}
        {isLoading ? <p className="admin-muted">Loading orders...</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Assignee</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>
                    {order.contact.firstName} {order.contact.lastName}
                    <p className="admin-muted">{order.contact.email}</p>
                  </td>
                  <td>
                    <AdminBadge status={order.status} />
                  </td>
                  <td>{order.paymentStatus}</td>
                  <td>{formatAdminCurrency(order.total)}</td>
                  <td>
                    {order.assignedTo
                      ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}`
                      : "—"}
                  </td>
                  <td>
                    <button type="button" className="admin-link-button" onClick={() => openOrder(order.orderNumber)}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminPagination page={page} total={total} limit={15} onPageChange={setPage} />
      </section>

      {selectedOrder ? (
        <section className="admin-panel admin-order-detail">
          <div className="admin-panel-header">
            <h2>{selectedOrder.orderNumber}</h2>
            <button type="button" className="admin-link-button" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>

          <div className="admin-detail-grid">
            <div>
              <p className="admin-label">Customer</p>
              <p>
                {selectedOrder.contact.firstName} {selectedOrder.contact.lastName}
              </p>
              <p>{selectedOrder.contact.email}</p>
              <p>{selectedOrder.contact.phone}</p>
            </div>
            <div>
              <p className="admin-label">Shipping</p>
              <p>{selectedOrder.contact.address}</p>
              <p>
                {selectedOrder.contact.city}, {selectedOrder.contact.postalCode}
              </p>
            </div>
          </div>

          <ul className="admin-order-items">
            {selectedOrder.items.map((item) => (
              <li key={`${item.slug}-${item.name}`}>
                <span>
                  {item.name}
                  {item.fabric ? ` · ${item.fabric}` : ""}
                </span>
                <span>
                  {item.quantity} × {formatAdminCurrency(item.price)}
                </span>
              </li>
            ))}
          </ul>

          <form className="admin-form" onSubmit={handleSave}>
            <label className="admin-field">
              <span>Assigned to</span>
              <select
                value={form.assignedTo}
                onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
                className="admin-select"
              >
                <option value="">Unassigned</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.firstName} {assignee.lastName} ({assignee.role})
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Order status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="admin-select"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Payment status</span>
              <select
                value={form.paymentStatus}
                onChange={(event) =>
                  setForm((current) => ({ ...current, paymentStatus: event.target.value }))
                }
                className="admin-select"
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field admin-field-full">
              <span>Internal notes</span>
              <textarea
                rows={4}
                value={form.internalNotes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, internalNotes: event.target.value }))
                }
                className="admin-textarea"
                placeholder="Notes visible only to staff"
              />
            </label>

            <Button
              type="submit"
              className="admin-button admin-button-primary"
              isLoading={isSaving}
              loadingText="Saving…"
            >
              Save changes
            </Button>
          </form>
        </section>
      ) : null}
      </div>
    </div>
  );
}
