import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, index: true },
    subject: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
  },
  { timestamps: true },
);

export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema, "supportTickets");
