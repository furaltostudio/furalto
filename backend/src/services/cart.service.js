const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return cart.items;
};

const resolveProductSnapshot = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Product not found");
  }

  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images?.find((img) => !img.hidden)?.src || product.images?.[0]?.src || "",
  };
};

const addCartItem = async (userId, item) => {
  const snapshot = await resolveProductSnapshot(item.slug);
  const cart = await getOrCreateCart(userId);
  const existingIndex = cart.items.findIndex((entry) => entry.itemId === item.itemId);

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += item.quantity || 1;
    cart.items[existingIndex].price = snapshot.price;
    cart.items[existingIndex].name = snapshot.name;
    cart.items[existingIndex].image = snapshot.image || cart.items[existingIndex].image;
  } else {
    cart.items.push({
      itemId: item.itemId,
      slug: snapshot.slug,
      name: snapshot.name,
      price: snapshot.price,
      image: snapshot.image || item.image,
      quantity: item.quantity || 1,
      fabric: item.fabric,
      finish: item.finish,
      size: item.size,
    });
  }

  await cart.save();
  return cart.items;
};

const updateCartItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((entry) => entry.itemId === itemId);

  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Cart item not found");
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((entry) => entry.itemId !== itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  return cart.items;
};

const removeCartItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((entry) => entry.itemId !== itemId);
  await cart.save();
  return cart.items;
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return [];
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
