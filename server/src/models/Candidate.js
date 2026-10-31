const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const candidateSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  jobTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  stage: { 
    type: String, 
    enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'], 
    default: 'Applied' 
  },
  rating: { type: Number, min: 1, max: 5, default: 4 },
  experienceYears: { type: Number, default: 3 },
  notes: { type: String }
}, schemaOptions);

module.exports = mongoose.model('Candidate', candidateSchema);
