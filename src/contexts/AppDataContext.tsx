import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoAppState } from "../lib/demoData";
import {
  createActivityLogDocument,
  createBookingDocument,
  createNotificationDocument,
  createPostDocument,
  createSupportTicketDocument,
  createTripDocument,
  createWishlistItemDocument,
  deleteBookingDocument,
  deletePostDocument,
  deleteTripDocument,
  deleteWishlistItemDocument,
  getUserByFirebaseUid,
  listActivityLog,
  listBookings,
  listNotifications,
  listPosts,
  listSupportTickets,
  listTrips,
  listUsers,
  listWishlistItems,
  updateBookingDocument,
  updateNotificationDocument,
  updatePostDocument,
  updateSupportTicketDocument,
  updateTripDocument,
  updateUserDocument,
  upsertUser,
} from "../lib/api";
import { toJsDate } from "../lib/utils";
import type {
  ActivityItem,
  ActivityLogItem,
  AppDataState,
  BookingItem,
  BudgetItem,
  NotificationItem,
  Post,
  SupportTicket,
  Trip,
  TripComment,
  TripMember,
  SupportPriority,
  UserProfile,
  UserStatus,
  WishlistItem,
} from "../types";
import { useAuth } from "./AuthContext";

const PREFERENCES_KEY = "wanderpack-user-preferences-v1";

interface CreateTripInput {
  name: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  vibe?: string;
  category?: string;
  groupSize?: number;
  currency?: string;
  budgetTotal?: number;
  coverImage?: string;
}

interface CreatePostInput {
  destination: string;
  caption: string;
  tags: string[];
  emoji?: string;
  image?: string;
}

interface CreateBookingInput {
  product: BookingItem["product"];
  title: string;
  from?: string;
  to?: string;
  city?: string;
  travelDate?: string;
  travelers?: number;
  amount?: number;
  currency?: string;
  destination?: string;
  state?: string;
  nights?: number;
  days?: number;
  packageCategory?: BookingItem["packageCategory"];
  budgetTier?: BookingItem["budgetTier"];
  hotelCategory?: string;
  withFlight?: boolean;
  paymentMethod?: BookingItem["paymentMethod"];
  paymentStatus?: BookingItem["paymentStatus"];
  paymentReference?: string;
  couponCode?: string;
  discountAmount?: number;
  travelerNames?: string[];
  travelerDetails?: BookingItem["travelerDetails"];
  contactPhone?: string;
  image?: string;
  itinerary?: string[];
  details?: string;
}

interface CreateWishlistInput {
  title: string;
  category: string;
  location: string;
  note?: string;
  image?: string;
}

interface CreateSupportTicketInput {
  subject: string;
  category: SupportTicket["category"];
  categoryLabel?: string;
  message: string;
  priority?: SupportPriority;
  contactEmail?: string;
  contactPhone?: string;
}

interface UpdateProfileInput {
  name: string;
  bio: string;
  location: string;
  notifications: "on" | "off";
  style: UserProfile["style"];
}

interface UserPreferences {
  followedUserIds: string[];
  bookmarkedDestinationIds: string[];
  theme: AppDataState["theme"];
}

interface AppDataContextValue {
  state: AppDataState;
  currentUserState: UserProfile | null;
  memberTrips: Trip[];
  loading: boolean;
  createTrip: (input: CreateTripInput) => Promise<Trip | null>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  duplicateTrip: (tripId: string) => Promise<Trip | null>;
  addDay: (tripId: string, label: string, date?: string) => Promise<string | null>;
  addActivity: (tripId: string, dayId: string, activity: Omit<ActivityItem, "id" | "votes">) => Promise<void>;
  moveActivity: (tripId: string, dayId: string, activityId: string, direction: "up" | "down") => Promise<void>;
  removeActivity: (tripId: string, dayId: string, activityId: string) => Promise<void>;
  voteActivity: (tripId: string, dayId: string, activityId: string) => Promise<void>;
  addExpense: (tripId: string, expense: Omit<BudgetItem, "id">) => Promise<void>;
  removeExpense: (tripId: string, expenseId: string) => Promise<void>;
  inviteMember: (tripId: string, email: string) => Promise<void>;
  updateMemberRole: (tripId: string, memberId: string, role: TripMember["role"]) => Promise<void>;
  removeMember: (tripId: string, memberId: string) => Promise<void>;
  addTripComment: (tripId: string, text: string) => Promise<void>;
  createPost: (input: CreatePostInput) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleBookmarkPost: (postId: string) => Promise<void>;
  addPostComment: (postId: string, text: string) => Promise<void>;
  createBooking: (input: CreateBookingInput) => Promise<void>;
  createServiceRequest: (input: CreateBookingInput) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingItem["status"]) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  addWishlistItem: (input: CreateWishlistInput) => Promise<void>;
  removeWishlistItem: (wishlistId: string) => Promise<void>;
  createSupportTicket: (input: CreateSupportTicketInput) => Promise<void>;
  updateSupportTicket: (ticketId: string, updates: Partial<SupportTicket>) => Promise<void>;
  resolveSupportTicket: (ticketId: string, adminReply: string, resolutionNote?: string) => Promise<void>;
  toggleFollow: (userId: string) => void;
  toggleDestinationBookmark: (destinationId: string) => void;
  updateUserStatus: (uid: string, status: UserStatus) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
  sendBroadcast: (message: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  updateCurrentUserProfileState: (input: UpdateProfileInput) => Promise<void>;
  setTheme: (theme: AppDataState["theme"]) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortByCreatedAt<T extends { createdAt?: unknown }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aTime = toJsDate(a.createdAt)?.getTime() || 0;
    const bTime = toJsDate(b.createdAt)?.getTime() || 0;
    return bTime - aTime;
  });
}

