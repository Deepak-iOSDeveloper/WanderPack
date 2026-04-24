import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const filter = {};

    if (request.query.userId) filter.userId = request.query.userId;
    if (request.query.product) filter.product = request.query.product;
    if (request.query.status) filter.status = request.query.status;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();
    response.json(successResponse(bookings));
  }),
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const booking = await Booking.create(request.body);
    response.status(HTTP_STATUS.CREATED).json(successResponse(booking, "Booking created"));
  }),
);

router.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const booking = await Booking.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!booking) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Booking not found");
    }

    response.json(successResponse(booking, "Booking updated"));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const booking = await Booking.findByIdAndDelete(request.params.id).lean();

    if (!booking) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Booking not found");
    }

    response.json({ ok: true, message: "Booking deleted" });
  }),
);

export default router;
