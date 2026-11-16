const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const attendeeSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  response: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Declined'], 
    default: 'Pending' 
  }
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  attendees: [attendeeSchema],
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true, index: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  mode: { type: String, enum: ['Online', 'Office'], default: 'Online' },
  meetLink: { type: String },
  room: { type: String },
  recurrence: {
    rrule: { type: String },
    until: { type: Date }
  },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Cancelled', 'Completed'], 
    default: 'Scheduled',
    index: true 
  },
  reminderSent: { type: Boolean, default: false }
}, schemaOptions);

// Compound index for meeting lookup & conflict checking
meetingSchema.index({ 'attendees.employee': 1, startAt: 1, endAt: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);

