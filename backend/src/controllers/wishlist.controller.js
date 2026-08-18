const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const wishlistService = require("../services/wishlist.service");

const getWishlist = asyncHandler(async (req, res) => {
  const products = await wishlistService.getWishlist(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { products }, "Wishlist fetched"));
});

const addItem = asyncHandler(async (req, res) => {
  if (!req.body.slug) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Product slug is required");
  }

  const products = await wishlistService.addToWishlist(req.user._id, req.body.slug);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { products }, "Added to wishlist"));
});

const removeItem = asyncHandler(async (req, res) => {
  const products = await wishlistService.removeFromWishlist(req.user._id, req.params.slug);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { products }, "Removed from wishlist"));
});

module.exports = {
  getWishlist,
  addItem,
  removeItem,
};
