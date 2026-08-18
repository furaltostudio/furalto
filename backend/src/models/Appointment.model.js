const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    appointmentType: {
      type: String,
      enum: ["in-showroom", "virtual", "trade", "swatches"],
      required: true,
    },
    showroom: {
      type: String,
      enum: ["virtual", "mumbai", "delhi", "bengaluru"],
      required: true,
    },
    preferredDate: { type: Date, required: true },
    preferredTime: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },
    interest: {
      type: String,
      enum: ["living", "bedroom", "dining", "outdoor", "office", "full-home"],
      required: true,
    },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
