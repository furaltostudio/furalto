const { Router } = require("express");
const newsletterController = require("../controllers/newsletter.controller");
const validate = require("../middlewares/validate.middleware");
const { newsletterLimiter } = require("../middlewares/rateLimit.middleware");
const {
  newsletterValidator,
  unsubscribeValidator,
} = require("../validators/newsletter.validator");

const router = Router();

router.post(
  "/subscribe",
  newsletterLimiter,
  validate(newsletterValidator),
  newsletterController.subscribe
);
router.post(
  "/unsubscribe",
  newsletterLimiter,
  validate(unsubscribeValidator),
  newsletterController.unsubscribe
);
router.get("/unsubscribe", newsletterLimiter, newsletterController.unsubscribeGet);

module.exports = router;
