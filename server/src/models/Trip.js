import mongoose from "mongoose";

const tripMemberSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: {
      type: String,
      enum: ["admin", "member", "pending"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const activityVoteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    value: { type: String, enum: ["up"], default: "up" },
  },
  { _id: false },
);

const activitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["flight", "hotel", "food", "tour", "transport", "experience"],
      required: true,
    },
    time: String,
    icon: String,
    notes: String,
    location: String,
    votes: { type: [activityVoteSchema], default: [] },
  },
  { _id: false },
);

const itineraryDaySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    date: String,
    activities: { type: [activitySchema], default: [] },
  },
  { _id: false },
);

const budgetItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["flights", "hotels", "food", "activities", "transport", "misc"],
      required: true,
    },
    currency: { type: String, required: true, trim: true, default: "USD" },
    paidBy: { type: String, required: true, trim: true },
    splitBetween: { type: [String], default: [] },
    actual: Number,
    emoji: String,
  },
  { _id: false },
);

const tripCommentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    startDate: String,
    endDate: String,
    vibe: { type: String, default: "Relaxed" },
    category: { type: String, default: "Leisure" },
    groupSize: { type: Number, default: 4, min: 1 },
    currency: { type: String, default: "USD", trim: true },
    budgetTotal: { type: Number, default: 0, min: 0 },
    coverImage: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "planning", "confirmed", "completed"],
      default: "planning",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    adminId: { type: String, required: true, trim: true },
    shareCode: { type: String, required: true, trim: true, uppercase: true },
    members: { type: [tripMemberSchema], default: [] },
    itinerary: { type: [itineraryDaySchema], default: [] },
    budget: { type: [budgetItemSchema], default: [] },
    comments: { type: [tripCommentSchema], default: [] },
    packingList: { type: [String], default: [] },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

export const Trip = mongoose.model("Trip", tripSchema);
