const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const customFurnitureService = require("../services/custom-furniture.service");

const getCatalog = asyncHandler(async (_req, res) => {
  const catalog = customFurnitureService.getCatalog();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, catalog, "Catalog fetched"));
});

const postEstimate = asyncHandler(async (req, res) => {
  const includeAdvice = req.body.includeAdvice === true || req.body.includeAdvice === "true";
  const estimate = await customFurnitureService.estimateConfiguration(req.body, {
    includeAdvice,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { estimate }, "Estimate calculated"));
});

const postQuote = asyncHandler(async (req, res) => {
  const result = await customFurnitureService.submitQuote(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      result,
      "Custom furniture request received. Our studio will contact you shortly."
    )
  );
});

const postChat = asyncHandler(async (req, res) => {
  const result = await customFurnitureService.chatAboutConfiguration(req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Studio AI reply ready"));
});

module.exports = {
  getCatalog,
  postEstimate,
  postQuote,
  postChat,
};
