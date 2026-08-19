export const GST_RATE = 0.18;
export const SHIPPING_FEE = 2500;

/** @deprecated Promo disabled — kept for older order displays */
export const PROMO_THRESHOLD = 200000;
/** @deprecated Promo disabled — kept for older order displays */
export const PROMO_PERCENT = 20;

export type CheckoutTotals = {
  /** Cart line total (GST-inclusive catalogue prices). */
  subtotal: number;
  /** Taxable value extracted from inclusive subtotal. */
  taxableValue: number;
  /** GST portion at 18% (included in subtotal). */
  gst: number;
  discount: number;
  shipping: number;
  total: number;
};

/** Break a GST-inclusive amount into taxable value + tax. */
export function breakdownGstInclusive(grossAmount: number) {
  const gross = Number(grossAmount) || 0;
  const taxableValue = Math.round((gross / (1 + GST_RATE)) * 100) / 100;
  const gst = Math.round((gross - taxableValue) * 100) / 100;

  return { taxableValue, gst };
}

export function calculateCheckoutTotals(subtotal: number): CheckoutTotals {
  const discount = 0;
  const shipping = SHIPPING_FEE;
  const { taxableValue, gst } = breakdownGstInclusive(subtotal);
  const total = Math.max(0, subtotal - discount + shipping);

  return { subtotal, taxableValue, gst, discount, shipping, total };
}
