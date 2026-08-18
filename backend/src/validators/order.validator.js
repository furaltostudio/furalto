const { body } = require("express-validator");
const { INDIA_STATES } = require("../constants/india-states");

const contactFields = [
  body("contact.email").isEmail().withMessage("Valid email is required"),
  body("contact.phone").notEmpty().withMessage("Phone is required"),
  body("contact.firstName").notEmpty().withMessage("First name is required"),
  body("contact.lastName").notEmpty().withMessage("Last name is required"),
  body("contact.address").notEmpty().withMessage("Address is required"),
  body("contact.city").notEmpty().withMessage("City is required"),
  body("contact.state")
    .notEmpty()
    .withMessage("State is required")
    .isIn(INDIA_STATES)
    .withMessage("Select a valid Indian state or union territory"),
  body("contact.postalCode")
    .matches(/^\d{6}$/)
    .withMessage("Postal code must be a valid 6-digit Indian PIN"),
];

const itemFields = [
  body("items").isArray({ min: 1 }).withMessage("Order must include at least one item"),
  body("items.*.slug").notEmpty(),
  body("items.*.name").notEmpty(),
  body("items.*.price").isNumeric(),
  body("items.*.quantity").isInt({ min: 1 }),
];

const checkoutValidator = [...contactFields, ...itemFields, body("saveAddress").optional().isBoolean()];

const verifyPaymentValidator = [
  body("orderNumber").notEmpty().withMessage("Order number is required"),
  body("razorpayOrderId").notEmpty().withMessage("Razorpay order id is required"),
  body("razorpayPaymentId").notEmpty().withMessage("Razorpay payment id is required"),
  body("razorpaySignature").notEmpty().withMessage("Razorpay signature is required"),
];

const trackOrderValidator = [
  body("orderNumber").notEmpty().withMessage("Order number is required"),
  body("email").isEmail().withMessage("Valid email is required"),
];

const markPaymentFailedValidator = [
  body("orderNumber").notEmpty().withMessage("Order number is required"),
  body("razorpayOrderId").optional().isString(),
];

module.exports = {
  checkoutValidator,
  verifyPaymentValidator,
  trackOrderValidator,
  markPaymentFailedValidator,
};
