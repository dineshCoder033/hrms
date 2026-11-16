const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

// All user routes require authentication
router.use(authenticate);

// List users (Admin/HR only)
router.get('/', authorize('Admin', 'HR'), userController.getUsers);

// Create user (Admin/HR only, HR cannot create Admin)
router.post('/', authorize('Admin', 'HR'), userController.createUser);

module.exports = router;

