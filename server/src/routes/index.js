const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const employeeRoutes = require('./employeeRoutes');
const taskRoutes = require('./taskRoutes');
const leadRoutes = require('./leadRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const leaveRoutes = require('./leaveRoutes');
const payrollRoutes = require('./payrollRoutes');
const recruitmentRoutes = require('./recruitmentRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/tasks', taskRoutes);
router.use('/leads', leadRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/', statsRoutes);

module.exports = router;
