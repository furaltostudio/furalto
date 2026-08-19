"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/providers/CartProvider";
import { businessContact } from "@/config/contact";
import { INDIA_STATES, INDIAN_PIN_REGEX } from "@/config/india-states";
import { formatInrPrice } from "@/lib/products/format";
import {
  emptyCheckoutAddress,
  saveCheckoutAddress,
  type CheckoutAddress,
} from "@/lib/checkout/address";
import { calculateCheckoutTotals } from "@/lib/checkout/pricing";
import { orderService } from "@/services/commerce.service";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { loadRazorpay } from "@/lib/razorpay/loadRazorpay";

export function CheckoutPageContent() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutAddress>(emptyCheckoutAddress);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const { taxableValue, gst, shipping, total } = calculateCheckoutTotals(subtotal);

  if (items.length === 0) {
    return (
      <section className="checkout-empty">
        <div className="container-app py-16 sm:py-24">
          <h1 className="checkout-empty-title">No items to checkout</h1>
          <p className="checkout-empty-copy">Add products to your cart before proceeding to checkout.</p>
          <Link href="/collections" className="checkout-empty-cta">
            Browse Collections
          </Link>
        </div>
      </section>
    );
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

    if (name === "saveAddress" && type === "checkbox") {
      setSaveAddress(nextValue as boolean);
      return;
    }

    setForm((current) => ({ ...current, [name]: nextValue }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    if (!form.state) {
      setSubmitError("Please select your state.");
      setIsSubmitting(false);
      return;
    }

    if (!INDIAN_PIN_REGEX.test(form.postalCode.trim())) {
      setSubmitError("Enter a valid 6-digit Indian PIN code.");
      setIsSubmitting(false);
      return;
    }

    if (saveAddress) {
      saveCheckoutAddress({
        email: form.email,
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
      });
    }

    try {
      const checkoutResponse = await orderService.initiateCheckout({
        contact: {
          email: form.email,
          phone: form.phone,
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
        },
        items,
        saveAddress,
      });

      const checkout = checkoutResponse.data;

      // Dev / Razorpay test: high-value carts exceed test-account max amount
      if (checkout.mockPayment) {
        await orderService.verifyPayment({
          orderNumber: checkout.orderNumber,
          razorpayOrderId: checkout.razorpayOrderId,
          razorpayPaymentId: `pay_mock_${checkout.orderNumber}`,
          razorpaySignature: "mock_signature",
        });

        clearCart().catch(() => undefined);
        router.push(
          `/track-order?orderNumber=${checkout.orderNumber}&email=${encodeURIComponent(form.email)}&paid=1`
        );
        return;
      }

      const razorpayReady = await loadRazorpay();

      if (!razorpayReady || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Please refresh and try again.");
      }

      const isTestKey = String(checkout.keyId || "").startsWith("rzp_test_");

      // This Razorpay test account rejects card BINs as international (400).
      // Prefer netbanking in test; hide cards/EMI.
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency || "INR",
        name: "Furalto",
        description: `Order ${checkout.orderNumber}`,
        order_id: checkout.razorpayOrderId,
        recurring: false,
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          contact: form.phone,
          ...(isTestKey ? { method: "netbanking" } : {}),
        },
        theme: {
          color: "#8b5a2b",
        },
        ...(isTestKey
          ? {
              config: {
                display: {
                  blocks: {
                    banks: {
                      name: "Pay via Netbanking (recommended in test)",
                      instruments: [{ method: "netbanking" }],
                    },
                  },
                  hide: [{ method: "card" }, { method: "emi" }],
                  sequence: ["block.banks"],
                  preferences: {
                    show_default_blocks: true,
                  },
                },
              },
            }
          : {}),
        handler: async (response) => {
          try {
            await orderService.verifyPayment({
              orderNumber: checkout.orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart().catch(() => undefined);
            router.push(
              `/track-order?orderNumber=${checkout.orderNumber}&email=${encodeURIComponent(form.email)}&paid=1`
            );
          } catch (error) {
            setSubmitError(getAuthErrorMessage(error));
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        const reason = response.error.reason || "";
        const description = response.error.description || "";

        orderService
          .markPaymentFailed({
            orderNumber: checkout.orderNumber,
            razorpayOrderId: checkout.razorpayOrderId,
          })
          .catch(() => undefined);

        if (
          reason === "international_transaction_not_allowed" ||
          /international cards/i.test(description)
        ) {
          setSubmitError(
            "This card is treated as international, and international cards are not enabled on this Razorpay account. Try Netbanking → any bank → Success."
          );
        } else if (/maximum amount/i.test(description)) {
          setSubmitError(
            "Razorpay rejected this amount (account max limit). Reduce the cart total or raise the limit in your Razorpay dashboard, then try again."
          );
        } else {
          setSubmitError(description || "Payment failed. Please try again.");
        }

        setIsSubmitting(false);
      });

      razorpay.open();
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <section className="checkout-page">
      <div className="container-app py-10 sm:py-14">
        <h1 className="checkout-page-title">Checkout</h1>

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={handleSubmit}
            autoComplete="on"
          >
            <div className="checkout-panel">
              <h2>Contact</h2>
              <div className="checkout-fields">
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder={businessContact.phone}
                    autoComplete="tel"
                  />
                </label>
              </div>
            </div>

            <div className="checkout-panel">
              <h2>Delivery</h2>

              <div className="checkout-fields">
                <label>
                  <span>First Name</span>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="shipping given-name"
                  />
                </label>
                <label>
                  <span>Last Name</span>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="shipping family-name"
                  />
                </label>
                <label className="checkout-field-full">
                  <span>Address</span>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="House / flat, street, locality"
                    autoComplete="shipping street-address"
                  />
                </label>
                <label>
                  <span>City</span>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    autoComplete="shipping address-level2"
                  />
                </label>
                <label>
                  <span>State</span>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    autoComplete="shipping address-level1"
                  >
                    <option value="">Select state</option>
                    {INDIA_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>PIN Code</span>
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    autoComplete="shipping postal-code"
                    placeholder="6-digit PIN"
                  />
                </label>
              </div>

              <label className="checkout-save-address">
                <input
                  type="checkbox"
                  name="saveAddress"
                  checked={saveAddress}
                  onChange={handleChange}
                />
                <span>Save address for future orders</span>
              </label>
            </div>

            <div className="checkout-panel">
              <h2>Payment</h2>
              <div className="checkout-payment-info">
                <span className="checkout-payment-icon" aria-hidden="true">
                  <CreditCard strokeWidth={1.5} />
                </span>
                <div>
                  <p className="checkout-payment-title">Secure payment via Razorpay</p>
                  <p className="checkout-payment-copy">
                    You’ll complete payment securely through Razorpay. Cards, UPI, and netbanking
                    are supported.
                  </p>
                </div>
              </div>
            </div>

            {submitError ? (
              <p className="account-form-error" role="alert">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="checkout-submit"
              isLoading={isSubmitting}
              loadingText="Opening Payment…"
            >
              Pay {formatInrPrice(total)}
            </Button>
          </form>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            <ul className="checkout-items">
              {items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatInrPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="checkout-summary-row">
              <span>Subtotal (excl. GST)</span>
              <span>{formatInrPrice(taxableValue)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>GST (18%)</span>
              <span>{formatInrPrice(gst)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>White Glove Delivery</span>
              <span>{formatInrPrice(shipping)}</span>
            </div>
            <div className="checkout-summary-total">
              <span>Total (incl. GST)</span>
              <span>{formatInrPrice(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
