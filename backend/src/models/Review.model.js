const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productSlug: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", index: true },
    orderNumber: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, lowercase: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, default: "" },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

reviewSchema.index({ orderNumber: 1, productSlug: 1 }, { unique: true });
reviewSchema.index({ productSlug: 1, isPublished: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
