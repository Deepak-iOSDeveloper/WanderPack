import mongoose from "mongoose";

const travelerDetailSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    age: { type: String, trim: true, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, index: true },
    product: {
      type: String,
      enum: ["flights", "hotels", "homestays", "holiday-packages", "trains", "buses", "cabs", "visa", "insurance", "forex"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    from: { type: String, trim: true, default: "" },
    to: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    travelDate: { type: String, trim: true, default: "" },
    travelers: { type: Number, min: 0, default: 1 },
    amount: { type: Number, min: 0, default: 0 },
    currency: { type: String, trim: true, default: "INR" },
    status: {
      type: String,
      enum: ["draft", "confirmed", "completed", "cancelled"],
      default: "confirmed",
    },
    destination: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    nights: { type: Number, min: 0, default: 0 },
    days: { type: Number, min: 0, default: 0 },
    packageCategory: {
      type: String,
      enum: ["holiday", "honeymoon", "family", "adventure", "spiritual", "luxury", ""],
      default: "",
    },
    budgetTier: {
      type: String,
      enum: ["low", "mid", "high", ""],
      default: "",
    },
    hotelCategory: { type: String, trim: true, default: "" },
    withFlight: { type: Boolean, default: false },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cash", ""],
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", ""],
      default: "",
    },
    paymentReference: { type: String, trim: true, default: "" },
    couponCode: { type: String, trim: true, default: "" },
    discountAmount: { type: Number, min: 0, default: 0 },
    travelerNames: { type: [String], default: [] },
    travelerDetails: { type: [travelerDetailSchema], default: [] },
    contactPhone: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    itinerary: { type: [String], default: [] },
    details: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
