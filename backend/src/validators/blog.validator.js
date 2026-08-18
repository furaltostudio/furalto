const { body, param, query } = require("express-validator");

const listPublicValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("category").optional().isString().trim().isLength({ max: 80 }),
];

const slugValidator = [param("slug").isString().trim().notEmpty()];

const idValidator = [param("id").isMongoId()];

const createBlogValidator = [
  body("title").isString().trim().notEmpty().isLength({ max: 180 }),
  body("slug").optional().isString().trim().isLength({ max: 160 }),
  body("excerpt").isString().trim().notEmpty().isLength({ max: 500 }),
  body("body").isString().trim().notEmpty().isLength({ max: 50000 }),
  body("category").optional().isString().trim().isLength({ max: 80 }),
  body("author").optional().isString().trim().isLength({ max: 120 }),
  body("publishedAt").optional().isISO8601(),
  body("isPublished").optional().isBoolean(),
  body("seoDescription").optional().isString().trim().isLength({ max: 320 }),
  body("tags").optional().isArray({ max: 20 }),
  body("tags.*").optional().isString().trim().isLength({ max: 40 }),
  body("coverImage").optional().isObject(),
  body("coverImage.src").optional().isString().trim(),
  body("coverImage.alt").optional().isString().trim(),
];

const updateBlogValidator = [
  param("id").isMongoId(),
  body("title").optional().isString().trim().notEmpty().isLength({ max: 180 }),
  body("slug").optional().isString().trim().isLength({ max: 160 }),
  body("excerpt").optional().isString().trim().notEmpty().isLength({ max: 500 }),
  body("body").optional().isString().trim().notEmpty().isLength({ max: 50000 }),
  body("category").optional().isString().trim().isLength({ max: 80 }),
  body("author").optional().isString().trim().isLength({ max: 120 }),
  body("publishedAt").optional().isISO8601(),
  body("isPublished").optional().isBoolean(),
  body("seoDescription").optional().isString().trim().isLength({ max: 320 }),
  body("tags").optional().isArray({ max: 20 }),
  body("tags.*").optional().isString().trim().isLength({ max: 40 }),
  body("coverImage").optional().isObject(),
];

module.exports = {
  listPublicValidator,
  slugValidator,
  idValidator,
  createBlogValidator,
  updateBlogValidator,
};
