const Category = require("../models/Category.model");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");
const defaultCategories = require("../data/default-categories");

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mapCategory = (category) => ({
  id: category._id.toString(),
  name: category.name,
  slug: category.slug,
  description: category.description || "",
  sortOrder: category.sortOrder || 0,
  isActive: category.isActive !== false,
  subcategories: (category.subcategories || []).map((sub) => ({
    id: sub._id.toString(),
    name: sub.name,
    slug: sub.slug,
    sortOrder: sub.sortOrder || 0,
    isActive: sub.isActive !== false,
  })),
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

const ensureDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count > 0) {
    return;
  }

  await Category.insertMany(
    defaultCategories.map((category, index) => ({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder ?? (index + 1) * 10,
      isActive: true,
      subcategories: (category.subcategories || []).map((sub, subIndex) => ({
        name: sub.name,
        slug: sub.slug,
        sortOrder: sub.sortOrder ?? (subIndex + 1) * 10,
        isActive: true,
      })),
    }))
  );
};

const listCategories = async ({ includeInactive = false } = {}) => {
  await ensureDefaultCategories();

  const query = includeInactive ? {} : { isActive: true };
  const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 }).lean();

  return categories.map((category) => {
    const mapped = mapCategory(category);
    if (!includeInactive) {
      mapped.subcategories = mapped.subcategories.filter((sub) => sub.isActive);
    }
    return mapped;
  });
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Category not found");
  }
  return category;
};

const createCategory = async ({ name, slug, description, sortOrder, isActive, subcategories }) => {
  await ensureDefaultCategories();

  const nextSlug = slugify(slug || name);
  if (!name?.trim() || !nextSlug) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Category name is required");
  }

  const exists = await Category.findOne({ slug: nextSlug });
  if (exists) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "A category with this slug already exists");
  }

  const category = await Category.create({
    name: name.trim(),
    slug: nextSlug,
    description: description || "",
    sortOrder: Number(sortOrder) || 0,
    isActive: isActive !== false,
    subcategories: (subcategories || []).map((sub, index) => ({
      name: sub.name.trim(),
      slug: slugify(sub.slug || sub.name),
      sortOrder: Number(sub.sortOrder) || (index + 1) * 10,
      isActive: sub.isActive !== false,
    })),
  });

  return mapCategory(category);
};

const updateCategory = async (id, payload) => {
  const category = await getCategoryById(id);

  if (payload.name !== undefined) {
    category.name = String(payload.name).trim();
  }

  if (payload.slug !== undefined) {
    const nextSlug = slugify(payload.slug);
    const conflict = await Category.findOne({ slug: nextSlug, _id: { $ne: category._id } });
    if (conflict) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "A category with this slug already exists");
    }
    category.slug = nextSlug;
  }

  if (payload.description !== undefined) {
    category.description = String(payload.description || "");
  }

  if (payload.sortOrder !== undefined) {
    category.sortOrder = Number(payload.sortOrder) || 0;
  }

  if (payload.isActive !== undefined) {
    category.isActive = Boolean(payload.isActive);
  }

  if (Array.isArray(payload.subcategories)) {
    category.subcategories = payload.subcategories.map((sub, index) => ({
      _id: sub.id || undefined,
      name: String(sub.name || "").trim(),
      slug: slugify(sub.slug || sub.name),
      sortOrder: Number(sub.sortOrder) || (index + 1) * 10,
      isActive: sub.isActive !== false,
    }));
  }

  await category.save();
  return mapCategory(category);
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Category not found");
  }
  return { id };
};

const addSubcategory = async (id, { name, slug, sortOrder, isActive }) => {
  const category = await getCategoryById(id);
  const nextSlug = slugify(slug || name);

  if (!name?.trim() || !nextSlug) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Subcategory name is required");
  }

  if (category.subcategories.some((sub) => sub.slug === nextSlug)) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "A subcategory with this slug already exists");
  }

  category.subcategories.push({
    name: name.trim(),
    slug: nextSlug,
    sortOrder: Number(sortOrder) || (category.subcategories.length + 1) * 10,
    isActive: isActive !== false,
  });

  await category.save();
  return mapCategory(category);
};

const updateSubcategory = async (id, subId, payload) => {
  const category = await getCategoryById(id);
  const subcategory = category.subcategories.id(subId);

  if (!subcategory) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Subcategory not found");
  }

  if (payload.name !== undefined) {
    subcategory.name = String(payload.name).trim();
  }

  if (payload.slug !== undefined) {
    const nextSlug = slugify(payload.slug);
    const conflict = category.subcategories.some(
      (sub) => sub.slug === nextSlug && String(sub._id) !== String(subId)
    );
    if (conflict) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "A subcategory with this slug already exists");
    }
    subcategory.slug = nextSlug;
  }

  if (payload.sortOrder !== undefined) {
    subcategory.sortOrder = Number(payload.sortOrder) || 0;
  }

  if (payload.isActive !== undefined) {
    subcategory.isActive = Boolean(payload.isActive);
  }

  await category.save();
  return mapCategory(category);
};

const deleteSubcategory = async (id, subId) => {
  const category = await getCategoryById(id);
  const subcategory = category.subcategories.id(subId);

  if (!subcategory) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Subcategory not found");
  }

  subcategory.deleteOne();
  await category.save();
  return mapCategory(category);
};

module.exports = {
  ensureDefaultCategories,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  mapCategory,
};
