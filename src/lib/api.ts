import { demoActivityLog, demoBookings, demoNotifications, demoPosts, demoTrips, demoUsers } from "./demoData";
import type {
  ActivityLogItem,
  BookingItem,
  NotificationItem,
  Post,
  SupportTicket,
  Trip,
  UserProfile,
  WishlistItem,
} from "../types";

export interface BackendHealth {
  ok: boolean;
  service: string;
  database: "connected" | "disconnected";
  timestamp: string;
}

interface ApiEnvelope<T> {
  ok: boolean;
  message?: string;
  data: T;
}

type QueryValue = string | number | boolean | undefined | null;
type LocalStore = {
  users: UserProfile[];
  trips: Trip[];
  posts: Post[];
  notifications: NotificationItem[];
  activityLog: ActivityLogItem[];
  bookings: BookingItem[];
  wishlist: WishlistItem[];
  supportTickets: SupportTicket[];
};

const LOCAL_STORE_KEY = "wanderpack-offline-store-v2";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
const BACKEND_ENABLED = import.meta.env.VITE_ENABLE_BACKEND === "true";
let backendAvailable: boolean | null = null;
let backendAvailabilityCheck: Promise<boolean> | null = null;

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultStore(): LocalStore {
  return {
    users: demoUsers.map((item) => ({ ...item, _id: item._id || item.uid })),
    trips: demoTrips.map((item) => ({ ...item, _id: item._id || item.id })),
    posts: demoPosts.map((item) => ({ ...item, _id: item._id || item.id })),
    notifications: demoNotifications.map((item) => ({ ...item, _id: item._id || item.id })),
    activityLog: demoActivityLog.map((item) => ({ ...item, _id: item._id || item.id })),
    bookings: demoBookings.map((item) => ({ ...item, _id: item._id || item.id })),
    wishlist: [],
    supportTickets: [],
  };
}

function readLocalStore(): LocalStore {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    const merged = {
      ...defaultStore(),
      ...parsed,
    };
    // Force demo bookings if the cached state has none, so the user can see them without clearing storage
    if (merged.bookings.length === 0) {
      merged.bookings = defaultStore().bookings;
    }
    return merged;
  } catch {
    return defaultStore();
  }
}

function writeLocalStore(store: LocalStore) {
  window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(store));
}

function buildQuery(params?: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function getApiUrl(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const isAvailable = await ensureBackendAvailable();

  if (!isAvailable) {
    throw new Error("Backend unavailable");
  }

  try {
    const response = await fetch(path, {
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      ...init,
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;

      try {
        const payload = (await response.json()) as { error?: { message?: string } };
        if (payload.error?.message) {
          message = payload.error.message;
        }
      } catch {
        // Ignore JSON parse errors for non-JSON responses.
      }

      throw new Error(message);
    }

    backendAvailable = true;

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    backendAvailable = false;
    throw error;
  }
}

async function probeBackendAvailability() {
  if (!BACKEND_ENABLED) {
    backendAvailable = false;
    return false;
  }

  try {
    const response = await fetch(getApiUrl("/api/health"));

    if (!response.ok) {
      throw new Error(`Backend health check failed with status ${response.status}`);
    }

    backendAvailable = true;
    return true;
  } catch {
    backendAvailable = false;
    return false;
  }
}

async function ensureBackendAvailable() {
  if (!BACKEND_ENABLED) {
    backendAvailable = false;
    return false;
  }

  if (backendAvailable !== null) {
    return backendAvailable;
  }

  if (!backendAvailabilityCheck) {
    backendAvailabilityCheck = probeBackendAvailability().finally(() => {
      backendAvailabilityCheck = null;
    });
  }

  return backendAvailabilityCheck;
}

function normalizeUser(item: Record<string, unknown>): UserProfile {
  return {
    ...(item as unknown as UserProfile),
    _id: String(item._id || item.uid || item.firebaseUid || ""),
    uid: String(item.firebaseUid || item.uid || item._id || ""),
  };
}

function normalizeTrip(item: Record<string, unknown>): Trip {
  return {
    ...(item as unknown as Trip),
    _id: String(item._id || item.id || ""),
    id: String(item._id || item.id || ""),
  };
}

function normalizeBooking(item: Record<string, unknown>): BookingItem {
  return {
    ...(item as unknown as BookingItem),
    _id: String(item._id || item.id || ""),
    id: String(item._id || item.id || ""),
  };
}

function normalizeNotification(item: Record<string, unknown>): NotificationItem {
  return {
    ...(item as unknown as NotificationItem),
    _id: String(item._id || item.id || ""),
    id: String(item._id || item.id || ""),
  };
}

function normalizeActivityLog(item: Record<string, unknown>): ActivityLogItem {
  return {
    ...(item as unknown as ActivityLogItem),
    _id: String(item._id || item.id || ""),
    id: String(item._id || item.id || ""),
  };
}

function normalizePost(item: Record<string, unknown>): Post {
  return {
    ...(item as unknown as Post),
    _id: String(item._id || item.id || ""),
    id: String(item._id || item.id || ""),
  };
}

function normalizeWishlistItem(item: Record<string, unknown>): WishlistItem {
  return {
    ...(item as unknown as WishlistItem),
    _id: String(item._id || item.id || ""),
    id: String(item._id || item.id || ""),
  };
}

function normalizeSupportTicket(item: Record<string, unknown>): SupportTicket {
  return {
    ...(item as unknown as SupportTicket),
    _id: String(item._id || item.id || ""),
    id: String(item._id || item.id || ""),
  };
}

function filterItems<T>(items: T[], filters?: Record<string, QueryValue>) {
  if (!filters) return items;
  return items.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      const current = (item as Record<string, unknown>)[key];
      return value === undefined || value === null || value === "" || String(current) === String(value);
    }),
  );
}

