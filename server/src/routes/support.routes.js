import { Router } from "express";
import { SupportTicket } from "../models/SupportTicket.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const filter = {};
    if (request.query.userId) filter.userId = request.query.userId;
    if (request.query.status) filter.status = request.query.status;
    const items = await SupportTicket.find(filter).sort({ createdAt: -1 }).lean();
    response.json(successResponse(items));
  }),
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const item = await SupportTicket.create(request.body);
    response.status(HTTP_STATUS.CREATED).json(successResponse(item, "Support ticket created"));
  }),
);

router.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const item = await SupportTicket.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Support ticket not found");
    }
    response.json(successResponse(item, "Support ticket updated"));
  }),
);

export default router;
