import { Router } from "express";
import { Post } from "../models/Post.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_request, response) => {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    response.json(successResponse(posts));
  }),
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const post = await Post.create(request.body);
    response.status(HTTP_STATUS.CREATED).json(successResponse(post, "Post created"));
  }),
);

router.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const post = await Post.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
    }

    response.json(successResponse(post, "Post updated"));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const post = await Post.findByIdAndDelete(request.params.id).lean();

    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Post not found");
    }

    response.json({ ok: true, message: "Post deleted" });
  }),
);

export default router;