function sortNewest<T extends { createdAt?: unknown }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date((a.createdAt as string) || 0).getTime();
    const bTime = new Date((b.createdAt as string) || 0).getTime();
    return bTime - aTime;
  });
}

export async function fetchBackendHealth() {
  if (!BACKEND_ENABLED) {
    backendAvailable = false;
    return {
      ok: false,
      service: "wanderpack-offline",
      database: "disconnected" as const,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(getApiUrl("/api/health"));

    if (!response.ok) {
      throw new Error(`Backend health check failed with status ${response.status}`);
    }

    backendAvailable = true;
    return (await response.json()) as BackendHealth;
  } catch {
    backendAvailable = false;
    return {
      ok: false,
      service: "wanderpack-offline",
      database: "disconnected" as const,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function listUsers() {
  try {
    const response = await apiRequest<{ ok: boolean; data: Record<string, unknown>[] }>(getApiUrl("/api/users?limit=200"));
    return response.data.map(normalizeUser);
  } catch {
    return sortNewest(readLocalStore().users);
  }
}

export async function getUserByFirebaseUid(firebaseUid: string) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl(`/api/users/firebase/${firebaseUid}`));
    return normalizeUser(response.data);
  } catch {
    const store = readLocalStore();
    const user = store.users.find((entry) => entry.uid === firebaseUid) || null;
    return user ? normalizeUser(user as unknown as Record<string, unknown>) : null;
  }
}

export async function upsertUser(user: Partial<UserProfile> & { firebaseUid?: string; email: string; name: string }) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/users/upsert"), {
      method: "POST",
      body: JSON.stringify(user),
    });
    return normalizeUser(response.data);
  } catch {
    const store = readLocalStore();
    const existing = store.users.find((entry) => entry.uid === user.firebaseUid || entry.email === user.email);
    const nextUser: UserProfile = {
      ...(existing || {
        uid: user.firebaseUid || createId("user"),
        role: "traveler",
        status: "active",
      }),
      ...user,
      _id: existing?._id || user.firebaseUid || createId("user"),
      uid: user.firebaseUid || existing?.uid || createId("user"),
      email: user.email,
      name: user.name,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    store.users = [nextUser, ...store.users.filter((entry) => entry.uid !== nextUser.uid && entry.email !== nextUser.email)];
    writeLocalStore(store);
    return nextUser;
  }
}

export async function updateUserDocument(documentId: string, updates: Partial<UserProfile>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl(`/api/users/${documentId}`), {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return normalizeUser(response.data);
  } catch {
    const store = readLocalStore();
    let updatedUser: UserProfile | null = null;
    store.users = store.users.map((entry) => {
      if (entry._id !== documentId && entry.uid !== documentId) return entry;
      updatedUser = { ...entry, ...updates, updatedAt: new Date() };
      return updatedUser;
    });
    writeLocalStore(store);
    return updatedUser as unknown as UserProfile;
  }
}

export async function listTrips() {
  try {
    const response = await apiRequest<{ ok: boolean; data: Record<string, unknown>[] }>(getApiUrl("/api/trips?limit=200"));
    return response.data.map(normalizeTrip);
  } catch {
    return sortNewest(readLocalStore().trips);
  }
}

