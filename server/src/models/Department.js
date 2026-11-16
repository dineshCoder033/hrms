const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, schemaOptions);

module.exports = mongoose.model('Department', departmentSchema);

