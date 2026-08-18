const { body } = require("express-validator");

const registerValidator = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").optional().trim().isLength({ max: 20 }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("acceptTerms")
    .custom((value) => value === true)
    .withMessage("You must accept the terms and conditions"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const verifyEmailValidator = [body("token").notEmpty().withMessage("Verification token is required")];

const resendVerificationValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
];

const googleAuthValidator = [
  body("credential").notEmpty().withMessage("Google credential is required"),
];

const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
];

const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

const acceptInviteValidator = [
  body("token").notEmpty().withMessage("Invite token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName").optional().trim().isLength({ max: 60 }),
  body("lastName").optional().trim().isLength({ max: 60 }),
];

module.exports = {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  googleAuthValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  acceptInviteValidator,
};
