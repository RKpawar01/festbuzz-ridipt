const Event = require("../../models/Events/Event.js");
const FestBooking = require("../../models/FestBooking/FestBooking.js");
const EventBooking = require("../../models/EventBooking/EventBooking.js");

exports.createEventBooking = async (req, res) => {
  try {
    const { eventId } = req.params;
    const participantId = req.participant; // from JWT middleware
    const { type, isTeamLeader, teamName, teamCode, additionalAnswer1, additionalAnswer2 } = req.body;

    // 1️⃣ Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // 2️⃣ Check participant has booked the fest
    const festBooking = await FestBooking.findOne({ festId: event.fest, participantId });
    if (!festBooking) {
      return res.status(400).json({ success: false, message: "You must book the fest first" });
    }

    // 3️⃣ Handle Individual Event Booking
    if (event.eventType === "Individual") {
      // 🔒 Prevent duplicate booking
      const existingBooking = await EventBooking.findOne({ eventId, participantId });
      if (existingBooking) {
        return res.status(400).json({ success: false, message: "You have already booked this event" });
      }

      const booking = new EventBooking({
        eventId,
        participantId,
        festBookingId: festBooking._id,
        eventType: "Individual",
        additionalAnswer1,
        additionalAnswer2,
        bookingStatus: event.eventFeeType === "Free" ? "Confirmed" : "Pending",
        paymentStatus: event.eventFeeType === "Free" ? "Not Required" : "Pending"
      });

      await booking.save();
      return res.status(201).json({ success: true, message: "Individual event booked", booking });
    }

    // 4️⃣ Handle Team Event Booking
    if (event.eventType === "Team") {
      let booking;

      if (isTeamLeader) {
        // Leader creates a new team
        const code = EventBooking.generateTeamCode();

        booking = new EventBooking({
          eventId,
          participantId,
          festBookingId: festBooking._id,
          eventType: "Team",
          teamName,
          teamCode: code,
          teamLeader: participantId, // ✅ store leader explicitly
          members: [{ participantId }],
          bookingStatus: event.eventFeeType === "Free" ? "Confirmed" : "Pending",
          paymentStatus: event.eventFeeType === "Free" ? "Not Required" : "Pending"
        });

        await booking.save();
        return res.status(201).json({ success: true, message: "Team created successfully", booking });
      } else {
        // 🔒 Optional check: prevent joining multiple teams for the same event
        const alreadyInTeam = await EventBooking.findOne({
          eventId,
          "members.participantId": participantId
        });
        if (alreadyInTeam) {
          return res.status(400).json({ success: false, message: "You are already part of a team for this event" });
        }

        // Member joins an existing team
        const leaderBooking = await EventBooking.findOne({ eventId, teamName, teamCode, teamLeader: { $exists: true } });
        if (!leaderBooking) {
          return res.status(404).json({ success: false, message: "Team not found or invalid code" });
        }

        // prevent duplicate joining (extra safety, though already checked above)
        const alreadyMember = leaderBooking.members.some(m => m.participantId.toString() === participantId.toString());
        if (alreadyMember) {
          return res.status(400).json({ success: false, message: "You are already part of this team" });
        }

        leaderBooking.members.push({ participantId });
        await leaderBooking.save();

        return res.status(200).json({ success: true, message: "Joined team successfully", team: leaderBooking });
      }
    }

  } catch (err) {
    console.error("Event booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getMyEventBookings = async (req, res) => {
  try {
    const participantId = req.participant; // ✅ from JWT middleware

    // fetch bookings of this participant (individual or team)
    const bookings = await EventBooking.find({
      $or: [
        { participantId }, // individual bookings
        { "members.participantId": participantId } // team bookings
      ]
    })
      .populate("eventId", "name description eventType eventFeeType")
      .populate("festBookingId", "festId")
      .populate("members.participantId", "name email") // populate team members
      .lean();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: "No event bookings found" });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMyTeamDetails = async (req, res) => {
  try {
    const participantId = req.participant; // ✅ from JWT middleware
    const { eventId } = req.params; // pass eventId in URL

    // find booking where the user is the leader
    const teamBooking = await EventBooking.findOne({
      eventId,
      teamLeader: participantId
    })
      .populate("eventId", "name description eventType eventFeeType")
      .populate("members.participantId", "name email") // populate member details
      .lean();

    if (!teamBooking) {
      return res.status(404).json({
        success: false,
        message: "You are not a team leader for this event or team not found"
      });
    }

    res.status(200).json({
      success: true,
      team: {
        teamName: teamBooking.teamName,
        teamCode: teamBooking.teamCode,
        event: teamBooking.eventId,
        bookingStatus: teamBooking.bookingStatus,
        paymentStatus: teamBooking.paymentStatus,
        members: teamBooking.members
      }
    });
  } catch (err) {
    console.error("Get team details error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updateTeamMembers = async (req, res) => {
  try {
    const participantId = req.participant; // ✅ from JWT middleware (current user)
    const { eventId } = req.params;
    const { action, memberId } = req.body; 
    // action = "add" | "remove"

    // 1️⃣ Check if user is team leader
    const teamBooking = await EventBooking.findOne({
      eventId,
      teamLeader: participantId
    });

    if (!teamBooking) {
      return res.status(403).json({
        success: false,
        message: "Only team leaders can manage team members"
      });
    }

    // 2️⃣ Handle Add Member
    if (action === "add") {
      // prevent duplicate
      const alreadyMember = teamBooking.members.some(
        (m) => m.participantId.toString() === memberId.toString()
      );
      if (alreadyMember) {
        return res.status(400).json({ success: false, message: "Member already in the team" });
      }

      teamBooking.members.push({ participantId: memberId });
      await teamBooking.save();

      return res.status(200).json({
        success: true,
        message: "Member added successfully",
        team: teamBooking
      });
    }

    // 3️⃣ Handle Remove Member
    if (action === "remove") {
      const initialCount = teamBooking.members.length;

      teamBooking.members = teamBooking.members.filter(
        (m) => m.participantId.toString() !== memberId.toString()
      );

      if (teamBooking.members.length === initialCount) {
        return res.status(404).json({ success: false, message: "Member not found in team" });
      }

      await teamBooking.save();

      return res.status(200).json({
        success: true,
        message: "Member removed successfully",
        team: teamBooking
      });
    }

    // Invalid action
    return res.status(400).json({ success: false, message: "Invalid action type" });
  } catch (err) {
    console.error("Update team members error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};