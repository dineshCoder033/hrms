const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const validate = require('../middlewares/validate');
const { punchSchema } = require('../validators/attendanceValidator');

router.get('/', attendanceController.getAttendance);
router.get('/monthly-report', attendanceController.getMonthlyReport);
router.post('/punch', validate(punchSchema), attendanceController.punch);

module.exports = router;
