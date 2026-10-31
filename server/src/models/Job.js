const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  type: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], 
    default: 'Full-time' 
  },
  openings: { type: Number, default: 1 },
  applicantsCount: { type: Number, default: 0 },
  salaryRange: { type: String, default: '$90k - $130k' },
  status: { 
    type: String, 
    enum: ['Active', 'Draft', 'Closed'], 
    default: 'Active' 
  },
  description: { type: String }
}, schemaOptions);

module.exports = mongoose.model('Job', jobSchema);
