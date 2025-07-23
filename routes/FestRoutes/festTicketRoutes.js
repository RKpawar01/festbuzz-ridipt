const express = require('express');
const router = express.Router();
const { createFestTicket } = require('../../controllers/FestController/festTicketController.js');

router.post('/create', createFestTicket);

module.exports = router;
