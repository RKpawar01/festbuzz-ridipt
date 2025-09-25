// controllers/participantController.js

const Participant = require('../../models/Participant/Participant.js');
const ParticipantOTP = require('../../models/Participant/ParticipantOTP.js');
const generateToken = require('../../utils/generateToken.js');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/email.js');

// Step 1: Register - validate and send OTP
exports.registerParticipant = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await Participant.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Participant already registered with this email' });
    }

    // const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const otp = "123456"; // 🔹 Hardcoded for development

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await ParticipantOTP.findOneAndUpdate(
      { email },
      { email, otp, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const html = `<p>Your FestBuzz verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`;
    // await sendEmail(email, 'Verify your email - FestBuzz', html);

    return res.status(200).json({ success: true, message: 'OTP sent to email. Please verify to complete signup.' });
  } catch (error) {
    console.error('Register (send OTP) Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
};

// Step 2: Verify OTP and create account
exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, password, confirmPassword, otp } = req.body;

    if (!email || !password || !confirmPassword || !otp) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await Participant.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Participant already registered with this email' });
    }

    const otpDoc = await ParticipantOTP.findOne({ email });
    if (!otpDoc) return res.status(400).json({ success: false, message: 'OTP not requested' });
    if (otpDoc.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });
    if (otpDoc.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    const newParticipant = await Participant.create({ email, password, otp: 'verified' });
    await ParticipantOTP.deleteOne({ _id: otpDoc._id });

    return res.status(201).json({
      success: true,
      message: 'Participant registered successfully',
      token: generateToken(newParticipant._id)
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// @desc Login participant
exports.loginParticipant = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const participant = await Participant.findOne({ email });
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const isMatch = await bcrypt.compare(password, participant.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(participant._id)
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// Update profile after signup
exports.completeParticipantProfile = async (req, res) => {
  try {
    const participantId = req.participant._id;
    const {
      name,
      contactNumber,
      dob,
      gender,
      state,
      city,
      college,
      profilePhoto // ✅ directly coming from S3 as URL
    } = req.body;

    if (!name || !contactNumber || !dob || !gender || !state || !city || !college || !profilePhoto) {
      return res.status(400).json({ success: false, message: 'All profile fields are mandatory' });
    }

    const updated = await Participant.findByIdAndUpdate(
      participantId,
      {
        name,
        contactNumber,
        dob,
        gender,
        state,
        city,
        college,
        profilePhoto, // ✅ save S3 URL in DB
        profileCompleted: true
      },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password -otp');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      participant: updated
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
};



// @desc Get own profile
exports.getParticipantProfile = async (req, res) => {
  try {
    const participant = req.participant;
    return res.status(200).json({ success: true, data: participant });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};
