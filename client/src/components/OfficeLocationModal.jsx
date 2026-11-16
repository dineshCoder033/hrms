import React, { useState, useEffect } from 'react';
import { X, MapPin, Trash2, AlertCircle } from 'lucide-react';
import { fetchLocations, createLocationApi, deleteLocationApi } from '../services/api';
import GeofenceLocationPicker from './GeofenceLocationPicker';

export default function OfficeLocationModal({ isOpen, onClose }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await fetchLocations();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (locData) => {
    const created = await createLocationApi(locData);
    setLocations((prev) => [...prev, created]);
    return created;
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this office geofence?')) return;
    try {
      await deleteLocationApi(id);
      await loadLocations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-[#C7F436]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Office Geofence Locations</h3>
              <p className="text-xs text-gray-500 font-medium">Configure company offices and authorized punch radii</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Map & Radius Picker */}
          <GeofenceLocationPicker
            onLocationSaved={handleCreate}
            existingLocations={locations}
          />

          {/* Existing Locations List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-sm text-gray-900">Active Office Geofences ({locations.length})</h4>
            {locations.length === 0 ? (
              <p className="text-gray-400 p-4 bg-gray-50 rounded-2xl text-center">No office geofence locations configured yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                {locations.map((loc) => (
                  <div key={loc._id} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{loc.name}</p>
                        <p className="text-gray-500 text-[11px]">{loc.address || 'No address provided'}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-600 font-mono">
                          <span>Lat: {Number(loc.lat).toFixed(4)}</span>
                          <span>Lng: {Number(loc.lng).toFixed(4)}</span>
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                            Radius: {loc.radiusMeters || 100}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(loc._id)}
                      className="p-2 text-gray-400 hover:text-rose-600 transition"
                      title="Deactivate location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

