const rolePermissions = require('../config/rolePermissions.js');

module.exports = (routeKey) => {
  return (req, res, next) => {
    const role = req.user.role;
    const method = req.method;

    const permissions = rolePermissions[role];

    if (!permissions || !permissions.routes[routeKey]) {
      return res.status(403).json({ message: 'Access denied: No permissions defined.' });
    }

    if (!permissions.routes[routeKey].includes(method)) {
      return res.status(403).json({ message: 'Access denied: Method not allowed.' });
    }

    next();
  };
};
