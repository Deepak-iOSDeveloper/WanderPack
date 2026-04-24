/**
 * Backend constants
 */

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// User roles
export const USER_ROLES = {
  TRAVELER: "traveler",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
};

// User status
export const USER_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  SUSPENDED: "suspended",
  DELETED: "deleted",
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_INPUT: "Invalid input provided",
  UNAUTHORIZED: "Unauthorized access",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource already exists",
  INTERNAL_ERROR: "Internal server error",
  DATABASE_ERROR: "Database error",
  VALIDATION_ERROR: "Validation failed",
};

// Success messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  TRIP_CREATED: "Trip created successfully",
  TRIP_UPDATED: "Trip updated successfully",
  TRIP_DELETED: "Trip deleted successfully",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: "/api/health",
  USERS: "/api/users",
  TRIPS: "/api/trips",
};
