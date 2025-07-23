// middleware/authParticipant.js

const jwt = require('jsonwebtoken');
const Participant = require('../models/Participant/Participant.js');

const authParticipant = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const participant = await Participant.findById(decoded.id);

    if (!participant) {
      return res.status(401).json({ success: false, message: 'Participant not found' });
    }

    req.participant = participant;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
};

module.exports = authParticipant;
