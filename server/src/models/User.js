const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schemaOptions = require('./schemaOptions');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['Admin', 'HR', 'Manager', 'Employee'], 
    default: 'Employee' 
  },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  refreshToken: { type: String, select: false },
  isActive: { type: Boolean, default: true }
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
      return ret;
    }
  }
});

// Pre-save password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
