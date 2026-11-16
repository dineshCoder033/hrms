const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const employeeRoutes = require('./employeeRoutes');
const meetingRoutes = require('./meetingRoutes');
const taskRoutes = require('./taskRoutes');
const leadRoutes = require('./leadRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const locationRoutes = require('./locationRoutes');
const leaveRoutes = require('./leaveRoutes');
const holidayRoutes = require('./holidayRoutes');
const payrollRoutes = require('./payrollRoutes');
const recruitmentRoutes = require('./recruitmentRoutes');
const statsRoutes = require('./statsRoutes');
const auditRoutes = require('./auditRoutes');
const notificationRoutes = require('./notificationRoutes');
const settingsRoutes = require('./settingsRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/meetings', meetingRoutes);
router.use('/tasks', taskRoutes);
router.use('/leads', leadRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/locations', locationRoutes);
router.use('/leaves', leaveRoutes);
router.use('/holidays', holidayRoutes);
router.use('/payroll', payrollRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/', statsRoutes);

module.exports = router;
