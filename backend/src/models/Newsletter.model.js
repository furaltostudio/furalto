const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: "footer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Newsletter", newsletterSchema);
