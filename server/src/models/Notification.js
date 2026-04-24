import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["trip", "member", "budget", "feed", "admin", "system"],
      default: "system",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationSchema);
