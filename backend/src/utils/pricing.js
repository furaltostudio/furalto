const SHIPPING_FEE = 2500;
const GST_RATE = 0.18;

/** Promo disabled for now — constants kept for reference / older orders. */
const PROMO_THRESHOLD = 200000;
const PROMO_PERCENT = 20;

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const shipping = SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shipping);

  return { subtotal, discount, shipping, total };
};

/** Break GST-inclusive total into taxable value + tax (18%). */
const breakdownGstInclusive = (grossAmount) => {
  const gross = Number(grossAmount) || 0;
  const taxableValue = Math.round((gross / (1 + GST_RATE)) * 100) / 100;
  const gstAmount = Math.round((gross - taxableValue) * 100) / 100;
  const half = Math.round((gstAmount / 2) * 100) / 100;

  return {
    taxableValue,
    gstAmount,
    cgst: half,
    sgst: Math.round((gstAmount - half) * 100) / 100,
    igst: gstAmount,
    rate: GST_RATE,
  };
};

module.exports = {
  PROMO_THRESHOLD,
  PROMO_PERCENT,
  SHIPPING_FEE,
  GST_RATE,
  calculateTotals,
  breakdownGstInclusive,
};
