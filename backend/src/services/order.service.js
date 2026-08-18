const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const { calculateTotals } = require("../utils/pricing");
const cartService = require("./cart.service");
const paymentService = require("./payment.service");
const {
  sendPaidOrderEmails,
  sendPaymentFailedEmail,
} = require("./email.service");

const generateOrderNumber = () => {
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `FUR-${suffix}`;
};

const resolveCheckoutItems = async (items) => {
  if (!items?.length) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cart is empty");
  }

  const slugs = [...new Set(items.map((item) => item.slug))];
  const products = await Product.find({ slug: { $in: slugs }, isActive: true }).lean();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  return items.map((item) => {
    const product = productBySlug.get(item.slug);

    if (!product) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Product unavailable: ${item.slug}`);
    }

    return {
      slug: product.slug,
      name: product.name,
      price: product.price,
      image:
        product.images?.find((img) => !img.hidden)?.src ||
        product.images?.[0]?.src ||
        item.image,
      quantity: item.quantity,
      fabric: item.fabric,
      finish: item.finish,
      size: item.size,
    };
  });
};

const markOrderPaid = async (order, razorpayPaymentId) => {
  if (order.paymentStatus === "paid") {
    return { order, newlyPaid: false };
  }

  order.paymentStatus = "paid";
  order.status = "confirmed";
  if (razorpayPaymentId) {
    order.razorpayPaymentId = razorpayPaymentId;
  }
  await order.save();

  return { order, newlyPaid: true };
};

const sendPaidEmailsOnce = async (order) => {
  if (order.confirmationEmailSentAt) {
    return;
  }

  await sendPaidOrderEmails(order);
  order.confirmationEmailSentAt = new Date();
  await order.save();
};

const initiateCheckout = async (userId, { contact, items, saveAddress }) => {
  if (!userId) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Please sign in to checkout");
  }

  const pricedItems = await resolveCheckoutItems(items);
  const { subtotal, discount, shipping, total } = calculateTotals(pricedItems);
  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: userId,
    items: pricedItems,
    contact,
    subtotal,
    discount,
    shipping,
    total,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "razorpay",
    notes: saveAddress ? "Customer requested address save" : "",
  });

  const { env } = require("../config");
  const keyId = paymentService.getPublicKeyId() || "";
  // Real Razorpay by default. Mock only when PAYMENT_MOCK=true.
  const useMockPayment = Boolean(env.razorpay.mockPayments);

  if (useMockPayment) {
    const mockOrderId = `order_mock_${orderNumber}`;
    order.razorpayOrderId = mockOrderId;
    order.paymentMethod = "mock";
    await order.save();

    return {
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      razorpayOrderId: mockOrderId,
      amount: Math.round(total * 100),
      currency: "INR",
      keyId: "mock_key",
      mockPayment: true,
      mockReason: "PAYMENT_MOCK is enabled. Payment was completed without Razorpay.",
    };
  }

  const razorpayOrder = await paymentService.createRazorpayOrder({
    amount: total,
    receipt: orderNumber,
    notes: {
      orderNumber,
      email: contact.email,
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return {
    orderNumber: order.orderNumber,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId,
    mockPayment: false,
  };
};

const verifyPayment = async (
  userId,
  { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature }
) => {
  const order = await Order.findOne({
    orderNumber: orderNumber.toUpperCase(),
    razorpayOrderId,
  });

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Order not found for this payment.");
  }

  if (userId && order.user && String(order.user) !== String(userId)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "This order does not belong to your account.");
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  // Mock checkout is used for PAYMENT_MOCK or Razorpay test keys (default).
  // Accept those by order markers — not only when PAYMENT_MOCK=true.
  const isMockPayment =
    order.paymentMethod === "mock" &&
    String(razorpayOrderId).startsWith("order_mock_") &&
    String(razorpayPaymentId).startsWith("pay_mock_");

  const isValid = isMockPayment
    ? true
    : paymentService.verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

  if (!isValid) {
    order.paymentStatus = "failed";
    await order.save();
    sendPaymentFailedEmail(order).catch(() => undefined);
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Payment verification failed. Please contact support.");
  }

  const { order: paidOrder, newlyPaid } = await markOrderPaid(order, razorpayPaymentId);

  if (userId) {
    await cartService.clearCart(userId);
  }

  if (newlyPaid) {
    await sendPaidEmailsOnce(paidOrder);
    const { notifyOrderPaid } = require("./notification.service");
    notifyOrderPaid(paidOrder).catch(() => undefined);
  }

  return paidOrder;
};

const markPaymentFailed = async (userId, { orderNumber, razorpayOrderId }) => {
  const filter = {
    orderNumber: String(orderNumber || "").toUpperCase(),
  };

  if (razorpayOrderId) {
    filter.razorpayOrderId = razorpayOrderId;
  }

  const order = await Order.findOne(filter);

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Order not found.");
  }

  if (userId && order.user && String(order.user) !== String(userId)) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "This order does not belong to your account.");
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  const wasPending = order.paymentStatus === "pending";
  order.paymentStatus = "failed";
  await order.save();

  if (wasPending) {
    sendPaymentFailedEmail(order).catch(() => undefined);
  }

  return order;
};

const handleRazorpayWebhook = async (rawBody, signature) => {
  const verified = paymentService.verifyWebhookSignature(rawBody, signature);
  if (!verified) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Razorpay webhook signature.");
  }

  let payload;
  try {
    payload = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid webhook payload.");
  }

  const event = payload.event;
  const paymentEntity = payload?.payload?.payment?.entity;
  const orderEntity = payload?.payload?.order?.entity;

  const razorpayOrderId =
    paymentEntity?.order_id || orderEntity?.id || payload?.payload?.payment?.entity?.order_id;
  const razorpayPaymentId = paymentEntity?.id;

  if (!razorpayOrderId) {
    return { handled: false, reason: "No order id in webhook" };
  }

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    return { handled: false, reason: "Order not found" };
  }

  if (event === "payment.captured" || event === "order.paid") {
    const { order: paidOrder, newlyPaid } = await markOrderPaid(order, razorpayPaymentId);
    if (newlyPaid) {
      if (paidOrder.user) {
        await cartService.clearCart(paidOrder.user).catch(() => undefined);
      }
      await sendPaidEmailsOnce(paidOrder);
      const { notifyOrderPaid } = require("./notification.service");
      notifyOrderPaid(paidOrder).catch(() => undefined);
    }
    return { handled: true, orderNumber: paidOrder.orderNumber, paymentStatus: "paid" };
  }

  if (event === "payment.failed") {
    if (order.paymentStatus !== "paid") {
      const wasPending = order.paymentStatus === "pending";
      order.paymentStatus = "failed";
      await order.save();
      if (wasPending) {
        sendPaymentFailedEmail(order).catch(() => undefined);
      }
    }
    return { handled: true, orderNumber: order.orderNumber, paymentStatus: order.paymentStatus };
  }

  return { handled: false, reason: `Unhandled event ${event}` };
};

const trackOrder = async ({ orderNumber, email }) => {
  const order = await Order.findOne({
    orderNumber: orderNumber.toUpperCase(),
    "contact.email": email.toLowerCase(),
  }).lean();

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Order not found. Check your order number and email.");
  }

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    total: order.total,
    subtotal: order.subtotal,
    discount: order.discount || 0,
    shipping: order.shipping,
    items: order.items,
    contact: {
      firstName: order.contact.firstName,
      lastName: order.contact.lastName,
      email: order.contact.email,
      phone: order.contact.phone,
      address: order.contact.address,
      city: order.contact.city,
      state: order.contact.state,
      postalCode: order.contact.postalCode,
    },
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const getUserOrders = async (userId) => {
  return Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();
};

const getOrderByNumber = async (userId, orderNumber) => {
  const order = await Order.findOne({
    user: userId,
    orderNumber: orderNumber.toUpperCase(),
  }).lean();

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Order not found");
  }

  return order;
};

module.exports = {
  initiateCheckout,
  verifyPayment,
  markPaymentFailed,
  handleRazorpayWebhook,
  trackOrder,
  getUserOrders,
  getOrderByNumber,
};
