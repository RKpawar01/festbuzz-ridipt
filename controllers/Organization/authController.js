const User = require('../../models/Organization/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            adminId: user.role === 'Admin' ? user._id : user.adminId
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            mobile,
            role: 'Admin',
            otp: '123456' // Add this explicitly to keep it clear

        });

        res.status(201).json({
            message: 'Admin registered successfully',
            token: generateToken(user)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        res.json({
            message: 'Login successful',
            token: generateToken(user)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
