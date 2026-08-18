const Wishlist = require("../models/Wishlist.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, productSlugs: [] });
  }

  return wishlist;
};

const getWishlist = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);

  if (!wishlist.productSlugs.length) {
    return [];
  }

  const products = await Product.find({
    slug: { $in: wishlist.productSlugs },
    isActive: true,
  }).lean();

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return wishlist.productSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
};

const addToWishlist = async (userId, slug) => {
  const product = await Product.findOne({ slug, isActive: true });

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Product not found");
  }

  const wishlist = await getOrCreateWishlist(userId);

  if (!wishlist.productSlugs.includes(slug)) {
    wishlist.productSlugs.unshift(slug);
    await wishlist.save();
  }

  return getWishlist(userId);
};

const removeFromWishlist = async (userId, slug) => {
  const wishlist = await getOrCreateWishlist(userId);
  wishlist.productSlugs = wishlist.productSlugs.filter((entry) => entry !== slug);
  await wishlist.save();
  return getWishlist(userId);
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
