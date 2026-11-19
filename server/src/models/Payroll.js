const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const payrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  employeeName: { type: String, required: true },
  employeeRole: { type: String },
  department: { type: String },
  month: { type: String, required: true, index: true }, // Strictly 'YYYY-MM'
  workingDaysInMonth: { type: Number, default: 22 },
  grossSalary: { type: Number, required: true },
  basicPay: { type: Number, required: true },
  hra: { type: Number, required: true },
  specialAllowance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  allowance: { type: Number, default: 0 },
  isPfEligible: { type: Boolean, default: true },
  isEsiEligible: { type: Boolean, default: false },
  pfDeduction: { type: Number, default: 0 },
  esiDeduction: { type: Number, default: 0 },
  taxDeduction: { type: Number, default: 0 },
  lopDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  lopDeduction: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  baseSalary: { type: Number, required: true },
  netPayable: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Approved', 'Processing', 'Paid', 'Failed'],
    default: 'Draft',
    index: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['Draft', 'Approved', 'Pending', 'Processing', 'Paid', 'Failed'], 
    default: 'Draft' 
  },
  paymentDate: { type: String },
  paymentMethod: { type: String, default: 'Direct Deposit' },
  failureReason: { type: String },
  isLocked: { type: Boolean, default: false },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}, schemaOptions);

// Prevent duplicate payroll for the same employee in the same month
payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
