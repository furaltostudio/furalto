const { body, param, query } = require("express-validator");

const submitReviewValidator = [
  body("token").trim().notEmpty().withMessage("Feedback token is required"),
  body("productSlug").trim().notEmpty().withMessage("Product is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("title").optional().trim().isLength({ max: 120 }).withMessage("Title is too long"),
  body("comment")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Feedback must be between 10 and 2000 characters"),
];

const productSlugParamValidator = [
  param("slug").trim().notEmpty().withMessage("Product slug is required"),
];

const inviteTokenParamValidator = [
  param("token").trim().notEmpty().withMessage("Token is required"),
];

const listReviewsQueryValidator = [
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Invalid limit"),
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page"),
];

module.exports = {
  submitReviewValidator,
  productSlugParamValidator,
  inviteTokenParamValidator,
  listReviewsQueryValidator,
};
