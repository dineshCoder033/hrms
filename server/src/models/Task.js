const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  clientRole: { type: String, required: true },
  clientAvatar: { type: String },
  taskType: { type: String, enum: ['Google Meet Call', 'Send Proposal', 'Review Document', 'Interview', 'Contract Signing'], default: 'Google Meet Call' },
  scheduledTime: { type: String, default: '2:00 pm' },
  scheduledDate: { type: String, default: '28.03.2023' },
  amount: { type: String },
  status: { type: String, enum: ['Call scheduled', 'Waiting Proposal', 'Overdue', 'Completed', 'In Review'], default: 'Call scheduled' },
  category: { type: String, enum: ['Hot', 'Due Today', 'Overdue', 'Completed'], default: 'Due Today' },
  attendees: [{
    name: String,
    avatar: String
  }],
  isHighlight: { type: Boolean, default: false }
}, schemaOptions);

module.exports = mongoose.model('Task', taskSchema);
