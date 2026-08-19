const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS, USER_ROLES } = require("../constants");
const User = require("../models/User.model");
const Order = require("../models/Order.model");
const Appointment = require("../models/Appointment.model");
const Contact = require("../models/Contact.model");
const Newsletter = require("../models/Newsletter.model");
const StaffInvite = require("../models/StaffInvite.model");
const Product = require("../models/Product.model");
const { sendStaffInviteEmail } = require("./email.service");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const createInviteToken = () => crypto.randomBytes(32).toString("hex");

const formatStaffUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = startOfMonth;
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const paidMatch = { paymentStatus: "paid" };

  const [
    orders,
    pendingAppointments,
    newContacts,
    staffCount,
    products,
    customers,
    newsletterSubscribers,
    processingOrders,
    revenueAllTime,
    revenueThisMonth,
    revenueThisYear,
    revenueLastMonth,
    paidOrdersCount,
    ordersThisMonth,
    monthlySeries,
    categoryCount,
  ] = await Promise.all([
    Order.countDocuments(),
    Appointment.countDocuments({ status: "pending" }),
    Contact.countDocuments({ status: "new" }),
    User.countDocuments({ role: USER_ROLES.STAFF, isActive: true }),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: USER_ROLES.CUSTOMER, isActive: true }),
    Newsletter.countDocuments({ isActive: true }),
    Order.countDocuments({ status: { $in: ["confirmed", "processing", "shipped"] } }),
    Order.aggregate([
      { $match: paidMatch },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          ...paidMatch,
          createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments(paidMatch),
    Order.countDocuments({ ...paidMatch, createdAt: { $gte: startOfMonth } }),
    Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    require("./category.service")
      .listCategories({ includeInactive: true })
      .then((items) => items.length)
      .catch(() => 0),
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("orderNumber status paymentStatus total contact.firstName contact.lastName createdAt")
    .lean();

  const recentContacts = await Contact.find({ status: "new" })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("firstName lastName email subject status createdAt")
    .lean();

  const monthLabels = [];
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
    });
  }

  const seriesMap = new Map(
    monthlySeries.map((row) => [
      `${row._id.year}-${String(row._id.month).padStart(2, "0")}`,
      { revenue: row.revenue, orders: row.orders },
    ])
  );

  const revenueMonthly = monthLabels.map((item) => ({
    key: item.key,
    label: item.label,
    revenue: seriesMap.get(item.key)?.revenue || 0,
    orders: seriesMap.get(item.key)?.orders || 0,
  }));

  const allTimeRevenue = revenueAllTime[0]?.total || 0;
  const allTimePaidOrders = revenueAllTime[0]?.count || paidOrdersCount || 0;

  return {
    orders,
    pendingAppointments,
    newContacts,
    staffCount,
    products,
    customers,
    newsletterSubscribers,
    revenue: allTimeRevenue,
    revenueAllTime: allTimeRevenue,
    revenueThisMonth: revenueThisMonth[0]?.total || 0,
    revenueThisYear: revenueThisYear[0]?.total || 0,
    revenueLastMonth: revenueLastMonth[0]?.total || 0,
    paidOrders: allTimePaidOrders,
    paidOrdersThisMonth: revenueThisMonth[0]?.count || ordersThisMonth || 0,
    averageOrderValue: allTimePaidOrders
      ? Math.round((allTimeRevenue / allTimePaidOrders) * 100) / 100
      : 0,
    processingOrders,
    categoryCount,
    revenueMonthly,
    recentOrders,
    recentContacts,
  };
};

const listOrders = async ({ status, search, page = 1, limit = 20 }) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const term = search.trim();
    query.$or = [
      { orderNumber: new RegExp(term, "i") },
      { "contact.email": new RegExp(term, "i") },
      { "contact.firstName": new RegExp(term, "i") },
      { "contact.lastName": new RegExp(term, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("assignedTo", "firstName lastName email")
      .lean(),
    Order.countDocuments(query),
  ]);

  return { orders, total, page: Number(page), limit: Number(limit) };
};

const getOrder = async (orderNumber) => {
  const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() })
    .populate("assignedTo", "firstName lastName email")
    .populate("user", "firstName lastName email")
    .lean();

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Order not found");
  }

  return order;
};

