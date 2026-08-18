const Notification = require("../models/Notification.model");
const { emitToAdmins } = require("./socket.service");

const serializeNotification = (doc, userId) => {
  const raw = doc.toObject ? doc.toObject() : doc;
  const readBy = (raw.readBy || []).map((id) => String(id));
  const userKey = userId ? String(userId) : null;

  return {
    id: String(raw._id),
    type: raw.type,
    title: raw.title,
    message: raw.message,
    href: raw.href,
    meta: raw.meta || {},
    isRead: userKey ? readBy.includes(userKey) : false,
    createdAt: raw.createdAt,
  };
};

const createAdminNotification = async ({ type, title, message, href, meta = {} }) => {
  const notification = await Notification.create({
    type,
    title,
    message,
    href,
    meta,
  });

  const payload = serializeNotification(notification, null);
  // Realtime clients treat every push as unread for them until marked
  payload.isRead = false;
  emitToAdmins("admin:notification", payload);

  return notification;
};

const notifyOrderPaid = async (order) => {
  const orderNumber = order.orderNumber || "";
  const total = Number(order.total || 0);
  const name = [order.contact?.firstName, order.contact?.lastName].filter(Boolean).join(" ").trim();

  return createAdminNotification({
    type: "order",
    title: "New paid order",
    message: name
      ? `${orderNumber} · ${name} · ₹${total.toLocaleString("en-IN")}`
      : `${orderNumber} · ₹${total.toLocaleString("en-IN")}`,
    href: "/admin/orders",
    meta: { orderNumber, total },
  });
};

const notifyAppointment = async (appointment) => {
  const name = [appointment.firstName, appointment.lastName].filter(Boolean).join(" ").trim();
  return createAdminNotification({
    type: "appointment",
    title: "New appointment request",
    message: `${name || appointment.email} · ${appointment.appointmentType || "consultation"}`,
    href: "/admin/appointments",
    meta: { id: String(appointment._id), email: appointment.email },
  });
};

const notifyContact = async (inquiry) => {
  const name = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(" ").trim();
  return createAdminNotification({
    type: "contact",
    title: "New enquiry",
    message: `${name || inquiry.email} · ${inquiry.subject || "general"}`,
    href: "/admin/contacts",
    meta: { id: String(inquiry._id), email: inquiry.email },
  });
};

const notifyCustomQuote = async (quote, estimateAmount) => {
  const name = [quote.firstName, quote.lastName].filter(Boolean).join(" ").trim();
  const amount = Number(estimateAmount ?? quote.estimate?.amount ?? 0);
  return createAdminNotification({
    type: "custom_quote",
    title: "New custom quote",
    message: name
      ? `${name} · estimate ₹${amount.toLocaleString("en-IN")}`
      : `Estimate ₹${amount.toLocaleString("en-IN")}`,
    href: "/admin/custom-quotes",
    meta: { id: String(quote._id), email: quote.email, amount },
  });
};

const notifyNewsletter = async (subscriber, { reactivated = false } = {}) => {
  return createAdminNotification({
    type: "newsletter",
    title: reactivated ? "Newsletter re-subscribed" : "New newsletter subscriber",
    message: subscriber.email,
    href: "/admin/newsletter",
    meta: { id: String(subscriber._id), email: subscriber.email },
  });
};

const listNotifications = async (userId, { limit = 30 } = {}) => {
  const capped = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(capped)
    .lean();

  const unreadCount = await Notification.countDocuments({
    readBy: { $nin: [userId] },
  });

  return {
    notifications: notifications.map((item) => serializeNotification(item, userId)),
    unreadCount,
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { $addToSet: { readBy: userId } },
    { new: true }
  );

  if (!notification) {
    return null;
  }

  return serializeNotification(notification, userId);
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { readBy: { $nin: [userId] } },
    { $addToSet: { readBy: userId } }
  );

  return listNotifications(userId);
};

module.exports = {
  createAdminNotification,
  notifyOrderPaid,
  notifyAppointment,
  notifyContact,
  notifyCustomQuote,
  notifyNewsletter,
  listNotifications,
  markAsRead,
  markAllAsRead,
  serializeNotification,
};
