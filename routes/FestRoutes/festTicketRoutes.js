const express = require('express');
const router = express.Router();
const { createFestTicket } = require('../../controllers/FestController/festTicketController.js');
const protect = require('../../middlewares/authMiddleware.js');
const checkPermission = require('../../middlewares/checkPermission.js');

router.post('/create',protect,checkPermission("/api/festticket"), createFestTicket);

module.exports = router;
