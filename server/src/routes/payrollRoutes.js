const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// View payrolls (Admin/HR all, Employee own)
router.get('/', authorize('Admin', 'HR', 'Employee'), payrollController.getPayrolls);

// Company & Payroll Config Settings
router.get('/settings', authorize('Admin', 'HR'), payrollController.getSettings);
router.patch('/settings', authorize('Admin'), payrollController.updateSettings);

// 1. Generate Draft Payroll Run (HR / Admin)
router.post('/generate', authorize('Admin', 'HR'), payrollController.generateMonthlyRun);

// 2. Edit Draft Payroll (Bonus / Allowance) before approval
router.patch('/:id', authorize('Admin', 'HR'), payrollController.updateDraft);

// 3. Approve & Lock Payroll Run (Admin ONLY + Maker-Checker enforced)
router.post('/approve', authorize('Admin'), payrollController.approveRun);

// 4. Execute Direct Salary Payouts (Admin ONLY + Atomic claim + Idempotency)
router.post('/payout', authorize('Admin'), payrollController.executePayouts);

// Payslip download / view
router.get('/:id/payslip', authorize('Admin', 'HR', 'Employee'), payrollController.getPayslip);

module.exports = router;
