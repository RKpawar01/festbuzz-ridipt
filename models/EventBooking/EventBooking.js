const mongoose = require("mongoose");
const crypto = require("crypto");

const eventBookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true
  },
  festBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FestBooking", 
    required: true
  },

  // Event Type
  eventType: { type: String, enum: ["Individual", "Team"], required: true },

  // For Individual
  additionalAnswer1: { type: String },
  additionalAnswer2: { type: String },

  // For Team
  teamName: { type: String },
  teamCode: { type: String }, // unique passcode
  teamLeader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Participant" 
  }, // ✅ always store the leader explicitly
  members: [
    {
      participantId: { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },
      joinedAt: { type: Date, default: Date.now }
    }
  ],

  // Payment / status
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

// Generate team code
eventBookingSchema.statics.generateTeamCode = function () {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

module.exports = mongoose.model("EventBooking", eventBookingSchema);
