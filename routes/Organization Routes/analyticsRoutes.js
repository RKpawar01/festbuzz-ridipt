const express = require('express');
const router = express.Router();
const protect = require('../../middlewares/authMiddleware.js');
const { getFestBookingSummary, getFestParticipants, getEventBookingSummary, getEventParticipants, getEventTeams, getOrganizationSummary } = require('../../controllers/Organization/analyticsController.js');
const { scanAndCheckIn } = require('../../controllers/Organization/checkinController.js');

// All routes require organization auth
router.use(protect);

// Summary across all fests for this organization
router.get('/fests/summary', getFestBookingSummary);

// Participants of a specific fest
router.get('/fests/:festId/participants', getFestParticipants);

// Summary across all events for this organization
router.get('/events/summary', getEventBookingSummary);

// Individual participants of a specific event
router.get('/events/:eventId/participants', getEventParticipants);

// Teams of a specific event
router.get('/events/:eventId/teams', getEventTeams);

// Consolidated organization summary (fests + events)
router.get('/summary', getOrganizationSummary);

// Check-in scanning endpoint for organizers
router.post('/checkin/scan', scanAndCheckIn);

module.exports = router;


