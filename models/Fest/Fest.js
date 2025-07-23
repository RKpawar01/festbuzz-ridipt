// models/Fest.js
const mongoose = require('mongoose');

const festSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  festName: { type: String, required: true },
  festType: { type: String, required: true },
  visibility: {
    type: String,
    enum: ['Open to all', 'Private'],
    default: 'Open to all'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  websiteUrl: {
    type: String,
    validate: {
      validator: (v) => /^(http|https):\/\/[^ "]+$/.test(v),
      message: 'Invalid website URL'
    }
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline'],
    required: true
  },
  aboutFest: { type: String, required: true },
  eligibilityCriteria: { type: String, required: true },
  venue: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  collegeName: { type: String, required: true },
  instagramUrl: {
    type: String,
    validate: {
      validator: (v) => /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._%-]+\/?$/.test(v),
      message: 'Invalid Instagram URL'
    }
  },
  linkedinUrl: {
    type: String,
    validate: {
      validator: (v) => /^https:\/\/(www\.)?linkedin\.com\/.+$/.test(v),
      message: 'Invalid LinkedIn URL'
    }
  },

  sponsors: [
    {
      sponsorName: { type: String },
      sponsorImage: { type: String },
      sponsorTitle: { type: String }
    }
  ],

  youtubeAftermovie: {
    type: String,
    validate: {
      validator: (v) => /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v),
      message: 'Invalid YouTube link'
    }
  },

  logo: { type: String, required: true },
  photos: [{ type: String }],

  festStatus: {
    type: String,
    enum: ['Draft', 'Live', 'Past'],
    default: 'Draft'
  }

}, { timestamps: true });

module.exports = mongoose.model('Fest', festSchema);
