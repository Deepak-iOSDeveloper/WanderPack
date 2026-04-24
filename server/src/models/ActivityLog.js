import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema, "activityLog");
