const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

/** Strip admin-hidden images and remap scaleImageIndex for storefront responses. */
const withVisibleImages = (product) => {
  if (!product) return product;

  const images = Array.isArray(product.images) ? product.images : [];
  const visible = [];
  const indexMap = new Map();

  images.forEach((image, index) => {
    if (image?.hidden) return;
    indexMap.set(index, visible.length);
    visible.push({
      src: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
    });
  });

  let scaleImageIndex = product.scaleImageIndex;
  if (scaleImageIndex != null && Number.isInteger(Number(scaleImageIndex))) {
    const mapped = indexMap.get(Number(scaleImageIndex));
    scaleImageIndex = mapped == null ? null : mapped;
  } else {
    scaleImageIndex = null;
  }

  return {
    ...product,
    images: visible,
    scaleImageIndex,
  };
};

const listProducts = async (query = {}) => {
  const {
    category,
    subcategory,
    room,
    q,
    collection,
    limit = 50,
    page = 1,
    sort = "name",
  } = query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (room) filter.rooms = room;
  if (collection) filter.collection = new RegExp(collection, "i");

  if (q) {
    filter.$text = { $search: q };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOption = q ? { score: { $meta: "textScore" } } : { [sort]: 1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items: items.map(withVisibleImages),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Product not found");
  }

  return withVisibleImages(product);
};

const getRelatedProducts = async (slug, { limit = 8 } = {}) => {
  const product = await getProductBySlug(slug);
  const max = Math.max(1, Math.min(Number(limit) || 8, 12));

  const relatedFromSlugs = product.relatedSlugs?.length
    ? await Product.find({
        slug: { $in: product.relatedSlugs },
        isActive: true,
      }).lean()
    : [];

  // Keep admin-curated order when present.
  const ordered = (product.relatedSlugs || [])
    .map((relatedSlug) =>
      relatedFromSlugs.find((item) => item.slug === relatedSlug),
    )
    .filter(Boolean)
    .map(withVisibleImages);

  if (ordered.length >= max) {
    return ordered.slice(0, max);
  }

  const exclude = new Set([
    product.slug,
    ...ordered.map((item) => item.slug),
  ]);

  const categoryMatches = await Product.find({
    isActive: true,
    category: product.category,
    slug: { $nin: [...exclude] },
  })
    .sort({ soldCount: -1, name: 1 })
    .limit(max * 2)
    .lean();

  // Prefer shared rooms / same collection first.
  const scored = categoryMatches
    .map((item) => {
      let score = 0;
      if (item.collection && item.collection === product.collection) score += 3;
      const sharedRooms = (item.rooms || []).filter((room) =>
        (product.rooms || []).includes(room),
      ).length;
      score += sharedRooms;
      if (item.compareAtPrice && item.compareAtPrice > item.price) score += 0.5;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map(({ item }) => withVisibleImages(item));

  return [...ordered, ...scored].slice(0, max);
};

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchProducts = async (q, limit = 20) => {
  const term = String(q || "").trim();
  if (!term) {
    return [];
  }

  const max = Math.min(Math.max(Number(limit) || 20, 1), 60);
  const slug = term
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const rx = new RegExp(escapeRegex(term), "i");
  const slugRx = slug ? new RegExp(escapeRegex(slug), "i") : null;

  const seen = new Set();
  const results = [];

  const pushUnique = (docs = []) => {
    for (const doc of docs) {
      const key = String(doc._id || doc.slug);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(doc);
      if (results.length >= max) break;
    }
  };

  try {
    const textHits = await Product.find(
      { $text: { $search: term }, isActive: true },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(max)
      .lean();
    pushUnique(textHits);
  } catch {
    // Text index may be unavailable — fall through to regex search.
  }

  if (results.length < max) {
    const filter = {
      isActive: true,
      $or: [
        { name: rx },
        { description: rx },
        { category: rx },
        { collection: rx },
        { subcategory: rx },
        ...(slugRx ? [{ slug: slugRx }, { category: slugRx }, { collection: slugRx }] : []),
      ],
    };

    const regexHits = await Product.find(filter)
      .sort({ updatedAt: -1 })
      .limit(max)
      .lean();
    pushUnique(regexHits);
  }

  return results.slice(0, max).map(withVisibleImages);
};

const getCollections = async () => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { category: "$category", subcategory: "$subcategory" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.category",
        subcategories: {
          $push: {
            slug: "$_id.subcategory",
            count: "$count",
          },
        },
        productCount: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return categories.map((item) => ({
    category: item._id,
    productCount: item.productCount,
    subcategories: item.subcategories.sort((a, b) => a.slug.localeCompare(b.slug)),
  }));
};

const seedProducts = async (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No products to seed");
  }

  const operations = products.map((product) => ({
    updateOne: {
      filter: { slug: product.slug },
      update: { $set: product },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(operations);
  const count = await Product.countDocuments();

  return {
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
    total: count,
  };
};

module.exports = {
  listProducts,
  getProductBySlug,
  getRelatedProducts,
  searchProducts,
  getCollections,
  seedProducts,
};
