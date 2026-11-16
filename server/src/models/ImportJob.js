const mongoose = require('mongoose');

const importJobSchema = new mongoose.Schema({
  importId: { type: String, required: true, unique: true, index: true },
  validRows: [{ type: mongoose.Schema.Types.Mixed }],
  invalidRows: [{ type: mongoose.Schema.Types.Mixed }],
  summary: {
    total: { type: Number, default: 0 },
    validCount: { type: Number, default: 0 },
    invalidCount: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // TTL index 1 hour
});

module.exports = mongoose.model('ImportJob', importJobSchema);

