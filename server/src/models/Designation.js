const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const designationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isActive: { type: Boolean, default: true }
}, schemaOptions);

module.exports = mongoose.model('Designation', designationSchema);

