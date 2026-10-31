const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const payrollSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  employeeRole: { type: String },
  department: { type: String },
  month: { type: String, required: true, index: true }, // e.g. "March 2026" or "2026-03"
  grossSalary: { type: Number, required: true },
  basicPay: { type: Number, required: true },
  hra: { type: Number, required: true },
  specialAllowance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  allowance: { type: Number, default: 0 },
  pfDeduction: { type: Number, default: 0 },
  taxDeduction: { type: Number, default: 0 },
  lopDays: { type: Number, default: 0 },
  lopDeduction: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  baseSalary: { type: Number, required: true },
  netPayable: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Processing'], 
    default: 'Pending' 
  },
  paymentDate: { type: String },
  paymentMethod: { type: String, default: 'Direct Deposit' },
  isLocked: { type: Boolean, default: false }
}, schemaOptions);

// Prevent duplicate payroll for the same employee in the same month
payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
