import { Router } from "express";
import { Trip } from "../models/Trip.js";
import { validateTripCreation } from "../validators/schemas.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import { successResponse } from "../utils/helpers.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/index.js";

const router = Router();

/**
 * GET /api/trips - Get all trips
 */
router.get(
  "/",
  asyncHandler(async (request, response) => {
    const limit = Math.min(Number(request.query.limit) || 10, 100);
    const page = Math.max(Number(request.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const trips = await Trip.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Trip.countDocuments();

    response.json({
      ok: true,
      data: trips,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),
);

/**
 * GET /api/trips/:id - Get trip by ID
 */
router.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const trip = await Trip.findById(request.params.id).lean();
    if (!trip) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }
    response.json(successResponse(trip, "Trip retrieved successfully"));
  }),
);

/**
 * POST /api/trips - Create new trip
 */
router.post(
  "/",
  asyncHandler(async (request, response) => {
    const validation = validateTripCreation(request.body);
    if (!validation.isValid) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `${ERROR_MESSAGES.VALIDATION_ERROR}: ${Object.values(validation.errors).join(", ")}`,
      );
    }

    const trip = await Trip.create({
      name: request.body.name,
      destination: request.body.destination,
      startDate: request.body.startDate,
      endDate: request.body.endDate,
      vibe: request.body.vibe || "Relaxed",
      category: request.body.category || "Leisure",
      groupSize: request.body.groupSize || 4,
      currency: request.body.currency || "USD",
      budgetTotal: request.body.budgetTotal || 0,
      coverImage: request.body.coverImage || "",
      status: request.body.status || "planning",
      progress: request.body.progress || 0,
      adminId: request.body.adminId,
      shareCode: request.body.shareCode,
      members: request.body.members || [],
      itinerary: request.body.itinerary || [],
      budget: request.body.budget || [],
      comments: request.body.comments || [],
      packingList: request.body.packingList || [],
      notes: request.body.notes || "",
    });

    response.status(HTTP_STATUS.CREATED).json(successResponse(trip, SUCCESS_MESSAGES.TRIP_CREATED));
  }),
);

/**
 * PUT /api/trips/:id - Update trip
 */
router.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const validation = validateTripCreation({
      ...request.body,
      name: request.body.name || "existing-name",
      destination: request.body.destination || "existing-destination",
      adminId: request.body.adminId || "existing-admin",
      shareCode: request.body.shareCode || "EXIST1",
    });

    if (!validation.isValid) {
      const allowedUpdateErrors = Object.entries(validation.errors).filter(
        ([field]) => !["name", "destination", "adminId", "shareCode"].includes(field),
      );

      if (allowedUpdateErrors.length > 0) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `${ERROR_MESSAGES.VALIDATION_ERROR}: ${allowedUpdateErrors.map(([, message]) => message).join(", ")}`,
        );
      }
    }

    const trip = await Trip.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!trip) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }

    response.json(successResponse(trip, SUCCESS_MESSAGES.TRIP_UPDATED));
  }),
);

/**
 * DELETE /api/trips/:id - Delete trip
 */
router.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const trip = await Trip.findByIdAndDelete(request.params.id);
    if (!trip) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }

    response.json({ ok: true, message: SUCCESS_MESSAGES.TRIP_DELETED });
  }),
);

export default router;
