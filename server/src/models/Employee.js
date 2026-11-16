const mongoose = require('mongoose');
const schemaOptions = require('./schemaOptions');
const { getNextEmployeeCode } = require('./Counter');

const educationSchema = new mongoose.Schema({
  degree: { type: String, trim: true },
  institution: { type: String, trim: true },
  yearOfPassing: { type: String, trim: true },
  percentageOrCgpa: { type: String, trim: true }
}, { _id: false });

const employeeSchema = new mongoose.Schema({
  employeeCode: { type: String, unique: true, sparse: true, index: true },
  
  // Basic Personal Info
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  name: { type: String, required: true, trim: true }, // Combined full name
  phone: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''], 
    default: 'Unknown' 
  },
  maritalStatus: { 
    type: String, 
    enum: ['Single', 'Married', 'Unmarried', 'Divorced', 'Widowed', 'Other'], 
    default: 'Single' 
  },
  dateOfBirth: { type: String }, // YYYY-MM-DD
  gender: { type: String, enum: ['Male', 'Female', 'Non-Binary', 'Other'], default: 'Other' },
  avatar: { type: String },

  // Employment & Role
  role: { type: String, required: true, trim: true },
  designation: { type: String, trim: true },
  designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
  department: { type: String, required: true, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  joinDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Active', 'Probation', 'On Leave', 'Resigned', 'Terminated'], 
    default: 'Active' 
  },
  workMode: { 
    type: String, 
    enum: ['Office', 'Remote', 'Hybrid'], 
    default: 'Office' 
  },
  officeLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'OfficeLocation' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  experienceYears: { type: Number, default: 0 },
  skills: [{ type: String }],
  performanceScore: { type: Number, default: 90 },

  // Compensation, PF & ESI Eligibility
  annualCtc: { type: Number, default: 65000 },
  salary: { type: Number, default: 65000 },
  isPfEligible: { type: Boolean, default: true },
  pfNumber: { type: String, trim: true },
  isEsiEligible: { type: Boolean, default: false },
  esiNumber: { type: String, trim: true },

  // Education Details
  education: [educationSchema],

  // Government & KYC Documents
  governmentIds: {
    aadhaarNumberEnc: { type: String }, // Encrypted
    panNumberEnc: { type: String },     // Encrypted
    aadhaarMasked: { type: String },    // e.g. XXXX-XXXX-1234
    panMasked: { type: String }         // e.g. ABCDE****F
  },
  documents: [{
    type: { type: String }, // 'Aadhaar Card', 'PAN Card', 'Degree Certificate', 'Resume', etc.
    fileUrl: { type: String },
    fileName: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Bank & Payment Details
  bank: {
    holderName: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    ifsc: { type: String },
    pincode: { type: String },
    accountNumberEnc: { type: String }, // Encrypted
    maskedAccount: { type: String }     // e.g. •••• 1234
  },

  // Address
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' }
  },
  location: { type: String, default: 'India' },

  // Emergency Contact
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  }
}, schemaOptions);

// Ensure employeeCode and name combination before saving
employeeSchema.pre('save', async function () {
  if (!this.employeeCode) {
    this.employeeCode = await getNextEmployeeCode();
  }
  if (!this.name) {
    const combined = `${this.firstName || ''} ${this.lastName || ''}`.trim();
    this.name = combined || 'Unnamed Employee';
  } else if (!this.firstName && this.name) {
    const parts = this.name.split(' ');
    this.firstName = parts[0] || '';
    this.lastName = parts.slice(1).join(' ') || '';
  }
  if (this.annualCtc && !this.salary) {
    this.salary = this.annualCtc;
  } else if (this.salary && !this.annualCtc) {
    this.annualCtc = this.salary;
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
