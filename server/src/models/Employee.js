const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  avatar: { type: String },
  salary: { type: Number, default: 65000 },
  status: { type: String, enum: ['Active', 'On Leave', 'Probation', 'Remote'], default: 'Active' },
  joinDate: { type: Date, default: Date.now },
  location: { type: String, default: 'New York, USA' },
  performanceScore: { type: Number, default: 92 },
  skills: [{ type: String }],
  reportsTo: { type: String, default: 'CEO' }
}, schemaOptions);

module.exports = mongoose.model('Employee', employeeSchema);
