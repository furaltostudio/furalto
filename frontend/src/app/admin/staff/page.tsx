"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { RequireRole } from "@/components/admin/RequireRole";
import { Button } from "@/components/ui/Button";
import { USER_ROLES } from "@/lib/auth/roles";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { adminService, type StaffInvite, type StaffMember } from "@/services/admin.service";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [staffResponse, invitesResponse] = await Promise.all([
        adminService.getStaff(),
        adminService.getStaffInvites(),
      ]);
      setStaff(staffResponse.data.staff || []);
      setInvites(invitesResponse.data.invites || []);
    } catch {
      setError("Unable to load staff data.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await adminService.inviteStaff(form);
      setForm({ email: "", firstName: "", lastName: "" });
      setMessage("Invite sent successfully.");
      await loadData();
    } catch (inviteError) {
      setError(getAuthErrorMessage(inviteError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const revokeInvite = async (id: string) => {
    setBusyInviteId(id);
    try {
      await adminService.revokeInvite(id);
      setMessage("Invite revoked.");
      await loadData();
    } catch (revokeError) {
      setError(getAuthErrorMessage(revokeError));
    } finally {
      setBusyInviteId(null);
    }
  };

  const removeStaff = async (id: string) => {
    setBusyInviteId(id);
    try {
      await adminService.deactivateStaff(id);
      await loadData();
    } catch {
      setError("Unable to remove staff access.");
    } finally {
      setBusyInviteId(null);
    }
  };

  return (
    <RequireRole roles={[USER_ROLES.ADMIN]}>
      <div className="admin-stack">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Invite staff</h2>
          </div>

          <form className="admin-form admin-form-inline" onSubmit={handleInvite}>
            <label className="admin-field">
              <span>Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>First name</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>Last name</span>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                className="admin-input"
              />
            </label>
            <Button
              type="submit"
              className="admin-button admin-button-primary"
              isLoading={isSubmitting}
              loadingText="Sending…"
            >
              Send invite
            </Button>
          </form>

          {message ? <p className="admin-success">{message}</p> : null}
          {error ? <p className="admin-error">{error}</p> : null}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Pending invites</h2>
          </div>
          <div className="admin-table-wrap">
            {invites.length === 0 ? (
              <p className="admin-muted" style={{ padding: "0.85rem 1.15rem 1.15rem" }}>
                No pending invites.
              </p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Expires</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => (
                    <tr key={invite._id}>
                      <td>{invite.email}</td>
                      <td>
                        {invite.firstName} {invite.lastName}
                      </td>
                      <td>{new Date(invite.expiresAt).toLocaleDateString("en-IN")}</td>
                      <td>
                        <Button
                          type="button"
                          className="admin-link-button"
                          isLoading={busyInviteId === invite._id}
                          loadingText="Revoking…"
                          onClick={() => void revokeInvite(invite._id)}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Team members</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      {member.firstName} {member.lastName}
                    </td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                    <td>{member.isActive ? "active" : "inactive"}</td>
                    <td>
                      {member.role === "staff" ? (
                        <Button
                          type="button"
                          className="admin-link-button"
                          isLoading={busyInviteId === member.id}
                          loadingText="Removing…"
                          onClick={() => void removeStaff(member.id)}
                        >
                          Remove access
                        </Button>
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </RequireRole>
  );
}
