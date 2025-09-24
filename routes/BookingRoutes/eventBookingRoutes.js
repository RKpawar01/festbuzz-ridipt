const express = require("express");
const router = express.Router();
const { createEventBooking, getMyEventBookings, getMyTeamDetails,updateTeamMembers } = require("../../controllers/Booking/eventBookingController.js");
const authParticipant = require('../../middlewares/authParticipant.js');

router.get("/getmybookedevent", authParticipant, getMyEventBookings)
router.get("/event/:eventId/my-team", authParticipant, getMyTeamDetails)
router.post("/:eventId/book", authParticipant, createEventBooking);
router.put("/event/:eventId/team/update",authParticipant,updateTeamMembers)
module.exports = router;
