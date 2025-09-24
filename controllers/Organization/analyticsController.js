const mongoose = require('mongoose');
const Fest = require('../../models/Fest/Fest.js');
const FestBooking = require('../../models/FestBooking/FestBooking.js');
const Event = require('../../models/Events/Event.js');
const EventBooking = require('../../models/EventBooking/EventBooking.js');

// GET /admin/api/analytics/fests/summary
exports.getFestBookingSummary = async (req, res) => {
	try {
		const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

		const pipeline = [
			{ $match: { adminId: new mongoose.Types.ObjectId(adminId) } },
			{
				$lookup: {
					from: 'festbookings',
					localField: '_id',
					foreignField: 'festId',
					as: 'bookings'
				}
			},
			{
				$addFields: {
					ticketsSold: { $size: '$bookings' }
				}
			},
			{
				$project: {
					_id: 1,
					festName: 1,
					festStatus: 1,
					startDate: 1,
					endDate: 1,
					city: 1,
					state: 1,
					ticketsSold: 1
				}
			}
		];

		const perFest = await Fest.aggregate(pipeline);
		const totalTicketsSold = perFest.reduce((sum, f) => sum + (f.ticketsSold || 0), 0);

		return res.status(200).json({
			success: true,
			organization: {
				adminId,
				totalFests: perFest.length,
				totalTicketsSold
			},
			fests: perFest
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Failed to fetch fest summary', error: err.message });
	}
};

// GET /admin/api/analytics/fests/:festId/participants
exports.getFestParticipants = async (req, res) => {
	try {
		const { festId } = req.params;
		const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

		// Ensure the fest belongs to this organization
		const fest = await Fest.findOne({ _id: festId, adminId });
		if (!fest) return res.status(404).json({ success: false, message: 'Fest not found or unauthorized' });

		const bookings = await FestBooking.find({ festId })
			.populate({
				path: 'participantId',
				select: 'name email contactNumber dob gender state city college profilePhoto'
			})
			.select('participantId additionalAnswer1 additionalAnswer2 bookingStatus paymentStatus createdAt');

		return res.status(200).json({
			success: true,
			fest: { _id: fest._id, festName: fest.festName },
			count: bookings.length,
			participants: bookings.map(b => ({
				participant: b.participantId,
				answers: {
					additionalAnswer1: b.additionalAnswer1,
					additionalAnswer2: b.additionalAnswer2
				},
				bookingStatus: b.bookingStatus,
				paymentStatus: b.paymentStatus,
				bookedAt: b.createdAt
			}))
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Failed to fetch participants', error: err.message });
	}
};

// GET /admin/api/analytics/events/summary
exports.getEventBookingSummary = async (req, res) => {
	try {
		const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

		const pipeline = [
			{ $match: { adminId: new mongoose.Types.ObjectId(adminId) } },
			{
				$lookup: {
					from: 'eventbookings',
					localField: '_id',
					foreignField: 'eventId',
					as: 'bookings'
				}
			},
			{
				$addFields: {
					ticketsSold: { $size: '$bookings' },
					individualCount: {
						$size: {
							$filter: {
								input: '$bookings',
								as: 'b',
								cond: { $eq: ['$$b.eventType', 'Individual'] }
							}
						}
					},
					teamCount: {
						$size: {
							$filter: {
								input: '$bookings',
								as: 'b',
								cond: { $eq: ['$$b.eventType', 'Team'] }
							}
						}
					}
				}
			},
			{
				$project: {
					_id: 1,
					eventName: 1,
					eventType: 1,
					fest: 1,
					status: 1,
					ticketsSold: 1,
					individualCount: 1,
					teamCount: 1
				}
			}
		];

		const perEvent = await Event.aggregate(pipeline);
		const totals = perEvent.reduce((acc, e) => {
			acc.ticketsSold += e.ticketsSold || 0;
			acc.individual += e.individualCount || 0;
			acc.team += e.teamCount || 0;
			return acc;
		}, { ticketsSold: 0, individual: 0, team: 0 });

		return res.status(200).json({
			success: true,
			organization: {
				adminId,
				totalEvents: perEvent.length,
				ticketsSold: totals.ticketsSold,
				individualBookings: totals.individual,
				teamBookings: totals.team
			},
			events: perEvent
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Failed to fetch event summary', error: err.message });
	}
};

// GET /admin/api/analytics/events/:eventId/participants
exports.getEventParticipants = async (req, res) => {
	try {
		const { eventId } = req.params;
		const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

		const event = await Event.findOne({ _id: eventId, adminId });
		if (!event) return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });

		const bookings = await EventBooking.find({ eventId, eventType: 'Individual' })
			.populate({ path: 'participantId', select: 'name email contactNumber dob gender state city college profilePhoto' })
			.select('participantId additionalAnswer1 additionalAnswer2 bookingStatus paymentStatus createdAt');

		return res.status(200).json({
			success: true,
			event: { _id: event._id, eventName: event.eventName },
			count: bookings.length,
			participants: bookings.map(b => ({
				participant: b.participantId,
				answers: {
					additionalAnswer1: b.additionalAnswer1,
					additionalAnswer2: b.additionalAnswer2
				},
				bookingStatus: b.bookingStatus,
				paymentStatus: b.paymentStatus,
				bookedAt: b.createdAt
			}))
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Failed to fetch event participants', error: err.message });
	}
};

// GET /admin/api/analytics/events/:eventId/teams
exports.getEventTeams = async (req, res) => {
	try {
		const { eventId } = req.params;
		const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

		const event = await Event.findOne({ _id: eventId, adminId });
		if (!event) return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });

		const teams = await EventBooking.find({ eventId, eventType: 'Team', teamLeader: { $ne: null } })
			.populate({ path: 'teamLeader', select: 'name email contactNumber' })
			.populate({ path: 'members.participantId', select: 'name email contactNumber' })
			.select('teamName teamCode teamLeader members bookingStatus paymentStatus createdAt');

		return res.status(200).json({
			success: true,
			event: { _id: event._id, eventName: event.eventName },
			count: teams.length,
			teams: teams.map(t => ({
				teamName: t.teamName,
				teamCode: t.teamCode,
				leader: t.teamLeader,
				members: t.members.map(m => m.participantId),
				bookingStatus: t.bookingStatus,
				paymentStatus: t.paymentStatus,
				createdAt: t.createdAt
			}))
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Failed to fetch event teams', error: err.message });
	}
};


