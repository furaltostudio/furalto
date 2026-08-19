"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getAuthErrorMessage, useAuth } from "@/providers/AuthProvider";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is invalid or missing.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified. You are now signed in.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(getAuthErrorMessage(error));
      });
  }, [token, verifyEmail]);

  return (
    <div className="account-form-panel">
      <div className="account-panel-header">
        <p className="account-panel-eyebrow">Email Verification</p>
        <h2>Confirm Your Email</h2>
      </div>

      {status === "loading" ? (
        <p className="account-form-lead">Verifying your email address...</p>
      ) : null}

      {status === "success" ? (
        <div className="account-success-card" role="status">
          <span className="account-success-icon" aria-hidden="true">
            <CheckCircle2 strokeWidth={1.5} />
          </span>
          <h3>Email verified</h3>
          <p>{message}</p>
          <Link href="/" className="account-success-link">
            Continue Shopping
          </Link>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="account-form-error-card" role="alert">
          <h3>Verification failed</h3>
          <p>{message}</p>
          <Link href="/account" className="account-success-link">
            Back to Sign In
          </Link>
        </div>
      ) : null}
    </div>
  );
}
