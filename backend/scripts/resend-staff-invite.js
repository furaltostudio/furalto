/**
 * Resend the latest pending staff invite email with a fresh token.
 * Usage: node scripts/resend-staff-invite.js [email]
 */
require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const StaffInvite = require("../src/models/StaffInvite.model");
const User = require("../src/models/User.model");
const { sendStaffInviteEmail } = require("../src/services/email.service");
const { USER_ROLES } = require("../src/constants");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

(async () => {
  const email = (process.argv[2] || "furaltostudio@gmail.com").toLowerCase();
  await mongoose.connect(process.env.MONGODB_URI);

  const invite = await StaffInvite.findOne({
    email,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!invite) {
    console.error("No pending invite found for", email);
    process.exit(1);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  invite.token = hashToken(rawToken);
  invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await invite.save();

  const admin = await User.findOne({ role: USER_ROLES.ADMIN }).sort({ createdAt: 1 });

  await sendStaffInviteEmail({
    email: invite.email,
    firstName: invite.firstName,
    token: rawToken,
    invitedByName: admin ? `${admin.firstName} ${admin.lastName}`.trim() : "Furalto Admin",
  });

  console.log("Invite email resent to", invite.email);
  console.log("Accept link:", `${process.env.FRONTEND_URL || "http://localhost:3000"}/account/accept-invite?token=${rawToken}`);
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
