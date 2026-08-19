"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { formatAdminDate } from "@/lib/admin/format";
import { adminService } from "@/services/admin.service";

const APPOINTMENT_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

type AppointmentRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentType: string;
  showroom: string;
  preferredDate: string;
  preferredTime: string;
  interest: string;
  message?: string;
  status: string;
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), limit: "12" };
      if (statusFilter) params.status = statusFilter;

      const response = await adminService.getAppointments(params);
      setAppointments(response.data.appointments as AppointmentRow[]);
      setTotal(response.data.total);
    } catch {
      setError("Unable to load appointments.");
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await adminService.updateAppointment(id, { status });
      await loadAppointments();
    } catch {
      setError("Unable to update appointment.");
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
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-appointment-grid">
          {appointments.map((appointment) => (
            <article key={appointment._id} className="admin-appointment-card">
              <div className="admin-appointment-card-head">
                <div>
                  <h3>
                    {appointment.firstName} {appointment.lastName}
                  </h3>
                  <p className="admin-muted">
                    {appointment.email} · {appointment.phone}
                  </p>
                </div>
                <AdminBadge status={appointment.status} />
              </div>

              <div className="admin-detail-grid">
                <div>
                  <p className="admin-label">Type</p>
                  <p>{appointment.appointmentType}</p>
                </div>
                <div>
                  <p className="admin-label">Showroom</p>
                  <p>{appointment.showroom}</p>
                </div>
                <div>
                  <p className="admin-label">Preferred slot</p>
                  <p>
                    {formatAdminDate(appointment.preferredDate)} · {appointment.preferredTime}
                  </p>
                </div>
                <div>
                  <p className="admin-label">Interest</p>
                  <p>{appointment.interest}</p>
                </div>
              </div>

              {appointment.message ? <p className="admin-appointment-message">{appointment.message}</p> : null}

              <label className="admin-field">
                <span>Update status</span>
                <select
                  value={appointment.status}
                  onChange={(event) => updateStatus(appointment._id, event.target.value)}
                  className={`admin-select${busyId === appointment._id ? " is-loading" : ""}`}
                  disabled={busyId === appointment._id}
                  aria-busy={busyId === appointment._id || undefined}
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          ))}
        </div>

        <AdminPagination page={page} total={total} limit={12} onPageChange={setPage} />
      </section>
    </div>
  );
}
