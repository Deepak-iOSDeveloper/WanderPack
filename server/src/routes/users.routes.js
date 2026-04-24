import { Router } from "express";
import { User } from "../models/User.js";
import { validateUserRegistration, validateUserUpdate } from "../validators/schemas.js";
import { asyncHandler, ApiError } from "../middleware/errorHandler.js";
import { sanitizeUser, sanitizeUsers, successResponse } from "../utils/helpers.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/index.js";

const router = Router();

/**
 * GET /api/users - Get all users
 */
router.get(
  "/",
  asyncHandler(async (request, response) => {
    const limit = Math.min(Number(request.query.limit) || 10, 100);
    const page = Math.max(Number(request.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await User.countDocuments();

    response.json({
      ok: true,
      data: sanitizeUsers(users),
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
 * GET /api/users/:id - Get user by ID
 */
router.get(
  "/firebase/:firebaseUid",
  asyncHandler(async (request, response) => {
    const user = await User.findOne({ firebaseUid: request.params.firebaseUid }).lean();
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }
    response.json(successResponse(sanitizeUser(user), "User retrieved successfully"));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const user = await User.findById(request.params.id).lean();
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }
    response.json(successResponse(sanitizeUser(user), "User retrieved successfully"));
  }),
);

/**
 * POST /api/users - Create new user
 */
router.post(
  "/upsert",
  asyncHandler(async (request, response) => {
    const validation = validateUserRegistration({
      ...request.body,
      email: request.body.email,
      name: request.body.name,
    });
    if (!validation.isValid) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `${ERROR_MESSAGES.VALIDATION_ERROR}: ${Object.values(validation.errors).join(", ")}`,
      );
    }

    const query = request.body.firebaseUid
      ? { firebaseUid: request.body.firebaseUid }
      : { email: String(request.body.email).toLowerCase() };

    const user = await User.findOneAndUpdate(
      query,
      {
        firebaseUid: request.body.firebaseUid || null,
        email: String(request.body.email).toLowerCase(),
        name: request.body.name,
        role: request.body.role || "traveler",
        status: request.body.status || "active",
        avatar: request.body.avatar || "",
        bio: request.body.bio || "",
        location: request.body.location || "",
        notifications: request.body.notifications || "on",
        style: request.body.style || "adventure",
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    response.status(HTTP_STATUS.CREATED).json(successResponse(sanitizeUser(user), "User synced"));
  }),
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const validation = validateUserRegistration(request.body);
    if (!validation.isValid) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `${ERROR_MESSAGES.VALIDATION_ERROR}: ${Object.values(validation.errors).join(", ")}`,
      );
    }

    const existingUser = await User.findOne({ email: request.body.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Email already registered");
    }

    const user = await User.create({
      firebaseUid: request.body.firebaseUid || null,
      email: request.body.email,
      name: request.body.name,
      role: request.body.role || "traveler",
      status: request.body.status || "active",
      avatar: request.body.avatar || "",
      bio: request.body.bio || "",
      location: request.body.location || "",
      notifications: request.body.notifications || "on",
      style: request.body.style || "adventure",
    });

    response.status(HTTP_STATUS.CREATED).json(successResponse(sanitizeUser(user), SUCCESS_MESSAGES.USER_CREATED));
  }),
);

/**
 * PUT /api/users/:id - Update user
 */
router.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const validation = validateUserUpdate(request.body);
    if (!validation.isValid) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `${ERROR_MESSAGES.VALIDATION_ERROR}: ${Object.values(validation.errors).join(", ")}`,
      );
    }

    const user = await User.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }

    response.json(successResponse(sanitizeUser(user), SUCCESS_MESSAGES.USER_UPDATED));
  }),
);

/**
 * DELETE /api/users/:id - Delete user
 */
router.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const user = await User.findByIdAndDelete(request.params.id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }

    response.json({ ok: true, message: SUCCESS_MESSAGES.USER_DELETED });
  }),
);

export default router;
