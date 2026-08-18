const nodemailer = require("nodemailer");
const { env } = require("../config");
const {
  buildVerificationEmail,
  buildPasswordResetEmail,
  buildStaffInviteEmail,
  buildOrderConfirmationEmail,
  buildPaymentReceiptEmail,
  buildAdminNewOrderEmail,
  buildOrderStatusEmail,
  buildPaymentFailedEmail,
  buildContactNotifyEmail,
  buildAppointmentEmails,
  buildCustomQuoteNotifyEmail,
  buildCustomQuoteCustomerEmail,
  buildTaxInvoiceEmail,
  buildNewsletterWelcomeEmail,
} = require("./email-templates");

let transporter;

const parseEmailAddress = (value = "") => {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
};

const normalizeRecipients = (to) => {
  const list = Array.isArray(to) ? to : [to];
  return [...new Set(list.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))];
};

const getSender = () => {
  const email = env.brevo.senderEmail || parseEmailAddress(env.smtp.from);

  return {
    email,
    name: env.brevo.senderName || "Furalto",
  };
};

let verifiedSendersCache = { at: 0, emails: null };

const fetchActiveBrevoSenders = async (apiKey) => {
  const now = Date.now();
  if (verifiedSendersCache.emails && now - verifiedSendersCache.at < 60_000) {
    return verifiedSendersCache.emails;
  }

  const response = await fetch("https://api.brevo.com/v3/senders", {
    headers: {
      accept: "application/json",
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Unable to load Brevo senders (${response.status}): ${details}`);
  }

  const payload = await response.json();
  const emails = new Set(
    (payload.senders || [])
      .filter((sender) => sender?.active && sender?.email)
      .map((sender) => String(sender.email).trim().toLowerCase())
  );

  verifiedSendersCache = { at: now, emails };
  return emails;
};

const assertSenderIsVerified = async (apiKey, senderEmail) => {
  const activeSenders = await fetchActiveBrevoSenders(apiKey);
  const normalized = String(senderEmail || "").trim().toLowerCase();

  if (!activeSenders.has(normalized)) {
    throw new Error(
      `Brevo sender "${senderEmail}" is not verified/active. Open Brevo → Senders, verify this email (check inbox + spam), then restart the backend. Until then Brevo rewrites From to the account default address.`
    );
  }
};

const getBillingEmails = () => {
  const configured = normalizeRecipients(env.billing.email || env.admin.email);
  return configured;
};

const sendBrevoEmail = async ({ to, subject, html, text, bcc = [] }) => {
  const sender = getSender();
  const recipients = normalizeRecipients(to);
  const bccList = normalizeRecipients(bcc).filter((email) => !recipients.includes(email));
  const apiKey = env.brevo.apiKey || "";

  // Brevo REST requires an xkeysib- API key.
  if (!apiKey || !/^xkeysib-/i.test(apiKey)) {
    return null;
  }

  if (!sender.email) {
    throw new Error(
      "BREVO_SENDER_EMAIL is missing. Set it to a sender verified in your Brevo account."
    );
  }

  if (recipients.length === 0) {
    return null;
  }

  await assertSenderIsVerified(apiKey, sender.email);

  if (typeof fetch !== "function") {
    throw new Error("Brevo email requires Node.js fetch support. Use Node 18+.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: recipients.map((email) => ({ email })),
      ...(bccList.length ? { bcc: bccList.map((email) => ({ email })) } : {}),
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo email failed with ${response.status}: ${details}`);
  }

  const result = await response.json();
  console.log(
    `[email:brevo] sent to=${recipients.join(",")} from=${sender.email} messageId=${result?.messageId || "n/a"}`
  );
  return result;
};

const assertEmailDelivered = (result, recipients) => {
  if (result?.skipped) {
    throw new Error("Email skipped: no recipients.");
  }
  if (result?.devMode) {
    throw new Error(
      "Email not delivered: set BREVO_API_KEY (xkeysib-…) and BREVO_SENDER_EMAIL (verified Brevo sender)."
    );
  }
  return result;
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (env.smtp.host && env.smtp.user && env.smtp.pass) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
    return transporter;
  }

  return null;
};

