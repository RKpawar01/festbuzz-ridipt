const express = require('express');
const router = express.Router();
const { signup, login } = require('../../controllers/Organization/authController.js');

router.post('/signup', signup); // Only for Admins
router.post('/login', login);

module.exports = router;
