const User = require('../../models/Organization/User.js');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      role,
      adminId: req.user.role === 'Admin' ? req.user._id : req.user.adminId
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // `req.user` is set in the `protect` middleware
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsersOfOrganization = async (req, res) => {
  try {
    const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

    const users = await User.find({ adminId }).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role, password } = req.body;

    const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

    const user = await User.findOne({ _id: id, adminId });
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const adminId = req.user.role === 'Admin' ? req.user._id : req.user.adminId;

    const user = await User.findOneAndDelete({ _id: id, adminId });
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
