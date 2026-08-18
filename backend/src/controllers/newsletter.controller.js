const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const newsletterService = require("../services/newsletter.service");

const subscribe = asyncHandler(async (req, res) => {
  const result = await newsletterService.subscribe(req.body.email, req.body.source);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

const unsubscribe = asyncHandler(async (req, res) => {
  const result = await newsletterService.unsubscribe(req.body.email, req.body.token);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

const unsubscribeGet = asyncHandler(async (req, res) => {
  const result = await newsletterService.unsubscribe(req.query.email, req.query.token);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

module.exports = {
  subscribe,
  unsubscribe,
  unsubscribeGet,
};
