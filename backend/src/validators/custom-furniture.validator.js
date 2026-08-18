const { body } = require("express-validator");

const selectionFields = [
  body("pieceId").trim().notEmpty().withMessage("Piece is required"),
  body("woodId").trim().notEmpty().withMessage("Wood is required"),
  body("fabricId").trim().notEmpty().withMessage("Fabric is required"),
  body("finishId").trim().notEmpty().withMessage("Finish is required"),
  body("sizeId").trim().notEmpty().withMessage("Size is required"),
];

const estimateValidator = [
  ...selectionFields,
  body("includeAdvice").optional().isBoolean(),
  body("city").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("roomNotes").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  body("message").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
];

const submitQuoteValidator = [
  ...selectionFields,
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("city").optional().trim().isLength({ max: 80 }),
  body("message").optional().trim().isLength({ max: 2000 }),
  body("advice").optional().trim().isLength({ max: 4000 }),
];

const quoteStatusValidator = [
  body("status")
    .isIn(["new", "contacted", "quoted", "closed"])
    .withMessage("Invalid quote status"),
];

const chatValidator = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 1000 })
    .withMessage("Message is too long"),
  body("history").optional().isArray({ max: 12 }),
  body("history.*.role")
    .optional()
    .isIn(["user", "assistant", "model"])
    .withMessage("Invalid chat role"),
  body("history.*.content")
    .optional()
    .customSanitizer((value) => String(value || "").slice(0, 2000))
    .isLength({ max: 2000 }),
  body("pieceId").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("woodId").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("fabricId").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("finishId").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("sizeId").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("city").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  body("roomNotes").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
  body("pathname").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
];

module.exports = {
  estimateValidator,
  submitQuoteValidator,
  quoteStatusValidator,
  chatValidator,
};
