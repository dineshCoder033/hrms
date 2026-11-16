const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// View leaves: Employee sees self, Manager sees team, Admin/HR see all
router.get('/', leaveController.getLeaves);

// View leave balance
router.get('/balance', leaveController.getBalance);

// Apply for leave: Any authenticated employee
router.post('/', authorize('Employee', 'Manager', 'HR', 'Admin'), leaveController.createLeave);

// Approve / Reject leave: ADMIN ONLY (as requested)
router.patch('/:id/status', authorize('Admin'), leaveController.updateLeaveStatus);

module.exports = router;
