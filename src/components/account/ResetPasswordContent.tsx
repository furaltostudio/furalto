"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { AccountFormField } from "@/components/account/AccountFormField";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage, useAuth } from "@/providers/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { authService } from "@/services/auth.service";
import { getPostLoginPath } from "@/lib/auth/roles";

export function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { refreshUser } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Reset link is invalid or missing.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.resetPassword(token, password);
      apiClient.setAccessToken(response.data.accessToken);
      await refreshUser();
      router.replace(getPostLoginPath(response.data.user.role));
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="account-form-panel">
        <div className="account-panel-header">
          <p className="account-panel-eyebrow">Account Recovery</p>
          <h2>Reset Password</h2>
        </div>
        <div className="account-form-error-card" role="alert">
          <h3>Invalid reset link</h3>
          <p>This password reset link is missing a token. Request a new link to continue.</p>
          <Link href="/account/forgot-password" className="account-success-link">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-form-panel">
      <div className="account-panel-header">
        <p className="account-panel-eyebrow">Account Recovery</p>
        <h2>Choose a New Password</h2>
        <p className="account-form-lead">
          Create a new password for your Furalto account. You will be signed in after saving.
        </p>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        <AccountFormField
          label="New password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrorMessage("");
          }}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          icon={Lock}
        />
        <AccountFormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrorMessage("");
          }}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          icon={Lock}
        />

        {errorMessage ? (
          <p className="account-form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          className="account-form-submit"
          isLoading={isSubmitting}
          loadingText="Saving…"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}
