/**
 * Validation schemas for request data
 */

const USER_ROLES = ["traveler", "admin", "superadmin"];
const USER_STATUSES = ["active", "pending", "banned"];
const NOTIFICATION_PREFERENCES = ["on", "off"];
const TRAVEL_STYLES = ["adventure", "relaxation", "culture", "food"];
const TRIP_STATUSES = ["draft", "planning", "confirmed", "completed"];

/**
 * Validate user creation data
 */
export function validateUserRegistration(data) {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = "Name is required";
  } else if (data.name.length > 100) {
    errors.name = "Name cannot exceed 100 characters";
  }

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (data.role && !USER_ROLES.includes(data.role)) {
    errors.role = "Invalid role";
  }

  if (data.status && !USER_STATUSES.includes(data.status)) {
    errors.status = "Invalid status";
  }

  if (data.notifications && !NOTIFICATION_PREFERENCES.includes(data.notifications)) {
    errors.notifications = "Invalid notification preference";
  }

  if (data.style && !TRAVEL_STYLES.includes(data.style)) {
    errors.style = "Invalid travel style";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate user update data
 */
export function validateUserUpdate(data) {
  const errors = {};

  if (data.name && data.name.length > 100) {
    errors.name = "Name cannot exceed 100 characters";
  }

  if (data.bio && data.bio.length > 500) {
    errors.bio = "Bio cannot exceed 500 characters";
  }

  if (data.location && data.location.length > 100) {
    errors.location = "Location cannot exceed 100 characters";
  }

  if (data.role && !USER_ROLES.includes(data.role)) {
    errors.role = "Invalid role";
  }

  if (data.status && !USER_STATUSES.includes(data.status)) {
    errors.status = "Invalid status";
  }

  if (data.notifications && !NOTIFICATION_PREFERENCES.includes(data.notifications)) {
    errors.notifications = "Invalid notification preference";
  }

  if (data.style && !TRAVEL_STYLES.includes(data.style)) {
    errors.style = "Invalid travel style";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate trip creation data
 */
export function validateTripCreation(data) {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = "Trip name is required";
  } else if (data.name.length > 200) {
    errors.name = "Trip name cannot exceed 200 characters";
  }

  if (!data.destination?.trim()) {
    errors.destination = "Destination is required";
  }

  if (!data.adminId?.trim()) {
    errors.adminId = "adminId is required";
  }

  if (!data.shareCode?.trim()) {
    errors.shareCode = "shareCode is required";
  }

  if (data.startDate) {
    const start = new Date(data.startDate);
    if (Number.isNaN(start.getTime())) {
      errors.startDate = "Invalid start date";
    }
  }

  if (data.endDate) {
    const end = new Date(data.endDate);
    if (Number.isNaN(end.getTime())) {
      errors.endDate = "Invalid end date";
    }
  }

  if (data.budgetTotal !== undefined && (typeof data.budgetTotal !== "number" || data.budgetTotal < 0)) {
    errors.budgetTotal = "budgetTotal must be a positive number";
  }

  if (data.groupSize !== undefined && (typeof data.groupSize !== "number" || data.groupSize < 1)) {
    errors.groupSize = "groupSize must be at least 1";
  }

  if (data.status && !TRIP_STATUSES.includes(data.status)) {
    errors.status = "Invalid trip status";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate request has required fields
 */
export function validateRequired(data, requiredFields) {
  const errors = {};

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = `${field} is required`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
