const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// System Stats & Schedule
router.get('/stats', authorize('Admin', 'HR'), statsController.getStats);
router.get('/schedule', statsController.getSchedule);
router.get('/summary', statsController.getSummary);
router.patch('/summary/goal', authorize('Admin', 'HR'), statsController.updateGoal);

// OKR Goals
router.get('/goals', statsController.getGoals);
router.post('/goals', authorize('Admin', 'HR', 'Manager'), statsController.createGoal);
router.patch('/goals/:id', authorize('Admin', 'HR', 'Manager'), statsController.updateGoalProgress);

// HR Analytics
router.get('/analytics', authorize('Admin', 'HR'), statsController.getAnalytics);

// CSV Data Exports (Admin and HR only)
router.get('/export/employees', authorize('Admin', 'HR'), statsController.exportEmployees);
router.get('/export/attendance', authorize('Admin', 'HR'), statsController.exportAttendance);

module.exports = router;
