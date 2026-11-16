const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const officeLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  radiusMeters: { type: Number, default: 150 },
  address: { type: String },
  isActive: { type: Boolean, default: true }
}, schemaOptions);

module.exports = mongoose.model('OfficeLocation', officeLocationSchema);

