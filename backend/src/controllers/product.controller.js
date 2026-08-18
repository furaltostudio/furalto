const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/product.service");
const { env } = require("../config");

const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Products fetched"));
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { product }, "Product fetched"));
});

const getRelatedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getRelatedProducts(req.params.slug, {
    limit: req.query.limit,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { products }, "Related products fetched"));
});

const searchProducts = asyncHandler(async (req, res) => {
  const products = await productService.searchProducts(req.query.q, req.query.limit);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { products }, "Search results"));
});

const getCollections = asyncHandler(async (req, res) => {
  const collections = await productService.getCollections();

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { collections }, "Collections fetched"));
});

const seedProducts = asyncHandler(async (req, res) => {
  if (env.isProduction || env.nodeEnv === "production") {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      statusCode: HTTP_STATUS.FORBIDDEN,
      message: "Product seed endpoint is disabled in production",
    });
  }

  const secret = req.headers["x-seed-secret"];

  if (secret !== env.seedSecret) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: "Invalid seed secret",
    });
  }

  const result = await productService.seedProducts(req.body.products);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Products seeded"));
});

module.exports = {
  listProducts,
  getProduct,
  getRelatedProducts,
  searchProducts,
  getCollections,
  seedProducts,
};
