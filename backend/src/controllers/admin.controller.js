const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const adminService = require("../services/admin.service");
const customFurnitureService = require("../services/custom-furniture.service");

const getStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getDashboardStats();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, stats, "Dashboard stats fetched"));
});

const getOrders = asyncHandler(async (req, res) => {
  const result = await adminService.listOrders(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Orders fetched"));
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await adminService.getOrder(req.params.orderNumber);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { order }, "Order fetched"));
});

const patchOrder = asyncHandler(async (req, res) => {
  const order = await adminService.updateOrder(req.params.orderNumber, req.body, req.user._id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { order }, "Order updated"));
});

const getAppointments = asyncHandler(async (req, res) => {
  const result = await adminService.listAppointments(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Appointments fetched"));
});

const patchAppointment = asyncHandler(async (req, res) => {
  const appointment = await adminService.updateAppointment(req.params.id, req.body);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { appointment }, "Appointment updated"));
});

const getContacts = asyncHandler(async (req, res) => {
  const result = await adminService.listContacts(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Contacts fetched"));
});

const patchContact = asyncHandler(async (req, res) => {
  const contact = await adminService.updateContact(req.params.id, req.body);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { contact }, "Contact updated"));
});

const getCustomQuotes = asyncHandler(async (req, res) => {
  const result = await customFurnitureService.listQuotes(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Custom quotes fetched"));
});

const patchCustomQuote = asyncHandler(async (req, res) => {
  const quote = await customFurnitureService.updateQuoteStatus(req.params.id, req.body.status);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { quote }, "Custom quote updated"));
});

const getNewsletter = asyncHandler(async (req, res) => {
  const result = await adminService.listNewsletterSubscribers(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Newsletter subscribers fetched"));
});

const getStaff = asyncHandler(async (_req, res) => {
  const staff = await adminService.listStaff();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { staff }, "Staff fetched"));
});

const getStaffInvites = asyncHandler(async (_req, res) => {
  const invites = await adminService.listStaffInvites();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { invites }, "Staff invites fetched"));
});

const postStaffInvite = asyncHandler(async (req, res) => {
  const invite = await adminService.createStaffInvite(req.user._id, req.body);

  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, { invite }, "Staff invite sent"));
});

const deleteStaffInvite = asyncHandler(async (req, res) => {
  const result = await adminService.revokeStaffInvite(req.params.id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

const deactivateStaff = asyncHandler(async (req, res) => {
  const result = await adminService.deactivateStaff(req.params.id, req.user._id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

const getAssignees = asyncHandler(async (_req, res) => {
  const assignees = await adminService.getAssignees();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { assignees }, "Assignees fetched"));
});

const getProducts = asyncHandler(async (req, res) => {
  const result = await adminService.listProductsAdmin(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Products fetched"));
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await adminService.getProductAdmin(req.params.slug);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { product }, "Product fetched"));
});

const postProduct = asyncHandler(async (req, res) => {
  const product = await adminService.createProduct(req.body);

  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, { product }, "Product created"));
});

const patchProduct = asyncHandler(async (req, res) => {
  const product = await adminService.updateProduct(req.params.slug, req.body);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { product }, "Product updated"));
});

const patchProductStatus = asyncHandler(async (req, res) => {
  const product = await adminService.toggleProductStatus(req.params.slug, req.body.isActive);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { product }, "Product status updated"));
});

const getCustomers = asyncHandler(async (req, res) => {
  const result = await adminService.listCustomers(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Customers fetched"));
});

const getCustomer = asyncHandler(async (req, res) => {
  const result = await adminService.getCustomer(req.params.id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Customer fetched"));
});

const patchNewsletter = asyncHandler(async (req, res) => {
  const subscriber = await adminService.updateNewsletterSubscriber(req.params.id, req.body);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { subscriber }, "Subscriber updated"));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notificationService = require("../services/notification.service");
  const result = await notificationService.listNotifications(req.user._id, {
    limit: req.query.limit,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Notifications fetched"));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notificationService = require("../services/notification.service");
  const ApiError = require("../utils/ApiError");
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);

  if (!notification) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { notification }, "Notification marked as read"));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const notificationService = require("../services/notification.service");
  const result = await notificationService.markAllAsRead(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "All notifications marked as read"));
});

module.exports = {
  getStats,
  getOrders,
  getOrder,
  patchOrder,
  getAppointments,
  patchAppointment,
  getContacts,
  patchContact,
  getCustomQuotes,
  patchCustomQuote,
  getNewsletter,
  getStaff,
  getStaffInvites,
  postStaffInvite,
  deleteStaffInvite,
  deactivateStaff,
  getAssignees,
  getProducts,
  getProduct,
  postProduct,
  patchProduct,
  patchProductStatus,
  getCustomers,
  getCustomer,
  patchNewsletter,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
