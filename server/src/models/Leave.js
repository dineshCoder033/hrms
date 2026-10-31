const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  employeeAvatar: { type: String },
  leaveType: { type: String, enum: ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Maternity/Paternity', 'Unpaid'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  daysCount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedAt: { type: Date, default: Date.now },
  reviewedBy: { type: String }
}, schemaOptions);

module.exports = mongoose.model('Leave', leaveSchema);
