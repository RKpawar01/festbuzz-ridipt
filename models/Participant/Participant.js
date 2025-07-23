const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const participantSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^()_\-])[A-Za-z\d@$!%*?#&^()_\-]{8,}$/,
            'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'
        ]
    },
    otp: {
        type: String,
        required: true
    },

    // 📌 Extended Fields (Required AFTER Signup)
    name: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        match: [/^\d{10}$/, 'Contact number must be a valid 10-digit number']
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    college: {
        type: String
    },
    profilePhoto: {
        type: String // Store image URL (e.g., from S3 or public upload folder)
    },
    profileCompleted: {
        type: Boolean,
        default: false
    }
}, {
        timestamps: true
    });

// 🔐 Hash password before saving
participantSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Participant', participantSchema);
