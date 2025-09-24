const express = require('express');
const router = express.Router();
const { createFestTicket, getfestticket, updateticket, deleteticket } = require('../../controllers/FestController/festTicketController.js');
const protect = require('../../middlewares/authMiddleware.js');
const checkPermission = require('../../middlewares/checkPermission.js');

router.post('/create', protect, checkPermission("/api/festticket"), createFestTicket);

// Get all tickets for a fest
router.get('/:festId', protect, checkPermission("/api/festticket"), getfestticket);

// Update a specific ticket
router.patch('/:ticketId', protect, checkPermission("/api/festticket"), updateticket);

// Delete a specific ticket
router.delete('/:ticketId', protect, checkPermission("/api/festticket"), deleteticket);

module.exports = router;
