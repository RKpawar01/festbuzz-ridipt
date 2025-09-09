// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const festbookingController = require("../../controllers/Booking/festbookingController.js");
const authParticipant = require('../../middlewares/authParticipant.js');

// participant books fest
router.post("/:festId/ticket/:ticketId/book", authParticipant, festbookingController.createBooking);

// get all bookings for a fest (admin use)
router.get("/my/bookings", authParticipant, festbookingController.getMyBookings);

module.exports = router;
