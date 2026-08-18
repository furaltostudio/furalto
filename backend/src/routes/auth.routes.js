const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { authLimiter, authStrictLimiter } = require("../middlewares/rateLimit.middleware");
const {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  googleAuthValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  acceptInviteValidator,
} = require("../validators/auth.validator");

const router = Router();

router.post("/register", authLimiter, validate(registerValidator), authController.register);
router.post("/login", authLimiter, validate(loginValidator), authController.login);
router.post("/google", authLimiter, validate(googleAuthValidator), authController.googleLogin);
router.post("/verify-email", authLimiter, validate(verifyEmailValidator), authController.verifyEmail);
router.post(
  "/resend-verification",
  authStrictLimiter,
  validate(resendVerificationValidator),
  authController.resendVerification
);
router.post(
  "/forgot-password",
  authStrictLimiter,
  validate(forgotPasswordValidator),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authStrictLimiter,
  validate(resetPasswordValidator),
  authController.resetPassword
);
router.get("/invite/:token", authLimiter, authController.getInvite);
router.post(
  "/accept-invite",
  authLimiter,
  validate(acceptInviteValidator),
  authController.acceptInvite
);
router.post("/refresh", authLimiter, authController.refreshToken);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
