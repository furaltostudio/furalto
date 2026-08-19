"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadGoogleAuth,
  parseGoogleCredential,
  type GoogleUserProfile,
} from "@/lib/google/loadGoogleAuth";
import {
  AccountFormDivider,
  GoogleAuthFallbackButton,
  type GoogleAuthSuccess,
} from "@/components/account/AccountAuthShared";

type GoogleAuthButtonProps = {
  mode: "signin" | "signup";
  clientId?: string;
  disabled?: boolean;
  onSuccess: (profile: GoogleAuthSuccess) => void;
  onError?: (message: string) => void;
};

export function GoogleAuthButton({
  mode,
  clientId,
  disabled = false,
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const buttonHostRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const handleProfile = (profile: GoogleUserProfile, credential?: string) => {
    onSuccessRef.current({
      name: profile.name,
      email: profile.email,
      provider: "google",
      credential,
    });
  };

  useEffect(() => {
    if (!clientId || !buttonHostRef.current) {
      setIsReady(false);
      setLoadError("");
      return;
    }

    let cancelled = false;

    loadGoogleAuth(clientId)
      .then(() => {
        if (cancelled || !buttonHostRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonHostRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) {
              onErrorRef.current?.("Google sign-in was cancelled. Please try again.");
              return;
            }

            const profile = parseGoogleCredential(response.credential);
            if (!profile) {
              onErrorRef.current?.("Could not read your Google account details. Please try again.");
              return;
            }

            handleProfile(profile, response.credential);
          },
        });

        window.google.accounts.id.renderButton(buttonHostRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "signin_with",
          width: buttonHostRef.current.offsetWidth || 320,
        });

        setLoadError("");
        setIsReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load Google sign-in. Please try again.";
          setLoadError(message);
          setIsReady(false);
          onErrorRef.current?.(message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, mode]);

  if (!clientId) {
    return (
      <p className="account-form-error" role="alert">
        Google sign-in is not configured. Add <code>GOOGLE_CLIENT_ID</code> in frontend{" "}
        <code>.env.local</code>.
      </p>
    );
  }

  return (
    <div className="account-google-auth">
      <div
        ref={buttonHostRef}
        className="account-google-button-host"
        hidden={!isReady}
        aria-label={mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
      />
      {!isReady && !loadError ? (
        <GoogleAuthFallbackButton mode={mode} disabled={disabled || !isReady} />
      ) : null}
      {loadError ? (
        <p className="account-form-error" role="alert">
          {loadError}
        </p>
      ) : null}
    </div>
  );
}

export { AccountFormDivider };
export type { GoogleAuthSuccess } from "@/components/account/AccountAuthShared";
