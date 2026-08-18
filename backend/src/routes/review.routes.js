const { Router } = require("express");
const reviewController = require("../controllers/review.controller");
const validate = require("../middlewares/validate.middleware");
const { formLimiter } = require("../middlewares/rateLimit.middleware");
const {
  submitReviewValidator,
  productSlugParamValidator,
  inviteTokenParamValidator,
  listReviewsQueryValidator,
} = require("../validators/review.validator");

const router = Router();

router.get(
  "/product/:slug",
  validate([...productSlugParamValidator, ...listReviewsQueryValidator]),
  reviewController.listProductReviews
);

router.get(
  "/invite/:token",
  validate(inviteTokenParamValidator),
  reviewController.getInvite
);

router.post(
  "/",
  formLimiter,
  validate(submitReviewValidator),
  reviewController.submitReview
);

module.exports = router;
