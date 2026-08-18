const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const blogService = require("../services/blog.service");

const listPublished = asyncHandler(async (req, res) => {
  const result = await blogService.listPublished({
    page: req.query.page,
    limit: req.query.limit,
    category: req.query.category,
  });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Blog posts fetched"));
});

const getPublishedBySlug = asyncHandler(async (req, res) => {
  const post = await blogService.getPublishedBySlug(req.params.slug);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { post }, "Blog post fetched"));
});

const listAdmin = asyncHandler(async (req, res) => {
  const result = await blogService.listAdmin({
    page: req.query.page,
    limit: req.query.limit,
    q: req.query.q,
  });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Blog posts fetched"));
});

const getAdminById = asyncHandler(async (req, res) => {
  const post = await blogService.getAdminById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { post }, "Blog post fetched"));
});

const createPost = asyncHandler(async (req, res) => {
  const post = await blogService.createPost(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, { post }, "Blog post created"));
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await blogService.updatePost(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { post }, "Blog post updated"));
});

const deletePost = asyncHandler(async (req, res) => {
  const result = await blogService.deletePost(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Blog post deleted"));
});

module.exports = {
  listPublished,
  getPublishedBySlug,
  listAdmin,
  getAdminById,
  createPost,
  updatePost,
  deletePost,
};
