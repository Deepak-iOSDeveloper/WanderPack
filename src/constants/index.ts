// App-wide constants
export const APP_NAME = "WanderPack";
export const APP_VERSION = "2.0.0";

// API
export const API_BASE_URL = "/api";
export const API_TIMEOUT = 10000; // ms

// Routes
export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  ADMIN_AUTH: "/admin-auth",
  DASHBOARD: "/dashboard",
  EXPLORE: "/explore",
  PROFILE: "/profile",
  TRIPS: "/trips",
  BOOKINGS: "/bookings",
  BOOKING_VAULT: "/booking-vault",
  WISHLIST: "/wishlist",
  POSTS: "/posts",
  CREATE_POST: "/posts/create",
  NOTIFICATIONS: "/notifications",
  SUPPORT: "/support",
  SETTINGS: "/settings",
  ADMIN: "/admin",
  ADMIN_PROFILE: "/admin/profile",
  SERVICE_REQUEST: "/service-request",
  SERVICES: "/services",
  OFFERS: "/offers",
  ASSISTANT: "/assistant",
  INDIA_PRODUCTS: "/india/:product",
} as const;

// User Roles
export const USER_ROLES = {
  TRAVELER: "traveler",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
} as const;

// Status values
export const USER_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

// Notification preferences
export const NOTIFICATION_PREFS = {
  ON: "on",
  OFF: "off",
  MUTED: "muted",
} as const;

// Travel styles
export const TRAVEL_STYLES = {
  ADVENTURE: "adventure",
  LUXURY: "luxury",
  BUDGET: "budget",
  CULTURAL: "cultural",
  RELAXATION: "relaxation",
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: "Logged in successfully!",
  LOGOUT_SUCCESS: "Logged out successfully!",
  REGISTRATION_SUCCESS: "Account created successfully! Please verify your email.",
  RESET_LINK_SENT: "Password reset link sent to your email!",
  PROFILE_UPDATED: "Profile updated successfully!",
  ERROR_GENERIC: "Something went wrong. Please try again.",
  ERROR_NETWORK: "Network error. Please check your connection.",
  ERROR_AUTH_REQUIRED: "Please log in to continue.",
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_BIO_LENGTH: 500,
  MAX_LOCATION_LENGTH: 100,
  MAX_NAME_LENGTH: 100,
} as const;

// Local Storage keys
export const STORAGE_KEYS = {
  USER_THEME: "wp_theme",
  USER_PREFERENCES: "wp_preferences",
  AUTH_TOKEN: "wp_auth_token",
} as const;
