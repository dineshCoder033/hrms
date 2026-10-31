const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// System Stats & Schedule
router.get('/stats', statsController.getStats);
router.get('/schedule', statsController.getSchedule);
router.get('/summary', statsController.getSummary);
router.patch('/summary/goal', statsController.updateGoal);

// OKR Goals
router.get('/goals', statsController.getGoals);
router.post('/goals', statsController.createGoal);
router.patch('/goals/:id', statsController.updateGoalProgress);

// HR Analytics
router.get('/analytics', statsController.getAnalytics);

// CSV Data Exports
router.get('/export/employees', statsController.exportEmployees);
router.get('/export/attendance', statsController.exportAttendance);

module.exports = router;
