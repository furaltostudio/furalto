const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS, USER_ROLES } = require("../constants");
const { env } = require("../config");
const User = require("../models/User.model");
const StaffInvite = require("../models/StaffInvite.model");
const { buildAuthTokens } = require("./token.service");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./email.service");

const googleClient = env.google.clientId ? new OAuth2Client(env.google.clientId) : null;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const createVerificationToken = () => crypto.randomBytes(32).toString("hex");

const formatUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  provider: user.provider,
  role: user.role || USER_ROLES.CUSTOMER,
  isActive: user.isActive !== false,
  isEmailVerified: user.isEmailVerified,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

const registerUser = async ({ firstName, lastName, email, phone, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "An account with this email already exists");
  }

  const verificationToken = createVerificationToken();

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone: phone || "",
    password,
    provider: "local",
    isEmailVerified: false,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendVerificationEmail(user, verificationToken);

  return {
    user: formatUser(user),
    message: "Account created. Please check your email to verify your account.",
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !user.password) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Your account has been deactivated");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Please verify your email before signing in. Check your inbox for the verification link."
    );
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = buildAuthTokens(user._id.toString());

  return {
    user: formatUser(user),
    ...tokens,
  };
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired verification link");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  const tokens = buildAuthTokens(user._id.toString());

  return {
    user: formatUser(user),
    ...tokens,
    message: "Email verified successfully",
  };
};

const resendVerification = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+emailVerificationToken +emailVerificationExpires"
  );

  if (!user) {
    return { message: "If an account exists, a verification email has been sent." };
  }

  if (user.isEmailVerified) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is already verified");
  }

  const verificationToken = createVerificationToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user, verificationToken);

  return { message: "Verification email sent" };
};

const googleAuth = async (credential) => {
  if (!googleClient) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Google OAuth is not configured on the server");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.google.clientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Google account email not available");
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ $or: [{ email }, { googleId: payload.sub }] });

  if (user) {
    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Your account has been deactivated");
    }

    user.googleId = payload.sub;
    user.provider = "google";
    user.isEmailVerified = payload.email_verified ?? true;
    user.avatar = payload.picture || user.avatar;
    user.lastLoginAt = new Date();

    if (!user.firstName && payload.given_name) {
      user.firstName = payload.given_name;
    }
    if (!user.lastName && payload.family_name) {
      user.lastName = payload.family_name;
    }

    await user.save();
  } else {
    user = await User.create({
      firstName: payload.given_name || payload.name?.split(" ")[0] || "Furalto",
      lastName: payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "Member",
      email,
      provider: "google",
      googleId: payload.sub,
      isEmailVerified: payload.email_verified ?? true,
      avatar: payload.picture || "",
      lastLoginAt: new Date(),
    });
  }

  const tokens = buildAuthTokens(user._id.toString());

  return {
    user: formatUser(user),
    ...tokens,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  return formatUser(user);
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase(), provider: "local" }).select(
    "+passwordResetToken +passwordResetExpires"
  );

  if (!user) {
    return { message: "If an account exists, a password reset email has been sent." };
  }

  const resetToken = createVerificationToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user, resetToken);

  return { message: "If an account exists, a password reset email has been sent." };
};

const resetPassword = async (token, password) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires +password");

  if (!user) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired reset link");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.isEmailVerified = true;
  await user.save();

  const tokens = buildAuthTokens(user._id.toString());

  return {
    user: formatUser(user),
    ...tokens,
    message: "Password reset successfully",
  };
};

const refreshSession = async (refreshToken) => {
  const { verifyRefreshToken } = require("./token.service");
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Your account has been deactivated");
  }

  return buildAuthTokens(user._id.toString());
};

const getInviteDetails = async (token) => {
  const invite = await StaffInvite.findOne({
    token: hashToken(token),
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).select("-token");

  if (!invite) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired invite link");
  }

  return {
    email: invite.email,
    firstName: invite.firstName,
    lastName: invite.lastName,
    expiresAt: invite.expiresAt,
  };
};

const acceptStaffInvite = async ({ token, password, firstName, lastName }) => {
  const invite = await StaffInvite.findOne({
    token: hashToken(token),
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).select("+token");

  if (!invite) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired invite link");
  }

  let user = await User.findOne({ email: invite.email }).select("+password");

  if (user?.role === USER_ROLES.ADMIN) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This account already has admin access");
  }

  if (user) {
    user.role = USER_ROLES.STAFF;
    user.isActive = true;
    user.isEmailVerified = true;
    user.invitedBy = invite.invitedBy;
    user.password = password;
    user.provider = "local";

    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }

    await user.save();
  } else {
    user = await User.create({
      firstName: firstName || invite.firstName || "Furalto",
      lastName: lastName || invite.lastName || "Staff",
      email: invite.email,
      password,
      provider: "local",
      role: USER_ROLES.STAFF,
      isEmailVerified: true,
      isActive: true,
      invitedBy: invite.invitedBy,
    });
  }

  invite.status = "accepted";
  invite.acceptedAt = new Date();
  await invite.save();

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = buildAuthTokens(user._id.toString());

  return {
    user: formatUser(user),
    ...tokens,
    message: "Staff account activated successfully",
  };
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  googleAuth,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  refreshSession,
  getInviteDetails,
  acceptStaffInvite,
  formatUser,
};
