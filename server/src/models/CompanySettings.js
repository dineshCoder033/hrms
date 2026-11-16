const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const companySettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  name: { type: String, default: 'TaskOrbit Technologies Pvt. Ltd.' },
  address: { type: String, default: 'Outer Ring Rd, Bellandur, Bengaluru, Karnataka 560103' },
  taxId: { type: String, default: 'IN-GST-29AABCT1332L1Z5' },
  currency: { type: String, default: 'INR' },
  
  // Work shift & Punch In/Out Configurations (24h format HH:mm)
  workShift: {
    startTime: { type: String, default: '09:00' }, // Standard Check-In (e.g. 09:00 AM)
    endTime: { type: String, default: '18:00' },   // Standard Check-Out (e.g. 06:00 PM)
    gracePeriodMinutes: { type: Number, default: 15 }, // Grace period before marked Late (e.g. 15 mins)
    halfDayThresholdHours: { type: Number, default: 4 }, // Min hours for Half Day
    fullDayThresholdHours: { type: Number, default: 8 }  // Min hours for Full Day
  }
}, schemaOptions);

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
