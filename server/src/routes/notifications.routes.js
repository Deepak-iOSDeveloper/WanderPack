import { Router } from "express";
import { Notification } from "../models/Notification.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const filter = {};

    if (request.query.userId) filter.userId = request.query.userId;
    if (request.query.type) filter.type = request.query.type;
    if (request.query.read === "true" || request.query.read === "false") {
      filter.read = request.query.read === "true";
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    response.json(successResponse(notifications));
  }),
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const notification = await Notification.create(request.body);
    response.status(HTTP_STATUS.CREATED).json(successResponse(notification, "Notification created"));
  }),
);

router.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const notification = await Notification.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
    }

    response.json(successResponse(notification, "Notification updated"));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const notification = await Notification.findByIdAndDelete(request.params.id).lean();

    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
    }

    response.json({ ok: true, message: "Notification deleted" });
  }),
);

export default router;
