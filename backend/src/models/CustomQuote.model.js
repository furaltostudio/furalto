const mongoose = require("mongoose");

const customQuoteSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    configuration: {
      pieceId: { type: String, required: true },
      pieceLabel: { type: String, required: true },
      woodId: { type: String, required: true },
      woodLabel: { type: String, required: true },
      fabricId: { type: String, required: true },
      fabricLabel: { type: String, required: true },
      finishId: { type: String, required: true },
      finishLabel: { type: String, required: true },
      sizeId: { type: String, required: true },
      sizeLabel: { type: String, required: true },
    },
    estimate: {
      currency: { type: String, default: "INR" },
      amount: { type: Number, required: true },
      breakdown: {
        base: { type: Number, required: true },
        wood: { type: Number, required: true },
        fabric: { type: Number, required: true },
        finish: { type: Number, required: true },
        sizeMultiplier: { type: Number, required: true },
      },
    },
    advice: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "closed"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomQuote", customQuoteSchema);
