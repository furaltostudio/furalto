const { body, query } = require("express-validator");

const newsletterValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
];

const unsubscribeValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("token").notEmpty().withMessage("Unsubscribe token is required"),
];

const unsubscribeQueryValidator = [
  query("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  query("token").notEmpty().withMessage("Unsubscribe token is required"),
];

module.exports = {
  newsletterValidator,
  unsubscribeValidator,
  unsubscribeQueryValidator,
};
