const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const categoryService = require("../services/category.service");

const listPublicCategories = asyncHandler(async (_req, res) => {
  const categories = await categoryService.listCategories({ includeInactive: false });
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { categories }, "Categories fetched"));
});

const listAdminCategories = asyncHandler(async (_req, res) => {
  const categories = await categoryService.listCategories({ includeInactive: true });
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { categories }, "Categories fetched"));
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, { category }, "Category created"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { category }, "Category updated"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Category deleted"));
});

const addSubcategory = asyncHandler(async (req, res) => {
  const category = await categoryService.addSubcategory(req.params.id, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, { category }, "Subcategory added"));
});

const updateSubcategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateSubcategory(
    req.params.id,
    req.params.subId,
    req.body
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { category }, "Subcategory updated"));
});

const deleteSubcategory = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteSubcategory(req.params.id, req.params.subId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { category }, "Subcategory deleted"));
});

module.exports = {
  listPublicCategories,
  listAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
