import React, { useEffect, useState } from 'react';
import { 
  User, 
  Lock, 
  Phone, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  HeartPulse, 
  Calendar, 
  CreditCard, 
  GraduationCap, 
  MapPin, 
  FileText,
  Users,
  CalendarCheck,
  UserCheck,
  UserX,
  IndianRupee,
  Camera,
  Mail,
  Save,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchOwnProfile, 
  updateOwnProfile, 
  changePassword, 
  fetchStats, 
  updateUserProfile 
} from '../services/api';

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Admin Specific States
  const [stats, setStats] = useState(null);
  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminEmail, setAdminEmail] = useState(user?.email || '');
  const [adminAvatar, setAdminAvatar] = useState(user?.avatar || '');
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);

  // Employee Specific Profile State
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change States (Common)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (isAdmin) {
          const statsData = await fetchStats().catch(() => null);
          setStats(statsData);
          setAdminName(user?.name || '');
          setAdminEmail(user?.email || '');
          setAdminAvatar(user?.avatar || '');
        } else {
          const data = await fetchOwnProfile().catch(() => null);
          if (data) {
            setProfile(data);
            setPhone(data.phone || '');
            setStreet(data.address?.street || '');
            setCity(data.address?.city || '');
            setState(data.address?.state || '');
            setPincode(data.address?.pincode || '');
            setEmergencyName(data.emergencyContact?.name || '');
            setEmergencyPhone(data.emergencyContact?.phone || '');
            setEmergencyRelation(data.emergencyContact?.relation || '');
          }
        }
      } catch (err) {
        console.warn('Failed to load profile context:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin, user]);

  // Admin Photo Upload Handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Profile photo size must be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAdminAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save Admin Profile (Name, Email, Avatar)
  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!adminName.trim()) {
      setError('Please provide a valid name.');
      return;
    }
    if (!adminEmail.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setSavingAdminProfile(true);
      const res = await updateUserProfile({
        name: adminName.trim(),
        email: adminEmail.trim(),
        avatar: adminAvatar
      });

      if (updateUser) {
        updateUser(res.data || { name: adminName.trim(), email: adminEmail.trim(), avatar: adminAvatar });
      }
      setMessage('Admin profile details updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update admin profile');
    } finally {
      setSavingAdminProfile(false);
    }
  };

  // Save Employee Profile
  const handleSaveEmployeeProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      setSavingProfile(true);
      const updated = await updateOwnProfile({
        phone,
        address: {
          street,
          city,
          state,
          pincode,
          country: profile?.address?.country || 'India'
        },
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation
        }
      });
      setProfile(updated);
      setMessage('Profile contact & address details updated.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setSavingPwd(true);
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center text-xs text-gray-400 border border-gray-100">
        Loading profile data...
      </div>
    );
  }

  // =========================================================================
  // 1. ADMIN PROFILE VIEW
  // =========================================================================
  if (isAdmin) {
    const initial = adminName ? adminName.charAt(0).toUpperCase() : 'A';

    return (
      <div className="space-y-6 max-w-5xl pb-10 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Administrator Profile & System Command
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Super Admin credentials, executive workforce statistics & system controls
            </p>
          </div>

          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black text-[#C7F436] font-extrabold text-xs shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Access</span>
          </span>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center justify-between gap-2 shadow-soft-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage('')} className="text-emerald-800 font-bold">✕</button>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center justify-between gap-2 shadow-soft-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-800 font-bold">✕</button>
          </div>
        )}

        {/* Executive Stats Cards (Total Employees, Total Attendance, Present & Absent, Today Payment) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Total Employees */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-soft-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Total Workforce</span>
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                {stats?.totalEmployees ?? stats?.activeEmployees ?? 0}
              </p>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                Active Staff
              </span>
            </div>
          </div>

          {/* Total Attendances */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-soft-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Total Attendances</span>
              <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                {stats?.totalAttendances ?? 0}
              </p>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">
                Total Logs
              </span>
            </div>
          </div>

          {/* Today Present */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-soft-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Today Present</span>
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-emerald-600 tracking-tight">
                {stats?.todayPresent ?? 0}
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                On Duty ({stats?.attendanceRate || 0}%)
              </span>
            </div>
          </div>

          {/* Today Absent */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-soft-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Today Absent</span>
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <UserX className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-rose-600 tracking-tight">
                {stats?.todayAbsent ?? 0}
              </p>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-1">
                Off Work
              </span>
            </div>
          </div>

          {/* Today Payment / Total Payroll */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-soft-sm flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Today Payment</span>
              <div className="w-7 h-7 rounded-full bg-lime-50 text-lime-700 flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                ₹{Number(stats?.todayPayment || stats?.totalPayroll || 0).toLocaleString()}
              </p>
              <span className="text-[10px] font-bold text-black bg-[#C7F436] px-2 py-0.5 rounded-full inline-block mt-1">
                Disbursement
              </span>
            </div>
          </div>
        </div>

        {/* Admin Account & Profile Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Admin Identity Form (Name, Email, Profile Picture) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-soft-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-black text-[#C7F436] flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Admin Profile & Identity</h3>
                <p className="text-[11px] text-gray-400">Update your Super Admin name, official email, and profile avatar</p>
              </div>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="relative group">
                  {adminAvatar ? (
                    <img
                      src={adminAvatar}
                      alt={adminName}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-black text-[#C7F436] font-black text-xl flex items-center justify-center ring-2 ring-gray-200 shadow-sm">
                      {initial}
                    </div>
                  )}

                  <label
                    title="Change Profile Picture"
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition duration-200"
                  >
                    <Camera className="w-4 h-4 text-[#C7F436]" />
                    <span className="text-[8px] font-bold mt-0.5">Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-xs">Admin Avatar / Profile Photo</p>
                  <p className="text-[11px] text-gray-400 mb-2">Upload a square photo (PNG, JPG, WebP max 3MB)</p>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-[11px] rounded-full transition flex items-center gap-1.5 active:scale-95 shadow-sm">
                      <Camera className="w-3 h-3 text-[#C7F436]" />
                      <span>{adminAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {adminAvatar && (
                      <button
                        type="button"
                        onClick={() => setAdminAvatar('')}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-[11px] rounded-full transition"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Email Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Administrator Name</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Super Admin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-900 focus:outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Administrator Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-black font-semibold transition"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    This email is used to sign in to the Super Admin portal.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingAdminProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-[#C7F436]" />
                  <span>{savingAdminProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Password Change Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-soft-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Change Admin Password</h3>
                <p className="text-[11px] text-gray-400">Update your Super Admin password credentials</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 chars (letters & numbers)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-black transition"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C7F436]" />
                  <span>{savingPwd ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. REGULAR EMPLOYEE / STAFF PROFILE VIEW
  // =========================================================================
  return (
    <div className="space-y-5 max-w-5xl pb-10 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Profile & Records</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          View your comprehensive HR records, statutory benefits, education, bank info & security settings
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-black text-[#C7F436] flex items-center justify-center font-black text-sm">
            {profile?.name ? profile.name.charAt(0) : (user?.name?.charAt(0) || 'U')}
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm leading-snug">{profile?.name || user?.name}</p>
            <p className="text-gray-400 font-medium">{profile?.email || user?.email}</p>
            <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
              {profile?.employeeCode || 'EMP-STAFF'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-gray-400 font-semibold block">Designation & Department</span>
          <span className="font-extrabold text-gray-900 mt-0.5 block">
            {profile?.designation || profile?.role || 'Staff'}
          </span>
          <span className="text-gray-500 font-medium">{profile?.department || 'Engineering'}</span>
        </div>

        <div>
          <span className="text-gray-400 font-semibold block">Joining Date & Work Mode</span>
          <span className="font-extrabold text-gray-900 mt-0.5 block">
            {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}
          </span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
            {profile?.workMode || 'Office'} Mode
          </span>
        </div>

        <div>
          <span className="text-gray-400 font-semibold block">Personal Status</span>
          <span className="font-extrabold text-gray-900 mt-0.5 block">
            Blood Group: <span className="text-rose-600 font-black">{profile?.bloodGroup || 'O+'}</span>
          </span>
          <span className="text-gray-500 font-medium">{profile?.maritalStatus || 'Single'}</span>
        </div>
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Comprehensive Read-Only HR & Statutory Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Statutory & Benefits */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="font-extrabold text-gray-900">Statutory Compliance, PF & ESI</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">Provident Fund (PF)</span>
                <span className="font-bold text-gray-900">
                  {profile?.isPfEligible ? 'Eligible' : 'Not Eligible'}
                </span>
                {profile?.pfNumber && (
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{profile.pfNumber}</span>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">ESI Benefit</span>
                <span className="font-bold text-gray-900">
                  {profile?.isEsiEligible ? 'Eligible' : 'Not Eligible'}
                </span>
                {profile?.esiNumber && (
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{profile.esiNumber}</span>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">Aadhaar Masked</span>
                <span className="font-mono font-bold text-gray-900">
                  {profile?.governmentIds?.aadhaarMasked || 'XXXX-XXXX-XXXX'}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">PAN Masked</span>
                <span className="font-mono font-bold text-gray-900">
                  {profile?.governmentIds?.panMasked || 'XXXXX0000X'}
                </span>
              </div>
            </div>
          </div>

          {/* Education Records */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <h2 className="font-extrabold text-gray-900">Educational Qualifications</h2>
            </div>

            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-2">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-900">{edu.degree || 'Degree'}</p>
                      <p className="text-gray-400 text-[11px]">{edu.institution} • {edu.yearOfPassing}</p>
                    </div>
                    {edu.percentageOrCgpa && (
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {edu.percentageOrCgpa}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-[11px]">No formal education records linked to this account.</p>
            )}
          </div>

          {/* Bank & Payment Details */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2 className="font-extrabold text-gray-900">Bank & Direct Deposit Information</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">Bank Name</span>
                <span className="font-bold text-gray-900">{profile?.bank?.bankName || 'HDFC Bank'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">Branch</span>
                <span className="font-bold text-gray-900">{profile?.bank?.branchName || 'Main Branch'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">IFSC Code</span>
                <span className="font-mono font-bold text-gray-900">{profile?.bank?.ifsc || 'HDFC0001234'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">Account (Masked)</span>
                <span className="font-mono font-bold text-gray-900">
                  {profile?.bank?.accountNumberMasked || '•••• •••• 4589'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Self-Service Editable Contact & Password */}
        <div className="space-y-4">
          {/* Editable Contact Info */}
          <form onSubmit={handleSaveEmployeeProfile} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <h2 className="font-extrabold text-gray-900">Contact & Address</h2>
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">Mobile Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Door No, Street name"
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2 space-y-2">
              <span className="font-bold text-gray-800 block">Emergency Contact</span>
              <div>
                <label className="block text-gray-500 font-semibold mb-0.5">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Relative / Guardian Name"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 font-semibold mb-0.5">Relation</label>
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="e.g. Spouse"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-0.5">Phone</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold transition shadow-md disabled:opacity-50 mt-2"
            >
              {savingProfile ? 'Saving...' : 'Save Contact Details'}
            </button>
          </form>

          {/* Password Change Box */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h2 className="font-extrabold text-gray-900">Change Password</h2>
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars (letter + number)"
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>

            <button
              type="submit"
              disabled={savingPwd}
              className="w-full py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold transition shadow-md disabled:opacity-50 mt-2"
            >
              {savingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
