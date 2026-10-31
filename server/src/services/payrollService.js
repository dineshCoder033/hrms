const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('./dataService');
const ApiError = require('../errors/ApiError');

/**
 * Standard Salary Breakdown Engine
 * Basic Pay = 50%
 * HRA = 30%
 * Special Allowance = 20%
 * PF Deduction = 12% of Basic
 * TDS / Tax = 10% of Gross
 * LOP = (Gross / 22) * unpaidDays
 */
const calculateSalaryBreakdown = ({
  annualSalary,
  unpaidDays = 0,
  bonus = 0,
  extraAllowance = 0,
  workingDaysInMonth = 22
}) => {
  const grossMonthly = Math.round(annualSalary / 12);
  const basicPay = Math.round(grossMonthly * 0.50);
  const hra = Math.round(grossMonthly * 0.30);
  const specialAllowance = Math.max(0, grossMonthly - (basicPay + hra));

  const pfDeduction = Math.round(basicPay * 0.12);
  const taxDeduction = Math.round(grossMonthly * 0.10);

  const perDaySalary = workingDaysInMonth > 0 ? (grossMonthly / workingDaysInMonth) : 0;
  const lopDeduction = Math.round(unpaidDays * perDaySalary);

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
    lopDays: unpaidDays,
    lopDeduction,
    deductions: totalDeductions,
    netPayable
  };
};

const getAllPayrolls = async (query = {}) => {
  if (getIsConnected()) {
    const filter = {};
    if (query.month) filter.month = query.month;
    if (query.status) filter.paymentStatus = query.status;
    if (query.employeeId) filter.employeeId = query.employeeId;
    return await Payroll.find(filter).sort({ createdAt: -1 });
  }

  let list = memoryStore.payrolls;
  if (query.month) list = list.filter(p => p.month === query.month);
  if (query.status) list = list.filter(p => p.paymentStatus === query.status);
  return list;
};

const generateMonthlyPayrollRun = async (monthName = 'March 2026') => {
  if (getIsConnected()) {
    const employees = await Employee.find({ status: { $ne: 'Terminated' } });
    const results = [];

    for (const emp of employees) {
      const empId = emp._id.toString();

      // Check if already generated and locked
      const existing = await Payroll.findOne({ employeeId: empId, month: monthName });
      if (existing && existing.isLocked) {
        results.push(existing);
        continue;
      }

      // Check unpaid leaves in that month
      const unpaidLeaves = await Leave.find({
        employeeId: empId,
        status: 'Approved',
        leaveType: 'Unpaid'
      });
      const lopDays = unpaidLeaves.reduce((sum, l) => sum + (l.daysCount || 0), 0);

      const breakdown = calculateSalaryBreakdown({
        annualSalary: emp.salary || 65000,
        unpaidDays: lopDays,
        bonus: existing?.bonus || 0,
        extraAllowance: existing?.allowance || 0
      });

      const payrollData = {
        employeeId: empId,
        employeeName: emp.name,
        employeeRole: emp.role,
        department: emp.department,
        month: monthName,
        ...breakdown,
        paymentStatus: existing?.paymentStatus || 'Pending',
        paymentDate: existing?.paymentDate || null,
        paymentMethod: existing?.paymentMethod || 'Direct Deposit',
        isLocked: false
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
  }

  // Dev fallback
  return memoryStore.payrolls;
};

const processAllPayrolls = async (monthName) => {
  const today = new Date().toISOString().split('T')[0];

  if (getIsConnected()) {
    const filter = { paymentStatus: { $ne: 'Paid' } };
    if (monthName) filter.month = monthName;

    await Payroll.updateMany(filter, {
      paymentStatus: 'Paid',
      paymentDate: today,
      isLocked: true
    });

    return await Payroll.find().sort({ createdAt: -1 });
  }

  memoryStore.payrolls.forEach(p => {
    if (!monthName || p.month === monthName) {
      p.paymentStatus = 'Paid';
      p.paymentDate = today;
      p.isLocked = true;
    }
  });
  return memoryStore.payrolls;
};

const getPayslipById = async (id) => {
  let payroll = null;
  if (getIsConnected()) {
    payroll = await Payroll.findById(id);
  } else {
    payroll = memoryStore.payrolls.find(p => p.id === id || p._id?.toString() === id);
  }

  if (!payroll) {
    throw ApiError.notFound('Payroll record not found');
  }

  // Structure printable Payslip Metadata
  return {
    payslipNumber: `PAY-${payroll.month.replace(/\s+/g, '')}-${payroll.employeeId?.slice(-4) || '001'}`,
    company: {
      name: 'TaskOrbit Technologies Inc.',
      address: '100 Innovation Way, Suite 400, San Francisco, CA',
      taxId: 'US-EIN-948271049'
    },
    payroll
  };
};

module.exports = {
  calculateSalaryBreakdown,
  getAllPayrolls,
  generateMonthlyPayrollRun,
  processAllPayrolls,
  getPayslipById
};