export async function createTripDocument(payload: Partial<Trip>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/trips"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeTrip(response.data);
  } catch {
    const store = readLocalStore();
    const trip = normalizeTrip({
      ...payload,
      _id: createId("trip"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.trips = [trip, ...store.trips];
    writeLocalStore(store);
    return trip;
  }
}

export async function updateTripDocument(id: string, updates: Partial<Trip>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl(`/api/trips/${id}`), {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return normalizeTrip(response.data);
  } catch {
    const store = readLocalStore();
    let updatedTrip: Trip | null = null;
    store.trips = store.trips.map((entry) => {
      if (entry.id !== id && entry._id !== id) return entry;
      updatedTrip = normalizeTrip({
        ...entry,
        ...updates,
        updatedAt: new Date(),
      } as unknown as Record<string, unknown>);
      return updatedTrip;
    });
    writeLocalStore(store);
    return updatedTrip as unknown as Trip;
  }
}

export async function deleteTripDocument(id: string) {
  try {
    await apiRequest<{ ok: boolean }>(getApiUrl(`/api/trips/${id}`), { method: "DELETE" });
  } catch {
    const store = readLocalStore();
    store.trips = store.trips.filter((entry) => entry.id !== id && entry._id !== id);
    writeLocalStore(store);
  }
}

export async function listBookings(filters?: Record<string, QueryValue>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>[]>>(getApiUrl(`/api/bookings${buildQuery(filters)}`));
    return response.data.map(normalizeBooking);
  } catch {
    return sortNewest(filterItems(readLocalStore().bookings, filters));
  }
}

export async function createBookingDocument(payload: Partial<BookingItem>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/bookings"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeBooking(response.data);
  } catch {
    const store = readLocalStore();
    const booking = normalizeBooking({
      ...payload,
      _id: createId("booking"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.bookings = [booking, ...store.bookings];
    writeLocalStore(store);
    return booking;
  }
}

export async function updateBookingDocument(id: string, updates: Partial<BookingItem>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl(`/api/bookings/${id}`), {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return normalizeBooking(response.data);
  } catch {
    const store = readLocalStore();
    let updatedBooking: BookingItem | null = null;
    store.bookings = store.bookings.map((entry) => {
      if (entry.id !== id && entry._id !== id) return entry;
      updatedBooking = normalizeBooking({
        ...entry,
        ...updates,
        updatedAt: new Date(),
      } as unknown as Record<string, unknown>);
      return updatedBooking;
    });
    writeLocalStore(store);
    return updatedBooking as unknown as BookingItem;
  }
}

export async function deleteBookingDocument(id: string) {
  try {
    await apiRequest<{ ok: boolean }>(getApiUrl(`/api/bookings/${id}`), { method: "DELETE" });
  } catch {
    const store = readLocalStore();
    store.bookings = store.bookings.filter((entry) => entry.id !== id && entry._id !== id);
    writeLocalStore(store);
  }
}

export async function listNotifications(filters?: Record<string, QueryValue>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>[]>>(getApiUrl(`/api/notifications${buildQuery(filters)}`));
    return response.data.map(normalizeNotification);
  } catch {
    return sortNewest(filterItems(readLocalStore().notifications, filters));
  }
}

export async function createNotificationDocument(payload: Partial<NotificationItem>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/notifications"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeNotification(response.data);
  } catch {
    const store = readLocalStore();
    const notification = normalizeNotification({
      ...payload,
      _id: createId("notification"),
      createdAt: new Date(),
    });
    store.notifications = [notification, ...store.notifications];
    writeLocalStore(store);
    return notification;
  }
}

export async function updateNotificationDocument(id: string, updates: Partial<NotificationItem>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl(`/api/notifications/${id}`), {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return normalizeNotification(response.data);
  } catch {
    const store = readLocalStore();
    let updatedNotification: NotificationItem | null = null;
    store.notifications = store.notifications.map((entry) => {
      if (entry.id !== id && entry._id !== id) return entry;
      updatedNotification = normalizeNotification({
        ...entry,
        ...updates,
      } as unknown as Record<string, unknown>);
      return updatedNotification;
    });
    writeLocalStore(store);
    return updatedNotification as unknown as NotificationItem;
  }
}

export async function listActivityLog() {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>[]>>(getApiUrl("/api/activity-log"));
    return response.data.map(normalizeActivityLog);
  } catch {
    return sortNewest(readLocalStore().activityLog);
  }
}

