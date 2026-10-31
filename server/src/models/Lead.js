const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  avatar: { type: String },
  interestLevel: { 
    type: String, 
    enum: ['Hot Client', 'Great interest', 'Medium interest', 'Low interest', 'Non interest'], 
    default: 'Hot Client' 
  },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  sources: [{ type: String }],
  email: { type: String },
  phone: { type: String },
  dealValue: { type: Number, default: 15000 },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'], default: 'New' }
}, schemaOptions);

module.exports = mongoose.model('Lead', leadSchema);
