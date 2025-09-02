// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { getEventsByFestId } = require('../../controllers/Participant/participanteventController.js');

// GET all events by festId
router.get('/fests/:festId/events', getEventsByFestId);

module.exports = router;