export async function createActivityLogDocument(payload: Partial<ActivityLogItem>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/activity-log"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeActivityLog(response.data);
  } catch {
    const store = readLocalStore();
    const item = normalizeActivityLog({
      ...payload,
      _id: createId("activity"),
      createdAt: new Date(),
    });
    store.activityLog = [item, ...store.activityLog];
    writeLocalStore(store);
    return item;
  }
}

export async function listPosts() {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>[]>>(getApiUrl("/api/posts"));
    return response.data.map(normalizePost);
  } catch {
    return sortNewest(readLocalStore().posts);
  }
}

export async function createPostDocument(payload: Partial<Post>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/posts"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizePost(response.data);
  } catch {
    const store = readLocalStore();
    const post = normalizePost({
      ...payload,
      _id: createId("post"),
      createdAt: new Date(),
    });
    store.posts = [post, ...store.posts];
    writeLocalStore(store);
    return post;
  }
}

export async function updatePostDocument(id: string, updates: Partial<Post>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl(`/api/posts/${id}`), {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return normalizePost(response.data);
  } catch {
    const store = readLocalStore();
    let updatedPost: Post | null = null;
    store.posts = store.posts.map((entry) => {
      if (entry.id !== id && entry._id !== id) return entry;
      updatedPost = normalizePost({
        ...entry,
        ...updates,
      } as unknown as Record<string, unknown>);
      return updatedPost;
    });
    writeLocalStore(store);
    return updatedPost as unknown as Post;
  }
}

export async function deletePostDocument(id: string) {
  try {
    await apiRequest<{ ok: boolean }>(getApiUrl(`/api/posts/${id}`), { method: "DELETE" });
  } catch {
    const store = readLocalStore();
    store.posts = store.posts.filter((entry) => entry.id !== id && entry._id !== id);
    writeLocalStore(store);
  }
}

export async function listWishlistItems(filters?: Record<string, QueryValue>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>[]>>(getApiUrl(`/api/wishlist${buildQuery(filters)}`));
    return response.data.map(normalizeWishlistItem);
  } catch {
    return sortNewest(filterItems(readLocalStore().wishlist, filters));
  }
}

export async function createWishlistItemDocument(payload: Partial<WishlistItem>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/wishlist"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeWishlistItem(response.data);
  } catch {
    const store = readLocalStore();
    const item = normalizeWishlistItem({
      ...payload,
      _id: createId("wishlist"),
      createdAt: new Date(),
    });
    store.wishlist = [item, ...store.wishlist];
    writeLocalStore(store);
    return item;
  }
}

export async function deleteWishlistItemDocument(id: string) {
  try {
    await apiRequest<{ ok: boolean }>(getApiUrl(`/api/wishlist/${id}`), { method: "DELETE" });
  } catch {
    const store = readLocalStore();
    store.wishlist = store.wishlist.filter((entry) => entry.id !== id && entry._id !== id);
    writeLocalStore(store);
  }
}

export async function listSupportTickets(filters?: Record<string, QueryValue>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>[]>>(getApiUrl(`/api/support-tickets${buildQuery(filters)}`));
    return response.data.map(normalizeSupportTicket);
  } catch {
    return sortNewest(filterItems(readLocalStore().supportTickets, filters));
  }
}

export async function createSupportTicketDocument(payload: Partial<SupportTicket>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl("/api/support-tickets"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeSupportTicket(response.data);
  } catch {
    const store = readLocalStore();
    const item = normalizeSupportTicket({
      ...payload,
      _id: createId("support"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.supportTickets = [item, ...store.supportTickets];
    writeLocalStore(store);
    return item;
  }
}

export async function updateSupportTicketDocument(id: string, updates: Partial<SupportTicket>) {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(getApiUrl(`/api/support-tickets/${id}`), {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return normalizeSupportTicket(response.data);
  } catch {
    const store = readLocalStore();
    let updatedItem: SupportTicket | null = null;
    store.supportTickets = store.supportTickets.map((entry) => {
      if (entry.id !== id && entry._id !== id) return entry;
      updatedItem = normalizeSupportTicket({
        ...entry,
        ...updates,
        updatedAt: new Date(),
      } as unknown as Record<string, unknown>);
      return updatedItem;
    });
    writeLocalStore(store);
    return updatedItem as unknown as SupportTicket;
  }
}
