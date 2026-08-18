const { Router } = require("express");
const adminController = require("../controllers/admin.controller");
const validate = require("../middlewares/validate.middleware");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { USER_ROLES, STAFF_ROLES } = require("../constants");
const {
  listOrdersValidator,
  updateOrderValidator,
  updateAppointmentValidator,
  updateContactValidator,
  createStaffInviteValidator,
  inviteIdValidator,
  staffIdValidator,
  createProductValidator,
  updateProductValidator,
  productSlugValidator,
  productStatusValidator,
  customerIdValidator,
  updateNewsletterValidator,
  updateCustomQuoteValidator,
} = require("../validators/admin.validator");

const uploadController = require("../controllers/upload.controller");
const contentController = require("../controllers/content.controller");
const categoryController = require("../controllers/category.controller");
const blogController = require("../controllers/blog.controller");
const {
  categoryIdValidator,
  subcategoryIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
  addSubcategoryValidator,
  updateSubcategoryValidator,
} = require("../validators/category.validator");
const {
  idValidator: blogIdValidator,
  createBlogValidator,
  updateBlogValidator,
} = require("../validators/blog.validator");
const { imageUpload } = require("../middlewares/upload.middleware");

const router = Router();

router.use(authenticate, authorize(...STAFF_ROLES));
router.get("/stats", adminController.getStats);
router.get("/notifications", adminController.getNotifications);
router.patch("/notifications/read-all", adminController.markAllNotificationsRead);
router.patch("/notifications/:id/read", adminController.markNotificationRead);
router.get("/content", contentController.listAdminContent);
router.get("/content/:key", contentController.getAdminContent);
router.put("/content/:key", contentController.upsertAdminContent);
router.patch("/content/:key", contentController.patchAdminContent);
router.delete("/content/:key", contentController.deleteAdminContent);
router.get("/assignees", adminController.getAssignees);
router.post("/uploads/image", imageUpload.single("image"), uploadController.uploadImage);
router.get("/orders", validate(listOrdersValidator), adminController.getOrders);
router.get("/orders/:orderNumber", adminController.getOrder);
router.patch("/orders/:orderNumber", validate(updateOrderValidator), adminController.patchOrder);
router.get("/appointments", adminController.getAppointments);
router.patch("/appointments/:id", validate(updateAppointmentValidator), adminController.patchAppointment);
router.get("/contacts", adminController.getContacts);
router.patch("/contacts/:id", validate(updateContactValidator), adminController.patchContact);
router.get("/custom-quotes", adminController.getCustomQuotes);
router.patch(
  "/custom-quotes/:id",
  validate(updateCustomQuoteValidator),
  adminController.patchCustomQuote
);
router.get("/newsletter", adminController.getNewsletter);
router.patch("/newsletter/:id", validate(updateNewsletterValidator), adminController.patchNewsletter);

router.get("/products", adminController.getProducts);
router.post("/products", validate(createProductValidator), adminController.postProduct);
router.get("/products/:slug", validate(productSlugValidator), adminController.getProduct);
router.patch("/products/:slug", validate(updateProductValidator), adminController.patchProduct);
router.patch(
  "/products/:slug/status",
  validate(productStatusValidator),
  adminController.patchProductStatus
);

router.get("/categories", categoryController.listAdminCategories);
router.post("/categories", validate(createCategoryValidator), categoryController.createCategory);
router.patch("/categories/:id", validate(updateCategoryValidator), categoryController.updateCategory);
router.delete("/categories/:id", validate(categoryIdValidator), categoryController.deleteCategory);
router.post(
  "/categories/:id/subcategories",
  validate(addSubcategoryValidator),
  categoryController.addSubcategory
);
router.patch(
  "/categories/:id/subcategories/:subId",
  validate(updateSubcategoryValidator),
  categoryController.updateSubcategory
);
router.delete(
  "/categories/:id/subcategories/:subId",
  validate(subcategoryIdValidator),
  categoryController.deleteSubcategory
);

router.get("/blog", blogController.listAdmin);
router.post("/blog", validate(createBlogValidator), blogController.createPost);
router.get("/blog/:id", validate(blogIdValidator), blogController.getAdminById);
router.patch("/blog/:id", validate(updateBlogValidator), blogController.updatePost);
router.delete("/blog/:id", validate(blogIdValidator), blogController.deletePost);

router.get("/customers", adminController.getCustomers);
router.get("/customers/:id", validate(customerIdValidator), adminController.getCustomer);

router.get("/staff", authorize(USER_ROLES.ADMIN), adminController.getStaff);
router.get("/staff/invites", authorize(USER_ROLES.ADMIN), adminController.getStaffInvites);
router.post(
  "/staff/invites",
  authorize(USER_ROLES.ADMIN),
  validate(createStaffInviteValidator),
  adminController.postStaffInvite
);
router.delete(
  "/staff/invites/:id",
  authorize(USER_ROLES.ADMIN),
  validate(inviteIdValidator),
  adminController.deleteStaffInvite
);
router.patch(
  "/staff/:id/deactivate",
  authorize(USER_ROLES.ADMIN),
  validate(staffIdValidator),
  adminController.deactivateStaff
);

module.exports = router;
