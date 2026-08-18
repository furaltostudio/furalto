const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

const setAuthCookies = (res, tokens) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, "Registration successful")
  );
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  setAuthCookies(res, result);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: result.user, accessToken: result.accessToken },
      "Signed in successfully"
    )
  );
});

const googleLogin = asyncHandler(async (req, res) => {
  const result = await authService.googleAuth(req.body.credential);
  setAuthCookies(res, result);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: result.user, accessToken: result.accessToken },
      "Signed in with Google"
    )
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body.token);
  setAuthCookies(res, result);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: result.user, accessToken: result.accessToken },
      result.message
    )
  );
});

const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { user }, "Profile fetched"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, "Signed out successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  setAuthCookies(res, result);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: result.user, accessToken: result.accessToken },
      result.message
    )
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: "Refresh token required",
    });
  }

  const tokens = await authService.refreshSession(token);
  setAuthCookies(res, tokens);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, { accessToken: tokens.accessToken }, "Token refreshed")
  );
});

const getInvite = asyncHandler(async (req, res) => {
  const invite = await authService.getInviteDetails(req.params.token);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { invite }, "Invite details fetched"));
});

const acceptInvite = asyncHandler(async (req, res) => {
  const result = await authService.acceptStaffInvite(req.body);
  setAuthCookies(res, result);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: result.user, accessToken: result.accessToken },
      result.message
    )
  );
});

module.exports = {
  register,
  login,
  googleLogin,
  verifyEmail,
  resendVerification,
  me,
  logout,
  forgotPassword,
  resetPassword,
  refreshToken,
  getInvite,
  acceptInvite,
};
