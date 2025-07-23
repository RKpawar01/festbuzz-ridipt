// 📁 config/cloudinary.js
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 👇 Add this for participant profile photo uploads
const participantStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'festbuzz/participants',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }]
  })
});

module.exports = {
  cloudinary,
  storage, // existing fests storage
  participantStorage
};
