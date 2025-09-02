// routes/festRoutes.js
const express = require('express');
const router = express.Router();
const { getAllFests } = require('../../controllers/Participant/participantfestController.js');

// GET all fests
router.get('/fests', getAllFests);

module.exports = router;
