const { body } = require("express-validator");

const cartItemValidator = [
  body("itemId").notEmpty().withMessage("Item ID is required"),
  body("slug").notEmpty().withMessage("Product slug is required"),
  body("name").notEmpty().withMessage("Product name is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("image").notEmpty().withMessage("Image is required"),
  body("quantity").optional().isInt({ min: 1 }),
];

const updateCartItemValidator = [
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be 0 or greater"),
];

module.exports = {
  cartItemValidator,
  updateCartItemValidator,
};
