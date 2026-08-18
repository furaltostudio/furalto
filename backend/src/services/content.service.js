const SiteContent = require("../models/SiteContent.model");
const ApiError = require("../utils/ApiError");
const { HTTP_STATUS } = require("../constants");

const listContent = async ({ type, includeDrafts = false } = {}) => {
  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (!includeDrafts) {
    filter.isPublished = true;
  }

  return SiteContent.find(filter).sort({ type: 1, title: 1 }).lean();
};

const getByKey = async (key, { includeDrafts = false } = {}) => {
  const filter = { key };

  if (!includeDrafts) {
    filter.isPublished = true;
  }

  const content = await SiteContent.findOne(filter).lean();

  if (!content) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Content not found");
  }

  return content;
};

const upsertContent = async (payload) => {
  const { key, title, type, description = "", data = {}, isPublished = true } = payload;

  if (!key || !title || !type) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "key, title, and type are required");
  }

  const content = await SiteContent.findOneAndUpdate(
    { key },
    {
      $set: {
        title,
        type,
        description,
        data,
        isPublished,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return content;
};

const patchContent = async (key, updates) => {
  const content = await SiteContent.findOne({ key });

  if (!content) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Content not found");
  }

  if (updates.title !== undefined) content.title = updates.title;
  if (updates.description !== undefined) content.description = updates.description;
  if (updates.data !== undefined) content.data = updates.data;
  if (updates.isPublished !== undefined) content.isPublished = updates.isPublished;
  if (updates.type !== undefined) content.type = updates.type;

  await content.save();
  return content.toObject();
};

const deleteContent = async (key) => {
  const result = await SiteContent.findOneAndDelete({ key });

  if (!result) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Content not found");
  }

  return { key };
};

const seedDefaults = async (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No content entries to seed");
  }

  const operations = entries.map((entry) => ({
    updateOne: {
      filter: { key: entry.key },
      update: {
        $setOnInsert: {
          key: entry.key,
          title: entry.title,
          type: entry.type,
          description: entry.description || "",
          data: entry.data || {},
          isPublished: entry.isPublished !== false,
        },
      },
      upsert: true,
    },
  }));

  const result = await SiteContent.bulkWrite(operations);
  const total = await SiteContent.countDocuments();

  return {
    upserted: result.upsertedCount,
    total,
  };
};

module.exports = {
  listContent,
  getByKey,
  upsertContent,
  patchContent,
  deleteContent,
  seedDefaults,
};
