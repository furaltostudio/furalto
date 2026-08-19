"use client";

import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { getPostLoginPath, isStaffRole } from "@/lib/auth/roles";
import { AccountAuthTabs } from "@/components/account/AccountAuthTabs";
import { AccountFormField } from "@/components/account/AccountFormField";
import { AccountTrustStrip } from "@/components/account/AccountTrustStrip";
import {
  AccountFormDivider,
  GoogleAuthButton,
  type GoogleAuthSuccess,
} from "@/components/account/GoogleAuthButton";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage, useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@/types";

const initialForm = {
  email: "",
  password: "",
  rememberMe: false,
};

function resolveRedirect(role: UserRole | undefined, next: string | null) {
  if (isStaffRole(role)) {
    return getPostLoginPath(role);
  }

  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return getPostLoginPath(role);
}

export function AccountSignInForm({ googleClientId }: { googleClientId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const user = await login({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      });
      setForm(initialForm);
      router.replace(resolveRedirect(user.role, next));
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = useCallback(
    async (profile: GoogleAuthSuccess) => {
      setErrorMessage("");

      if (!profile.credential) {
        setErrorMessage("Google sign-in did not return a valid credential. Please try again.");
        return;
      }

      setIsSubmitting(true);

      try {
        const user = await loginWithGoogle(profile.credential);
        router.replace(resolveRedirect(user.role, next));
      } catch (error) {
        setErrorMessage(getAuthErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [loginWithGoogle, next, router]
  );

  const handleGoogleError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  return (
    <div className="account-form-panel">
      <AccountAuthTabs active="signin" />

      <div className="account-panel-header">
        <p className="account-panel-eyebrow">Member Access</p>
        <h1>Sign In</h1>
        <p className="account-form-lead">
          Access your orders, wishlists, and design appointments with your Furalto account.
        </p>
      </div>

      <div className="account-form-body">
        <GoogleAuthButton
          mode="signin"
          clientId={googleClientId}
          disabled={isSubmitting}
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <AccountFormDivider label="or continue with email" />

        <form className="account-form" onSubmit={handleSubmit}>
          <AccountFormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
          />

          <AccountFormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={Lock}
          />

          <div className="account-form-meta">
            <label className="account-form-checkbox account-form-checkbox-inline">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <Link href="/account/forgot-password" className="account-forgot-link">
              Forgot password?
            </Link>
          </div>

          {errorMessage ? (
            <p className="account-form-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            className="account-form-submit"
            isLoading={isSubmitting}
            loadingText="Signing In…"
          >
            Sign In
          </Button>
        </form>

        <AccountTrustStrip />
      </div>

      <p className="account-note">
        New to Furalto? <Link href="/account/signup">Create an account</Link>
      </p>
    </div>
  );
}
