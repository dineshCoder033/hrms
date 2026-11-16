const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const payrollConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  basicPercent: { type: Number, default: 0.50 },
  hraPercent: { type: Number, default: 0.30 },
  pfRate: { type: Number, default: 0.12 }, // 12% of Basic
  taxRate: { type: Number, default: 0.10 }, // Flat 10% TDS placeholder
  weekendDays: { type: [Number], default: [0, 6] } // 0 = Sunday, 6 = Saturday
}, schemaOptions);

module.exports = mongoose.model('PayrollConfig', payrollConfigSchema);

