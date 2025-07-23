// 📁 middleware/participantUpload.js
const multer = require('multer');
const { participantStorage } = require('../config/cloudinary');

const participantUpload = multer({ storage: participantStorage });

module.exports = participantUpload;
