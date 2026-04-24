type Timestamp = { toDate: () => Date };

export type UserRole = "traveler" | "admin" | "superadmin";
export type UserStatus = "active" | "pending" | "banned";
export type TripStatus = "draft" | "planning" | "confirmed" | "completed";
export type MemberRole = "admin" | "member" | "pending";
export type ActivityType = "flight" | "hotel" | "food" | "tour" | "transport" | "experience";
export type ExpenseCategory = "flights" | "hotels" | "food" | "activities" | "transport" | "misc";
export type NotificationType =
  | "trip"
  | "member"
  | "budget"
  | "feed"
  | "admin"
  | "system";
export type BookingStatus = "draft" | "confirmed" | "completed" | "cancelled";
export type PackageCategory = "holiday" | "honeymoon" | "family" | "adventure" | "spiritual" | "luxury";
export type PaymentMethod = "upi" | "card" | "netbanking" | "cash";
export type PaymentStatus = "pending" | "paid";
export type TravelerGender = "male" | "female" | "other";
export type BookingProduct =
  | "flights"
  | "hotels"
  | "homestays"
  | "holiday-packages"
  | "trains"
  | "buses"
  | "cabs"
  | "visa"
  | "insurance"
  | "forex";
export type SupportStatus = "open" | "in-progress" | "resolved";
export type SupportCategory =
  | "booking"
  | "payment"
  | "visa"
  | "insurance"
  | "forex"
  | "account"
  | "trip-planner"
  | "technical"
  | "other";
export type SupportPriority = "low" | "medium" | "high" | "urgent";

export interface UserProfile {
  _id?: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  location?: string;
  trips?: string[];
  notifications?: "on" | "off";
  style?: "adventure" | "relaxation" | "culture" | "food";
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface TripMember {
  uid: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt?: Timestamp | Date | null;
}

export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  category: ExpenseCategory;
  currency: string;
  paidBy: string;
  splitBetween: string[];
  actual?: number;
  emoji?: string;
}

export interface ActivityVote {
  userId: string;
  value: "up";
}

export interface ActivityItem {
  id: string;
  name: string;
  type: ActivityType;
  time?: string;
  icon?: string;
  notes?: string;
  location?: string;
  votes?: ActivityVote[];
}

export interface ItineraryDay {
  id: string;
  label: string;
  date?: string;
  activities: ActivityItem[];
}

export interface TripComment {
  id: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt?: Timestamp | Date | null;
}

export interface Trip {
  _id?: string;
  id: string;
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
  status?: TripStatus;
  progress?: number;
  members: TripMember[];
  adminId: string;
  shareCode?: string;
  itinerary?: ItineraryDay[];
  budget?: BudgetItem[];
  comments?: TripComment[];
  packingList?: string[];
  notes?: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface PostComment {
  id: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt?: Timestamp | Date | null;
}

export interface StoryItem {
  id: string;
  userId: string;
  authorName: string;
  destination: string;
  emoji?: string;
}

export interface Post {
  _id?: string;
  id: string;
  authorId?: string;
  authorName: string;
  authorColor?: string;
  destination: string;
  caption: string;
  image?: string;
  tags?: string[];
  emoji?: string;
  likes?: number;
  likedBy?: string[];
  comments?: number;
  commentItems?: PostComment[];
  bookmarkedBy?: string[];
  category?: string;
  createdAt?: Timestamp | Date | null;
}

export interface DestinationCard {
  id: string;
  name: string;
  region: string;
  bestFor: string[];
  budget: "low" | "mid" | "high";
  season: string;
  groupSize: string;
  summary: string;
}

export interface NotificationItem {
  _id?: string;
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt?: Timestamp | Date | null;
}

export interface ActivityLogItem {
  _id?: string;
  id: string;
  title: string;
  detail: string;
  createdAt?: Timestamp | Date | null;
}

export interface BookingItem {
  _id?: string;
  id: string;
  userId: string;
  product: BookingProduct;
  title: string;
  from?: string;
  to?: string;
  city?: string;
  travelDate?: string;
  travelers?: number;
  amount?: number;
  currency?: string;
  status: BookingStatus;
  destination?: string;
  state?: string;
  nights?: number;
  days?: number;
  packageCategory?: PackageCategory;
  budgetTier?: "low" | "mid" | "high";
  hotelCategory?: string;
  withFlight?: boolean;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  couponCode?: string;
  discountAmount?: number;
  travelerNames?: string[];
  travelerDetails?: Array<{ name: string; age: string; gender: TravelerGender }>;
  contactPhone?: string;
  image?: string;
  itinerary?: string[];
  details?: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface WishlistItem {
  _id?: string;
  id: string;
  userId: string;
  title: string;
  category: string;
  location: string;
  note?: string;
  image?: string;
  createdAt?: Timestamp | Date | null;
}

export interface SupportTicket {
  _id?: string;
  id: string;
  userId: string;
  subject: string;
  category: SupportCategory;
  categoryLabel?: string;
  message: string;
  status: SupportStatus;
  priority?: SupportPriority;
  contactEmail?: string;
  contactPhone?: string;
  adminReply?: string;
  resolutionNote?: string;
  resolvedAt?: Timestamp | Date | null;
  resolvedBy?: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface AppDataState {
  users: UserProfile[];
  trips: Trip[];
  posts: Post[];
  stories: StoryItem[];
  destinations: DestinationCard[];
  notifications: NotificationItem[];
  activityLog: ActivityLogItem[];
  bookings: BookingItem[];
  wishlist: WishlistItem[];
  supportTickets: SupportTicket[];
  followedUserIds: string[];
  bookmarkedDestinationIds: string[];
  theme: "light" | "dark";
}
