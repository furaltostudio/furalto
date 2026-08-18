const { body, param, query } = require("express-validator");

const paginationQuery = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

const listOrdersValidator = [
  ...paginationQuery,
  query("status")
    .optional()
    .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
  query("search").optional().trim().isLength({ max: 120 }),
];

const updateOrderValidator = [
  param("orderNumber").notEmpty().withMessage("Order number is required"),
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
  body("paymentStatus")
    .optional()
    .isIn(["pending", "paid", "failed", "refunded"])
    .withMessage("Invalid payment status"),
  body("internalNotes").optional().isString().isLength({ max: 2000 }),
  body("assignedTo").optional({ nullable: true }).isMongoId().withMessage("Invalid assignee"),
];

const updateAppointmentValidator = [
  param("id").isMongoId().withMessage("Invalid appointment id"),
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "completed", "cancelled"])
    .withMessage("Invalid appointment status"),
];

const updateContactValidator = [
  param("id").isMongoId().withMessage("Invalid contact id"),
  body("status")
    .optional()
    .isIn(["new", "in_progress", "resolved"])
    .withMessage("Invalid contact status"),
];

const createStaffInviteValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("firstName").optional().trim().isLength({ max: 60 }),
  body("lastName").optional().trim().isLength({ max: 60 }),
];

const inviteIdValidator = [param("id").isMongoId().withMessage("Invalid invite id")];
const staffIdValidator = [param("id").isMongoId().withMessage("Invalid staff id")];

const productSlugValidator = [param("slug").trim().notEmpty().withMessage("Product slug is required")];

const createProductValidator = [
  body("slug").trim().notEmpty().withMessage("Slug is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("subcategory").optional({ values: "falsy" }).trim(),
  body("collection").optional().trim(),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("compareAtPrice").optional().isNumeric(),
  body("isActive").optional().isBoolean(),
  body("details").optional().isArray(),
  body("specs").optional().isArray(),
  body("images").optional().isArray(),
  body("fabrics").optional().isArray(),
  body("finishes").optional().isArray(),
  body("sizes").optional().isArray(),
  body("relatedSlugs").optional().isArray(),
  body("rooms").optional().isArray(),
  body("scaleImageIndex")
    .optional({ nullable: true })
    .custom((value) => value === null || value === "" || Number.isInteger(Number(value)))
    .withMessage("scaleImageIndex must be an integer or null"),
];

const updateProductValidator = [
  ...productSlugValidator,
  body("name").optional().trim().notEmpty(),
  body("category").optional().trim().notEmpty(),
  body("subcategory").optional({ values: "falsy" }).trim(),
  body("collection").optional().trim(),
  body("price").optional().isNumeric(),
  body("compareAtPrice").optional().isNumeric(),
  body("description").optional().trim().notEmpty(),
  body("isActive").optional().isBoolean(),
  body("details").optional().isArray(),
  body("specs").optional().isArray(),
  body("images").optional().isArray(),
  body("fabrics").optional().isArray(),
  body("finishes").optional().isArray(),
  body("sizes").optional().isArray(),
  body("relatedSlugs").optional().isArray(),
  body("rooms").optional().isArray(),
  body("scaleImageIndex")
    .optional({ nullable: true })
    .custom((value) => value === null || value === "" || Number.isInteger(Number(value)))
    .withMessage("scaleImageIndex must be an integer or null"),
];

const productStatusValidator = [
  ...productSlugValidator,
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
];

const customerIdValidator = [param("id").isMongoId().withMessage("Invalid customer id")];

const newsletterIdValidator = [param("id").isMongoId().withMessage("Invalid subscriber id")];

const updateNewsletterValidator = [
  ...newsletterIdValidator,
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
];

const updateCustomQuoteValidator = [
  param("id").isMongoId().withMessage("Invalid quote id"),
  body("status")
    .isIn(["new", "contacted", "quoted", "closed"])
    .withMessage("Invalid quote status"),
];

module.exports = {
  listOrdersValidator,
  updateOrderValidator,
  updateAppointmentValidator,
  updateContactValidator,
  createStaffInviteValidator,
  inviteIdValidator,
  staffIdValidator,
  productSlugValidator,
  createProductValidator,
  updateProductValidator,
  productStatusValidator,
  customerIdValidator,
  updateNewsletterValidator,
  updateCustomQuoteValidator,
};
