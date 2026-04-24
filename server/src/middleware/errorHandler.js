/**
 * Express Error Handling Middleware
 */

/**
 * Error handler middleware for Express
 * Must be the last middleware in the app
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  console.error(`[ERROR] ${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });

  res.status(statusCode).json({
    ok: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      statusCode: 404,
    },
  });
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

/**
 * Validation error helper
 */
export function validationError(field, message) {
  const error = new ApiError(400, message);
  error.field = field;
  return error;
}
