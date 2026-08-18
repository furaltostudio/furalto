const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const { verifyAccessToken } = require("../services/token.service");
const User = require("../models/User.model");

const assertActiveUser = (user) => {
  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Your account has been deactivated");
  }
};

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authentication required");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-password");

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "User not found");
    }

    assertActiveUser(user);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token"));
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.accessToken;

    if (!token) {
      req.user = null;
      return next();
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-password");
    req.user = user || null;
    return next();
  } catch {
    req.user = null;
    return next();
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(HTTP_STATUS.FORBIDDEN, "You do not have permission to perform this action"));
    }

    return next();
  };

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
};
