const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const customFurnitureService = require("../services/custom-furniture.service");

const postChat = asyncHandler(async (req, res) => {
  const result = await customFurnitureService.chatAboutConfiguration(req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Studio AI reply ready"));
});

module.exports = {
  postChat,
};
