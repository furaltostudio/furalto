const crypto = require("crypto");
const Review = require("../models/Review.model");
const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const createReviewInviteToken = () => crypto.randomBytes(32).toString("hex");

const INVITE_TTL_DAYS = 90;

const prepareReviewInvite = (order) => {
  const token = createReviewInviteToken();
  order.reviewInviteTokenHash = hashToken(token);
  order.reviewInviteExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  return token;
};

const applySoldCountsForOrder = async (order) => {
  if (order.soldCountAppliedAt || !order.items?.length) {
    return;
  }

  const increments = new Map();
  for (const item of order.items) {
    if (!item?.slug) continue;
    increments.set(item.slug, (increments.get(item.slug) || 0) + Number(item.quantity || 1));
  }

  await Promise.all(
    [...increments.entries()].map(([slug, quantity]) =>
      Product.updateOne({ slug }, { $inc: { soldCount: quantity } })
    )
  );

  order.soldCountAppliedAt = new Date();
};

const refreshProductRating = async (productSlug) => {
  const [stats] = await Review.aggregate([
    { $match: { productSlug, isPublished: true } },
    {
      $group: {
        _id: "$productSlug",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await Product.updateOne(
    { slug: productSlug },
    {
      $set: {
        averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
        reviewCount: stats?.reviewCount || 0,
      },
    }
  );
};

const findOrderByInviteToken = async (token) => {
  if (!token?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Feedback token is required");
  }

  const order = await Order.findOne({
    reviewInviteTokenHash: hashToken(token.trim()),
  });

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "This feedback link is invalid or has expired");
  }

  if (order.status !== "delivered") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Feedback is available after delivery");
  }

  if (order.reviewInviteExpiresAt && order.reviewInviteExpiresAt.getTime() < Date.now()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This feedback link has expired");
  }

  return order;
};

const getInviteByToken = async (token) => {
  const order = await findOrderByInviteToken(token);

  const existing = await Review.find({ orderNumber: order.orderNumber })
    .select("productSlug")
    .lean();
  const reviewedSlugs = new Set(existing.map((item) => item.productSlug));

  const items = [];
  const seen = new Set();

  for (const item of order.items || []) {
    if (!item?.slug || seen.has(item.slug)) continue;
    seen.add(item.slug);
    items.push({
      slug: item.slug,
      name: item.name,
      image: item.image,
      alreadyReviewed: reviewedSlugs.has(item.slug),
    });
  }

  return {
    orderNumber: order.orderNumber,
    customerName: [order.contact?.firstName, order.contact?.lastName].filter(Boolean).join(" "),
    items,
    expiresAt: order.reviewInviteExpiresAt,
  };
};

const submitReview = async ({ token, productSlug, rating, title = "", comment }) => {
  const order = await findOrderByInviteToken(token);
  const item = (order.items || []).find((entry) => entry.slug === productSlug);

  if (!item) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "This product is not part of your order");
  }

  const existing = await Review.findOne({ orderNumber: order.orderNumber, productSlug });
  if (existing) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You have already reviewed this product");
  }

  const authorName =
    [order.contact?.firstName, order.contact?.lastName].filter(Boolean).join(" ").trim() ||
    "Furalto customer";

  const review = await Review.create({
    productSlug: item.slug,
    productName: item.name,
    order: order._id,
    orderNumber: order.orderNumber,
    user: order.user || undefined,
    authorName,
    authorEmail: order.contact?.email || "",
    rating: Number(rating),
    title: String(title || "").trim(),
    comment: String(comment || "").trim(),
    isPublished: true,
  });

  await refreshProductRating(item.slug);

  return review;
};

const listProductReviews = async (slug, { page = 1, limit = 24 } = {}) => {
  const product = await Product.findOne({ slug, isActive: true })
    .select("slug name soldCount averageRating reviewCount")
    .lean();

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Product not found");
  }

  const skip = (Number(page) - 1) * Number(limit);
  const filter = { productSlug: slug, isPublished: true };

  const [reviews, total, distribution, featuredAgg] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("authorName rating title comment createdAt productName")
      .lean(),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
    Review.find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .select("authorName rating title comment createdAt productName")
      .lean(),
  ]);

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of distribution) {
    const key = Number(row._id);
    if (ratingDistribution[key] !== undefined) {
      ratingDistribution[key] = row.count;
    }
  }

  const recommendCount = (ratingDistribution[4] || 0) + (ratingDistribution[5] || 0);
  const recommendPercent =
    total > 0 ? Math.round((recommendCount / total) * 100) : 0;

  const featured =
    [...featuredAgg].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (b.comment?.length || 0) - (a.comment?.length || 0);
    })[0] || null;

  return {
    product: {
      slug: product.slug,
      name: product.name,
      soldCount: product.soldCount || 0,
      averageRating: product.averageRating || 0,
      reviewCount: product.reviewCount || 0,
      recommendPercent,
      ratingDistribution,
    },
    featuredReview: featured,
    reviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 0,
    },
  };
};

module.exports = {
  prepareReviewInvite,
  applySoldCountsForOrder,
  getInviteByToken,
  submitReview,
  listProductReviews,
  refreshProductRating,
};
