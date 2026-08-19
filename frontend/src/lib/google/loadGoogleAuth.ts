let googleAuthPromise: Promise<void> | null = null;

export function loadGoogleAuth(clientId: string): Promise<void> {
  if (!clientId) {
    return Promise.reject(new Error("Google Client ID is not configured."));
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Auth can only load in the browser."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleAuthPromise) {
    return googleAuthPromise;
  }

  googleAuthPromise = new Promise((resolve, reject) => {
    const scriptId = "google-auth-script";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Auth.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Auth."));
    document.head.appendChild(script);
  });

  return googleAuthPromise;
}

export type GoogleUserProfile = {
  name: string;
  email: string;
};

export function parseGoogleCredential(credential: string): GoogleUserProfile | null {
  try {
    const payload = credential.split(".")[1];
    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { name?: string; email?: string };

    if (!decoded.email) {
      return null;
    }

    return {
      name: decoded.name ?? decoded.email,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}
