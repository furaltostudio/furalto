const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const BlogPost = require("../models/BlogPost.model");

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug || `post-${Date.now()}`;
  let suffix = 0;

  while (true) {
    const candidate = suffix ? `${slug}-${suffix}` : slug;
    const existing = await BlogPost.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select("_id")
      .lean();

    if (!existing) {
      return candidate;
    }
    suffix += 1;
  }
};

const toPublicPost = (post) => ({
  id: String(post._id),
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  body: post.body,
  coverImage: post.coverImage || { src: "", alt: "", width: 1600, height: 1000 },
  category: post.category,
  author: post.author,
  tags: post.tags || [],
  publishedAt: post.publishedAt,
  seoDescription: post.seoDescription || post.excerpt,
  updatedAt: post.updatedAt,
});

const listPublished = async ({ page = 1, limit = 12, category } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 12));
  const filter = {
    isPublished: true,
    publishedAt: { $lte: new Date() },
  };

  if (category) {
    filter.category = category;
  }

  const [total, posts] = await Promise.all([
    BlogPost.countDocuments(filter),
    BlogPost.find(filter)
      .sort({ publishedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
  ]);

  return {
    posts: posts.map(toPublicPost),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
};

const getPublishedBySlug = async (slug) => {
  const post = await BlogPost.findOne({
    slug: String(slug || "").toLowerCase(),
    isPublished: true,
    publishedAt: { $lte: new Date() },
  }).lean();

  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Blog post not found");
  }

  return toPublicPost(post);
};

const listAdmin = async ({ page = 1, limit = 20, q } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const filter = {};

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const [total, posts] = await Promise.all([
    BlogPost.countDocuments(filter),
    BlogPost.find(filter)
      .sort({ publishedAt: -1, updatedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
  ]);

  return {
    posts: posts.map((post) => ({
      ...toPublicPost(post),
      isPublished: Boolean(post.isPublished),
      createdAt: post.createdAt,
    })),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
};

const getAdminById = async (id) => {
  const post = await BlogPost.findById(id).lean();
  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Blog post not found");
  }
  return {
    ...toPublicPost(post),
    isPublished: Boolean(post.isPublished),
    createdAt: post.createdAt,
  };
};

const createPost = async (payload) => {
  const title = String(payload.title || "").trim();
  if (!title) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Title is required");
  }

  const slug = await ensureUniqueSlug(slugify(payload.slug || title));
  const post = await BlogPost.create({
    title,
    slug,
    excerpt: String(payload.excerpt || "").trim(),
    body: String(payload.body || "").trim(),
    coverImage: {
      src: payload.coverImage?.src || "",
      alt: payload.coverImage?.alt || title,
      width: Number(payload.coverImage?.width) || 1600,
      height: Number(payload.coverImage?.height) || 1000,
    },
    category: String(payload.category || "Journal").trim() || "Journal",
    author: String(payload.author || "Furalto Studio").trim() || "Furalto Studio",
    tags: Array.isArray(payload.tags)
      ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
    isPublished: payload.isPublished !== false,
    seoDescription: String(payload.seoDescription || payload.excerpt || "").trim(),
  });

  return getAdminById(post._id);
};

const updatePost = async (id, payload) => {
  const post = await BlogPost.findById(id);
  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Blog post not found");
  }

  if (payload.title != null) post.title = String(payload.title).trim();
  if (payload.excerpt != null) post.excerpt = String(payload.excerpt).trim();
  if (payload.body != null) post.body = String(payload.body).trim();
  if (payload.category != null) {
    post.category = String(payload.category).trim() || "Journal";
  }
  if (payload.author != null) {
    post.author = String(payload.author).trim() || "Furalto Studio";
  }
  if (payload.seoDescription != null) {
    post.seoDescription = String(payload.seoDescription).trim();
  }
  if (payload.publishedAt != null) post.publishedAt = new Date(payload.publishedAt);
  if (payload.isPublished != null) post.isPublished = Boolean(payload.isPublished);
  if (Array.isArray(payload.tags)) {
    post.tags = payload.tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (payload.coverImage) {
    post.coverImage = {
      src: payload.coverImage.src ?? post.coverImage?.src ?? "",
      alt: payload.coverImage.alt ?? post.coverImage?.alt ?? post.title,
      width: Number(payload.coverImage.width) || post.coverImage?.width || 1600,
      height: Number(payload.coverImage.height) || post.coverImage?.height || 1000,
    };
  }
  if (payload.slug != null || payload.title != null) {
    const nextSlug = slugify(payload.slug || post.slug || post.title);
    post.slug = await ensureUniqueSlug(nextSlug, post._id);
  }

  await post.save();
  return getAdminById(post._id);
};

const deletePost = async (id) => {
  const post = await BlogPost.findByIdAndDelete(id).lean();
  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Blog post not found");
  }
  return { id: String(post._id), deleted: true };
};

module.exports = {
  slugify,
  listPublished,
  getPublishedBySlug,
  listAdmin,
  getAdminById,
  createPost,
  updatePost,
  deletePost,
};
