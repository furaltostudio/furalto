const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

const validate = (validations = []) => async (req, res, next) => {
  if (!Array.isArray(validations)) {
    return next(new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Invalid route validation config"));
  }

  await Promise.all(validations.map((validation) => validation.run(req)));

  const { validationResult } = require("express-validator");
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Validation failed",
        errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        }))
      )
    );
  }

  return next();
};

module.exports = validate;
