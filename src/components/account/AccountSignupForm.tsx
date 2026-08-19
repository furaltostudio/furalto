"use client";

import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { CheckCircle2, Lock, Mail, Phone, User } from "lucide-react";
import { AccountAuthTabs } from "@/components/account/AccountAuthTabs";
import { AccountFormField, AccountFormSection } from "@/components/account/AccountFormField";
import { AccountTrustStrip } from "@/components/account/AccountTrustStrip";
import {
  AccountFormDivider,
  GoogleAuthButton,
  type GoogleAuthSuccess,
} from "@/components/account/GoogleAuthButton";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage, useAuth } from "@/providers/AuthProvider";
import { businessContact } from "@/config/contact";

type FormStatus = "idle" | "submitting" | "success" | "error";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function AccountSignupForm({ googleClientId }: { googleClientId?: string }) {
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [googleUser, setGoogleUser] = useState<GoogleAuthSuccess | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
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

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match. Please check and try again.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    setGoogleUser(null);

    try {
      const message = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        acceptTerms: form.acceptTerms,
      });
      setSuccessMessage(message);
      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  const handleGoogleSuccess = useCallback(
    async (profile: GoogleAuthSuccess) => {
      setErrorMessage("");

      if (!profile.credential) {
        setErrorMessage("Google sign-up did not return a valid credential. Please try again.");
        return;
      }

      setStatus("submitting");

      try {
        await loginWithGoogle(profile.credential);
        setGoogleUser(profile);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(getAuthErrorMessage(error));
      }
    },
    [loginWithGoogle]
  );

  const handleGoogleError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  return (
    <div className="account-form-panel account-form-panel-signup">
      <AccountAuthTabs active="signup" />

      <div className="account-panel-header">
        <p className="account-panel-eyebrow">New Member</p>
        <h1>Create Account</h1>
        <p className="account-form-lead">
          Join Furalto to save favorites, track orders, and book design appointments with ease.
        </p>
      </div>

      {status === "success" ? (
        <div className="account-success-card" role="status">
          <span className="account-success-icon" aria-hidden="true">
            <CheckCircle2 strokeWidth={1.5} />
          </span>
          <h3>Account created{googleUser ? ` for ${googleUser.name}` : ""}</h3>
          <p>
            {googleUser
              ? `Welcome to Furalto. Your Google account (${googleUser.email}) is connected.`
              : successMessage ||
                "Welcome to Furalto. Please verify your email, then sign in to access your account."}
          </p>
          <Link href="/account" className="account-success-link">
            Go to My Account
          </Link>
        </div>
      ) : (
        <div className="account-form-body">
          <GoogleAuthButton
            mode="signup"
            clientId={googleClientId}
            disabled={status === "submitting"}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          <AccountFormDivider label="or register with email" />

          <form className="account-form" onSubmit={handleSubmit}>
            <AccountFormSection title="Personal Details">
              <div className="account-form-grid">
                <AccountFormField
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  placeholder="First name"
                  icon={User}
                />
                <AccountFormField
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  placeholder="Last name"
                  icon={User}
                />
              </div>

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
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder={businessContact.phone}
                icon={Phone}
                hint="Optional — used for appointment confirmations"
              />
            </AccountFormSection>

            <AccountFormSection title="Account Security">
              <div className="account-form-grid">
                <AccountFormField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  icon={Lock}
                />
                <AccountFormField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  icon={Lock}
                />
              </div>
            </AccountFormSection>

            <label className="account-form-checkbox">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the{" "}
                <Link href="/terms">Terms of Use</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </span>
            </label>

            {errorMessage ? (
              <p className="account-form-error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              className="account-form-submit"
              isLoading={status === "submitting"}
              loadingText="Creating Account…"
            >
              Create Account
            </Button>
          </form>

          <AccountTrustStrip />
        </div>
      )}

      <p className="account-note">
        Already have an account? <Link href="/account">Sign in</Link>
      </p>
    </div>
  );
}
