const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

const notFound = (req, res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route not found: ${req.originalUrl}`));
};

module.exports = notFound;
