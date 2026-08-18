const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const uploadService = require("../services/upload.service");

const uploadImage = asyncHandler(async (req, res) => {
  if (!uploadService.isConfigured()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cloudinary is not configured on the server");
  }

  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Image file is required");
  }

  const folder = req.body.folder?.trim() || "furalto/products";
  const asset = await uploadService.uploadImage(req.file, folder);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, { asset }, "Image uploaded successfully")
  );
});

module.exports = {
  uploadImage,
};
