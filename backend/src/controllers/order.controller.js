const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/order.service");

const initiateCheckout = asyncHandler(async (req, res) => {
  const checkout = await orderService.initiateCheckout(req.user?._id, req.body);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, checkout, "Checkout initiated")
  );
});

const verifyPayment = asyncHandler(async (req, res) => {
  const order = await orderService.verifyPayment(req.user?._id, req.body);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        email: order.contact?.email,
      },
      "Payment verified successfully. Confirmation and receipt emails are on the way."
    )
  );
});

const markPaymentFailed = asyncHandler(async (req, res) => {
  const order = await orderService.markPaymentFailed(req.user?._id, req.body);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
      },
      "Payment marked as failed"
    )
  );
});

const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const result = await orderService.handleRazorpayWebhook(req.body, signature);

  res.status(HTTP_STATUS.OK).json({ ok: true, ...result });
});

const trackOrder = asyncHandler(async (req, res) => {
  const order = await orderService.trackOrder(req.body);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { order }, "Order found"));
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { orders }, "Orders fetched"));
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderByNumber(req.user._id, req.params.orderNumber);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { order }, "Order fetched"));
});

module.exports = {
  initiateCheckout,
  verifyPayment,
  markPaymentFailed,
  razorpayWebhook,
  trackOrder,
  getOrders,
  getOrder,
};