const updateOrder = async (orderNumber, { status, paymentStatus, internalNotes, assignedTo }, actorId) => {
  const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() });

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Order not found");
  }

  const previousStatus = order.status;
  const previousPaymentStatus = order.paymentStatus;
  const refundRequested =
    paymentStatus === "refunded" && previousPaymentStatus !== "refunded";

  if (refundRequested) {
    if (previousPaymentStatus !== "paid" && previousPaymentStatus !== "refunded") {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Only paid orders can be refunded.");
    }

    if (!order.razorpayPaymentId) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot refund: this order has no Razorpay payment id."
      );
    }

    if (!order.razorpayRefundId) {
      const paymentService = require("./payment.service");
      const refund = await paymentService.createRefund({
        paymentId: order.razorpayPaymentId,
        amount: order.total,
        notes: {
          orderNumber: order.orderNumber,
          reason: "Admin refund",
        },
      });
      order.razorpayRefundId = refund.id;
    }
  }

  if (status) {
    order.status = status;
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  if (internalNotes !== undefined) {
    order.internalNotes = internalNotes;
  }

  if (assignedTo !== undefined) {
    if (assignedTo) {
      const assignee = await User.findOne({
        _id: assignedTo,
        role: { $in: [USER_ROLES.STAFF, USER_ROLES.ADMIN] },
        isActive: true,
      });

      if (!assignee) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Assigned user must be an active staff member");
      }
    }

    order.assignedTo = assignedTo || undefined;
  }

  if (!order.assignedTo && actorId) {
    order.assignedTo = actorId;
  }

  let reviewInviteToken = null;
  const deliveredNow = statusChangedToDelivered(status, previousStatus);

  if (deliveredNow) {
    const reviewService = require("./review.service");
    await reviewService.applySoldCountsForOrder(order);
    reviewInviteToken = reviewService.prepareReviewInvite(order);
  }

  await order.save();

  const statusChanged = status && status !== previousStatus;
  const refundedNow =
    paymentStatus === "refunded" && previousPaymentStatus !== "refunded";

  if (statusChanged || refundedNow) {
    const emailStatus = refundedNow && !statusChanged ? "cancelled" : order.status;
    const emailOrder = order.toObject();
    emailOrder.status = emailStatus;
    const { sendOrderStatusEmail, sendPaidOrderEmails } = require("./email.service");

    if (
      previousPaymentStatus !== "paid" &&
      order.paymentStatus === "paid" &&
      !order.confirmationEmailSentAt
    ) {
      try {
        await sendPaidOrderEmails(order);
        order.confirmationEmailSentAt = new Date();
        await order.save();
      } catch (error) {
        console.warn("[email:paid-order]", error.message || error);
      }
    }

    const alreadyToldCustomer =
      emailStatus === "confirmed" && Boolean(order.confirmationEmailSentAt);
    const alreadyEmailedThisStatus = order.lastStatusEmailed === emailStatus;
    const skipPending = emailStatus === "pending";

    if (!alreadyToldCustomer && !alreadyEmailedThisStatus && !skipPending) {
      try {
        await sendOrderStatusEmail(emailOrder, previousStatus, {
          reviewInviteToken: deliveredNow ? reviewInviteToken : null,
        });
        order.lastStatusEmailAt = new Date();
        order.lastStatusEmailed = emailStatus;
        if (deliveredNow && reviewInviteToken) {
          order.reviewInviteSentAt = new Date();
        }
        await order.save();
      } catch (error) {
        console.warn("[email:order-status]", error.message || error);
      }
    }
  }

  return order;
};

const statusChangedToDelivered = (nextStatus, previousStatus) =>
  nextStatus === "delivered" && previousStatus !== "delivered";

const listAppointments = async ({ status, page = 1, limit = 20 }) => {
  const query = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [appointments, total] = await Promise.all([
    Appointment.find(query).sort({ preferredDate: 1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Appointment.countDocuments(query),
  ]);

  return { appointments, total, page: Number(page), limit: Number(limit) };
};

const updateAppointment = async (id, { status }) => {
  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { ...(status ? { status } : {}) },
    { new: true, runValidators: true }
  ).lean();

  if (!appointment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Appointment not found");
  }

  return appointment;
};

const listContacts = async ({ status, page = 1, limit = 20 }) => {
  const query = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [contacts, total] = await Promise.all([
    Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Contact.countDocuments(query),
  ]);

  return { contacts, total, page: Number(page), limit: Number(limit) };
};

const updateContact = async (id, { status }) => {
  const contact = await Contact.findByIdAndUpdate(
    id,
    { ...(status ? { status } : {}) },
    { new: true, runValidators: true }
  ).lean();

  if (!contact) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Contact message not found");
  }

  return contact;
};

