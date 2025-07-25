const express = require('express');
const router = express.Router();
const protect = require('../../middlewares/authMiddleware.js');
const checkPermission = require('../../middlewares/checkPermission.js');
const roleCreateCheck= require('../../middlewares/roleCreateCheck.js');
const { createUser } = require('../../controllers/Organization/userController.js');


router.post(
  '/user',
  protect,
  checkPermission('/api/user'),
  roleCreateCheck,
  createUser
);

module.exports = router;
