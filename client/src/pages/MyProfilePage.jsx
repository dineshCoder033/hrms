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
  FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchOwnProfile, updateOwnProfile, changePassword } from '../services/api';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchOwnProfile();
        setProfile(data);
        setPhone(data.phone || '');
        setStreet(data.address?.street || '');
        setCity(data.address?.city || '');
        setState(data.address?.state || '');
        setPincode(data.address?.pincode || '');

        setEmergencyName(data.emergencyContact?.name || '');
        setEmergencyPhone(data.emergencyContact?.phone || '');
        setEmergencyRelation(data.emergencyContact?.relation || '');
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async (e) => {
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      setSavingPwd(true);
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl pb-10">
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
              {profile?.employeeCode || 'EMP-ADMIN'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-gray-400 font-semibold block">Designation & Department</span>
          <span className="font-extrabold text-gray-900 mt-0.5 block">
            {profile?.designation || profile?.role || 'Staff'}
          </span>
          <span className="text-gray-500 font-medium">{profile?.department || 'Administration'}</span>
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
          <span className="text-gray-500 font-medium">{profile?.maritalStatus || 'Unmarried'}</span>
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
                <span className="text-gray-400 font-semibold block text-[10px]">ESI Health Insurance</span>
                <span className="font-bold text-gray-900">
                  {profile?.isEsiEligible ? 'Eligible' : 'Not Applicable'}
                </span>
                {profile?.esiNumber && (
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{profile.esiNumber}</span>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">Aadhaar Card (KYC)</span>
                <span className="font-mono font-bold text-gray-900">
                  {profile?.governmentIds?.aadhaarMasked || 'XXXX-XXXX-••••'}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 font-semibold block text-[10px]">PAN Card (TDS)</span>
                <span className="font-mono font-bold text-gray-900">
                  {profile?.governmentIds?.panMasked || '••••••••'}
                </span>
              </div>
            </div>
          </div>

          {/* Salary Disbursal Bank Account */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <CreditCard className="w-4 h-4 text-gray-700" />
              <h2 className="font-extrabold text-gray-900">Salary Disbursal Bank Account</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-gray-400 block text-[10px] font-semibold">Account Holder</span>
                <span className="font-bold text-gray-900">{profile?.bank?.holderName || profile?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] font-semibold">Bank & Branch</span>
                <span className="font-bold text-gray-900">
                  {profile?.bank?.bankName || 'HDFC Bank'} {profile?.bank?.branchName ? `(${profile.bank.branchName})` : ''}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] font-semibold">Account Number</span>
                <span className="font-mono font-bold text-gray-900">
                  {profile?.bank?.maskedAccount || profile?.bank?.accountNumberMasked || '•••• •••• ••••'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] font-semibold">IFSC Code</span>
                <span className="font-mono font-bold text-gray-900">{profile?.bank?.ifsc || 'DEFAULT001'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] font-semibold">Branch PIN Code</span>
                <span className="font-bold text-gray-900">{profile?.bank?.pincode || '-'}</span>
              </div>
            </div>
          </div>

          {/* Educational Qualifications */}
          {profile?.education && profile.education.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <GraduationCap className="w-4 h-4 text-gray-700" />
                <h2 className="font-extrabold text-gray-900">Educational Qualifications</h2>
              </div>

              <div className="space-y-2">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-900">{edu.degree || 'Degree'}</p>
                      <p className="text-[11px] text-gray-500">{edu.institution || 'College / University'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">{edu.percentageOrCgpa || '-'}</span>
                      <p className="text-[10px] text-gray-400">Class of {edu.yearOfPassing || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Self-Service Update: Address & Emergency Contact */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <MapPin className="w-4 h-4 text-gray-700" />
              <h2 className="font-extrabold text-gray-900">Update Contact & Residential Address</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="font-extrabold text-gray-900 text-xs block mb-2">Emergency Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Emergency Phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Relation (e.g. Spouse)"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-full bg-black text-white font-bold hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Change Password */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft-sm text-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Lock className="w-4 h-4 text-gray-700" />
              <h2 className="font-extrabold text-gray-900">Change Account Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={savingPwd}
                className="w-full py-2.5 rounded-full bg-[#C7F436] text-black font-extrabold hover:brightness-95 transition disabled:opacity-50 shadow-xs"
              >
                {savingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
