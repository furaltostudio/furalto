"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { formatInrPrice } from "@/lib/products/format";
import { calculateCheckoutTotals, SHIPPING_FEE } from "@/lib/checkout/pricing";

const FALLBACK_IMAGE = "/home/furnitures_five.jpeg";

export function CartPageContent() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { taxableValue, gst } = calculateCheckoutTotals(subtotal);
  const itemLabel = items.length === 1 ? "1 piece" : `${items.length} pieces`;

  if (items.length === 0) {
    return (
      <section className="cart-empty">
        <div className="container-app py-16 sm:py-24">
          <p className="cart-kicker">Your selection</p>
          <h1 className="cart-empty-title">Your cart is empty</h1>
          <p className="cart-empty-copy">
            Explore our collections and add pieces to compose a refined room.
          </p>
          <div className="cart-empty-actions">
            <Link href="/collections/sofas" className="cart-empty-cta">
              Shop Sofas
            </Link>
            <Link href="/collections/beds" className="cart-empty-secondary">
              Shop Beds
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="container-app py-10 sm:py-14">
        <header className="cart-page-header">
          <div>
            <p className="cart-kicker">Your selection</p>
            <h1 className="cart-page-title">Shopping Cart</h1>
            <p className="cart-page-count">{itemLabel}</p>
          </div>
          <Link href="/collections" className="cart-header-link">
            Continue shopping
          </Link>
        </header>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article key={item.id} className="cart-item">
                <Link href={`/products/${item.slug}`} className="cart-item-image-wrap">
                  <Image
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    width={240}
                    height={300}
                    unoptimized
                    className="cart-item-image"
                  />
                </Link>

                <div className="cart-item-content">
                  <div className="cart-item-header">
                    <div>
                      <Link href={`/products/${item.slug}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <div className="cart-item-options">
                        {item.fabric ? <span>{item.fabric}</span> : null}
                        {item.finish ? <span>{item.finish}</span> : null}
                        {item.size ? <span>{item.size}</span> : null}
                      </div>
                    </div>
                    <p className="cart-item-price">{formatInrPrice(item.price * item.quantity)}</p>
                  </div>

                  <div className="cart-item-meta">
                    <p className="cart-item-unit">{formatInrPrice(item.price)} each</p>
                    <div className="cart-item-actions">
                      <div className="cart-qty" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus strokeWidth={1.5} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus strokeWidth={1.5} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 strokeWidth={1.5} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <p className="cart-summary-kicker">Order summary</p>
            <h2>Ready to checkout</h2>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal (excl. GST)</span>
                <span>{formatInrPrice(taxableValue)}</span>
              </div>
              <div className="cart-summary-row">
                <span>GST (18%)</span>
                <span>{formatInrPrice(gst)}</span>
              </div>
              <div className="cart-summary-row">
                <span>White glove delivery</span>
                <span>From {formatInrPrice(SHIPPING_FEE)}</span>
              </div>
              <div className="cart-summary-total">
                <span>Estimated total</span>
                <span>{formatInrPrice(subtotal)}</span>
              </div>
            </div>
            <p className="cart-summary-note">
              Prices include 18% GST. Delivery is confirmed at checkout.
            </p>
            <Link href="/checkout" className="cart-summary-cta">
              Proceed to Checkout
            </Link>
            <Link href="/collections" className="cart-summary-link">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
