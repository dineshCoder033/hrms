const Payroll = require('../models/Payroll');
const Payout = require('../models/Payout');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');
const PayrollConfig = require('../models/PayrollConfig');
const CompanySettings = require('../models/CompanySettings');
const { decrypt } = require('../utils/crypto');
const { getPayoutProvider } = require('./payout/provider');
const ApiError = require('../errors/ApiError');
const { logAudit } = require('./auditService');
const { notifyByEmployeeId } = require('./notificationService');

/**
 * Compute working days in a specific YYYY-MM month excluding weekends and DB holidays
 */
const getMonthWorkingDays = async (monthStr, weekendDays = [0, 6]) => {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDateStr = `${monthStr}-01`;
  const endDateStr = `${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

  const holidays = await Holiday.find({
    date: { $gte: startDateStr, $lte: endDateStr }
  }).distinct('date');

  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = d.getUTCDay();
    const isoDate = d.toISOString().split('T')[0];

    if (!weekendDays.includes(dayOfWeek) && !holidays.includes(isoDate)) {
      workingDays++;
    }
  }
  return { workingDays, startDateStr, endDateStr, holidays };
};

/**
 * Count how many days of a leave fall inside the target month
 */
const countLeaveDaysInMonth = (leave, monthStartStr, monthEndStr, holidays = [], weekendDays = [0, 6]) => {
  const start = new Date(leave.startDate > monthStartStr ? leave.startDate : monthStartStr);
  const end = new Date(leave.endDate < monthEndStr ? leave.endDate : monthEndStr);

  if (start > end) return 0;

  let days = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const iso = current.toISOString().split('T')[0];
    if (!weekendDays.includes(dayOfWeek) && !holidays.includes(iso)) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
};

/**
 * Standard Salary Breakdown Engine (Configured via PayrollConfig)
 */
const calculateSalaryBreakdown = ({
  annualSalary,
  lopDays = 0,
  bonus = 0,
  extraAllowance = 0,
  workingDaysInMonth = 22,
  config = { basicPercent: 0.50, hraPercent: 0.30, pfRate: 0.12, taxRate: 0.10 }
}) => {
  const grossMonthly = Math.round(annualSalary / 12);
  const basicPay = Math.round(grossMonthly * config.basicPercent);
  const hra = Math.round(grossMonthly * config.hraPercent);
  const specialAllowance = Math.max(0, grossMonthly - (basicPay + hra));

  const pfDeduction = Math.round(basicPay * config.pfRate);
  const taxDeduction = Math.round(grossMonthly * config.taxRate);

  const perDaySalary = workingDaysInMonth > 0 ? (grossMonthly / workingDaysInMonth) : 0;
  const lopDeduction = Math.round(lopDays * perDaySalary);

  const totalDeductions = pfDeduction + taxDeduction + lopDeduction;
  const netPayable = Math.max(0, grossMonthly - totalDeductions + bonus + extraAllowance);

  return {
    grossSalary: grossMonthly,
    baseSalary: grossMonthly,
    basicPay,
    hra,
    specialAllowance,
    bonus,
    allowance: extraAllowance,
    pfDeduction,
    taxDeduction,
    tax: taxDeduction,
    lopDays,
    lopDeduction,
    deductions: totalDeductions,
    netPayable
  };
};

const getAllPayrolls = async (filter = {}) => {
  return await Payroll.find(filter).sort({ month: -1, createdAt: -1 });
};

/**
 * 5.2 Generate Monthly Payroll Run (Draft state)
 */
const generateMonthlyPayrollRun = async (monthStr, user) => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    throw ApiError.badRequest('Month is required in YYYY-MM format (e.g. 2026-11).');
  }

  let config = await PayrollConfig.findOne({ key: 'default' });
  if (!config) {
    config = await PayrollConfig.create({ key: 'default' });
  }

  const { workingDays, startDateStr, endDateStr, holidays } = await getMonthWorkingDays(
    monthStr,
    config.weekendDays
  );

  // Exclude Terminated and Resigned staff
  const employees = await Employee.find({
    status: { $nin: ['Terminated', 'Resigned'] }
  });

  const results = [];

  for (const emp of employees) {
    const existing = await Payroll.findOne({ employeeId: emp._id, month: monthStr });
    if (existing && existing.isLocked) {
      results.push(existing);
      continue;
    }

    // 5.1 Fix: Only count unpaid leaves intersecting THIS month
    const unpaidLeaves = await Leave.find({
      employeeId: emp._id,
      status: 'Approved',
      leaveType: 'Unpaid',
      startDate: { $lte: endDateStr },
      endDate: { $gte: startDateStr }
    });

    const unpaidLeaveDays = unpaidLeaves.reduce(
      (sum, l) => sum + countLeaveDaysInMonth(l, startDateStr, endDateStr, holidays, config.weekendDays),
      0
    );

    // Count Absent attendance records in THIS month
    const absentDays = await Attendance.countDocuments({
      employeeId: emp._id,
      date: { $gte: startDateStr, $lte: endDateStr },
      status: 'Absent'
    });

    const totalLopDays = unpaidLeaveDays + absentDays;

    const breakdown = calculateSalaryBreakdown({
      annualSalary: emp.annualCtc || emp.salary || 65000,
      lopDays: totalLopDays,
      bonus: existing?.bonus || 0,
      extraAllowance: existing?.allowance || 0,
      workingDaysInMonth: workingDays,
      config
    });

    const payrollData = {
      employeeId: emp._id,
      employeeName: emp.name,
      employeeRole: emp.designation || emp.role,
      department: emp.department,
      month: monthStr,
      workingDaysInMonth: workingDays,
      absentDays,
      ...breakdown,
      status: 'Draft',
      paymentStatus: 'Draft',
      isLocked: false,
      generatedBy: user.id
    };

    let record;
    if (existing) {
      Object.assign(existing, payrollData);
      record = await existing.save();
    } else {
      record = await Payroll.create(payrollData);
    }
    results.push(record);
  }

  return results;
};

/**
 * Edit Draft Payroll (Bonus / Allowance adjustment before locking)
 */
const updateDraftPayroll = async (id, { bonus, allowance }) => {
  const payroll = await Payroll.findById(id);
  if (!payroll) throw ApiError.notFound('Payroll record not found');

  if (payroll.isLocked || payroll.status !== 'Draft') {
    throw ApiError.forbidden('Cannot modify payroll after it has been approved and locked.');
  }

  const newBonus = bonus !== undefined ? Number(bonus) : payroll.bonus;
  const newAllowance = allowance !== undefined ? Number(allowance) : payroll.allowance;

  payroll.bonus = newBonus;
  payroll.allowance = newAllowance;
  payroll.netPayable = Math.max(0, payroll.grossSalary - payroll.deductions + newBonus + newAllowance);

  await payroll.save();
  return payroll;
};

/**
 * 5.2 Approve Payroll Run (Admin Only + Maker-Checker Guard)
 */
const approvePayrollRun = async (monthStr, user) => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    throw ApiError.badRequest('Month is required in YYYY-MM format.');
  }

  const drafts = await Payroll.find({ month: monthStr, status: 'Draft' });
  if (drafts.length === 0) {
    throw ApiError.badRequest(`No Draft payroll records found for ${monthStr}.`);
  }

  // Maker-checker verification: generator cannot approve their own payroll run
  const selfGenerated = drafts.some(d => d.generatedBy && d.generatedBy.toString() === user.id);
  if (selfGenerated) {
    throw ApiError.forbidden('Maker-Checker Violation: You cannot approve a payroll run that you generated.');
  }

  await Payroll.updateMany(
    { month: monthStr, status: 'Draft' },
    {
      status: 'Approved',
      paymentStatus: 'Approved',
      isLocked: true,
      approvedBy: user.id,
      approvedAt: new Date()
    }
  );

  return await Payroll.find({ month: monthStr }).sort({ employeeName: 1 });
};

/**
 * 5.4 Direct Salary Payout Execution (Atomic Claim + Idempotency + Encryption)
 */
const executePayouts = async (monthStr, user, providerName = 'MockProvider') => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    throw ApiError.badRequest('Month is required in YYYY-MM format.');
  }

  const approvedList = await Payroll.find({ month: monthStr, status: 'Approved' });
  if (approvedList.length === 0) {
    throw ApiError.badRequest(`No Approved payroll records ready for payout in ${monthStr}.`);
  }

  let company = await CompanySettings.findOne({ key: 'default' });
  const currency = company?.currency || 'INR';
  const provider = getPayoutProvider(providerName);
  const today = new Date().toISOString().split('T')[0];

  const payoutResults = [];

  for (const item of approvedList) {
    // 1. Atomic claim to prevent concurrent double-payments
    const claimed = await Payroll.findOneAndUpdate(
      { _id: item._id, status: 'Approved' },
      { status: 'Processing', paymentStatus: 'Processing' },
      { new: true }
    );
    if (!claimed) continue;

    const idempotencyKey = claimed._id.toString();

    try {
      const emp = await Employee.findById(claimed.employeeId);
      const decryptedAccount = emp?.bank?.accountNumberEnc
        ? decrypt(emp.bank.accountNumberEnc)
        : null;

      // Call abstracted payment provider
      const result = await provider.createPayout({
        idempotencyKey,
        amount: claimed.netPayable,
        currency,
        beneficiary: {
          name: emp?.bank?.holderName || claimed.employeeName,
          accountNumber: decryptedAccount,
          ifsc: emp?.bank?.ifsc || 'DEFAULT001'
        },
        narration: `Salary ${monthStr} - ${claimed.employeeName}`
      });

      const payoutDoc = await Payout.create({
        payrollId: claimed._id,
        employeeId: claimed.employeeId,
        amount: claimed.netPayable,
        currency,
        provider: result.provider,
        providerRef: result.providerRef,
        status: result.status,
        failureReason: result.failureReason,
        idempotencyKey,
        triggeredBy: user.id,
        triggeredAt: new Date(),
        completedAt: result.status === 'Paid' ? new Date() : undefined
      });

      // Update Payroll final status based on provider response
      claimed.status = result.status;
      claimed.paymentStatus = result.status;
      if (result.status === 'Paid') {
        claimed.paymentDate = today;
        await notifyByEmployeeId({
          employeeId: claimed.employeeId,
          title: `Salary Paid (${monthStr})`,
          message: `Your salary of ${currency} ${claimed.netPayable.toLocaleString()} for ${monthStr} has been credited.`,
          type: 'payroll',
          link: '/my-payslips'
        });
      } else if (result.status === 'Failed') {
        claimed.failureReason = result.failureReason;
      }
      await claimed.save();

      await logAudit({
        user,
        action: `PAYOUT_${result.status.toUpperCase()}`,
        entityType: 'Payroll',
        entityId: claimed._id,
        details: { month: monthStr, employeeName: claimed.employeeName, netPayable: claimed.netPayable, provider: result.provider }
      });

      payoutResults.push(payoutDoc);
    } catch (err) {
      claimed.status = 'Failed';
      claimed.paymentStatus = 'Failed';
      claimed.failureReason = err.message;
      await claimed.save();
    }
  }

  return payoutResults;
};

/**
 * 5.4 Idempotent Webhook Processor
 */
const processPayoutWebhook = async ({ providerRef, status, failureReason }) => {
  const payout = await Payout.findOne({ providerRef });
  if (!payout) {
    throw ApiError.notFound('Payout reference not found');
  }

  // Idempotent guard: already finalized
  if (payout.status === 'Paid' && status === 'Paid') {
    return payout;
  }

  payout.status = status;
  if (failureReason) payout.failureReason = failureReason;
  if (status === 'Paid') payout.completedAt = new Date();
  await payout.save();

  const payrollUpdate = {
    status,
    paymentStatus: status
  };
  if (status === 'Paid') {
    payrollUpdate.paymentDate = new Date().toISOString().split('T')[0];
  } else if (failureReason) {
    payrollUpdate.failureReason = failureReason;
  }

  await Payroll.findByIdAndUpdate(payout.payrollId, payrollUpdate);
  return payout;
};

/**
 * 5.1 Payslip using CompanySettings
 */
const getPayslipById = async (id, user) => {
  const payroll = await Payroll.findById(id);

  if (!payroll) {
    throw ApiError.notFound('Payroll record not found');
  }

  if (user.role === 'Employee' && payroll.employeeId.toString() !== user.employeeId) {
    throw ApiError.forbidden('You are not authorized to view another employee’s payslip.');
  }

  let company = await CompanySettings.findOne({ key: 'default' });
  if (!company) {
    company = await CompanySettings.create({ key: 'default' });
  }

  return {
    payslipNumber: `PAY-${payroll.month.replace(/-/g, '')}-${payroll.employeeId.toString().slice(-4)}`,
    company: {
      name: company.name,
      address: company.address,
      taxId: company.taxId,
      currency: company.currency
    },
    payroll
  };
};

module.exports = {
  calculateSalaryBreakdown,
  getMonthWorkingDays,
  getAllPayrolls,
  generateMonthlyPayrollRun,
  updateDraftPayroll,
  approvePayrollRun,
  executePayouts,
  processPayoutWebhook,
  getPayslipById
};
