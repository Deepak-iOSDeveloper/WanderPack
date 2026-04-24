import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export const WishlistItem = mongoose.model("WishlistItem", wishlistItemSchema, "wishlist");
