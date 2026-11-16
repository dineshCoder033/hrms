const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimiter');

// POST /auth/login with strict rate limiter (10 attempts / 15 min / IP)
router.post('/login', loginLimiter, authController.login);

// POST /auth/set-password (Activation of employee account via invite token)
router.post('/set-password', authController.setPassword);

// Refresh access token using HTTP-only cookie
router.post('/refresh', authController.refreshAccessToken);

// Current user profile
router.get('/me', authenticate, authController.me);

// Change password (self-service for any authenticated user)
router.post('/change-password', authenticate, authController.changePassword);

// Logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;
