import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      trim: true,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["traveler", "admin", "superadmin"],
      default: "traveler",
    },
    status: {
      type: String,
      enum: ["active", "pending", "banned"],
      default: "active",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    notifications: {
      type: String,
      enum: ["on", "off"],
      default: "on",
    },
    style: {
      type: String,
      enum: ["adventure", "relaxation", "culture", "food"],
      default: "adventure",
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
