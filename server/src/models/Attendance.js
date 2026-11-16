const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const locationSubSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number },
  accuracy: { type: Number },
  distanceMeters: { type: Number },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'OfficeLocation' }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true, index: true }, // 'YYYY-MM-DD' in COMPANY_TZ
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  checkIn: { type: String }, // formatted e.g. "09:05 AM"
  checkOut: { type: String }, // formatted e.g. "05:45 PM"
  checkInLocation: locationSubSchema,
  checkOutLocation: locationSubSchema,
  geofenceStatus: { 
    type: String, 
    enum: ['Inside', 'Outside', 'Remote'], 
    default: 'Inside' 
  },
  approvalStatus: { 
    type: String, 
    enum: ['Auto', 'Pending', 'Approved', 'Rejected'], 
    default: 'Auto' 
  },
  ip: { type: String },
  userAgent: { type: String },
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
  },
  reviewedBy: { type: String },
  rejectionReason: { type: String }
}, schemaOptions);

// Compound unique index per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
