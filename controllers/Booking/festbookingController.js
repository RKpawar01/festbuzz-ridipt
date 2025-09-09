const FestBooking = require("../../models/FestBooking/FestBooking.js");
const Fest = require("../../models/Fest/Fest.js");
const FestTicket = require("../../models/Ticket/FestTicketModel.js");

exports.createBooking = async (req, res) => {
  try {
    const { festId, ticketId } = req.params;
    const participantId = req.participant; // from JWT (participant auth)

    const {
      name,
      contactNumber,
      dob,
      gender,
      state,
      city,
      college,
      profilePhoto,
      additionalAnswer1,
      additionalAnswer2
    } = req.body;

    // check fest exists
    const fest = await Fest.findById(festId);
    if (!fest) {
      return res.status(404).json({ success: false, message: "Fest not found" });
    }

    // check ticket exists and belongs to the same fest
    const ticket = await FestTicket.findOne({ _id: ticketId, festId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found for this fest" });
    }

    // check if participant already booked same ticket
    const existingBooking = await FestBooking.findOne({ festId, ticketId, participantId });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: "You already booked this ticket" });
    }

    // define payment status
    let paymentStatus = "Not Required";
    if (ticket.festFeeType === "Paid") {
      paymentStatus = "Pending"; // later integrate Razorpay/Stripe
    }

    const booking = new FestBooking({
      festId,
      ticketId,
      participantId,
      name,
      contactNumber,
      dob,
      gender,
      state,
      city,
      college,
      profilePhoto,
      additionalAnswer1,
      additionalAnswer2,
      bookingStatus: ticket.festFeeType === "Free" ? "Confirmed" : "Pending",
      paymentStatus
    });

    await booking.save();

    res.status(201).json({ success: true, message: "Booking successful", booking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const participantId = req.participant; // from JWT middleware (participant)

    const bookings = await FestBooking.find({ participantId })
      .populate("festId", "festName festType startDate endDate city state collegeName logo")
      .populate("ticketId", "ticketName festFeeType price availableFromDate availableTillDate");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    console.error("Get My Bookings Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