const listNewsletterSubscribers = async ({ page = 1, limit = 50 }) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [subscribers, total] = await Promise.all([
    Newsletter.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Newsletter.countDocuments(),
  ]);

  return { subscribers, total, page: Number(page), limit: Number(limit) };
};

const listStaff = async () => {
  const staff = await User.find({
    role: { $in: [USER_ROLES.STAFF, USER_ROLES.ADMIN] },
  })
    .sort({ role: 1, createdAt: -1 })
    .select("firstName lastName email role isActive lastLoginAt createdAt")
    .lean();

  return staff.map(formatStaffUser);
};

const listStaffInvites = async () => {
  const invites = await StaffInvite.find({ status: "pending", expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .populate("invitedBy", "firstName lastName email")
    .select("-token")
    .lean();

  return invites;
};

const createStaffInvite = async (adminId, { email, firstName, lastName }) => {
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser?.role === USER_ROLES.ADMIN) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This user is already an admin");
  }

  if (existingUser?.role === USER_ROLES.STAFF) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This user is already a staff member");
  }

  const pendingInvite = await StaffInvite.findOne({
    email: normalizedEmail,
    status: "pending",
    expiresAt: { $gt: new Date() },
  });

  if (pendingInvite) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "An active invite already exists for this email");
  }

  const rawToken = createInviteToken();

  const invite = await StaffInvite.create({
    email: normalizedEmail,
    firstName: firstName || existingUser?.firstName || "",
    lastName: lastName || existingUser?.lastName || "",
    token: hashToken(rawToken),
    invitedBy: adminId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const admin = await User.findById(adminId);

  try {
    await sendStaffInviteEmail({
      email: normalizedEmail,
      firstName: invite.firstName,
      token: rawToken,
      invitedByName: admin?.getFullName() || "Furalto Admin",
    });
  } catch (emailError) {
    await StaffInvite.deleteOne({ _id: invite._id });
    throw new ApiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      emailError.message || "Invite created but email failed to send. Check Brevo sender settings."
    );
  }

  return {
    _id: invite._id,
    id: invite._id,
    email: invite.email,
    firstName: invite.firstName,
    lastName: invite.lastName,
    status: invite.status,
    expiresAt: invite.expiresAt,
    createdAt: invite.createdAt,
  };
};

const revokeStaffInvite = async (inviteId) => {
  const invite = await StaffInvite.findById(inviteId);

  if (!invite) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Invite not found");
  }

  if (invite.status !== "pending") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Only pending invites can be revoked");
  }

  invite.status = "revoked";
  await invite.save();

  return { message: "Invite revoked" };
};

const deactivateStaff = async (staffId, adminId) => {
  if (staffId.toString() === adminId.toString()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You cannot deactivate your own account");
  }

  const user = await User.findById(staffId);

  if (!user || user.role !== USER_ROLES.STAFF) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Staff member not found");
  }

  user.isActive = false;
  user.role = USER_ROLES.CUSTOMER;
  await user.save();

  return { message: "Staff access removed" };
};

const getAssignees = async () => {
  const assignees = await User.find({
    role: { $in: [USER_ROLES.STAFF, USER_ROLES.ADMIN] },
    isActive: true,
  })
    .sort({ role: 1, firstName: 1 })
    .select("firstName lastName email role")
    .lean();

  return assignees.map((user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  }));
};

const listProductsAdmin = async ({ search, category, isActive, page = 1, limit = 20 }) => {
  const query = {};

  if (category) {
    const values = String(category)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    query.category = values.length > 1 ? { $in: values } : values[0];
  }

  if (isActive === "true") {
    query.isActive = true;
  } else if (isActive === "false") {
    query.isActive = false;
  }

  if (search?.trim()) {
    const term = search.trim();
    query.$or = [
      { name: new RegExp(term, "i") },
      { slug: new RegExp(term, "i") },
      { collection: new RegExp(term, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("slug name category subcategory collection price compareAtPrice isActive images updatedAt")
      .lean(),
    Product.countDocuments(query),
  ]);

  return { products, total, page: Number(page), limit: Number(limit) };
};

const getProductAdmin = async (slug) => {
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Product not found");
  }

  return product;
};

const createProduct = async (payload) => {
  const existing = await Product.findOne({ slug: payload.slug });

  if (existing) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "A product with this slug already exists");
  }

  const scaleImageIndex =
    payload.scaleImageIndex === null || payload.scaleImageIndex === "" || payload.scaleImageIndex === undefined
      ? null
      : Number(payload.scaleImageIndex);

  const product = await Product.create({
    ...payload,
    collection: payload.collection || payload.category,
    isActive: payload.isActive ?? true,
    details: payload.details || [],
    specs: payload.specs || [],
    images: payload.images || [],
    fabrics: payload.fabrics || [],
    finishes: payload.finishes || [],
    sizes: payload.sizes || [],
    relatedSlugs: payload.relatedSlugs || [],
    rooms: payload.rooms || [],
    scaleImageIndex: Number.isInteger(scaleImageIndex) ? scaleImageIndex : null,
  });

  return product.toObject();
};

