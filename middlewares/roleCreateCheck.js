// ✅ middlewares/roleCreateCheck.js
const rolePermissions = require('../config/rolePermissions');

module.exports = (req, res, next) => {
  const { role: newUserRole } = req.body;
  const creatorRole = req.user.role;

  const allowed = rolePermissions[creatorRole]?.canCreate || [];

  if (!allowed.includes(newUserRole)) {
    return res.status(403).json({ message: `You cannot create a user with role ${newUserRole}` });
  }

  next();
};
