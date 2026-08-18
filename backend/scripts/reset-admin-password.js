/**
 * Reset / create local admin login.
 * Usage: node scripts/reset-admin-password.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User.model");
const { USER_ROLES } = require("../src/constants");

const EMAIL = (process.env.ADMIN_EMAIL || "furaltostudio@gmail.com").toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD || "Rahul@123";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const staff = await User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.STAFF] },
  })
    .select("email role isActive provider isEmailVerified")
    .lean();

  console.log("Current staff/admin accounts:");
  for (const user of staff) {
    console.log(`- ${user.email} | role=${user.role} | active=${user.isActive} | provider=${user.provider}`);
  }

  let user = await User.findOne({ email: EMAIL }).select("+password");

  if (!user) {
    user = await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || "Furalto",
      lastName: process.env.ADMIN_LAST_NAME || "Admin",
      email: EMAIL,
      password: PASSWORD,
      provider: "local",
      role: USER_ROLES.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });
    console.log(`Created admin: ${EMAIL}`);
  } else {
    user.role = USER_ROLES.ADMIN;
    user.isActive = true;
    user.isEmailVerified = true;
    user.provider = "local";
    user.password = PASSWORD;
    await user.save();
    console.log(`Reset admin password for: ${EMAIL}`);
  }

  const check = await User.findOne({ email: EMAIL }).select("+password");
  const ok = await check.comparePassword(PASSWORD);
  console.log(`Password verify: ${ok ? "OK" : "FAILED"}`);
  console.log(`Login with: ${EMAIL} / ${PASSWORD}`);

  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
