/**
 * Backend utility functions
 */

/**
 * Check if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Safe JSON parse
 */
export function safeJSONParse(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Build success response
 */
export function successResponse(data, message = "Success") {
  return {
    ok: true,
    message,
    data,
  };
}

/**
 * Build error response
 */
export function errorResponse(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Get response meta data
 */
export function getResponseMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Sanitize user data for response
 */
export function sanitizeUser(user) {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : user;

  // Remove sensitive fields
  delete userObj.password;
  delete userObj.__v;

  return userObj;
}

/**
 * Sanitize multiple users
 */
export function sanitizeUsers(users) {
  return users.map(sanitizeUser);
}

/**
 * Generate timestamp
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Log activity
 */
export function logActivity(userId, action, resource, details = {}) {
  return {
    userId,
    action,
    resource,
    details,
    timestamp: getCurrentTimestamp(),
  };
}
