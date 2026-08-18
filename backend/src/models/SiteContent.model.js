const mongoose = require("mongoose");

const CONTENT_TYPES = [
  "settings",
  "homepage",
  "page",
  "showroom",
  "navigation",
  "section",
];

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: CONTENT_TYPES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteContent", siteContentSchema);
module.exports.CONTENT_TYPES = CONTENT_TYPES;
