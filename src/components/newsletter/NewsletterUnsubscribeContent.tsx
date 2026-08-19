"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { newsletterService } from "@/services/commerce.service";
import { getAuthErrorMessage } from "@/providers/AuthProvider";

export function NewsletterUnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("This unsubscribe link is invalid or incomplete.");
      return;
    }

    newsletterService
      .unsubscribe(email, token)
      .then((response) => {
        setStatus("success");
        setMessage(response.data.message || "You have been unsubscribed.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(getAuthErrorMessage(error));
      });
  }, [email, token]);

  return (
    <section className="account-page">
      <div className="container-app account-page-wrap">
        <div className="account-form-panel">
          <div className="account-panel-header">
            <p className="account-panel-eyebrow">Newsletter</p>
            <h2>Unsubscribe</h2>
          </div>

          {status === "loading" ? (
            <p className="account-form-lead">Updating your subscription preferences...</p>
          ) : null}

          {status === "success" ? (
            <div className="account-success-card" role="status">
              <h3>Unsubscribed</h3>
              <p>{message}</p>
              <Link href="/" className="account-success-link">
                Return Home
              </Link>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="account-form-error-card" role="alert">
              <h3>Could not unsubscribe</h3>
              <p>{message}</p>
              <Link href="/contact" className="account-success-link">
                Contact Support
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
