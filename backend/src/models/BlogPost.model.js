const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    coverImage: {
      src: { type: String, default: "" },
      alt: { type: String, default: "" },
      width: { type: Number, default: 1600 },
      height: { type: Number, default: 1000 },
    },
    category: {
      type: String,
      trim: true,
      default: "Journal",
      index: true,
    },
    author: { type: String, trim: true, default: "Furalto Studio" },
    tags: { type: [String], default: [] },
    publishedAt: { type: Date, required: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    seoDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

blogPostSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model("BlogPost", blogPostSchema);