function loadPreferences(): UserPreferences {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return {
        followedUserIds: demoAppState.followedUserIds,
        bookmarkedDestinationIds: demoAppState.bookmarkedDestinationIds,
        theme: demoAppState.theme,
      };
    }

    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      followedUserIds: parsed.followedUserIds || [],
      bookmarkedDestinationIds: parsed.bookmarkedDestinationIds || [],
      theme: parsed.theme || "light",
    };
  } catch (error) {
    console.warn("Unable to load preferences:", error);
    return {
      followedUserIds: demoAppState.followedUserIds,
      bookmarkedDestinationIds: demoAppState.bookmarkedDestinationIds,
      theme: demoAppState.theme,
    };
  }
}

function cloneTripWithId(trip: Trip) {
  return {
    ...trip,
    id: String(trip.id),
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [remoteUsers, setRemoteUsers] = useState<UserProfile[]>([]);
  const [remoteTrips, setRemoteTrips] = useState<Trip[]>([]);
  const [remotePosts, setRemotePosts] = useState<Post[]>([]);
  const [remoteNotifications, setRemoteNotifications] = useState<NotificationItem[]>([]);
  const [remoteActivityLog, setRemoteActivityLog] = useState<ActivityLogItem[]>([]);
  const [remoteBookings, setRemoteBookings] = useState<BookingItem[]>([]);
  const [remoteWishlist, setRemoteWishlist] = useState<WishlistItem[]>([]);
  const [remoteSupportTickets, setRemoteSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());

  useEffect(() => {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences]);

  useEffect(() => {
    let cancelled = false;

    async function syncCurrentUser() {
      if (!user?.email) return;

      try {
        const existing = await getUserByFirebaseUid(user.uid);
        const synced = await upsertUser({
          firebaseUid: user.uid,
          email: user.email,
          name: profile?.name || existing?.name || user.displayName || user.email.split("@")[0] || "Traveler",
          role: profile?.role || existing?.role || "traveler",
          status: profile?.status || existing?.status || "active",
          avatar: profile?.avatar || existing?.avatar || user.photoURL || "",
          bio: profile?.bio || existing?.bio || "",
          location: profile?.location || existing?.location || "",
          notifications: profile?.notifications || existing?.notifications || "on",
          style: profile?.style || existing?.style || "adventure",
        });

        if (cancelled) return;

        setRemoteUsers((current) => {
          const next = current.filter((entry) => entry.uid !== synced.uid);
          return sortByCreatedAt([synced, ...next]);
        });
      } catch (error) {
        console.warn("Unable to sync current user to MongoDB:", error);
      }
    }

    void syncCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadAppData() {
      try {
        const [users, trips, posts, notifications, activityLog, bookings, wishlist, supportTickets] = await Promise.all([
          listUsers(),
          listTrips(),
          listPosts(),
          listNotifications(profile?.role === "admin" || profile?.role === "superadmin" ? undefined : { userId: user?.uid }),
          listActivityLog(),
          listBookings(profile?.role === "admin" || profile?.role === "superadmin" ? undefined : { userId: user?.uid }),
          listWishlistItems(user ? { userId: user.uid } : undefined),
          listSupportTickets(profile?.role === "admin" || profile?.role === "superadmin" ? undefined : { userId: user?.uid }),
        ]);

        if (cancelled) return;

        setRemoteUsers(users);
        setRemoteTrips(sortByCreatedAt(trips));
        setRemotePosts(sortByCreatedAt(posts));
        setRemoteNotifications(sortByCreatedAt(notifications));
        setRemoteActivityLog(sortByCreatedAt(activityLog));
        setRemoteBookings(sortByCreatedAt(bookings));
        setRemoteWishlist(sortByCreatedAt(wishlist));
        setRemoteSupportTickets(sortByCreatedAt(supportTickets));
      } catch (error) {
        console.warn("Unable to load app data from MongoDB:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAppData();
    const timer = window.setInterval(() => {
      void loadAppData();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [profile?.role, user]);

  const state: AppDataState = useMemo(
    () => ({
      users: remoteUsers,
      trips: remoteTrips,
      posts: remotePosts,
      stories: demoAppState.stories,
      destinations: demoAppState.destinations,
      notifications: remoteNotifications,
      activityLog: remoteActivityLog,
      bookings: remoteBookings,
      wishlist: remoteWishlist,
      supportTickets: remoteSupportTickets,
      followedUserIds: preferences.followedUserIds,
      bookmarkedDestinationIds: preferences.bookmarkedDestinationIds,
      theme: preferences.theme,
    }),
    [
      preferences,
      remoteActivityLog,
      remoteBookings,
      remoteNotifications,
      remotePosts,
      remoteSupportTickets,
      remoteTrips,
      remoteUsers,
      remoteWishlist,
    ],
  );

  const currentUserState = useMemo(
    () => (user ? state.users.find((entry) => entry.uid === user.uid) || null : null),
    [state.users, user],
  );

  const memberTrips = useMemo(
    () => (user ? state.trips.filter((trip) => trip.members.some((member) => member.uid === user.uid)) : []),
    [state.trips, user],
  );

  async function refreshTrips() {
    setRemoteTrips(sortByCreatedAt(await listTrips()));
  }

  async function refreshPosts() {
    setRemotePosts(sortByCreatedAt(await listPosts()));
  }

  async function refreshBookings() {
    setRemoteBookings(
      sortByCreatedAt(
        await listBookings(profile?.role === "admin" || profile?.role === "superadmin" ? undefined : { userId: user?.uid }),
      ),
    );
  }

  async function refreshNotifications() {
    setRemoteNotifications(
      sortByCreatedAt(
        await listNotifications(profile?.role === "admin" || profile?.role === "superadmin" ? undefined : { userId: user?.uid }),
      ),
    );
  }

  async function refreshUsers() {
    setRemoteUsers(await listUsers());
  }

  async function refreshWishlist() {
    setRemoteWishlist(sortByCreatedAt(await listWishlistItems(user ? { userId: user.uid } : undefined)));
  }

  async function refreshSupportTickets() {
    setRemoteSupportTickets(
      sortByCreatedAt(
        await listSupportTickets(profile?.role === "admin" || profile?.role === "superadmin" ? undefined : { userId: user?.uid }),
      ),
    );
  }

  async function refreshActivityLog() {
    setRemoteActivityLog(sortByCreatedAt(await listActivityLog()));
  }

  async function logActivity(title: string, detail: string) {
    await createActivityLogDocument({ title, detail });
    await refreshActivityLog();
  }

  async function createNotification(notification: Omit<NotificationItem, "id" | "createdAt">) {
    await createNotificationDocument(notification);
    await refreshNotifications();
  }

  async function createTrip(input: CreateTripInput) {
    if (!user) return null;

    const baseUser = currentUserState || {
      uid: user.uid,
      name: user.displayName || user.email?.split("@")[0] || "Traveler",
      email: user.email || "",
      role: profile?.role || "traveler",
      status: profile?.status || "active",
    };

    const trip = await createTripDocument({
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      vibe: input.vibe || "Relaxed",
      category: input.category || "Leisure",
      status: "planning",
      progress: 10,
      groupSize: input.groupSize || 4,
      currency: input.currency || "USD",
      budgetTotal: input.budgetTotal || 0,
      coverImage: input.coverImage || "",
      adminId: user.uid,
      shareCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      members: [
        {
          uid: baseUser.uid,
          name: baseUser.name,
          email: baseUser.email,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
      itinerary: [],
      budget: [],
      comments: [],
      packingList: ["Passport", "Phone charger"],
      notes: "",
    });

    await refreshTrips();
    await createNotification({
      userId: user.uid,
      title: "Trip created",
      body: `${trip.name} has been added to your trips.`,
      type: "trip",
      read: false,
    });
    await logActivity("Trip created", `${baseUser.name} created ${trip.name}.`);
    return trip;
  }

  async function updateTrip(tripId: string, updates: Partial<Trip>) {
    await updateTripDocument(tripId, updates);
    await refreshTrips();
  }

  async function deleteTrip(tripId: string) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    await deleteTripDocument(tripId);
    await refreshTrips();
    if (trip) {
      await logActivity("Trip removed", `${trip.name} was removed from the platform.`);
    }
  }

  async function duplicateTrip(tripId: string) {
    const source = state.trips.find((entry) => entry.id === tripId);
    if (!source) return null;
    const nextTrip = await createTripDocument({
      ...cloneTripWithId(source),
      name: `${source.name} Copy`,
      status: "draft",
      shareCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    });
    await refreshTrips();
    return nextTrip;
  }

  async function addDay(tripId: string, label: string, date?: string) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return null;
    const newDayId = createId("day");
    const itinerary = [...(trip.itinerary || []), { id: newDayId, label, date, activities: [] }];
    await updateTrip(tripId, { itinerary, progress: Math.min(100, (trip.progress || 0) + 8) });
    return newDayId;
  }

  async function addActivity(tripId: string, dayId: string, activity: Omit<ActivityItem, "id" | "votes">) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    const itinerary = (trip.itinerary || []).map((day) =>
      day.id === dayId
        ? { ...day, activities: [...day.activities, { ...activity, id: createId("activity"), votes: [] }] }
        : day,
    );
    await updateTrip(tripId, { itinerary, progress: Math.min(100, (trip.progress || 0) + 4) });
  }

  async function moveActivity(tripId: string, dayId: string, activityId: string, direction: "up" | "down") {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    const itinerary = (trip.itinerary || []).map((day) => {
      if (day.id !== dayId) return day;
      const index = day.activities.findIndex((activity) => activity.id === activityId);
      if (index < 0) return day;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= day.activities.length) return day;
      const nextActivities = [...day.activities];
      const [item] = nextActivities.splice(index, 1);
      nextActivities.splice(target, 0, item);
      return { ...day, activities: nextActivities };
    });
    await updateTrip(tripId, { itinerary });
  }

  async function removeActivity(tripId: string, dayId: string, activityId: string) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    const itinerary = (trip.itinerary || []).map((day) =>
      day.id === dayId
        ? { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) }
        : day,
    );
    await updateTrip(tripId, { itinerary });
  }

  async function voteActivity(tripId: string, dayId: string, activityId: string) {
    if (!user) return;
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    const itinerary = (trip.itinerary || []).map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        activities: day.activities.map((activity) => {
          if (activity.id !== activityId) return activity;
          const alreadyVoted = activity.votes?.some((vote) => vote.userId === user.uid);
          return {
            ...activity,
            votes: alreadyVoted
              ? (activity.votes || []).filter((vote) => vote.userId !== user.uid)
              : [...(activity.votes || []), { userId: user.uid, value: "up" as const }],
          };
        }),
      };
    });
    await updateTrip(tripId, { itinerary });
  }

  async function addExpense(tripId: string, expense: Omit<BudgetItem, "id">) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    await updateTrip(tripId, { budget: [...(trip.budget || []), { ...expense, id: createId("expense") }] });
  }

  async function removeExpense(tripId: string, expenseId: string) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    await updateTrip(tripId, { budget: (trip.budget || []).filter((entry) => entry.id !== expenseId) });
  }

  async function inviteMember(tripId: string, email: string) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    const matchingUser = state.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
    const nextMember: TripMember = matchingUser
      ? {
          uid: matchingUser.uid,
          name: matchingUser.name,
          email: matchingUser.email,
          role: "pending",
          joinedAt: new Date(),
        }
      : {
          uid: createId("guest"),
          name: email.split("@")[0],
          email,
          role: "pending",
          joinedAt: new Date(),
        };
    await updateTrip(tripId, { members: [...trip.members, nextMember] });

    const notificationTargets = matchingUser?.uid ? [matchingUser.uid, trip.adminId] : [trip.adminId];
    await Promise.all(
      notificationTargets.map((targetUserId) =>
        createNotificationDocument({
          userId: targetUserId,
          title: "Member invited",
          body: `${email} was invited to ${trip.name}.`,
          type: "member",
          read: false,
        }),
      ),
    );
    await refreshNotifications();
  }

  async function updateMemberRole(tripId: string, memberId: string, role: TripMember["role"]) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    await updateTrip(tripId, {
      members: trip.members.map((member) => (member.uid === memberId ? { ...member, role } : member)),
    });
  }

  async function removeMember(tripId: string, memberId: string) {
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    await updateTrip(tripId, { members: trip.members.filter((member) => member.uid !== memberId) });
  }

  async function addTripComment(tripId: string, text: string) {
    if (!user) return;
    const trip = state.trips.find((entry) => entry.id === tripId);
    if (!trip) return;
    const comment: TripComment = {
      id: createId("comment"),
      userId: user.uid,
      authorName: currentUserState?.name || user.displayName || "Traveler",
      text,
      createdAt: new Date(),
    };
    await updateTrip(tripId, { comments: [comment, ...(trip.comments || [])] });
  }

  async function createPost(input: CreatePostInput) {
    if (!user) return;
    await createPostDocument({
      authorId: user.uid,
      authorName: currentUserState?.name || user.displayName || "Traveler",
      authorColor: "#FF6B6B",
      destination: input.destination,
      caption: input.caption,
      image: input.image?.trim() || "",
      tags: input.tags,
      emoji: input.emoji || "Post",
      likes: 0,
      likedBy: [],
      comments: 0,
      commentItems: [],
      bookmarkedBy: [],
      category: input.tags[0] || "all",
    });
    await refreshPosts();
  }

  async function toggleLikePost(postId: string) {
    if (!user) return;
    const post = state.posts.find((entry) => entry.id === postId);
    if (!post) return;
    const liked = post.likedBy?.includes(user.uid);
    const likedBy = liked
      ? (post.likedBy || []).filter((value) => value !== user.uid)
      : [...(post.likedBy || []), user.uid];
    await updatePostDocument(postId, {
      likedBy,
      likes: likedBy.length,
    });
    await refreshPosts();
  }

  async function toggleBookmarkPost(postId: string) {
    if (!user) return;
    const post = state.posts.find((entry) => entry.id === postId);
    if (!post) return;
    const bookmarked = post.bookmarkedBy?.includes(user.uid);
    const bookmarkedBy = bookmarked
      ? (post.bookmarkedBy || []).filter((value) => value !== user.uid)
      : [...(post.bookmarkedBy || []), user.uid];
    await updatePostDocument(postId, { bookmarkedBy });
    await refreshPosts();
  }

  async function addPostComment(postId: string, text: string) {
    if (!user) return;
    const post = state.posts.find((entry) => entry.id === postId);
    if (!post) return;
    const commentItems = [
      {
        id: createId("post-comment"),
        userId: user.uid,
        authorName: currentUserState?.name || user.displayName || "Traveler",
        text,
        createdAt: new Date(),
      },
      ...(post.commentItems || []),
    ];
    await updatePostDocument(postId, {
      commentItems,
      comments: commentItems.length,
    });
    await refreshPosts();
  }

  async function createBooking(input: CreateBookingInput) {
    if (!user) return;
    await createBookingDocument({
      userId: user.uid,
      ...input,
      status: "confirmed",
    });
    await refreshBookings();
    await createNotification({
      userId: user.uid,
      title: "Booking saved",
      body: `${input.title} has been added to your bookings.`,
      type: "system",
      read: false,
    });
    await logActivity("Booking created", `${input.product} booking created for ${input.title}.`);
  }

  async function createServiceRequest(input: CreateBookingInput) {
    await createBooking(input);
  }

  async function updateBookingStatus(bookingId: string, status: BookingItem["status"]) {
    await updateBookingDocument(bookingId, { status });
    await refreshBookings();
  }

  async function cancelBooking(bookingId: string) {
    await updateBookingStatus(bookingId, "cancelled");
  }

  async function deleteBooking(bookingId: string) {
    await deleteBookingDocument(bookingId);
    await refreshBookings();
  }

  async function addWishlistItem(input: CreateWishlistInput) {
    if (!user) return;
    await createWishlistItemDocument({
      userId: user.uid,
      ...input,
    });
    await refreshWishlist();
  }

  async function removeWishlistItem(wishlistId: string) {
    await deleteWishlistItemDocument(wishlistId);
    await refreshWishlist();
  }

  async function createSupportTicket(input: CreateSupportTicketInput) {
    if (!user) return;
    await createSupportTicketDocument({
      userId: user.uid,
      ...input,
      status: "open",
    });
    await refreshSupportTickets();
    await createNotification({
      userId: user.uid,
      title: "Support ticket created",
      body: `${input.subject} is now in our support queue.`,
      type: "system",
      read: false,
    });
    await logActivity("Support ticket created", `${input.subject} was submitted to support.`);
  }

  async function updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>) {
    await updateSupportTicketDocument(ticketId, updates);
    await refreshSupportTickets();
  }

  async function resolveSupportTicket(ticketId: string, adminReply: string, resolutionNote?: string) {
    const ticket = state.supportTickets.find((entry) => entry.id === ticketId);
    if (!ticket) return;

    await updateSupportTicketDocument(ticketId, {
      status: "resolved",
      adminReply,
      resolutionNote: resolutionNote || "",
      resolvedAt: new Date(),
      resolvedBy: user?.uid || "admin",
    });
    await refreshSupportTickets();
    await createNotification({
      userId: ticket.userId,
      title: "Support issue resolved",
      body: `${ticket.subject} has been resolved by support.`,
      type: "system",
      read: false,
    });
    await logActivity("Support ticket resolved", `${ticket.subject} was marked resolved.`);
  }

  function toggleFollow(userId: string) {
    setPreferences((current) => {
      const following = current.followedUserIds.includes(userId);
      return {
        ...current,
        followedUserIds: following
          ? current.followedUserIds.filter((entry) => entry !== userId)
          : [...current.followedUserIds, userId],
      };
    });
  }

  function toggleDestinationBookmark(destinationId: string) {
    setPreferences((current) => {
      const bookmarked = current.bookmarkedDestinationIds.includes(destinationId);
      return {
        ...current,
        bookmarkedDestinationIds: bookmarked
          ? current.bookmarkedDestinationIds.filter((entry) => entry !== destinationId)
          : [...current.bookmarkedDestinationIds, destinationId],
      };
    });
  }

  async function updateUserStatus(uid: string, status: UserStatus) {
    const mongoUser = remoteUsers.find((entry) => entry.uid === uid) || (await getUserByFirebaseUid(uid));
    if (!mongoUser?._id) {
      await refreshUsers();
      return;
    }
    await updateUserDocument(mongoUser._id, { status });
    await refreshUsers();
  }

  async function removePost(postId: string) {
    await deletePostDocument(postId);
    await refreshPosts();
  }

  async function sendBroadcast(message: string) {
    if (!message.trim()) return;
    await Promise.all(
      state.users.map((entry) =>
        createNotificationDocument({
          userId: entry.uid,
          title: "Broadcast",
          body: message,
          type: "admin",
          read: false,
        }),
      ),
    );
    await refreshNotifications();
    await logActivity("Broadcast sent", message);
  }

  async function markNotificationsRead() {
    if (!user) return;
    const unread = state.notifications.filter((entry) => entry.userId === user.uid && !entry.read);
    await Promise.all(unread.map((entry) => updateNotificationDocument(entry.id, { read: true })));
    await refreshNotifications();
  }

  async function updateCurrentUserProfileState(input: UpdateProfileInput) {
    if (!user?.email) return;
    await upsertUser({
      firebaseUid: user.uid,
      email: user.email,
      name: input.name,
      bio: input.bio,
      location: input.location,
      notifications: input.notifications,
      style: input.style,
      role: currentUserState?.role || profile?.role || "traveler",
      status: currentUserState?.status || profile?.status || "active",
      avatar: currentUserState?.avatar || user.photoURL || "",
    });
    await refreshUsers();
  }

  function setTheme(theme: AppDataState["theme"]) {
    setPreferences((current) => ({ ...current, theme }));
  }

  const value: AppDataContextValue = {
    state,
    currentUserState,
    memberTrips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    duplicateTrip,
    addDay,
    addActivity,
    moveActivity,
    removeActivity,
    voteActivity,
    addExpense,
    removeExpense,
    inviteMember,
    updateMemberRole,
    removeMember,
    addTripComment,
    createPost,
    toggleLikePost,
    toggleBookmarkPost,
    addPostComment,
    createBooking,
    createServiceRequest,
    updateBookingStatus,
    cancelBooking,
    deleteBooking,
    addWishlistItem,
    removeWishlistItem,
    createSupportTicket,
    updateSupportTicket,
    resolveSupportTicket,
    toggleFollow,
    toggleDestinationBookmark,
    updateUserStatus,
    removePost,
    sendBroadcast,
    markNotificationsRead,
    updateCurrentUserProfileState,
    setTheme,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}