const sendEmail = async ({ to, subject, html, text, bcc = [], requireDelivery = false }) => {
  const recipients = normalizeRecipients(to);
  const bccList = normalizeRecipients(bcc);
  const sender = getSender();

  if (recipients.length === 0) {
    const skipped = { skipped: true };
    if (requireDelivery) assertEmailDelivered(skipped, recipients);
    return skipped;
  }

  const brevoResult = await sendBrevoEmail({
    to: recipients,
    subject,
    html,
    text,
    bcc: bccList,
  });

  if (brevoResult) {
    return brevoResult;
  }

  const mailOptions = {
    from: sender.email
      ? `"${sender.name}" <${sender.email}>`
      : env.smtp.from,
    to: recipients.join(", "),
    ...(bccList.length ? { bcc: bccList.join(", ") } : {}),
    subject,
    html,
    text,
  };

  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    if (env.brevo.apiKey && !/^xkeysib-/i.test(env.brevo.apiKey)) {
      throw new Error(
        "BREVO_API_KEY must be an API key starting with xkeysib- (Brevo → SMTP & API → API keys)."
      );
    }
    if (env.brevo.apiKey) {
      throw new Error(
        "Brevo is configured but email could not be sent. Verify BREVO_SENDER_EMAIL is an active sender in Brevo."
      );
    }

    console.log("\n--- EMAIL (dev mode — Brevo not configured) ---");
    console.log(`To: ${recipients.join(", ")}`);
    if (bccList.length) console.log(`Bcc: ${bccList.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log("--------------------------------------------\n");
    const result = { devMode: true };
    if (requireDelivery) assertEmailDelivered(result, recipients);
    return result;
  }

  const smtpResult = await activeTransporter.sendMail(mailOptions);
  console.log(
    `[email:smtp] sent to=${recipients.join(",")} from=${sender.email || env.smtp.from} messageId=${smtpResult?.messageId || "n/a"}`
  );
  return smtpResult;
};

const safeSend = async (label, runner) => {
  try {
    await runner();
  } catch (error) {
    console.warn(`[email:${label}]`, error.message || error);
  }
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${env.frontendUrl}/account/verify-email?token=${token}`;
  const email = buildVerificationEmail(user, verifyUrl);

  await sendEmail({
    to: user.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${env.frontendUrl}/account/reset-password?token=${token}`;
  const email = buildPasswordResetEmail(user, resetUrl);

  await sendEmail({
    to: user.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
};

const sendStaffInviteEmail = async ({ email, firstName, token, invitedByName }) => {
  const inviteUrl = `${env.frontendUrl}/account/accept-invite?token=${token}`;
  const content = buildStaffInviteEmail({
    email,
    firstName,
    inviteUrl,
    invitedByName,
  });

  await sendEmail({
    to: email,
    subject: content.subject,
    text: content.text,
    html: content.html,
    requireDelivery: true,
  });
};

const sendPaidOrderEmails = async (order) => {
  const customerEmail = order.contact?.email;
  if (!customerEmail) return;

  const confirmation = buildOrderConfirmationEmail(order);
  const receipt = buildPaymentReceiptEmail(order);
  const adminAlert = buildAdminNewOrderEmail(order);
  const billingEmails = getBillingEmails();

  await safeSend("order-confirmation", () =>
    sendEmail({
      to: customerEmail,
      bcc: billingEmails,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
    })
  );

  await safeSend("payment-receipt", () =>
    sendEmail({
      to: customerEmail,
      bcc: billingEmails,
      subject: receipt.subject,
      text: receipt.text,
      html: receipt.html,
    })
  );

  await safeSend("admin-new-order", () =>
    sendEmail({
      to: billingEmails,
      subject: adminAlert.subject,
      text: adminAlert.text,
      html: adminAlert.html,
    })
  );

  const invoice = buildTaxInvoiceEmail(order, env.company);
  await safeSend("tax-invoice", () =>
    sendEmail({
      to: customerEmail,
      bcc: billingEmails,
      subject: invoice.subject,
      text: invoice.text,
      html: invoice.html,
    })
  );
};

const sendOrderStatusEmail = async (order, previousStatus, options = {}) => {
  if (!order.contact?.email) return;

  const content = buildOrderStatusEmail(order, previousStatus, options);
  await safeSend("order-status", () =>
    sendEmail({
      to: order.contact.email,
      bcc: getBillingEmails(),
      subject: content.subject,
      text: content.text,
      html: content.html,
    })
  );
};

const sendPaymentFailedEmail = async (order) => {
  if (!order.contact?.email) return;

  const content = buildPaymentFailedEmail(order);
  await safeSend("payment-failed", () =>
    sendEmail({
      to: order.contact.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    })
  );
};

const sendContactNotifyEmail = async (inquiry) => {
  const content = buildContactNotifyEmail(inquiry);
  await safeSend("contact-notify", () =>
    sendEmail({
      to: getBillingEmails(),
      subject: content.subject,
      text: content.text,
      html: content.html,
    })
  );
};

const sendAppointmentEmails = async (appointment) => {
  const { customer, admin } = buildAppointmentEmails(appointment);

  await safeSend("appointment-customer", () =>
    sendEmail({
      to: appointment.email,
      subject: customer.subject,
      text: customer.text,
      html: customer.html,
    })
  );

  await safeSend("appointment-admin", () =>
    sendEmail({
      to: getBillingEmails(),
      subject: admin.subject,
      text: admin.text,
      html: admin.html,
    })
  );
};

const sendCustomQuoteNotifyEmail = async (quote, estimateAmount) => {
  const adminContent = buildCustomQuoteNotifyEmail(quote, estimateAmount);
  const customerContent = buildCustomQuoteCustomerEmail(quote, estimateAmount);

  await safeSend("custom-quote-customer", () =>
    sendEmail({
      to: quote.email,
      subject: customerContent.subject,
      text: customerContent.text,
      html: customerContent.html,
    })
  );

  await safeSend("custom-quote", () =>
    sendEmail({
      to: getBillingEmails(),
      subject: adminContent.subject,
      text: adminContent.text,
      html: adminContent.html,
    })
  );
};

const sendNewsletterWelcomeEmail = async (email, unsubscribeUrl) => {
  const content = buildNewsletterWelcomeEmail(email, unsubscribeUrl);
  await safeSend("newsletter-welcome", () =>
    sendEmail({
      to: email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    })
  );
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendStaffInviteEmail,
  sendPaidOrderEmails,
  sendOrderStatusEmail,
  sendPaymentFailedEmail,
  sendContactNotifyEmail,
  sendAppointmentEmails,
  sendCustomQuoteNotifyEmail,
  sendNewsletterWelcomeEmail,
};
