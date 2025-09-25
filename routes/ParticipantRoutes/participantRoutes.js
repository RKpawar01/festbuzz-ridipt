// routes/participantRoutes.js

const express = require('express');
const router = express.Router();

const {
    registerParticipant,
    verifySignupOTP,
    loginParticipant,
    completeParticipantProfile,
    getParticipantProfile
} = require('../../controllers/Participant/participantController.js');

const authParticipant = require('../../middlewares/authParticipant.js');

// 🔐 Register - validate & send OTP, then verify
router.post('/register', registerParticipant);
router.post('/register/verify', verifySignupOTP);

// 🔓 Login without OTP
router.post('/login', loginParticipant);

// 🔒 Profile completion (auth required)
router.put('/complete-profile', authParticipant, completeParticipantProfile);

// 🔒 Get own profile
router.get('/me', authParticipant, getParticipantProfile);

module.exports = router;
