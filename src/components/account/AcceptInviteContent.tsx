"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPostLoginPath } from "@/lib/auth/roles";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage, useAuth } from "@/providers/AuthProvider";
import { inviteService } from "@/services/admin.service";
import { apiClient } from "@/lib/api/client";

export function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { refreshUser } = useAuth();

  const [invite, setInvite] = useState<{ email: string; firstName: string; lastName: string } | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invite link is invalid.");
      return;
    }

    inviteService
      .getInvite(token)
      .then((response) => {
        setInvite(response.data.invite);
        setForm((current) => ({
          ...current,
          firstName: response.data.invite.firstName || "",
          lastName: response.data.invite.lastName || "",
        }));
      })
      .catch(() => setError("This invite link is invalid or has expired."));
  }, [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await inviteService.acceptInvite({
        token,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });

      apiClient.setAccessToken(response.data.accessToken);
      await refreshUser();
      router.replace(getPostLoginPath(response.data.user.role));
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="account-page">
      <div className="account-form-panel">
        <p className="account-eyebrow">Team invitation</p>
        <h1 className="account-title">Activate your staff account</h1>

        {invite ? (
          <p className="account-lead">
            You are joining Furalto operations as <strong>{invite.email}</strong>.
          </p>
        ) : null}

        {error ? <p className="account-error">{error}</p> : null}

        {invite ? (
          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-field">
              <span>First name</span>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              />
            </label>
            <label className="account-field">
              <span>Last name</span>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              />
            </label>
            <label className="account-field">
              <span>Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            <label className="account-field">
              <span>Confirm password</span>
              <input
                type="password"
                required
                minLength={8}
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              />
            </label>
            <Button
              type="submit"
              className="account-submit"
              isLoading={isSubmitting}
              loadingText="Activating…"
            >
              Activate account
            </Button>
          </form>
        ) : (
          <p className="account-muted">
            Need help? <Link href="/contact">Contact support</Link>
          </p>
        )}
      </div>
    </section>
  );
}
