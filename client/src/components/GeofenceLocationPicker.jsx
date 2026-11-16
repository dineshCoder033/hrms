import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Link2, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Building2,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function GeofenceLocationPicker({ onLocationSaved, existingLocations = [] }) {
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [officeName, setOfficeName] = useState('Saroja ramasamy chettiar samudhaya koodam');
  const [address, setAddress] = useState('Pallipalayam, Tamil Nadu');
  const [lat, setLat] = useState(11.359666); // Extracted from user's URL
  const [lng, setLng] = useState(77.751476);
  const [radiusMeters, setRadiusMeters] = useState(150);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Parser for Google Maps links
  const parseGoogleMapsLink = (url) => {
    if (!url || !url.trim()) return;

    try {
      const trimmed = url.trim();
      let extractedName = '';
      let extractedLat = null;
      let extractedLng = null;
      let extractedAddress = '';

      // 1. Check for place name in URL: /place/Name/...
      const placeMatch = trimmed.match(/\/place\/([^/@?]+)/i);
      if (placeMatch && placeMatch[1]) {
        extractedName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim();
      }

      // 2. Check for precise pin coordinates: !3d11.3596657!4d77.7514759
      const preciseMatch = trimmed.match(/!3d([0-9.-]+)!4d([0-9.-]+)/i);
      if (preciseMatch) {
        extractedLat = parseFloat(preciseMatch[1]);
        extractedLng = parseFloat(preciseMatch[2]);
      }

      // 3. Check for @lat,lng: @11.3592898,77.751763
      if (extractedLat === null || extractedLng === null) {
        const atMatch = trimmed.match(/@([0-9.-]+),([0-9.-]+)/i);
        if (atMatch) {
          extractedLat = parseFloat(atMatch[1]);
          extractedLng = parseFloat(atMatch[2]);
        }
      }

      // 4. Check for ?q=lat,lng or ?q=loc:lat,lng
      if (extractedLat === null || extractedLng === null) {
        const qMatch = trimmed.match(/[?&]q=(?:loc:)?([0-9.-]+),([0-9.-]+)/i);
        if (qMatch) {
          extractedLat = parseFloat(qMatch[1]);
          extractedLng = parseFloat(qMatch[2]);
        }
      }

      // 5. Check for landmark inside URL params (e.g. 2sPallipalayam,+Tamil+Nadu)
      const landmarkMatch = trimmed.match(/!2s([^!/?]+)/i);
      if (landmarkMatch && landmarkMatch[1]) {
        extractedAddress = decodeURIComponent(landmarkMatch[1].replace(/\+/g, ' ')).trim();
      }

      // 6. Direct comma-separated lat,lng: "11.359666, 77.751476"
      if (extractedLat === null || extractedLng === null) {
        const rawCoords = trimmed.match(/^([0-9.-]+)\s*,\s*([0-9.-]+)$/);
        if (rawCoords) {
          extractedLat = parseFloat(rawCoords[1]);
          extractedLng = parseFloat(rawCoords[2]);
        }
      }

      if (extractedLat !== null && extractedLng !== null && !isNaN(extractedLat) && !isNaN(extractedLng)) {
        setLat(Number(extractedLat.toFixed(6)));
        setLng(Number(extractedLng.toFixed(6)));

        if (extractedName) {
          setOfficeName(extractedName);
        } else if (!officeName) {
          setOfficeName('Branch Office');
        }

        if (extractedAddress) {
          setAddress(extractedAddress);
        }

        setError('');
        setSuccessMsg(`Google Maps link parsed! Extracted: "${extractedName || 'Location'}" [${extractedLat.toFixed(6)}, ${extractedLng.toFixed(6)}]`);
        return true;
      } else {
        setError('Could not extract coordinates from this Google Maps link. Please check the URL format or use the GPS button.');
        return false;
      }
    } catch (err) {
      setError('Invalid Google Maps link format. Please paste a standard Google Maps link.');
      return false;
    }
  };

  // Auto-parse when user pastes or types into the Google Maps link input
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setGoogleMapsUrl(val);
    if (val.includes('maps') || val.includes('http') || val.includes(',')) {
      parseGoogleMapsLink(val);
    }
  };

  // 1-Click Detect GPS Location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        setLat(userLat);
        setLng(userLng);
        if (!officeName) setOfficeName('Main Office');
        setGpsLoading(false);
        setSuccessMsg(`Current GPS acquired: [${userLat}, ${userLng}]`);
      },
      (err) => {
        setGpsLoading(false);
        setError(`GPS permission error: ${err.message}. Please allow location access in your browser.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save Geofence Location
  const handleSave = async (e) => {
    e.preventDefault();
    if (!officeName.trim()) {
      setError('Please provide an Office Name (e.g. Saroja Ramasamy Chettiar Samudhaya Koodam).');
      return;
    }
    if (!lat || !lng) {
      setError('Please provide valid Latitude and Longitude coordinates.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      await onLocationSaved({
        name: officeName.trim(),
        address: address.trim() || 'Office Premises',
        lat: Number(lat),
        lng: Number(lng),
        radiusMeters: Number(radiusMeters)
      });
      setSuccessMsg(`Geofence for "${officeName}" with ${radiusMeters}m radius saved successfully!`);
      setGoogleMapsUrl('');
    } catch (err) {
      setError(err.message || 'Failed to save location.');
    } finally {
      setSaving(false);
    }
  };

  // Google Maps Embed URL
  const embedMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=m&z=17&output=embed`;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-soft-sm space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-[#C7F436] flex items-center justify-center font-bold shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Add Office Location via Google Maps Link
            </h3>
            <p className="text-xs text-gray-500">
              Paste any Google Maps link — name, latitude, longitude are auto-extracted!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200 transition active:scale-95 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
          <span>{gpsLoading ? 'Detecting GPS...' : 'Use My Current GPS'}</span>
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- GOOGLE MAPS LINK INPUT --- */}
      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-emerald-600" />
            <span>Paste Google Maps Link Here:</span>
          </label>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Auto-Extracts Name & GPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={googleMapsUrl}
            onChange={handleUrlChange}
            placeholder="Paste URL (e.g. https://www.google.com/maps/place/Saroja+ramasamy+chettiar...)"
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-black shadow-sm"
          />
          <button
            type="button"
            onClick={() => parseGoogleMapsLink(googleMapsUrl)}
            className="px-5 py-3 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs rounded-xl transition shadow-md whitespace-nowrap active:scale-95"
          >
            Extract Location
          </button>
        </div>
      </div>

      {/* --- LIVE GOOGLE MAPS EMBED & VISUAL GEOFENCE --- */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
        <iframe
          title="Google Maps Location Preview"
          src={embedMapUrl}
          className="w-full h-72 sm:h-80 border-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Live Geofence Card on Map */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-extrabold text-gray-900 text-xs">
                {officeName || 'Selected Location'}
              </p>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
              GPS: [{lat}, {lng}] • Allowed Radius: <strong className="text-emerald-700 font-bold">{radiusMeters}m</strong>
            </p>
          </div>

          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* --- CHOOSE GEOFENCE RADIUS (METERS) --- */}
      <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold text-xs text-gray-900">Choose Geofence Radius (Meters)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Punch Boundary:</span>
            <span className="font-extrabold text-xs text-black bg-[#C7F436] px-3.5 py-1 rounded-full shadow-sm">
              {radiusMeters} Meters
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400">20m</span>
          <input
            type="range"
            min="20"
            max="1000"
            step="10"
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(Number(e.target.value))}
            className="flex-1 accent-black cursor-pointer h-2 bg-gray-200 rounded-lg"
          />
          <span className="text-[10px] font-bold text-gray-400">1000m</span>
        </div>

        {/* Quick Radius Preset Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-gray-400">Quick Presets:</span>
          {[
            { val: 50, label: '50m (Floor / Room)' },
            { val: 100, label: '100m (Standard Building)' },
            { val: 150, label: '150m (Premises & Parking)' },
            { val: 250, label: '250m (Campus)' },
            { val: 500, label: '500m (Tech Park)' }
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setRadiusMeters(preset.val)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full transition active:scale-95 ${
                radiusMeters === preset.val
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- FORM FIELDS: OFFICE NAME & COORDINATES --- */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Office / Branch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Saroja Ramasamy Chettiar Samudhaya Koodam"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-black font-semibold text-gray-900"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700 block mb-1">Address / Area / Landmark</label>
            <input
              type="text"
              placeholder="e.g. Pallipalayam, Tamil Nadu"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-black text-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Extracted Latitude (Lat)</label>
            <input
              type="number"
              step="any"
              required
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700 block mb-1">Extracted Longitude (Lng)</label>
            <input
              type="number"
              step="any"
              required
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-gray-500">
            Employees will be allowed to punch attendance within <strong className="text-black font-bold">{radiusMeters} meters</strong> of this spot.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs rounded-full shadow-md transition active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-[#C7F436]" />
            <span>{saving ? 'Saving Geofence...' : '+ Save Office Location'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
