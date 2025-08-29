const express = require('express');
const router = express.Router();
const protect = require('../../middlewares/authMiddleware.js');
const checkPermission = require('../../middlewares/checkPermission.js');
const roleCreateCheck = require('../../middlewares/roleCreateCheck.js');
const { createUser, getProfile, getAllUsersOfOrganization, updateUser, deleteUser } = require('../../controllers/Organization/userController.js');

router.get('/getprofile', protect, getProfile)
router.get('/getallusers', protect, getAllUsersOfOrganization)
router.post(
  '/user',
  protect,
  checkPermission('/api/user'),
  roleCreateCheck,
  createUser
);
router.put('/:id', protect, updateUser); // Update user by ID
router.delete('/:id', protect, deleteUser); // Delete user by ID

module.exports = router;
