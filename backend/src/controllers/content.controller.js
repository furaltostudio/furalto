const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const contentService = require("../services/content.service");

const listPublicContent = asyncHandler(async (req, res) => {
  const items = await contentService.listContent({
    type: req.query.type,
    includeDrafts: false,
  });

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { items }, "Content fetched"));
});

const getPublicContent = asyncHandler(async (req, res) => {
  const content = await contentService.getByKey(req.params.key, { includeDrafts: false });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { content }, "Content fetched"));
});

const listAdminContent = asyncHandler(async (req, res) => {
  const items = await contentService.listContent({
    type: req.query.type,
    includeDrafts: true,
  });

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, { items }, "Content fetched"));
});

const getAdminContent = asyncHandler(async (req, res) => {
  const content = await contentService.getByKey(req.params.key, { includeDrafts: true });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { content }, "Content fetched"));
});

const upsertAdminContent = asyncHandler(async (req, res) => {
  const content = await contentService.upsertContent({
    ...req.body,
    key: req.params.key || req.body.key,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { content }, "Content saved"));
});

const patchAdminContent = asyncHandler(async (req, res) => {
  const content = await contentService.patchContent(req.params.key, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { content }, "Content updated"));
});

const deleteAdminContent = asyncHandler(async (req, res) => {
  const result = await contentService.deleteContent(req.params.key);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Content deleted"));
});

module.exports = {
  listPublicContent,
  getPublicContent,
  listAdminContent,
  getAdminContent,
  upsertAdminContent,
  patchAdminContent,
  deleteAdminContent,
};
