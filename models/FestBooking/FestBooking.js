// models/Booking.js
const mongoose = require("mongoose");

const festbookingSchema = new mongoose.Schema({
  festId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fest",
    required: true
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FestTicket",
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true
  },

  // Booking details from client
  name: { type: String, required: true },
  contactNumber: {
    type: String,
    match: [/^\d{10}$/, "Contact number must be a valid 10-digit number"],
    required: true
  },
  dob: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  state: { type: String },
  city: { type: String },
  college: { type: String },
  profilePhoto: { type: String },

  additionalAnswer1: { type: String },
  additionalAnswer2: { type: String },

  // Payment / status tracking
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending"
  },
  paymentStatus: {
    type: String,
    enum: ["Not Required", "Pending", "Paid", "Failed"],
    default: "Not Required"
  },

  // QR and check-in tracking
  qrIssuedAt: { type: Date },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("FestBooking", festbookingSchema);
