const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const payoutSchema = new mongoose.Schema({
  payrollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll', required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  provider: { type: String, enum: ['MockProvider', 'RazorpayX', 'Cashfree'], default: 'MockProvider' },
  providerRef: { type: String, index: true },
  status: { 
    type: String, 
    enum: ['Queued', 'Processing', 'Paid', 'Failed'], 
    default: 'Queued',
    index: true 
  },
  failureReason: { type: String },
  attempts: { type: Number, default: 1 },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  triggeredAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, schemaOptions);

module.exports = mongoose.model('Payout', payoutSchema);

