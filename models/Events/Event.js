const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    fest: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creatorRole: { type: String, required: true },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventName: { type: String },
    eventType: { type: String, enum: ['Individual', 'Team'] },
    visibility: { type: String, enum: ['Open to all', 'Private'] },

    startDate: { type: Date },
    endDate: { type: Date },

    startTime: { type: String },
    endTime: { type: String },

    eventMode: { type: String, enum: ['online', 'offline'] },

    location: { type: String },
    venueName: { type: String },

    rulebook: { type: String },
    about: { type: String },
    pastPhotos: [String],
    coverPhoto: { type: String },
    poster: { type: String },

    rewardCash: { type: Number },
    rewardCoupon: { type: Number },
    rewardGoodies: { type: Number },

    ticketName: { type: String },
    eventFeeType: { type: String, enum: ['Paid', 'Free'] },
    price: { type: Number },

    ticketAvailableFrom: { type: Date },
    ticketAvailableTill: { type: Date },
    ticketAvailableTime: { type: String },
    ticketEndTime: { type: String },

    additionalQuestions: [
        {
            question: String,
            inputType: { type: String, enum: ['detail', 'text', 'number', 'all'] }
        }
    ],

    roleType: { type: String, enum: ['Judge', 'Organizer', 'Participant'] },
    name: { type: String },
    email: { type: String, match: /.+\@.+\..+/ },
    judgeName: { type: String },
    mobile: { type: String, match: /^[0-9]{10}$/ },
    aboutPerson: { type: String },
    photo: { type: String },

    selectionRounds: { type: Number },

    evaluationParameters: [
        {
            name: String,
            weightage: Number
        }
    ],

    status: {
        type: String,
        enum: ['Draft', 'Live', 'Past'],
        default: 'Draft'
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
