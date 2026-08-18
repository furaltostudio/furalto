const crypto = require("crypto");
const Razorpay = require("razorpay");
const { env } = require("../config");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

let razorpayClient;
let razorpayClientKeyId;

/** Same pattern as feeorbit-backend/utils/razorpayClient.js */
const getRazorpayClient = () => {
  const keyId = env.razorpay.keyId;
  const keySecret = env.razorpay.keySecret;

  if (!keyId || !keySecret) {
    throw new ApiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "Payment gateway is not configured. Add Razorpay credentials to the server environment."
    );
  }

  if (!razorpayClient || razorpayClientKeyId !== keyId) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    razorpayClientKeyId = keyId;
  }

  return razorpayClient;
};

const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  const client = getRazorpayClient();
  const amountPaise = Math.round(Number(amount) * 100);

  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Amount must be at least ₹1 (100 paise).");
  }

  try {
    // Match feeorbit-backend/routes/subscriptionRoutes.js order create
    return await client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: String(receipt).slice(0, 40),
      payment_capture: 1,
      notes,
    });
  } catch (error) {
    const description =
      error?.error?.description ||
      error?.error?.reason ||
      error?.message ||
      "Unable to create payment order";

    const amountInr = Math.round(amount);
    const statusCode = Number(error?.statusCode);

    if (statusCode === 401) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Razorpay authentication failed. Check API keys.");
    }

    const friendly =
      /maximum amount/i.test(description) && amountInr > 500000
        ? `This order is ₹${amountInr.toLocaleString("en-IN")}. Razorpay currently allows up to ₹5,00,000 per payment on this account. Please contact us for high-value orders, or check out items under ₹5,00,000.`
        : `Payment gateway error: ${description}`;

    throw new ApiError(
      statusCode && statusCode < 500 ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR,
      friendly
    );
  }
};

const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!env.razorpay.keySecret) {
    throw new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, "Payment gateway is not configured.");
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Missing payment verification fields.");
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(payload)
    .digest("hex");

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(String(razorpaySignature));

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
};

const verifyWebhookSignature = (rawBody, signature) => {
  const secret = env.razorpay.webhookSecret;
  if (!secret) {
    throw new ApiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "Razorpay webhook secret is not configured."
    );
  }

  if (!signature) {
    return false;
  }

  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ""), "utf8");
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(String(signature));

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
};

const createRefund = async ({ paymentId, amount, notes = {} }) => {
  if (!paymentId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Payment id is required to process a refund.");
  }

  if (String(paymentId).startsWith("pay_mock_")) {
    return {
      id: `rfnd_mock_${Date.now()}`,
      payment_id: paymentId,
      amount: amount ? Math.round(Number(amount) * 100) : undefined,
      status: "processed",
      mock: true,
    };
  }

  const client = getRazorpayClient();
  const payload = {
    notes,
  };

  if (amount != null) {
    payload.amount = Math.round(Number(amount) * 100);
  }

  try {
    return await client.payments.refund(paymentId, payload);
  } catch (error) {
    const description =
      error?.error?.description ||
      error?.error?.reason ||
      error?.message ||
      "Unable to process refund";

    throw new ApiError(
      Number(error?.statusCode) === 400 ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.BAD_GATEWAY,
      `Refund failed: ${description}`
    );
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createRefund,
  getPublicKeyId: () => env.razorpay.keyId,
};
