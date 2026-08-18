const crypto = require("crypto");
const Newsletter = require("../models/Newsletter.model");
const { env } = require("../config");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const { sendNewsletterWelcomeEmail } = require("./email.service");
const { notifyNewsletter } = require("./notification.service");

const getUnsubscribeSecret = () =>
  env.seedSecret || env.jwt.accessSecret || "furalto-newsletter-secret";

const createUnsubscribeToken = (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  return crypto
    .createHmac("sha256", getUnsubscribeSecret())
    .update(`newsletter:${normalized}`)
    .digest("hex");
};

const verifyUnsubscribeToken = (email, token) => {
  const expected = createUnsubscribeToken(email);
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(String(token || ""));

  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
};

const buildUnsubscribeUrl = (email) => {
  const token = createUnsubscribeToken(email);
  return `${env.frontendUrl}/newsletter/unsubscribe?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(token)}`;
};

const subscribe = async (email, source = "footer") => {
  const normalized = email.toLowerCase();
  const existing = await Newsletter.findOne({ email: normalized });

  if (existing) {
    if (existing.isActive) {
      return { message: "You are already subscribed to our newsletter." };
    }

    existing.isActive = true;
    existing.source = source;
    await existing.save();
    sendNewsletterWelcomeEmail(existing.email, buildUnsubscribeUrl(existing.email)).catch(
      () => undefined
    );
    notifyNewsletter(existing, { reactivated: true }).catch(() => undefined);
    return { message: "Welcome back! Your newsletter subscription is active again." };
  }

  const subscriber = await Newsletter.create({ email: normalized, source });
  sendNewsletterWelcomeEmail(subscriber.email, buildUnsubscribeUrl(subscriber.email)).catch(
    () => undefined
  );
  notifyNewsletter(subscriber).catch(() => undefined);
  return { message: "Thank you for subscribing to Furalto." };
};

const unsubscribe = async (email, token) => {
  const normalized = String(email || "").trim().toLowerCase();

  if (!verifyUnsubscribeToken(normalized, token)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired unsubscribe link.");
  }

  const subscriber = await Newsletter.findOne({ email: normalized });

  if (!subscriber) {
    return { message: "You are already unsubscribed." };
  }

  if (!subscriber.isActive) {
    return { message: "You are already unsubscribed." };
  }

  subscriber.isActive = false;
  await subscriber.save();

  return { message: "You have been unsubscribed from the Furalto newsletter." };
};

module.exports = {
  subscribe,
  unsubscribe,
  createUnsubscribeToken,
  buildUnsubscribeUrl,
};
