const { body } = require("express-validator");

const contactValidator = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").optional().trim(),
  body("subject")
    .isIn(["general", "order", "product", "delivery", "trade", "other"])
    .withMessage("Invalid subject"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

module.exports = {
  contactValidator,
};
