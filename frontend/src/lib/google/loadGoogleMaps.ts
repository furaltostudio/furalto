let loaderPromise: Promise<void> | null = null;

export function getGoogleMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

export function loadGoogleMapsPlaces(): Promise<void> {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const scriptId = "google-maps-places-script";
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Failed to load Google Maps.")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps."));
      document.head.appendChild(script);
    });
  }

  return loaderPromise;
}
