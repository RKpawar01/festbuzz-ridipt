// 📁 models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String, required: true},
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'FestivalHead', 'EventManager', 'EventCoordinator', 'EventVolunteer'],
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () {
      return this.role !== 'Admin';
    }
  },
  otp: { type: String, default: '123456' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
