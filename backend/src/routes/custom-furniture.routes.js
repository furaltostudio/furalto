const { Router } = require("express");
const validate = require("../middlewares/validate.middleware");
const {
  formLimiter,
  estimateLimiter,
  chatLimiter,
} = require("../middlewares/rateLimit.middleware");
const customFurnitureController = require("../controllers/custom-furniture.controller");
const {
  estimateValidator,
  submitQuoteValidator,
  chatValidator,
} = require("../validators/custom-furniture.validator");

const router = Router();

router.get("/catalog", customFurnitureController.getCatalog);
router.post(
  "/estimate",
  estimateLimiter,
  validate(estimateValidator),
  customFurnitureController.postEstimate
);
router.post(
  "/chat",
  chatLimiter,
  validate(chatValidator),
  customFurnitureController.postChat
);
router.post(
  "/quote",
  formLimiter,
  validate(submitQuoteValidator),
  customFurnitureController.postQuote
);

module.exports = router;
