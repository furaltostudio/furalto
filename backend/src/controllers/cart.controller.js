const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const cartService = require("../services/cart.service");

const getCart = asyncHandler(async (req, res) => {
  const items = await cartService.getCart(req.user._id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { items }, "Cart fetched"));
});

const addItem = asyncHandler(async (req, res) => {
  const items = await cartService.addCartItem(req.user._id, req.body);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { items }, "Item added to cart"));
});

const updateItem = asyncHandler(async (req, res) => {
  const items = await cartService.updateCartItem(
    req.user._id,
    req.params.itemId,
    req.body.quantity
  );

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { items }, "Cart updated"));
});

const removeItem = asyncHandler(async (req, res) => {
  const items = await cartService.removeCartItem(req.user._id, req.params.itemId);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { items }, "Item removed"));
});

const clearCart = asyncHandler(async (req, res) => {
  const items = await cartService.clearCart(req.user._id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { items }, "Cart cleared"));
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
