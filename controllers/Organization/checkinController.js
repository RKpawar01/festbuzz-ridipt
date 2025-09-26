const jwt = require('jsonwebtoken');
const FestBooking = require('../../models/FestBooking/FestBooking.js');
const EventBooking = require('../../models/EventBooking/EventBooking.js');

exports.scanAndCheckIn = async (req, res) => {
  try {
    const { data } = req.body || {};
    if (!data || !data.t) {
      return res.status(400).json({ success: false, message: 'Invalid QR payload' });
    }

    let decoded;
    try {
      decoded = jwt.verify(data.t, process.env.QR_SECRET || process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR token' });
    }

    const { type, bookingId, participantId } = decoded || {};
    if (!type || !bookingId || !participantId) {
      return res.status(400).json({ success: false, message: 'Malformed QR token' });
    }

    if (type === 'fest') {
      const booking = await FestBooking.findById(bookingId);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.checkedIn) {
        return res.status(200).json({ success: true, message: 'Already checked-in', booking });
      }
      booking.checkedIn = true;
      booking.checkedInAt = new Date();
      booking.checkedInBy = req.user?._id || null;
      await booking.save();
      return res.status(200).json({ success: true, message: 'Fest check-in successful', booking });
    }

    if (type === 'event') {
      const booking = await EventBooking.findById(bookingId);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.checkedIn) {
        return res.status(200).json({ success: true, message: 'Already checked-in', booking });
      }
      booking.checkedIn = true;
      booking.checkedInAt = new Date();
      booking.checkedInBy = req.user?._id || null;
      await booking.save();
      return res.status(200).json({ success: true, message: 'Event check-in successful', booking });
    }

    return res.status(400).json({ success: false, message: 'Unknown QR type' });
  } catch (err) {
    console.error('scanAndCheckIn error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


