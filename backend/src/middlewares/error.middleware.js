const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err?.error?.description) {
    // Razorpay / gateway style errors often have empty message
    statusCode = err.statusCode || HTTP_STATUS.BAD_REQUEST;
    message = err.error.description;
  }

  if (err instanceof multer.MulterError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 8MB or smaller" : err.message;
  } else if (
    !(err instanceof ApiError) &&
    (message === "Only image files are allowed" || message === "Cloudinary is not configured")
  ) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[API Error]", statusCode, message, err?.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
