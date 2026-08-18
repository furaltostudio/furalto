const mongoose = require("mongoose");

const productOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    swatch: { type: String },
    specs: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { _id: false }
);

const productImageSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    /** When true, image is kept in admin but hidden from the storefront gallery. */
    hidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSpecSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: "", index: true },
    collection: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    description: { type: String, required: true },
    details: [{ type: String }],
    specs: [productSpecSchema],
    images: [productImageSchema],
    fabrics: [productOptionSchema],
    finishes: [productOptionSchema],
    sizes: [productOptionSchema],
    relatedSlugs: [{ type: String }],
    rooms: [{ type: String, index: true }],
    /** 0-based gallery index used by the Size / scale guide. Null = frontend default. */
    scaleImageIndex: { type: Number, min: 0, default: null },
    soldCount: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

productSchema.index({ name: "text", description: "text", collection: "text" });

module.exports = mongoose.model("Product", productSchema);
