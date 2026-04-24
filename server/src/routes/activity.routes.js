import { Router } from "express";
import { ActivityLog } from "../models/ActivityLog.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_request, response) => {
    const items = await ActivityLog.find().sort({ createdAt: -1 }).lean();
    response.json(successResponse(items));
  }),
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const item = await ActivityLog.create(request.body);
    response.status(HTTP_STATUS.CREATED).json(successResponse(item, "Activity logged"));
  }),
);

export default router;
