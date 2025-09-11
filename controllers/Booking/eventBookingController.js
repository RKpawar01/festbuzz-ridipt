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
        // Member joins an existing team
        const leaderBooking = await EventBooking.findOne({ eventId, teamName, teamCode, teamLeader: { $exists: true } });
        if (!leaderBooking) {
          return res.status(404).json({ success: false, message: "Team not found or invalid code" });
        }

        // prevent duplicate joining
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
