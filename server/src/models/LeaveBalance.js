const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');

const balanceItemSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  used: { type: Number, default: 0 }
}, {
  _id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

balanceItemSchema.virtual('remaining').get(function () {
  return Math.max(0, this.total - this.used);
});

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  year: { type: Number, default: () => new Date().getFullYear(), index: true },
  balances: {
    'Annual Leave': { 
      type: balanceItemSchema, 
      default: () => ({ total: 20, used: 0 }) 
    },
    'Casual Leave': { 
      type: balanceItemSchema, 
      default: () => ({ total: 10, used: 0 }) 
    },
    'Sick Leave': { 
      type: balanceItemSchema, 
      default: () => ({ total: 10, used: 0 }) 
    },
    'Maternity/Paternity': { 
      type: balanceItemSchema, 
      default: () => ({ total: 90, used: 0 }) 
    },
    'Unpaid': { 
      type: balanceItemSchema, 
      default: () => ({ total: 0, used: 0 }) 
    }
  }
}, schemaOptions);

// Each employee has one balance record per year
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
