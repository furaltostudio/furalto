"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatAdminCurrency, formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import { adminService } from "@/services/admin.service";

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Awaited<ReturnType<typeof adminService.getCustomer>>["data"] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getCustomer(params.id)
      .then((response) => setData(response.data))
      .catch(() => setError("Unable to load customer profile."));
  }, [params.id]);

  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  if (!data) {
    return <p className="admin-muted">Loading customer profile...</p>;
  }

  const { customer, orders, appointments } = data;

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={customer.email}
        actions={
          <Link href="/admin/customers" className="admin-button">
            Back to customers
          </Link>
        }
      />

      <div className="admin-detail-layout">
        <section className="admin-panel">
          <h3 className="admin-section-title">Profile</h3>
          <div className="admin-detail-grid">
            <div>
              <p className="admin-label">Phone</p>
              <p>{customer.phone || "Not added"}</p>
            </div>
            <div>
              <p className="admin-label">Provider</p>
              <p>{customer.provider}</p>
            </div>
            <div>
              <p className="admin-label">Joined</p>
              <p>{formatAdminDate(customer.createdAt)}</p>
            </div>
            <div>
              <p className="admin-label">Last login</p>
              <p>{customer.lastLoginAt ? formatAdminDateTime(customer.lastLoginAt) : "Never"}</p>
            </div>
          </div>
          <div className="admin-badge-row">
            <AdminBadge status={customer.isEmailVerified ? "verified" : "pending"} />
            <AdminBadge status={customer.isActive ? "active" : "inactive"} />
          </div>
        </section>

        <section className="admin-panel">
          <h3 className="admin-section-title">Orders</h3>
          {orders.length === 0 ? (
            <p className="admin-muted">No orders yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td>
                        <Link href={`/admin/orders?order=${order.orderNumber}`}>{order.orderNumber}</Link>
                      </td>
                      <td>
                        <AdminBadge status={order.status} />
                      </td>
                      <td>{order.paymentStatus}</td>
                      <td>{formatAdminCurrency(order.total)}</td>
                      <td>{formatAdminDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-panel">
          <h3 className="admin-section-title">Appointments</h3>
          {appointments.length === 0 ? (
            <p className="admin-muted">No appointments booked.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Showroom</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={String(appointment._id)}>
                      <td>{String(appointment.appointmentType)}</td>
                      <td>{String(appointment.showroom)}</td>
                      <td>{formatAdminDate(String(appointment.preferredDate))}</td>
                      <td>
                        <AdminBadge status={String(appointment.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