const updateProduct = async (slug, payload) => {
  const nextPayload = { ...payload };

  if (nextPayload.category && !nextPayload.collection) {
    nextPayload.collection = nextPayload.category;
  }

  if (Object.prototype.hasOwnProperty.call(nextPayload, "scaleImageIndex")) {
    const raw = nextPayload.scaleImageIndex;
    if (raw === null || raw === "" || raw === undefined) {
      nextPayload.scaleImageIndex = null;
    } else {
      const n = Number(raw);
      nextPayload.scaleImageIndex = Number.isInteger(n) ? n : null;
    }
  }

  const product = await Product.findOneAndUpdate(
    { slug },
    { $set: nextPayload },
    { new: true, runValidators: true }
  ).lean();

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Product not found");
  }

  return product;
};

const toggleProductStatus = async (slug, isActive) => {
  const product = await Product.findOneAndUpdate(
    { slug },
    { $set: { isActive } },
    { new: true }
  ).lean();

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Product not found");
  }

  return product;
};

const listCustomers = async ({ search, page = 1, limit = 20 }) => {
  const query = { role: USER_ROLES.CUSTOMER };

  if (search?.trim()) {
    const term = search.trim();
    query.$or = [
      { email: new RegExp(term, "i") },
      { firstName: new RegExp(term, "i") },
      { lastName: new RegExp(term, "i") },
      { phone: new RegExp(term, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("firstName lastName email phone provider isEmailVerified isActive createdAt lastLoginAt")
      .lean(),
    User.countDocuments(query),
  ]);

  const userIds = users.map((user) => user._id);
  const orderCounts = await Order.aggregate([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: "$user", count: { $sum: 1 }, totalSpent: { $sum: "$total" } } },
  ]);

  const orderMap = new Map(orderCounts.map((item) => [item._id.toString(), item]));

  const customers = users.map((user) => {
    const stats = orderMap.get(user._id.toString());

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      orderCount: stats?.count || 0,
      totalSpent: stats?.totalSpent || 0,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  });

  return { customers, total, page: Number(page), limit: Number(limit) };
};

const getCustomer = async (customerId) => {
  const user = await User.findOne({ _id: customerId, role: USER_ROLES.CUSTOMER })
    .select("firstName lastName email phone provider isEmailVerified isActive createdAt lastLoginAt")
    .lean();

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Customer not found");
  }

  const orders = await Order.find({ user: customerId })
    .sort({ createdAt: -1 })
    .select("orderNumber status total paymentStatus createdAt")
    .lean();

  const appointments = await Appointment.find({ email: user.email })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("appointmentType showroom preferredDate status createdAt")
    .lean();

  return {
    customer: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    orders,
    appointments,
  };
};

const updateNewsletterSubscriber = async (id, { isActive }) => {
  const subscriber = await Newsletter.findByIdAndUpdate(
    id,
    { $set: { isActive } },
    { new: true }
  ).lean();

  if (!subscriber) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Subscriber not found");
  }

  return subscriber;
};

module.exports = {
  getDashboardStats,
  listOrders,
  getOrder,
  updateOrder,
  listAppointments,
  updateAppointment,
  listContacts,
  updateContact,
  listNewsletterSubscribers,
  listStaff,
  listStaffInvites,
  createStaffInvite,
  revokeStaffInvite,
  deactivateStaff,
  getAssignees,
  listProductsAdmin,
  getProductAdmin,
  createProduct,
  updateProduct,
  toggleProductStatus,
  listCustomers,
  getCustomer,
  updateNewsletterSubscriber,
};
