const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const reviewService = require("../services/review.service");

const listProductReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.listProductReviews(req.params.slug, {
    page: req.query.page,
    limit: req.query.limit,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Reviews fetched"));
});

const getInvite = asyncHandler(async (req, res) => {
  const invite = await reviewService.getInviteByToken(req.params.token);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { invite }, "Feedback invite loaded"));
});

const submitReview = asyncHandler(async (req, res) => {
  const review = await reviewService.submitReview(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      {
        review: {
          id: review._id,
          productSlug: review.productSlug,
          rating: review.rating,
        },
      },
      "Thank you for your feedback"
    )
  );
});

module.exports = {
  listProductReviews,
  getInvite,
  submitReview,
};
