const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const validate = require('../middlewares/validate');
const { processPayrollSchema } = require('../validators/payrollValidator');

router.get('/', payrollController.getPayrolls);
router.post('/generate', payrollController.generateMonthlyRun);
router.get('/:id/payslip', payrollController.getPayslip);
router.post('/pay-all', validate(processPayrollSchema), payrollController.processAll);

module.exports = router;
