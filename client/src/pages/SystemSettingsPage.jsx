import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Clock, 
  Building2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Plus, 
  Trash2,
  Navigation
} from 'lucide-react';
import { 
  fetchSystemSettings, 
  updateSystemSettings, 
  fetchLocations, 
  createLocationApi, 
  deleteLocationApi 
} from '../services/api';
import GeofenceLocationPicker from '../components/GeofenceLocationPicker';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states - Company
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [currency, setCurrency] = useState('INR');
  
  // Punch In/Out Shift Timings
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [halfDayThresholdHours, setHalfDayThresholdHours] = useState(4);
  const [fullDayThresholdHours, setFullDayThresholdHours] = useState(8);

  // Office Geofence Locations
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [settingsData, locsData] = await Promise.all([
          fetchSystemSettings(),
          fetchLocations().catch(() => [])
        ]);

        setSettings(settingsData);
        setCompanyName(settingsData.name || '');
        setAddress(settingsData.address || '');
        setTaxId(settingsData.taxId || '');
        setCurrency(settingsData.currency || 'INR');

        if (settingsData.workShift) {
          setStartTime(settingsData.workShift.startTime || '09:00');
          setEndTime(settingsData.workShift.endTime || '18:00');
          setGracePeriodMinutes(settingsData.workShift.gracePeriodMinutes ?? 15);
          setHalfDayThresholdHours(settingsData.workShift.halfDayThresholdHours ?? 4);
          setFullDayThresholdHours(settingsData.workShift.fullDayThresholdHours ?? 8);
        }

        setLocations(Array.isArray(locsData) ? locsData : []);
      } catch (err) {
        setError(err.message || 'Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this office geofence location?')) return;
    try {
      await deleteLocationApi(id);
      setLocations(prev => prev.filter(l => l._id !== id));
      setMessage('Office location removed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete location');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      setSaving(true);
      const updated = await updateSystemSettings({
        name: companyName,
        address,
        taxId,
        currency,
        workShift: {
          startTime,
          endTime,
          gracePeriodMinutes: Number(gracePeriodMinutes),
          halfDayThresholdHours: Number(halfDayThresholdHours),
          fullDayThresholdHours: Number(fullDayThresholdHours)
        }
      });
      setSettings(updated);
      setMessage('System & Work Shift Timings updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-400 border border-gray-100">
        Loading system settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">System, Shift & Geofence Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure office GPS geofence locations (100m radius), work shift timings, grace period and company info (Admin Only)
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-800 font-bold">✕</button>
        </div>
      )}

      {/* 1. Office Geofence Locations Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">Configured Office Geofences</h2>
            <p className="text-[11px] text-gray-500">
              Active office locations with their custom allowed punch radius (meters)
            </p>
          </div>
        </div>

        {/* Existing Office Locations List */}
        <div className="space-y-2">
          {locations.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
              ⚠️ No office location added yet! Employees will not be able to punch until you add at least one office GPS location below.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locations.map((loc) => (
                <div key={loc._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-start justify-between gap-3 shadow-soft-xs">
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900">{loc.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{loc.address || 'Office Premises'}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono font-bold text-gray-600">
                      <span>Lat: {loc.lat}</span>
                      <span>•</span>
                      <span>Lng: {loc.lng}</span>
                    </div>
                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Geofence Radius: {loc.radiusMeters || 100}m
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(loc._id)}
                    className="p-1.5 rounded-full text-rose-500 hover:bg-rose-100 transition"
                    title="Delete Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Location & Radius Chooser */}
        <GeofenceLocationPicker
          onLocationSaved={async (locData) => {
            const created = await createLocationApi(locData);
            setLocations((prev) => [...prev, created]);
            setMessage(`Office Geofence "${created.name}" with ${created.radiusMeters}m radius saved successfully!`);
          }}
          existingLocations={locations}
        />
      </div>

      {/* 2. Punch In / Out Shift Timings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#C7F436] flex items-center justify-center text-black">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">Punch IN & Punch OUT Timings</h2>
              <p className="text-[11px] text-gray-500">
                Attendance engine automatically calculates 'Late', 'Present', and 'Half Day' using these rules
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Standard Check-IN Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Expected arrival time (e.g. 09:00 AM)</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Standard Check-OUT Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">End of shift time (e.g. 06:00 PM)</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Punches after {startTime} + {gracePeriodMinutes} mins are marked <b>Late</b>
              </span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Half-Day Threshold (Hours)</label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                required
                value={halfDayThresholdHours}
                onChange={(e) => setHalfDayThresholdHours(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Working less than {halfDayThresholdHours} hrs is marked <b>Half Day</b>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Company Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-black text-[#C7F436] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">Company Information</h2>
              <p className="text-[11px] text-gray-500">Displayed on official Payslips and Company Header</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tax ID / GST Number</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Official Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-full bg-black text-white text-xs font-extrabold hover:bg-neutral-800 transition flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
