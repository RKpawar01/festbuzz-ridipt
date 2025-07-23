// routes/participantRoutes.js

const express = require('express');
const router = express.Router();

const {
    registerParticipant,
    loginParticipant,
    completeParticipantProfile,
    getParticipantProfile
} = require('../../controllers/Participant/participantController.js');

const authParticipant = require('../../middlewares/authParticipant.js');
const participantUpload = require('../../middlewares/participantUpload.js');

// 🔐 Register with OTP (static for now)
router.post('/register', registerParticipant);

// 🔓 Login without OTP
router.post('/login', loginParticipant);

// 🔒 Profile completion (auth required)
router.put('/complete-profile', authParticipant, participantUpload.single('profilePhoto'), completeParticipantProfile);

// 🔒 Get own profile
router.get('/me', authParticipant, getParticipantProfile);

module.exports = router;
