const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// List attendance (Scoped by role: Employee sees self, Manager sees team, Admin/HR sees all)
router.get('/', attendanceController.getAttendance);

// Monthly report
router.get('/report', attendanceController.getMonthlyReport);

// Live nearest office distance calculation helper
router.get('/nearest-office', attendanceController.getNearestOffice);

// Punch IN/OUT with Geofence & Location validation
router.post('/punch', attendanceController.punch);

// Review Outside Geofence Punches: ADMIN ONLY (as requested)
router.patch('/:id/review', authorize('Admin'), attendanceController.reviewPunch);

module.exports = router;
