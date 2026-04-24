import mongoose from "mongoose";

const postCommentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    authorId: { type: String, trim: true, default: "" },
    authorName: { type: String, required: true, trim: true },
    authorColor: { type: String, trim: true, default: "#FF6B6B" },
    destination: { type: String, required: true, trim: true },
    caption: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: "" },
    tags: { type: [String], default: [] },
    emoji: { type: String, trim: true, default: "Post" },
    likes: { type: Number, default: 0, min: 0 },
    likedBy: { type: [String], default: [] },
    comments: { type: Number, default: 0, min: 0 },
    commentItems: { type: [postCommentSchema], default: [] },
    bookmarkedBy: { type: [String], default: [] },
    category: { type: String, trim: true, default: "all" },
  },
  { timestamps: true },
);

export const Post = mongoose.model("Post", postSchema);
