"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { AccountFormField } from "@/components/account/AccountFormField";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";

export function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await authService.forgotPassword(email);
      setSuccessMessage(
        response.data.message ||
          "If an account exists for this email, a reset link has been sent."
      );
      setEmail("");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="account-form-panel">
      <div className="account-panel-header">
        <p className="account-panel-eyebrow">Account Recovery</p>
        <h2>Forgot Password</h2>
        <p className="account-form-lead">
          Enter your account email and we will send a secure reset link if a matching
          local account exists.
        </p>
      </div>

      {successMessage ? (
        <div className="account-success-card" role="status">
          <h3>Check your inbox</h3>
          <p>{successMessage}</p>
          <Link href="/account" className="account-success-link">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form className="account-form" onSubmit={handleSubmit}>
          <AccountFormField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrorMessage("");
            }}
            required
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
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
            loadingText="Sending…"
          >
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="account-note">
        Remembered your password? <Link href="/account">Sign in</Link>
      </p>
    </div>
  );
}
