const { body, param } = require("express-validator");

const categoryIdValidator = [param("id").isMongoId().withMessage("Invalid category id")];

const subcategoryIdValidator = [
  param("id").isMongoId().withMessage("Invalid category id"),
  param("subId").isMongoId().withMessage("Invalid subcategory id"),
];

const createCategoryValidator = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  body("slug").optional().trim().isLength({ min: 1, max: 80 }),
  body("description").optional().isString().isLength({ max: 500 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
  body("subcategories").optional().isArray(),
  body("subcategories.*.name").optional().trim().notEmpty(),
  body("subcategories.*.slug").optional().trim().isLength({ min: 1, max: 80 }),
];

const updateCategoryValidator = [
  ...categoryIdValidator,
  body("name").optional().trim().notEmpty(),
  body("slug").optional().trim().isLength({ min: 1, max: 80 }),
  body("description").optional().isString().isLength({ max: 500 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
  body("subcategories").optional().isArray(),
];

const addSubcategoryValidator = [
  ...categoryIdValidator,
  body("name").trim().notEmpty().withMessage("Subcategory name is required"),
  body("slug").optional().trim().isLength({ min: 1, max: 80 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
];

const updateSubcategoryValidator = [
  ...subcategoryIdValidator,
  body("name").optional().trim().notEmpty(),
  body("slug").optional().trim().isLength({ min: 1, max: 80 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
];

module.exports = {
  categoryIdValidator,
  subcategoryIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
  addSubcategoryValidator,
  updateSubcategoryValidator,
};
