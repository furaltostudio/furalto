const BRAND = {
  name: "Furalto",
  tagline: "Luxury Furniture",
  navy: "#0d1520",
  cream: "#fef7ef",
  accent: "#a89478",
  muted: "#7a756e",
  border: "#e8e4df",
  text: "#1a232e",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  supportEmail: process.env.BREVO_SENDER_EMAIL || "furaltostudio@gmail.com",
  supportPhone: "+91 93114 87655",
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildEmailLayout = ({
  preheader,
  eyebrow,
  title,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  note,
  footerNote,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3efe8;font-family:Georgia,'Times New Roman',serif;color:${BRAND.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3efe8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid ${BRAND.border};">
          <tr>
            <td style="background-color:${BRAND.navy};padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:${BRAND.accent};">
                ${escapeHtml(BRAND.tagline)}
              </p>
              <p style="margin:10px 0 0;font-size:28px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND.cream};font-weight:500;">
                ${escapeHtml(BRAND.name)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:3px;background:linear-gradient(90deg, ${BRAND.accent} 0%, #d4c4b5 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:${BRAND.accent};">
                ${escapeHtml(eyebrow)}
              </p>
              <h1 style="margin:0 0 18px;font-size:30px;line-height:1.25;font-weight:500;color:${BRAND.text};">
                ${escapeHtml(title)}
              </h1>
              <div style="font-size:16px;line-height:1.7;color:${BRAND.text};">
                ${bodyHtml}
              </div>
              ${
                ctaLabel && ctaUrl
                  ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="border-radius:0;background-color:${BRAND.navy};">
                    <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;color:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;">
                      ${escapeHtml(ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:12px;line-height:1.6;word-break:break-all;">
                <a href="${ctaUrl}" style="color:${BRAND.navy};text-decoration:underline;">${ctaUrl}</a>
              </p>
              `
                  : ""
              }
              ${
                note
                  ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${note}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid ${BRAND.border};">
                <tr>
                  <td style="padding-top:22px;font-size:13px;line-height:1.7;color:${BRAND.muted};">
                    <p style="margin:0 0 8px;">
                      Need help? Contact us at
                      <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.navy};text-decoration:underline;">${BRAND.supportEmail}</a>
                      or call <a href="tel:+919311487655" style="color:${BRAND.navy};text-decoration:underline;">${BRAND.supportPhone}</a>.
                    </p>
                    ${
                      footerNote
                        ? `<p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">${footerNote}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#faf7f2;padding:18px 32px;text-align:center;border-top:1px solid ${BRAND.border};">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.muted};">
                ${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.tagline)}
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                Office No. 103–104, First Floor, Pocket 5, Sector 24, Rohini, New Delhi 110085
              </p>
              <p style="margin:10px 0 0;font-size:12px;line-height:1.6;">
                <a href="${BRAND.frontendUrl}" style="color:${BRAND.navy};text-decoration:underline;">Visit Furalto</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buildVerificationEmail = (user, verifyUrl) => {
  const firstName = escapeHtml(user.firstName || "there");

  const html = buildEmailLayout({
    preheader: "Confirm your email to activate your Furalto account.",
    eyebrow: "Account Verification",
    title: "Welcome to Furalto",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${firstName},</p>
      <p style="margin:0 0 14px;">
        Thank you for creating your Furalto account. Please confirm your email address to activate your profile,
        save wishlists, track orders, and book design appointments.
      </p>
      <p style="margin:0;">
        For your security, this verification link will expire in <strong>24 hours</strong>.
      </p>
    `,
    ctaLabel: "Verify Email Address",
    ctaUrl: verifyUrl,
    note: "If you did not create a Furalto account, you can safely ignore this email.",
    footerNote: "This is an automated message. Please do not reply directly to this email.",
  });

  const text = `Hi ${user.firstName || "there"},

Welcome to Furalto. Please verify your email address to activate your account:
${verifyUrl}

This link expires in 24 hours.

If you did not create this account, you can ignore this email.

Furalto
${BRAND.supportEmail} | ${BRAND.supportPhone}`;

  return {
    subject: "Verify your Furalto account",
    html,
    text,
  };
};

const buildPasswordResetEmail = (user, resetUrl) => {
  const firstName = escapeHtml(user.firstName || "there");

  const html = buildEmailLayout({
    preheader: "Reset your Furalto account password securely.",
    eyebrow: "Password Reset",
    title: "Reset your password",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${firstName},</p>
      <p style="margin:0 0 14px;">
        We received a request to reset the password for your Furalto account.
        Click the button below to choose a new password.
      </p>
      <p style="margin:0;">
        This reset link will expire in <strong>1 hour</strong> for your security.
      </p>
    `,
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl,
    note: "If you did not request a password reset, no action is required and your password will remain unchanged.",
    footerNote: "For account security, never share this link with anyone.",
  });

  const text = `Hi ${user.firstName || "there"},

We received a request to reset your Furalto password:
${resetUrl}

This link expires in 1 hour.

If you did not request this, you can ignore this email.

Furalto
${BRAND.supportEmail} | ${BRAND.supportPhone}`;

  return {
    subject: "Reset your Furalto password",
    html,
    text,
  };
};

const buildStaffInviteEmail = ({ email, firstName, inviteUrl, invitedByName }) => {
  const displayName = escapeHtml(firstName || email.split("@")[0]);

  const html = buildEmailLayout({
    preheader: "You have been invited to join the Furalto operations team.",
    eyebrow: "Team Invite",
    title: "Join the Furalto team",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${displayName},</p>
      <p style="margin:0 0 14px;">
        ${escapeHtml(invitedByName)} has invited you to join Furalto as a staff member.
        You will be able to track orders, manage appointments, and respond to customer enquiries.
      </p>
      <p style="margin:0;">
        Click below to set your password and activate your staff account. This invite expires in <strong>7 days</strong>.
      </p>
    `,
    ctaLabel: "Accept Invitation",
    ctaUrl: inviteUrl,
    note: "If you were not expecting this invitation, you can safely ignore this email.",
    footerNote: "Staff accounts are for authorised Furalto team members only.",
  });

  const text = `Hi ${firstName || "there"},

${invitedByName} has invited you to join Furalto as a staff member.
Accept your invitation here:
${inviteUrl}

This link expires in 7 days.

Furalto
${BRAND.supportEmail} | ${BRAND.supportPhone}`;

  return {
    subject: "You are invited to join Furalto",
    html,
    text,
  };
};

const formatInr = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatStatusLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildOrderItemsHtml = (items = []) => {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.text};">
          ${escapeHtml(item.name)}
          ${item.quantity > 1 ? ` × ${item.quantity}` : ""}
          ${
            item.fabric || item.finish || item.size
              ? `<br /><span style="font-size:12px;color:${BRAND.muted};">${escapeHtml(
                  [item.fabric, item.finish, item.size].filter(Boolean).join(" · ")
                )}</span>`
              : ""
          }
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;text-align:right;white-space:nowrap;color:${BRAND.text};">
          ${formatInr(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 8px;">
      ${rows}
    </table>
  `;
};

const buildOrderItemsText = (items = []) =>
  items
    .map(
      (item) =>
        `- ${item.name} × ${item.quantity}: ${formatInr(item.price * item.quantity)}`
    )
    .join("\n");

const buildOrderConfirmationEmail = (order) => {
  const firstName = escapeHtml(order.contact?.firstName || "there");
  const trackUrl = `${BRAND.frontendUrl}/track-order?orderNumber=${encodeURIComponent(
    order.orderNumber
  )}&email=${encodeURIComponent(order.contact?.email || "")}`;

  const html = buildEmailLayout({
    preheader: `Order ${order.orderNumber} is confirmed. Total ${formatInr(order.total)}.`,
    eyebrow: "Order Confirmed",
    title: "Thank you for your order",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${firstName},</p>
      <p style="margin:0 0 14px;">
        We’ve received your payment and confirmed order <strong>${escapeHtml(
          order.orderNumber
        )}</strong>.
        Our studio will begin preparing your pieces with care.
      </p>
      ${buildOrderItemsHtml(order.items)}
      <p style="margin:12px 0 4px;font-size:14px;color:${BRAND.muted};">
        Subtotal: ${formatInr(order.subtotal)}
        ${
          order.discount
            ? ` · Promo discount: −${formatInr(order.discount)}`
            : ""
        }
         · Shipping: ${
          order.shipping === 0 ? "Complimentary" : formatInr(order.shipping)
        }
      </p>
      <p style="margin:0 0 14px;font-size:18px;font-weight:500;">
        Total paid: ${formatInr(order.total)}
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.muted};">
        Delivering to ${escapeHtml(order.contact?.address || "")},
        ${escapeHtml(order.contact?.city || "")}
        ${order.contact?.state ? `, ${escapeHtml(order.contact.state)}` : ""}
        ${escapeHtml(order.contact?.postalCode || "")}.
      </p>
    `,
    ctaLabel: "Track Your Order",
    ctaUrl: trackUrl,
    note: "A separate payment receipt is included in this confirmation for your records.",
    footerNote: "Keep this email for your billing records.",
  });

  const text = `Hi ${order.contact?.firstName || "there"},

Your Furalto order ${order.orderNumber} is confirmed.
Total paid: ${formatInr(order.total)}

Items:
${buildOrderItemsText(order.items)}

Track your order:
${trackUrl}

Furalto
${BRAND.supportEmail} | ${BRAND.supportPhone}`;

  return {
    subject: `Order confirmed · ${order.orderNumber}`,
    html,
    text,
  };
};

const buildPaymentReceiptEmail = (order) => {
  const firstName = escapeHtml(order.contact?.firstName || "there");
  const paymentId = order.razorpayPaymentId || "—";

  const html = buildEmailLayout({
    preheader: `Payment receipt for ${order.orderNumber} · ${formatInr(order.total)}.`,
    eyebrow: "Payment Receipt",
    title: "Your billing receipt",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${firstName},</p>
      <p style="margin:0 0 14px;">
        This is your official payment receipt for Furalto order
        <strong>${escapeHtml(order.orderNumber)}</strong>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 16px;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:${BRAND.muted};">Order number</td>
          <td style="padding:8px 0;text-align:right;">${escapeHtml(order.orderNumber)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${BRAND.muted};">Payment ID</td>
          <td style="padding:8px 0;text-align:right;">${escapeHtml(paymentId)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${BRAND.muted};">Payment method</td>
          <td style="padding:8px 0;text-align:right;">${escapeHtml(
            formatStatusLabel(order.paymentMethod || "razorpay")
          )}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${BRAND.muted};">Payment status</td>
          <td style="padding:8px 0;text-align:right;">Paid</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-top:1px solid ${BRAND.border};font-size:16px;">Amount charged</td>
          <td style="padding:8px 0;border-top:1px solid ${BRAND.border};text-align:right;font-size:16px;font-weight:500;">
            ${formatInr(order.total)}
          </td>
        </tr>
      </table>
      ${buildOrderItemsHtml(order.items)}
    `,
    note: "Please retain this receipt for your accounts and tax records.",
    footerNote: "Billed by Furalto · Luxury Furniture",
  });

  const text = `Hi ${order.contact?.firstName || "there"},

Payment receipt for order ${order.orderNumber}
Payment ID: ${paymentId}
Amount charged: ${formatInr(order.total)}
Status: Paid

Items:
${buildOrderItemsText(order.items)}

Furalto
${BRAND.supportEmail} | ${BRAND.supportPhone}`;

  return {
    subject: `Payment receipt · ${order.orderNumber}`,
    html,
    text,
  };
};

const buildAdminNewOrderEmail = (order) => {
  const adminUrl = `${BRAND.frontendUrl}/admin/orders`;

  const html = buildEmailLayout({
    preheader: `New paid order ${order.orderNumber} · ${formatInr(order.total)}.`,
    eyebrow: "Studio Alert",
    title: "New paid order received",
    bodyHtml: `
      <p style="margin:0 0 14px;">
        Order <strong>${escapeHtml(order.orderNumber)}</strong> has been paid and confirmed.
      </p>
      <p style="margin:0 0 8px;font-size:14px;">
        Customer: ${escapeHtml(order.contact?.firstName || "")} ${escapeHtml(
          order.contact?.lastName || ""
        )}
        · ${escapeHtml(order.contact?.email || "")}
        · ${escapeHtml(order.contact?.phone || "")}
      </p>
      <p style="margin:0 0 14px;font-size:14px;">
        Ship to: ${escapeHtml(order.contact?.address || "")},
        ${escapeHtml(order.contact?.city || "")} ${escapeHtml(order.contact?.postalCode || "")}
      </p>
      ${buildOrderItemsHtml(order.items)}
      <p style="margin:12px 0 0;font-size:18px;font-weight:500;">Total: ${formatInr(
        order.total
      )}</p>
    `,
    ctaLabel: "Open Admin Orders",
    ctaUrl: adminUrl,
    footerNote: "Internal notification for Furalto operations.",
  });

  const text = `New paid order ${order.orderNumber}
Total: ${formatInr(order.total)}
Customer: ${order.contact?.email}
${adminUrl}`;

  return {
    subject: `New order · ${order.orderNumber} · ${formatInr(order.total)}`,
    html,
    text,
  };
};

const buildOrderStatusEmail = (order, previousStatus, options = {}) => {
  const firstName = escapeHtml(order.contact?.firstName || "there");
  const statusLabel = formatStatusLabel(order.status);
  const trackUrl = `${BRAND.frontendUrl}/track-order?orderNumber=${encodeURIComponent(
    order.orderNumber
  )}&email=${encodeURIComponent(order.contact?.email || "")}`;
  const reviewUrl = options.reviewInviteToken
    ? `${BRAND.frontendUrl}/feedback?token=${encodeURIComponent(options.reviewInviteToken)}`
    : null;

  const copyByStatus = {
    processing: "Your order is now being prepared in our studio.",
    shipped: "Your order is on its way. You can track progress anytime.",
    delivered: "Your order has been marked as delivered. We hope you love every detail.",
    cancelled: "Your order has been cancelled. If this is unexpected, please contact us.",
    confirmed: "Your order is confirmed and queued for preparation.",
    pending: "Your order is pending confirmation.",
  };

  const feedbackHtml =
    order.status === "delivered" && reviewUrl
      ? `
      <p style="margin:18px 0 0;">
        We’d love your honest feedback — it helps other customers choose with confidence.
      </p>
    `
      : "";

  const html = buildEmailLayout({
    preheader:
      order.status === "delivered" && reviewUrl
        ? `Order ${order.orderNumber} delivered — share your feedback.`
        : `Order ${order.orderNumber} is now ${statusLabel}.`,
    eyebrow: "Order Update",
    title: order.status === "delivered" ? "Your order was delivered" : `Order ${statusLabel.toLowerCase()}`,
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${firstName},</p>
      <p style="margin:0 0 14px;">
        An update on order <strong>${escapeHtml(order.orderNumber)}</strong>:
        status changed${previousStatus ? ` from ${escapeHtml(formatStatusLabel(previousStatus))}` : ""}
        to <strong>${escapeHtml(statusLabel)}</strong>.
      </p>
      <p style="margin:0;">
        ${escapeHtml(copyByStatus[order.status] || "You can view the latest status anytime.")}
      </p>
      ${feedbackHtml}
    `,
    ctaLabel: order.status === "delivered" && reviewUrl ? "Share Your Feedback" : "View Order Status",
    ctaUrl: order.status === "delivered" && reviewUrl ? reviewUrl : trackUrl,
    footerNote:
      order.status === "delivered" && reviewUrl
        ? `You can also track this order anytime: ${trackUrl}`
        : "You receive these updates whenever your order status changes.",
  });

  const text = `Hi ${order.contact?.firstName || "there"},

Order ${order.orderNumber} is now ${statusLabel}.
${copyByStatus[order.status] || ""}
${
  order.status === "delivered" && reviewUrl
    ? `\nShare your feedback: ${reviewUrl}\n`
    : ""
}
Track: ${trackUrl}

Furalto
${BRAND.supportEmail} | ${BRAND.supportPhone}`;

  return {
    subject:
      order.status === "delivered"
        ? `Order ${order.orderNumber} · Delivered — share your feedback`
        : `Order ${order.orderNumber} · ${statusLabel}`,
    html,
    text,
  };
};

const buildPaymentFailedEmail = (order) => {
  const firstName = escapeHtml(order.contact?.firstName || "there");
  const checkoutUrl = `${BRAND.frontendUrl}/checkout`;

  const html = buildEmailLayout({
    preheader: `Payment unsuccessful for order ${order.orderNumber}.`,
    eyebrow: "Payment Update",
    title: "Payment was not completed",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${firstName},</p>
      <p style="margin:0 0 14px;">
        We couldn’t confirm payment for order <strong>${escapeHtml(
          order.orderNumber
        )}</strong>.
        No amount has been captured for this attempt.
      </p>
      <p style="margin:0;">
        You can return to checkout and try again with another method, or contact us if you need help.
      </p>
    `,
    ctaLabel: "Return to Checkout",
    ctaUrl: checkoutUrl,
    footerNote: "If funds were held by your bank, they are typically released automatically.",
  });

  const text = `Hi ${order.contact?.firstName || "there"},

Payment was not completed for order ${order.orderNumber}.
Try again: ${checkoutUrl}

Furalto
${BRAND.supportEmail} | ${BRAND.supportPhone}`;

  return {
    subject: `Payment unsuccessful · ${order.orderNumber}`,
    html,
    text,
  };
};

const buildContactNotifyEmail = (inquiry) => {
  const html = buildEmailLayout({
    preheader: `New contact enquiry from ${inquiry.email}.`,
    eyebrow: "Contact Enquiry",
    title: "New website enquiry",
    bodyHtml: `
      <p style="margin:0 0 10px;"><strong>${escapeHtml(inquiry.firstName)} ${escapeHtml(
        inquiry.lastName
      )}</strong></p>
      <p style="margin:0 0 10px;font-size:14px;color:${BRAND.muted};">
        ${escapeHtml(inquiry.email)}${inquiry.phone ? ` · ${escapeHtml(inquiry.phone)}` : ""}
      </p>
      <p style="margin:0 0 10px;"><strong>Subject:</strong> ${escapeHtml(inquiry.subject)}</p>
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</p>
    `,
    ctaLabel: "Open Admin Contacts",
    ctaUrl: `${BRAND.frontendUrl}/admin/contacts`,
    footerNote: "Internal notification for Furalto studio.",
  });

  const text = `New enquiry from ${inquiry.firstName} ${inquiry.lastName}
${inquiry.email}
${inquiry.subject}

${inquiry.message}`;

  return {
    subject: `Contact · ${inquiry.subject}`,
    html,
    text,
  };
};

const buildAppointmentEmails = (appointment) => {
  const customerFirst = escapeHtml(appointment.firstName || "there");
  const when = appointment.preferredDate
    ? new Date(appointment.preferredDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "To be confirmed";

  const customer = {
    subject: "Your Furalto design appointment request",
    html: buildEmailLayout({
      preheader: "We received your design appointment request.",
      eyebrow: "Appointment",
      title: "Request received",
      bodyHtml: `
        <p style="margin:0 0 14px;">Hi ${customerFirst},</p>
        <p style="margin:0 0 14px;">
          Thank you for booking a design consultation. Our studio will confirm your preferred time shortly.
        </p>
        <p style="margin:0;font-size:14px;color:${BRAND.muted};">
          Preferred: ${escapeHtml(when)}
          ${appointment.showroom ? ` · ${escapeHtml(appointment.showroom)}` : ""}
        </p>
      `,
      footerNote: "You will receive another email once your appointment is confirmed.",
    }),
    text: `Hi ${appointment.firstName || "there"},

We received your appointment request for ${when}.
Our studio will confirm shortly.

Furalto
${BRAND.supportEmail}`,
  };

  const admin = {
    subject: `Appointment request · ${appointment.firstName} ${appointment.lastName}`,
    html: buildEmailLayout({
      preheader: "New design appointment request.",
      eyebrow: "Studio Alert",
      title: "New appointment request",
      bodyHtml: `
        <p style="margin:0 0 10px;">
          <strong>${escapeHtml(appointment.firstName)} ${escapeHtml(
            appointment.lastName
          )}</strong>
        </p>
        <p style="margin:0 0 10px;font-size:14px;color:${BRAND.muted};">
          ${escapeHtml(appointment.email)} · ${escapeHtml(appointment.phone || "—")}
        </p>
        <p style="margin:0 0 10px;">Preferred: ${escapeHtml(when)}</p>
        <p style="margin:0;">${escapeHtml(appointment.notes || appointment.message || "")}</p>
      `,
      ctaLabel: "Open Appointments",
      ctaUrl: `${BRAND.frontendUrl}/admin/appointments`,
      footerNote: "Internal notification for Furalto studio.",
    }),
    text: `Appointment request from ${appointment.firstName} ${appointment.lastName}
${appointment.email}
Preferred: ${when}`,
  };

  return { customer, admin };
};

const buildCustomQuoteNotifyEmail = (quote, estimateAmount) => {
  const html = buildEmailLayout({
    preheader: `New custom furniture quote from ${quote.email}.`,
    eyebrow: "Custom Studio",
    title: "New custom quote request",
    bodyHtml: `
      <p style="margin:0 0 10px;">
        <strong>${escapeHtml(quote.firstName)} ${escapeHtml(quote.lastName)}</strong>
      </p>
      <p style="margin:0 0 10px;font-size:14px;color:${BRAND.muted};">
        ${escapeHtml(quote.email)} · ${escapeHtml(quote.phone || "—")}
        ${quote.city ? ` · ${escapeHtml(quote.city)}` : ""}
      </p>
      <p style="margin:0 0 10px;">
        Indicative estimate: <strong>${formatInr(estimateAmount)}</strong>
      </p>
      <p style="margin:0 0 8px;font-size:14px;">
        ${escapeHtml(quote.configuration?.pieceLabel || "")} ·
        ${escapeHtml(quote.configuration?.woodLabel || "")} ·
        ${escapeHtml(quote.configuration?.fabricLabel || "")} ·
        ${escapeHtml(quote.configuration?.finishLabel || "")} ·
        ${escapeHtml(quote.configuration?.sizeLabel || "")}
      </p>
      <p style="margin:0;">${escapeHtml(quote.message || "")}</p>
    `,
    ctaLabel: "Open Custom Quotes",
    ctaUrl: `${BRAND.frontendUrl}/admin/custom-quotes`,
    footerNote: "Internal notification for Furalto studio.",
  });

  const text = `Custom quote from ${quote.firstName} ${quote.lastName}
${quote.email}
Estimate: ${formatInr(estimateAmount)}`;

  return {
    subject: `Custom quote · ${quote.firstName} ${quote.lastName}`,
    html,
    text,
  };
};

const buildCustomQuoteCustomerEmail = (quote, estimateAmount) => {
  const firstName = escapeHtml(quote.firstName || "there");
  const html = buildEmailLayout({
    preheader: `We received your custom furniture request. Indicative estimate ${formatInr(
      estimateAmount
    )}.`,
    eyebrow: "Custom Studio",
    title: "We received your quote request",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${firstName},</p>
      <p style="margin:0 0 14px;">
        Thank you for sharing your custom piece brief with Furalto. Our studio team will review
        your configuration and respond with a refined quote.
      </p>
      <p style="margin:0 0 10px;">
        Indicative estimate: <strong>${formatInr(estimateAmount)}</strong>
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:${BRAND.muted};">
        ${escapeHtml(quote.configuration?.pieceLabel || "")} ·
        ${escapeHtml(quote.configuration?.woodLabel || "")} ·
        ${escapeHtml(quote.configuration?.fabricLabel || "")} ·
        ${escapeHtml(quote.configuration?.finishLabel || "")} ·
        ${escapeHtml(quote.configuration?.sizeLabel || "")}
      </p>
      <p style="margin:0;font-size:13px;color:${BRAND.muted};">
        This estimate is indicative and may change after material, finish, and site review.
      </p>
    `,
    ctaLabel: "Explore Collections",
    ctaUrl: `${BRAND.frontendUrl}/collections`,
    footerNote: "You will hear from our studio shortly.",
  });

  const text = `Hi ${quote.firstName || "there"},

We received your Furalto custom furniture request.
Indicative estimate: ${formatInr(estimateAmount)}

Our studio will follow up soon.
${BRAND.supportEmail}`;

  return {
    subject: "We received your custom quote request",
    html,
    text,
  };
};

const buildTaxInvoiceEmail = (order, company = {}) => {
  const { breakdownGstInclusive } = require("../utils/pricing");
  const gst = breakdownGstInclusive(order.total);
  const companyState = (company.state || "").trim().toLowerCase();
  const customerState = (order.contact?.state || "").trim().toLowerCase();
  const isIntraState =
    companyState && customerState && companyState === customerState;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const legalName = escapeHtml(company.legalName || BRAND.name);
  const gstin = String(company.gstin || "").trim().toUpperCase();
  const isProd = (process.env.NODE_ENV || "development") === "production";
  if (!gstin && isProd) {
    throw new Error("COMPANY_GSTIN is required to generate a tax invoice.");
  }
  const companyAddress = escapeHtml(company.address || "");
  const sellerLine = gstin
    ? `${legalName} · GSTIN ${escapeHtml(gstin)}`
    : legalName;
  const sellerLineText = gstin
    ? `${company.legalName || BRAND.name} · GSTIN ${gstin}`
    : company.legalName || BRAND.name;

  const taxRows = isIntraState
    ? `
        <tr>
          <td style="padding:6px 0;color:${BRAND.muted};">CGST (9%)</td>
          <td style="padding:6px 0;text-align:right;">${formatInr(gst.cgst)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:${BRAND.muted};">SGST (9%)</td>
          <td style="padding:6px 0;text-align:right;">${formatInr(gst.sgst)}</td>
        </tr>
      `
    : `
        <tr>
          <td style="padding:6px 0;color:${BRAND.muted};">IGST (18%)</td>
          <td style="padding:6px 0;text-align:right;">${formatInr(gst.igst)}</td>
        </tr>
      `;

  const html = buildEmailLayout({
    preheader: `Tax invoice for order ${order.orderNumber}.`,
    eyebrow: "Tax Invoice",
    title: `Invoice ${escapeHtml(order.orderNumber)}`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:14px;color:${BRAND.muted};">
        ${sellerLine}
        ${companyAddress ? `<br/>${companyAddress}` : ""}
      </p>
      <p style="margin:0 0 14px;font-size:14px;">
        Bill to: ${escapeHtml(order.contact?.firstName || "")} ${escapeHtml(
          order.contact?.lastName || ""
        )}<br/>
        ${escapeHtml(order.contact?.address || "")}, ${escapeHtml(order.contact?.city || "")}
        ${order.contact?.state ? `, ${escapeHtml(order.contact.state)}` : ""}
        ${escapeHtml(order.contact?.postalCode || "")}<br/>
        Invoice date: ${escapeHtml(invoiceDate)}
      </p>
      ${buildOrderItemsHtml(order.items)}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:12px 0 0;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:${BRAND.muted};">Taxable value</td>
          <td style="padding:6px 0;text-align:right;">${formatInr(gst.taxableValue)}</td>
        </tr>
        ${taxRows}
        ${
          order.discount
            ? `<tr>
          <td style="padding:6px 0;color:${BRAND.muted};">Promo discount (included in totals)</td>
          <td style="padding:6px 0;text-align:right;">−${formatInr(order.discount)}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding:10px 0 0;border-top:1px solid ${BRAND.border};font-size:16px;">Invoice total (incl. GST)</td>
          <td style="padding:10px 0 0;border-top:1px solid ${BRAND.border};text-align:right;font-size:16px;font-weight:500;">
            ${formatInr(order.total)}
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">
        Prices are GST-inclusive at 18%. This invoice is generated for your records.
      </p>
    `,
    ctaLabel: "Track Order",
    ctaUrl: `${BRAND.frontendUrl}/track-order?orderNumber=${encodeURIComponent(
      order.orderNumber
    )}&email=${encodeURIComponent(order.contact?.email || "")}`,
    footerNote: "Retain this email for GST / accounting purposes.",
  });

  const text = `Tax invoice ${order.orderNumber}
${sellerLineText}
Total (incl. GST): ${formatInr(order.total)}
Taxable value: ${formatInr(gst.taxableValue)}
GST: ${formatInr(gst.gstAmount)}`;

  return {
    subject: `Tax invoice · ${order.orderNumber}`,
    html,
    text,
  };
};

const buildNewsletterWelcomeEmail = (email, unsubscribeUrl) => {
  const html = buildEmailLayout({
    preheader: "Welcome to the Furalto newsletter.",
    eyebrow: "Newsletter",
    title: "You’re on the list",
    bodyHtml: `
      <p style="margin:0 0 14px;">Thank you for subscribing.</p>
      <p style="margin:0;">
        We’ll share new collections, studio stories, and private invitations — thoughtfully, never loudly.
      </p>
    `,
    ctaLabel: "Explore Collections",
    ctaUrl: `${BRAND.frontendUrl}/collections`,
    footerNote: unsubscribeUrl
      ? `Prefer fewer emails? <a href="${unsubscribeUrl}" style="color:${BRAND.navy};">Unsubscribe</a>.`
      : undefined,
  });

  const text = `Welcome to the Furalto newsletter.
Explore collections: ${BRAND.frontendUrl}/collections
${unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : ""}`;

  return {
    subject: "Welcome to Furalto",
    html,
    text,
  };
};

module.exports = {
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
};
