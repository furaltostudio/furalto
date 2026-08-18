const rateLimit = require("express-rate-limit");

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: message || "Too many requests. Please try again shortly.",
    },
  });

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

const authStrictLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many password reset attempts. Please try again later.",
});

const checkoutLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many checkout attempts. Please try again shortly.",
});

const trackLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many track-order lookups. Please try again shortly.",
});

const formLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: "Too many submissions. Please try again later.",
});

/** Live configurator polls often — keep generous, separate from quote submissions. */
const estimateLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 90,
  message: "Too many estimate requests. Please wait a moment.",
});

/** Studio AI chat — conversational, slightly tighter than estimate polling. */
const chatLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many Studio AI messages. Please wait a moment.",
});

const newsletterLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many newsletter requests. Please try again later.",
});

module.exports = {
  authLimiter,
  authStrictLimiter,
  checkoutLimiter,
  trackLimiter,
  formLimiter,
  estimateLimiter,
  chatLimiter,
  newsletterLimiter,
};
