/**
 * Validation utilities
 */

import { VALIDATION } from "../constants";

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }
  return { valid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`,
    };
  }
  return { valid: true };
}

/**
 * Validate name
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  if (name.length > VALIDATION.MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name cannot exceed ${VALIDATION.MAX_NAME_LENGTH} characters`,
    };
  }
  return { valid: true };
}

/**
 * Validate bio
 */
export function validateBio(bio: string): { valid: boolean; error?: string } {
  if (bio && bio.length > VALIDATION.MAX_BIO_LENGTH) {
    return {
      valid: false,
      error: `Bio cannot exceed ${VALIDATION.MAX_BIO_LENGTH} characters`,
    };
  }
  return { valid: true };
}

/**
 * Validate location
 */
export function validateLocation(location: string): { valid: boolean; error?: string } {
  if (location && location.length > VALIDATION.MAX_LOCATION_LENGTH) {
    return {
      valid: false,
      error: `Location cannot exceed ${VALIDATION.MAX_LOCATION_LENGTH} characters`,
    };
  }
  return { valid: true };
}

/**
 * Validate registration form
 */
export function validateRegistration(data: {
  email: string;
  password: string;
  displayName: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || "";
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error || "";
  }

  const nameValidation = validateName(data.displayName);
  if (!nameValidation.valid) {
    errors.displayName = nameValidation.error || "";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate login form
 */
export function validateLogin(data: {
  email: string;
  password: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || "";
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error || "";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
