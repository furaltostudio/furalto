"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, PackageSearch } from "lucide-react";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { Reveal } from "@/components/ui/Reveal";
import { categoryImages } from "@/config/images";
import { orderService } from "@/services/commerce.service";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { formatInrPrice } from "@/lib/products/format";
import type { OrderStatus, PaymentStatus, TrackedOrder } from "@/types/order";

const STATUS_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function formatStatusLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getActiveStepIndex(status: OrderStatus) {
  if (status === "cancelled") {
    return -1;
  }

  const index = STATUS_STEPS.findIndex((step) => step.key === status);
  return index >= 0 ? index : 0;
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const className =
    status === "paid"
      ? "track-payment-badge track-payment-badge-paid"
      : status === "failed"
        ? "track-payment-badge track-payment-badge-failed"
        : "track-payment-badge track-payment-badge-pending";

  return <span className={className}>{formatStatusLabel(status)}</span>;
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="track-order-cancelled" role="status">
        This order was cancelled.
      </p>
    );
  }

  const activeIndex = getActiveStepIndex(status);

  return (
    <ol className="track-order-timeline">
      {STATUS_STEPS.map((step, index) => {
        const isReached = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <li
            key={step.key}
            className={`track-order-step${isReached ? " is-complete" : ""}${isCurrent ? " is-current" : ""}`}
          >
            <span className="track-order-step-icon" aria-hidden="true">
              {isReached ? <CheckCircle2 strokeWidth={1.5} /> : <Circle strokeWidth={1.5} />}
            </span>
            <span className="track-order-step-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetails({
  order,
  onReset,
  showPaidBanner = false,
}: {
  order: TrackedOrder;
  onReset: () => void;
  showPaidBanner?: boolean;
}) {
  return (
    <div className="track-order-result">
      {showPaidBanner || order.paymentStatus === "paid" ? (
        <div className="track-order-paid-banner" role="status">
          <p>
            {showPaidBanner
              ? "Payment successful. Your order is confirmed."
              : "This order is paid and confirmed."}
          </p>
          <span>
            A confirmation and billing receipt have been sent to {order.contact.email}.
          </span>
        </div>
      ) : null}

      <div className="track-order-result-header">
        <span className="utility-success-icon" aria-hidden="true">
          <PackageSearch strokeWidth={1.5} />
        </span>
        <div>
          <h3>Order {order.orderNumber}</h3>
          <p>
            Placed on {formatOrderDate(order.createdAt)} · Delivery to {order.contact.city}
          </p>
        </div>
      </div>

      <div className="track-order-meta">
        <div>
          <span>Order Status</span>
          <strong>{formatStatusLabel(order.status)}</strong>
        </div>
        <div>
          <span>Payment</span>
          <PaymentBadge status={order.paymentStatus} />
        </div>
        <div>
          <span>Total</span>
          <strong>{formatInrPrice(order.total)}</strong>
        </div>
      </div>

      <OrderTimeline status={order.status} />

      <div className="track-order-section">
        <h4>Items</h4>
        <ul className="track-order-items">
          {order.items.map((item) => (
            <li key={`${item.slug}-${item.fabric ?? ""}-${item.finish ?? ""}-${item.size ?? ""}`}>
              <div className="track-order-item-media">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={72}
                  height={72}
                  className="track-order-item-image"
                />
              </div>
              <div className="track-order-item-copy">
                <p>{item.name}</p>
                <span>
                  Qty {item.quantity}
                  {item.fabric ? ` · ${item.fabric}` : ""}
                  {item.finish ? ` · ${item.finish}` : ""}
                  {item.size ? ` · ${item.size}` : ""}
                </span>
              </div>
              <strong>{formatInrPrice(item.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="track-order-section track-order-totals">
        <div>
          <span>Subtotal</span>
          <span>{formatInrPrice(order.subtotal)}</span>
        </div>
        {order.discount ? (
          <div>
            <span>Promo discount</span>
            <span>−{formatInrPrice(order.discount)}</span>
          </div>
        ) : null}
        <div>
          <span>White Glove Delivery</span>
          <span>{order.shipping === 0 ? "Complimentary" : formatInrPrice(order.shipping)}</span>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatInrPrice(order.total)}</strong>
        </div>
      </div>

      <div className="track-order-section">
        <h4>Delivery Address</h4>
        <p className="track-order-address">
          {order.contact.firstName} {order.contact.lastName}
          <br />
          {order.contact.address}
          <br />
          {order.contact.city}
          {order.contact.state ? `, ${order.contact.state}` : ""}, {order.contact.postalCode}
          <br />
          {order.contact.phone}
        </p>
      </div>

      <button type="button" className="utility-success-reset" onClick={onReset}>
        Track Another Order
      </button>
    </div>
  );
}

export function TrackOrderPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [orderSummary, setOrderSummary] = useState<TrackedOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState({
    orderNumber: searchParams.get("orderNumber") ?? "",
    email: searchParams.get("email") ?? "",
  });

  const fetchOrder = useCallback(async (orderNumber: string, email: string) => {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await orderService.track(orderNumber, email);
      setOrderSummary(response.data.order);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(getAuthErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");

    if (orderNumber && email) {
      setFormValues({ orderNumber, email });
      void fetchOrder(orderNumber, email);
    }
  }, [fetchOrder, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const orderNumber = String(formData.get("orderNumber") || "");
    const email = String(formData.get("email") || "");

    setFormValues({ orderNumber, email });
    await fetchOrder(orderNumber, email);
  };

  return (
    <>
      <PageHeroWithImage
        eyebrow="Orders"
        title="Track Your Order"
        description="Enter your order number and email to view delivery status and scheduling."
        image={categoryImages.outdoor}
        className="utility-hero"
      />

      <section className="track-page">
        <div className="container-app utility-page-inner">
          <Reveal className="utility-layout">
            <div className="utility-form-panel">
              <p className="utility-panel-eyebrow">Order Status</p>
              <h2>Track Delivery</h2>
              <p className="utility-panel-lead">
                Use the details from your confirmation email to check white-glove delivery progress.
              </p>

              {status === "success" && orderSummary ? (
                <OrderDetails
                  order={orderSummary}
                  showPaidBanner={searchParams.get("paid") === "1"}
                  onReset={() => {
                    setStatus("idle");
                    setOrderSummary(null);
                    setErrorMessage("");
                    setFormValues({ orderNumber: "", email: "" });
                  }}
                />
              ) : (
                <form className="track-form" onSubmit={handleSubmit}>
                  <label>
                    <span>Order Number</span>
                    <input
                      type="text"
                      name="orderNumber"
                      required
                      placeholder="FUR-123456"
                      value={formValues.orderNumber}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, orderNumber: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={formValues.email}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </label>
                  {errorMessage ? (
                    <p className="account-form-error" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}
                  <button type="submit" className="utility-form-submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Checking..." : "Track Order"}
                  </button>
                </form>
              )}
            </div>

            <aside className="utility-aside">
              <div className="utility-aside-media">
                <Image
                  src={categoryImages.outdoor.src}
                  alt="Furniture delivery and outdoor collection"
                  width={categoryImages.outdoor.width}
                  height={categoryImages.outdoor.height}
                  className="utility-aside-image"
                />
              </div>
              <h3>White-Glove Delivery</h3>
              <p>In-room placement, careful handling, and packaging removal included on qualifying orders.</p>
              <Link href="/shipping">Shipping information</Link>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
