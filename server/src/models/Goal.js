const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerRole: { type: String },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  deadline: { type: String, default: 'Q4 2026' },
  category: { 
    type: String, 
    enum: ['Organizational', 'Engineering', 'Operations', 'Culture'], 
    default: 'Organizational' 
  },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'On Track', 'Exceeding', 'At Risk', 'Completed'], 
    default: 'In Progress' 
  }
}, schemaOptions);

module.exports = mongoose.model('Goal', goalSchema);
