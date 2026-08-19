export type CheckoutAddress = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

const STORAGE_KEY = "furalto-checkout-address";

export const emptyCheckoutAddress = (): CheckoutAddress => ({
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
});

export function readSavedCheckoutAddress(): CheckoutAddress | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<CheckoutAddress>;
    return {
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      firstName: parsed.firstName ?? "",
      lastName: parsed.lastName ?? "",
      address: parsed.address ?? "",
      city: parsed.city ?? "",
      state: parsed.state ?? "",
      postalCode: parsed.postalCode ?? "",
    };
  } catch {
    return null;
  }
}

export function saveCheckoutAddress(address: CheckoutAddress): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
}

export function hasSavedCheckoutAddress(): boolean {
  const saved = readSavedCheckoutAddress();
  if (!saved) {
    return false;
  }

  return Boolean(
    saved.firstName &&
      saved.lastName &&
      saved.address &&
      saved.city &&
      saved.state &&
      saved.postalCode
  );
}
