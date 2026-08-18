const Contact = require("../models/Contact.model");
const { sendContactNotifyEmail } = require("./email.service");
const { notifyContact } = require("./notification.service");

const createContact = async (payload) => {
  const inquiry = await Contact.create(payload);
  const plain = inquiry.toObject ? inquiry.toObject() : inquiry;
  sendContactNotifyEmail(plain).catch(() => undefined);
  notifyContact(plain).catch(() => undefined);
  return inquiry;
};

module.exports = {
  createContact,
};
