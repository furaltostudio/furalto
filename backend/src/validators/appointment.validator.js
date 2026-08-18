const { body } = require("express-validator");

const appointmentValidator = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("appointmentType")
    .isIn(["in-showroom", "virtual", "trade", "swatches"])
    .withMessage("Invalid appointment type"),
  body("showroom")
    .isIn(["virtual", "mumbai", "delhi", "bengaluru"])
    .withMessage("Invalid showroom"),
  body("preferredDate").isISO8601().withMessage("Valid preferred date is required"),
  body("preferredTime")
    .isIn(["morning", "afternoon", "evening"])
    .withMessage("Invalid preferred time"),
  body("interest")
    .isIn(["living", "bedroom", "dining", "outdoor", "office", "full-home"])
    .withMessage("Invalid interest"),
  body("message").optional().trim().isLength({ max: 2000 }),
];

module.exports = {
  appointmentValidator,
};
