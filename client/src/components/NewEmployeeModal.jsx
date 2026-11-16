import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  User, 
  Briefcase, 
  CreditCard, 
  GraduationCap, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  HeartPulse,
  Plus,
  Trash2,
  Camera,
  UploadCloud
} from 'lucide-react';

export default function NewEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [activeTab, setActiveTab] = useState('personal');

  // Form State covering all requested fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatar: '', // Profile Photo (Base64 data or image URL)
    phone: '',
    email: '',
    password: '', // Login Password created by Admin
    bloodGroup: 'O+',
    maritalStatus: 'Unmarried',
    gender: 'Male',
    dateOfBirth: '',
    joinDate: new Date().toISOString().split('T')[0],

    role: '',
    designation: '',
    department: 'Engineering',
    workMode: 'Office',
    status: 'Active',
    experienceYears: 0,

    annualCtc: 450000,
    isPfEligible: true,
    pfNumber: '',
    isEsiEligible: false,
    esiNumber: '',

    // Government / KYC
    aadhaarNumber: '',
    panNumber: '',

    // Bank Details
    bank: {
      holderName: '',
      bankName: '',
      branchName: '',
      accountNumber: '',
      ifsc: '',
      pincode: ''
    },

    // Address
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },

    // Education
    education: [
      { degree: '', institution: '', yearOfPassing: '', percentageOrCgpa: '' }
    ]
  });

  if (!isOpen) return null;

  const handleBankChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bank: { ...prev.bank, [field]: value }
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.education];
      updated[index][field] = value;
      return { ...prev, education: updated };
    });
  };

  const addEducationRow = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', yearOfPassing: '', percentageOrCgpa: '' }]
    }));
  };

  const removeEducationRow = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Profile photo size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.role) {
      alert('Please fill First Name, Email and Role.');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    onAddEmployee({
      ...formData,
      name: fullName,
      annualCtc: Number(formData.annualCtc),
      salary: Number(formData.annualCtc),
      experienceYears: Number(formData.experienceYears)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-4xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#C7F436] flex items-center justify-center text-black">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight">Add New Employee</h3>
              <p className="text-[11px] text-gray-400 font-medium">Complete employee profile, KYC, bank & education records</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-5 pt-3 border-b border-gray-100 bg-gray-50/60 overflow-x-auto shrink-0">
          {[
            { id: 'personal', label: '1. Personal Info', icon: User },
            { id: 'employment', label: '2. Job & Compensation', icon: Briefcase },
            { id: 'kyc_bank', label: '3. KYC & Bank Details', icon: CreditCard },
            { id: 'education_address', label: '4. Education & Address', icon: GraduationCap },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap border-b-2 ${
                  isActive 
                    ? 'border-black text-black bg-white shadow-2xs' 
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="relative group shrink-0">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt="Profile preview" 
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-black"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold border-2 border-dashed border-gray-300">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-[10px] font-bold">
                    Change
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Profile Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Upload employee portrait photo (JPG, PNG, WebP up to 2MB)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kumar"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Official Email (Username) *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Employee uses this email to log in</span>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Initial Login Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Employee@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Min 6 chars. Employee can change in profile</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  >
                    <option value="Unmarried">Unmarried / Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB & COMPENSATION */}
          {activeTab === 'employment' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Primary Role / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  >
                    {['Engineering', 'Product', 'Design', 'Human Resources', 'Finance', 'Operations', 'Sales', 'Marketing'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  >
                    <option value="Office">Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Employment Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  >
                    <option value="Active">Active</option>
                    <option value="Probation">Probation</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Salary, PF & ESI Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 text-xs">Annual Compensation & Statutory</span>
                  <span className="text-[11px] text-gray-500 font-semibold">Indian Labour Law Compliance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Annual CTC (₹ INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 600000"
                      value={formData.annualCtc}
                      onChange={(e) => setFormData({ ...formData, annualCtc: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={formData.isPfEligible}
                        onChange={(e) => setFormData({ ...formData, isPfEligible: e.target.checked })}
                        className="rounded accent-black"
                      />
                      <span>PF Eligible (Provident Fund)</span>
                    </label>
                    {formData.isPfEligible && (
                      <input
                        type="text"
                        placeholder="UAN / PF Number"
                        value={formData.pfNumber}
                        onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-bold text-gray-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={formData.isEsiEligible}
                        onChange={(e) => setFormData({ ...formData, isEsiEligible: e.target.checked })}
                        className="rounded accent-black"
                      />
                      <span>ESI Eligible (Health Ins.)</span>
                    </label>
                    {formData.isEsiEligible && (
                      <input
                        type="text"
                        placeholder="ESIC Insurance Number"
                        value={formData.esiNumber}
                        onChange={(e) => setFormData({ ...formData, esiNumber: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KYC & BANK DETAILS */}
          {activeTab === 'kyc_bank' && (
            <div className="space-y-4 animate-in fade-in">
              {/* KYC Government IDs */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <span className="font-extrabold text-gray-900 text-xs block">Government Identity Proofs (KYC)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      placeholder="12-digit Aadhaar Number"
                      maxLength={14}
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Stored with AES-256 GCM encryption</span>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono uppercase focus:outline-none focus:border-black"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Required for TDS salary deduction</span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <span className="font-extrabold text-gray-900 text-xs block">Salary Disbursal Bank Account</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="As per bank passbook"
                      value={formData.bank.holderName}
                      onChange={(e) => handleBankChange('holderName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, SBI"
                      value={formData.bank.bankName}
                      onChange={(e) => handleBankChange('bankName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g. T. Nagar, Chennai"
                      value={formData.bank.branchName}
                      onChange={(e) => handleBankChange('branchName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50100012345678"
                      value={formData.bank.accountNumber}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0000123"
                      maxLength={11}
                      value={formData.bank.ifsc}
                      onChange={(e) => handleBankChange('ifsc', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Branch PIN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 600017"
                      maxLength={6}
                      value={formData.bank.pincode}
                      onChange={(e) => handleBankChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION & ADDRESS */}
          {activeTab === 'education_address' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Address */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <span className="font-extrabold text-gray-900 text-xs block">Permanent / Residential Address</span>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="Flat No, Building, Street"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Chennai"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">State</label>
                    <input
                      type="text"
                      placeholder="Tamil Nadu"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">PIN Code</label>
                    <input
                      type="text"
                      placeholder="600001"
                      value={formData.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      value={formData.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Education Qualifications */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 text-xs">Educational Qualifications</span>
                  <button
                    type="button"
                    onClick={addEducationRow}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Degree</span>
                  </button>
                </div>

                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Degree / Course (e.g. B.Tech CS)"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                      className="flex-1 min-w-[130px] px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="College / University"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                      className="flex-1 min-w-[140px] px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      maxLength={4}
                      value={edu.yearOfPassing}
                      onChange={(e) => handleEducationChange(idx, 'yearOfPassing', e.target.value)}
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center"
                    />
                    <input
                      type="text"
                      placeholder="% / CGPA"
                      value={edu.percentageOrCgpa}
                      onChange={(e) => handleEducationChange(idx, 'percentageOrCgpa', e.target.value)}
                      className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center"
                    />
                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducationRow(idx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ['personal', 'employment', 'kyc_bank', 'education_address'];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
                  }}
                  className="px-4 py-2 rounded-full border border-gray-200 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}

              {activeTab !== 'education_address' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ['personal', 'employment', 'kyc_bank', 'education_address'];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
                  }}
                  className="px-5 py-2 rounded-full bg-black text-white font-bold hover:bg-neutral-800"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#C7F436] text-black font-extrabold hover:brightness-95 shadow-md flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save & Register Employee</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
