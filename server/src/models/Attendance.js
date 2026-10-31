const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  checkIn: { type: String }, // e.g. "09:05 AM"
  checkOut: { type: String }, // e.g. "05:45 PM"
  totalHours: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Present', 'Late', 'Absent', 'Half Day', 'On Leave'], 
    default: 'Present' 
  },
  workType: { 
    type: String, 
    enum: ['Office', 'Remote', 'Hybrid'], 
    default: 'Office' 
  }
}, schemaOptions);

// Compound index to ensure fast single-day lookup per employee
attendanceSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
