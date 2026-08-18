const { Router } = require("express");
const orderController = require("../controllers/order.controller");
const validate = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  checkoutLimiter,
  trackLimiter,
} = require("../middlewares/rateLimit.middleware");
const {
  checkoutValidator,
  verifyPaymentValidator,
  trackOrderValidator,
  markPaymentFailedValidator,
} = require("../validators/order.validator");

const router = Router();

router.post(
  "/track",
  trackLimiter,
  validate(trackOrderValidator),
  orderController.trackOrder
);
router.post(
  "/checkout",
  authenticate,
  checkoutLimiter,
  validate(checkoutValidator),
  orderController.initiateCheckout
);
router.post(
  "/verify-payment",
  authenticate,
  checkoutLimiter,
  validate(verifyPaymentValidator),
  orderController.verifyPayment
);
router.post(
  "/payment-failed",
  authenticate,
  checkoutLimiter,
  validate(markPaymentFailedValidator),
  orderController.markPaymentFailed
);
router.get("/", authenticate, orderController.getOrders);
router.get("/:orderNumber", authenticate, orderController.getOrder);

module.exports = router;
