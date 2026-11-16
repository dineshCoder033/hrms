const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schemaOptions = require('./schemaOptions');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['Admin', 'HR', 'Manager', 'Employee'], 
    default: 'Employee' 
  },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  refreshToken: { type: String, select: false },
  isActive: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  mustChangePassword: { type: Boolean, default: false },
  inviteTokenHash: { type: String, select: false },
  inviteExpiresAt: { type: Date, select: false }
}, {
  ...schemaOptions,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshToken;
      delete ret.inviteTokenHash;
      return ret;
    }
  }
});

// Pre-save password hashing (strictly async function without next)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is temporarily locked
userSchema.methods.isAccountLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

module.exports = mongoose.model('User', userSchema);
