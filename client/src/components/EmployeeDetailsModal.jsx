import React, { useState, useEffect } from 'react';
import {
  X,
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
  ShieldCheck,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award,
  UploadCloud,
  File,
  Camera
} from 'lucide-react';
import { updateEmployee, deleteEmployee, uploadEmployeeDocument } from '../services/api';

export default function EmployeeDetailsModal({
  employee,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
  isAdminOrHr
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Form State for Editing
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (employee) {
      setImgError(false);
      setFormData({
        name: employee.name || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        avatar: employee.avatar || '',
        email: employee.email || '',
        phone: employee.phone || '',
        bloodGroup: employee.bloodGroup || 'Unknown',
        maritalStatus: employee.maritalStatus || 'Single',
        gender: employee.gender || 'Other',
        dateOfBirth: employee.dateOfBirth || '',
        joinDate: employee.joinDate ? employee.joinDate.split('T')[0] : '',
        role: employee.role || '',
        designation: employee.designation || '',
        department: employee.department || 'Engineering',
        workMode: employee.workMode || 'Office',
        status: employee.status || 'Active',
        experienceYears: employee.experienceYears || 0,
        annualCtc: employee.annualCtc || employee.salary || 65000,
        salary: employee.salary || 65000,
        isPfEligible: employee.isPfEligible ?? true,
        pfNumber: employee.pfNumber || '',
        isEsiEligible: employee.isEsiEligible ?? false,
        esiNumber: employee.esiNumber || '',
        skills: Array.isArray(employee.skills) ? employee.skills.join(', ') : '',
        address: {
          street: employee.address?.street || '',
          city: employee.address?.city || '',
          state: employee.address?.state || '',
          pincode: employee.address?.pincode || '',
          country: employee.address?.country || 'India'
        },
        emergencyContact: {
          name: employee.emergencyContact?.name || '',
          relation: employee.emergencyContact?.relation || '',
          phone: employee.emergencyContact?.phone || ''
        },
        bank: {
          holderName: employee.bank?.holderName || '',
          bankName: employee.bank?.bankName || '',
          branchName: employee.bank?.branchName || '',
          ifsc: employee.bank?.ifsc || '',
          accountNumber: ''
        }
      });
      setIsEditing(false);
      setError('');
      setSuccessMsg('');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const empId = employee._id || employee.id;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Profile image must be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setFormData((prev) => ({ ...prev, avatar: base64Image }));
      setImgError(false);

      // If not in edit mode, immediately persist avatar to DB
      if (!isEditing) {
        try {
          setSaving(true);
          const updated = await updateEmployee(empId, { avatar: base64Image });
          setSuccessMsg('Profile image updated successfully!');
          if (onUpdated) onUpdated(updated);
        } catch (err) {
          setError(err.message || 'Failed to update profile image.');
        } finally {
          setSaving(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        ...formData,
        skills: typeof formData.skills === 'string'
          ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : formData.skills
      };
      if (!payload.bank?.accountNumber) {
        delete payload.bank?.accountNumber;
      }
      const updated = await updateEmployee(empId, payload);
      setSuccessMsg('Employee details updated successfully!');
      setIsEditing(false);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete employee "${employee.name}"? This will also remove their user account.`
    );
    if (!confirmDelete) return;

    try {
      setSaving(true);
      await deleteEmployee(empId);
      if (onDeleted) onDeleted(empId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      setError('');
      await uploadEmployeeDocument(empId, file, 'General Document');
      setSuccessMsg(`Document "${file.name}" uploaded successfully.`);
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const initial = employee.name ? employee.name.charAt(0).toUpperCase() : 'E';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {(formData.avatar || employee.avatar) && !imgError ? (
                <img
                  src={formData.avatar || employee.avatar}
                  alt={employee.name}
                  onError={() => setImgError(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black text-[#C7F436] font-extrabold text-2xl flex items-center justify-center ring-4 ring-white shadow-md">
                  {initial}
                </div>
              )}
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-white ${
                  employee.status === 'Active'
                    ? 'bg-emerald-500'
                    : employee.status === 'Remote'
                    ? 'bg-sky-500'
                    : employee.status === 'On Leave'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />

              {/* Instant Camera Upload Overlay for Admin/HR */}
              {isAdminOrHr && (
                <label
                  title="Click to Upload / Change Profile Photo"
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition duration-200"
                >
                  <Camera className="w-5 h-5 text-[#C7F436]" />
                  <span className="text-[9px] font-bold mt-0.5">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {employee.name}
                </h2>
                {employee.employeeCode && (
                  <span className="text-xs font-mono font-bold bg-black text-[#C7F436] px-2.5 py-0.5 rounded-full">
                    {employee.employeeCode}
                  </span>
                )}
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    employee.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : employee.status === 'Remote'
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {employee.status || 'Active'}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                {employee.role || employee.designation || 'Staff'} •{' '}
                <span className="text-gray-700 font-bold">{employee.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminOrHr && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full bg-black text-white hover:bg-neutral-800 transition active:scale-95 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}

            {isAdminOrHr && !isEditing && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 transition active:scale-95 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'personal', label: 'Personal & Contact', icon: User },
            { id: 'job', label: 'Job & Employment', icon: Briefcase },
            { id: 'finance', label: 'Salary & Bank', icon: CreditCard },
            { id: 'kyc', label: 'Government & KYC', icon: ShieldCheck },
            { id: 'education', label: 'Education & Docs', icon: GraduationCap }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-black text-black bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isEditing ? (
            /* --- EDIT FORM MODE --- */
            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Profile Photo Uploader */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="relative">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Preview"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-black text-[#C7F436] font-extrabold text-lg flex items-center justify-center ring-2 ring-gray-200">
                      {initial}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-bold text-gray-800 block text-xs">Employee Profile Photo</span>
                  <p className="text-gray-400 text-[11px] mb-2">Upload a portrait image (JPG, PNG, WebP up to 3MB)</p>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-[11px] rounded-full transition flex items-center gap-1.5 active:scale-95 shadow-sm">
                      <Camera className="w-3.5 h-3.5 text-[#C7F436]" />
                      <span>{formData.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-[11px] rounded-full transition"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Office">Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Probation">Probation</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Annual CTC ($ / ₹)</label>
                  <input
                    type="number"
                    value={formData.annualCtc}
                    onChange={(e) => setFormData({ ...formData, annualCtc: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="font-semibold text-gray-600 block mb-1">
                  Skills & Competencies (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, Node.js, Leadership, UI Design"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              {/* Address */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="font-bold text-gray-700 block mb-2">Address Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-gray-500">Street</label>
                    <input
                      type="text"
                      value={formData.address?.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500">City</label>
                    <input
                      type="text"
                      value={formData.address?.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500">State</label>
                    <input
                      type="text"
                      value={formData.address?.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-black hover:bg-neutral-800 text-white font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* --- READ ONLY VIEW MODE --- */
            <div className="space-y-6 text-xs">
              {/* TAB 1: Personal & Contact */}
              {activeTab === 'personal' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 font-medium block">Full Name</span>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{employee.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Employee Code</span>
                      <p className="font-mono font-bold text-gray-900 mt-0.5">
                        {employee.employeeCode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Work Email</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Phone Number</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Date of Birth</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.dateOfBirth || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Gender</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.gender || 'Other'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Blood Group</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.bloodGroup || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Marital Status</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.maritalStatus || 'Single'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Joining Date</span>
                      <p className="font-bold text-gray-900 mt-0.5">
                        {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
                    <div className="flex items-center gap-2 mb-2 text-gray-700 font-bold">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Residential Address</span>
                    </div>
                    <p className="text-gray-800 font-semibold leading-relaxed">
                      {[
                        employee.address?.street,
                        employee.address?.city,
                        employee.address?.state,
                        employee.address?.pincode,
                        employee.address?.country
                      ]
                        .filter(Boolean)
                        .join(', ') || 'No residential address configured.'}
                    </p>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
                    <div className="flex items-center gap-2 mb-2 text-gray-700 font-bold">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      <span>Emergency Contact</span>
                    </div>
                    {employee.emergencyContact?.name ? (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-gray-400 block text-[11px]">Contact Name</span>
                          <span className="font-bold text-gray-800">{employee.emergencyContact.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Relationship</span>
                          <span className="font-bold text-gray-800">{employee.emergencyContact.relation || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Phone</span>
                          <span className="font-bold text-gray-800">{employee.emergencyContact.phone || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No emergency contact details provided.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Job & Employment */}
              {activeTab === 'job' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 font-medium block">Department</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.department}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Role</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.role}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Designation</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.designation || 'Staff'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Work Mode</span>
                      <span className="inline-block mt-0.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                        {employee.workMode || 'Office'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Work Status</span>
                      <span className="inline-block mt-0.5 font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full text-[11px]">
                        {employee.status || 'Active'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Experience</span>
                      <p className="font-bold text-gray-900 mt-0.5">{employee.experienceYears || 0} years</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Reporting Manager</span>
                      <p className="font-bold text-gray-900 mt-0.5">
                        {typeof employee.manager === 'object' && employee.manager?.name
                          ? employee.manager.name
                          : employee.reportsTo || 'None (Direct Report)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Performance Score</span>
                      <span className="inline-block mt-0.5 font-bold bg-[#C7F436] text-black px-2.5 py-0.5 rounded-full text-[11px]">
                        {employee.performanceScore || 90}%
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
                    <span className="font-bold text-gray-700 block mb-2">Competencies & Skills</span>
                    {employee.skills && employee.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {employee.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-black/5 text-gray-800 font-semibold px-3 py-1 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No skills specified.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Salary & Bank Details */}
              {activeTab === 'finance' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 font-medium block">Annual CTC</span>
                      <p className="font-extrabold text-gray-900 text-base mt-0.5">
                        ${(employee.annualCtc || employee.salary || 65000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Monthly Base</span>
                      <p className="font-extrabold text-gray-900 text-base mt-0.5">
                        ${Math.round((employee.annualCtc || employee.salary || 65000) / 12).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">PF Status</span>
                      <span className={`inline-block mt-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                        employee.isPfEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {employee.isPfEligible ? `Eligible (${employee.pfNumber || 'Active'})` : 'Exempt'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">ESI Status</span>
                      <span className={`inline-block mt-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                        employee.isEsiEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {employee.isEsiEligible ? `Eligible (${employee.esiNumber || 'Active'})` : 'Exempt'}
                      </span>
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200/80">
                    <div className="flex items-center gap-2 mb-3 text-gray-700 font-bold">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Bank Account & Direct Deposit Information</span>
                    </div>
                    {employee.bank ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-400 text-[11px] block">Account Holder</span>
                          <span className="font-bold text-gray-800">
                            {employee.bank.holderName || employee.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[11px] block">Bank Name</span>
                          <span className="font-bold text-gray-800">
                            {employee.bank.bankName || 'HDFC Bank'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[11px] block">Branch Name</span>
                          <span className="font-bold text-gray-800">
                            {employee.bank.branchName || 'Main Branch'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[11px] block">Masked Account Number</span>
                          <span className="font-mono font-bold text-gray-800">
                            {employee.bank.accountNumberMasked || employee.bank.maskedAccount || '•••• •••• 4589'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[11px] block">IFSC / Routing Code</span>
                          <span className="font-mono font-bold text-gray-800">
                            {employee.bank.ifsc || 'HDFC0001234'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No bank details recorded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Government & KYC */}
              {activeTab === 'kyc' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 font-medium block">Aadhaar Card (National ID)</span>
                      <p className="font-mono font-bold text-gray-900 mt-1">
                        {employee.governmentIds?.aadhaarMasked || 'XXXX-XXXX-8921'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">PAN Number (Tax Identifier)</span>
                      <p className="font-mono font-bold text-gray-900 mt-1">
                        {employee.governmentIds?.panMasked || 'ABCDE****F'}
                      </p>
                    </div>
                  </div>

                  {/* Upload document widget */}
                  {isAdminOrHr && (
                    <div className="p-4 bg-white border border-dashed border-gray-300 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-800">Attach Verified Employee Document</p>
                        <p className="text-gray-400 text-[11px]">Upload PDF, PNG, or JPG (max 5MB)</p>
                      </div>
                      <label className="cursor-pointer bg-black hover:bg-neutral-800 text-white font-bold text-xs px-3.5 py-2 rounded-full transition active:scale-95 flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{uploadingDoc ? 'Uploading...' : 'Upload Document'}</span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          disabled={uploadingDoc}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Education & Attached Documents */}
              {activeTab === 'education' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Education History */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
                    <span className="font-bold text-gray-700 block mb-3">Academic Qualifications</span>
                    {employee.education && employee.education.length > 0 ? (
                      <div className="space-y-3">
                        {employee.education.map((edu, i) => (
                          <div
                            key={i}
                            className="p-3 bg-gray-50 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-gray-900">{edu.degree || 'Degree'}</p>
                              <p className="text-gray-500 text-[11px]">
                                {edu.institution} • {edu.yearOfPassing}
                              </p>
                            </div>
                            {edu.percentageOrCgpa && (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                {edu.percentageOrCgpa}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No education records on file.</p>
                    )}
                  </div>

                  {/* Documents List */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
                    <span className="font-bold text-gray-700 block mb-3">Stored File Attachments</span>
                    {employee.documents && employee.documents.length > 0 ? (
                      <div className="space-y-2">
                        {employee.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <File className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="font-bold text-gray-900">{doc.fileName || doc.type}</p>
                                <p className="text-gray-400 text-[10px]">
                                  {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-black text-[#C7F436] rounded-full text-[10px] font-bold hover:bg-neutral-800"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No document attachments uploaded.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Internal ID: <span className="font-mono text-gray-600">{empId}</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-black hover:bg-neutral-800 text-white font-bold transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
