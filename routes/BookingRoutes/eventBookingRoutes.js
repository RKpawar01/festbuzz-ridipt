const express = require("express");
const router = express.Router();
const { createEventBooking } = require("../../controllers/Booking/eventBookingController.js");
const authParticipant = require('../../middlewares/authParticipant.js');

// @route   POST /api/events/:eventId/book
// @desc    Create Event Booking (Individual / Team)
// @access  Private (Participant)
router.post("/:eventId/book", authParticipant, createEventBooking);

module.exports = router;
