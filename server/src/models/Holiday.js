const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const holidaySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true, index: true }, // 'YYYY-MM-DD'
  name: { type: String, required: true, trim: true },
  year: { type: Number, required: true, index: true },
  type: { type: String, enum: ['Public', 'Company'], default: 'Public' }
}, schemaOptions);

module.exports = mongoose.model('Holiday', holidaySchema);

