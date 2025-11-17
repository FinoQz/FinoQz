const express = require('express');
const { login, verifyLoginOtp } = require('../controllers/userLoginController');
const { getUserPanel } = require('../controllers/userPanelController');
const validateLogin = require('../middlewares/validateLogin');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Step 1: Initiate login
router.post('/initiate', validateLogin, login);

// Step 2: Verify OTP
router.post('/verify', verifyLoginOtp);

// Step 3: User Panel (Protected)
router.get('/user_dash', authMiddleware(), getUserPanel);

module.exports = router;
