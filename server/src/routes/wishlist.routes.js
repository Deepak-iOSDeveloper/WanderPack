import { Router } from "express";
import { WishlistItem } from "../models/WishlistItem.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const filter = {};
    if (request.query.userId) filter.userId = request.query.userId;
    const items = await WishlistItem.find(filter).sort({ createdAt: -1 }).lean();
    response.json(successResponse(items));
  }),
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const item = await WishlistItem.create(request.body);
    response.status(HTTP_STATUS.CREATED).json(successResponse(item, "Wishlist item created"));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const item = await WishlistItem.findByIdAndDelete(request.params.id).lean();
    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Wishlist item not found");
    }
    response.json({ ok: true, message: "Wishlist item deleted" });
  }),
);

export default router;
