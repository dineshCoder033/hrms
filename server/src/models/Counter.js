const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const getNextEmployeeCode = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'employee' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `EMP-${String(counter.seq).padStart(4, '0')}`;
};

module.exports = { Counter, getNextEmployeeCode };

