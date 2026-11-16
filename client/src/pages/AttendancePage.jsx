import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ArrowRight,
  Download,
  MapPin,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { 
  getExportUrl, 
  punchAttendance, 
  fetchNearestOffice, 
  reviewPunchApi, 
  fetchAttendance 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import OfficeLocationModal from '../components/OfficeLocationModal';

const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) => {
        let msg = 'Location access failed. Please enable GPS and try again.';
        if (e.code === 1) {
          msg = 'Location permission denied. Please allow GPS/Location access in your browser to punch attendance.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

export default function AttendancePage(props) {
  const context = useOutletContext() || {};
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(props.attendance ?? context.attendance ?? []);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punching, setPunching] = useState(false);
  const [punchMessage, setPunchMessage] = useState(null);
  const [punchError, setPunchError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending'

  const isPrivileged = user?.role === 'Admin';

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect live GPS location & distance to office
  useEffect(() => {
    let isMounted = true;
    getPosition()
      .then(async (pos) => {
        if (!isMounted) return;
        try {
          const nearest = await fetchNearestOffice(pos.lat, pos.lng);
          if (isMounted) setLocationInfo({ ...nearest, userCoords: pos });
        } catch {
          // Ignore location ping errors
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await fetchAttendance();
      setAttendance(data);
    } catch {
      // Ignore
    }
  };

  const handlePunch = async (type) => {
    setPunching(true);
    setPunchError(null);
    setPunchMessage(null);

    try {
      let coords;
      try {
        coords = await getPosition();
      } catch (geoErr) {
        throw new Error(geoErr.message || 'Please enable Location (GPS) permission to punch attendance.');
      }

      const res = await punchAttendance({
        type,
        lat: coords.lat,
        lng: coords.lng,
        accuracy: coords.accuracy
      });

      setPunchMessage(res.message);
      await loadAttendance();
      if (context.fetchAttendance) context.fetchAttendance();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to record attendance punch.';
      setPunchError(msg);
    } finally {
      setPunching(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await reviewPunchApi(id, { status });
      await loadAttendance();
    } catch (err) {
      alert(err.message);
    }
  };

  // Find today's record for logged-in employee
  const todayStr = new Date().toISOString().split('T')[0];
  const myRecordToday = attendance.find(
    (a) => a.date === todayStr && (a.employeeId === user?.employeeId || a.employeeId?._id === user?.employeeId)
  );

  const pendingPunches = attendance.filter((a) => a.approvalStatus === 'Pending');
  const filteredList = activeTab === 'pending' ? pendingPunches : attendance;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Time & Attendance</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Geofence verified punch clock, shift tracking & audit logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {['Admin', 'HR'].includes(user?.role) && (
            <>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2 rounded-full transition shadow-soft-sm hover:border-black active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Office Geofences</span>
              </button>

              <a
                href={getExportUrl('attendance')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2 rounded-full transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            </>
          )}

          {/* Live Date/Time Badge */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200/80 shadow-soft-sm">
            <Clock className="w-4 h-4 text-gray-500 animate-spin-slow" />
            <span className="font-mono font-bold text-xs text-gray-800">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Punch Clock & Shift Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hero Card: Punch Clock Action */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#111316] to-[#1E232A] text-white p-6 rounded-4xl shadow-soft-lg flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C7F436] tracking-wider uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geofence Terminal</span>
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7F436] animate-ping" />
            </div>

            <div className="my-5 text-center">
              <p className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-400 mt-1">Shift: 09:00 AM - 06:00 PM (Grace: 30 mins)</p>

              {/* Live Distance Pill */}
              {locationInfo && locationInfo.office && (
                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  locationInfo.isInside 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${locationInfo.isInside ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>
                    {locationInfo.office.name}: {locationInfo.distanceMeters}m away ({locationInfo.isInside ? 'Inside Geofence' : 'Outside Geofence'})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-2.5">
            {/* Toast-style Alert Messages */}
            {punchError && (
              <div className="bg-rose-500/90 text-white shadow-xl border border-rose-400 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-white animate-bounce" />
                  <span>{punchError}</span>
                </div>
                <button onClick={() => setPunchError(null)} className="text-white/80 hover:text-white font-black text-sm px-1">
                  ✕
                </button>
              </div>
            )}

            {punchMessage && (
              <div className="bg-emerald-600 text-white shadow-xl border border-emerald-400 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-[#C7F436]" />
                  <span>{punchMessage}</span>
                </div>
                <button onClick={() => setPunchMessage(null)} className="text-white/80 hover:text-white font-black text-sm px-1">
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePunch('in')}
                disabled={punching || !!myRecordToday?.checkInTime}
                className="py-3.5 rounded-2xl font-black text-xs tracking-wide transition shadow-lg flex items-center justify-center gap-1.5 active:scale-98 bg-[#C7F436] hover:bg-[#B8E52B] text-black disabled:opacity-40 disabled:pointer-events-none"
              >
                <UserCheck className="w-4 h-4" />
                <span>{myRecordToday?.checkInTime ? `Punched In (${myRecordToday.checkIn})` : 'Punch IN'}</span>
              </button>

              <button
                onClick={() => handlePunch('out')}
                disabled={punching || !myRecordToday?.checkInTime || !!myRecordToday?.checkOutTime}
                className="py-3.5 rounded-2xl font-black text-xs tracking-wide transition shadow-lg flex items-center justify-center gap-1.5 active:scale-98 bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-40 disabled:pointer-events-none"
              >
                <Clock className="w-4 h-4" />
                <span>{myRecordToday?.checkOutTime ? `Punched Out (${myRecordToday.checkOut})` : 'Punch OUT'}</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#C7F436]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Hero: Metric Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">Today's Logged Hours</span>
              <p className="text-3xl font-black text-gray-900 mt-2">
                {myRecordToday?.totalHours ? `${myRecordToday.totalHours} hrs` : '--'}
              </p>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-[#C7F436] h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, ((myRecordToday?.totalHours || 0) / 8) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">Shift Status Today</span>
              <p className="text-2xl font-black text-gray-900 mt-2">
                {myRecordToday?.status || 'Pending Check-In'}
              </p>
            </div>
            <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {myRecordToday?.geofenceStatus 
                ? `${myRecordToday.geofenceStatus} Check-In (${myRecordToday.approvalStatus})` 
                : 'Awaiting Punch'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">Outside Punch Policy</span>
              <p className="text-xl font-bold text-gray-900 mt-1">Pending Approval</p>
            </div>
            <span className="text-xs text-gray-500 mt-2">Outside punches require Manager or HR confirmation</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">Pending Approvals</span>
              <p className="text-3xl font-black text-gray-900 mt-1">{pendingPunches.length}</p>
            </div>
            <span className="text-xs font-semibold text-gray-500 mt-2">Awaiting Manager review</span>
          </div>
        </div>

      </div>

      {/* Check-In Table & Tab Filtering */}
      <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-base text-gray-900">Attendance Records</h3>
            {isPrivileged && (
              <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-bold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-full transition ${activeTab === 'all' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1 rounded-full transition flex items-center gap-1 ${activeTab === 'pending' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                >
                  <span>Pending Outside Punches</span>
                  {pendingPunches.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                      {pendingPunches.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Check In</th>
                <th className="pb-3">Check Out</th>
                <th className="pb-3">Total Hours</th>
                <th className="pb-3">Geofence</th>
                <th className="pb-3">Status</th>
                {isPrivileged && <th className="pb-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {filteredList.map((rec) => (
                <tr key={rec._id || rec.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3 font-bold text-gray-900">{rec.employeeName}</td>
                  <td className="py-3 text-gray-500">{rec.date}</td>
                  <td className="py-3 text-gray-700 font-semibold">{rec.checkIn || '-'}</td>
                  <td className="py-3 text-gray-700">{rec.checkOut || '-'}</td>
                  <td className="py-3 text-gray-900 font-bold">{rec.totalHours || 0} hrs</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      rec.geofenceStatus === 'Inside' ? 'bg-emerald-100 text-emerald-800' :
                      rec.geofenceStatus === 'Outside' ? 'bg-amber-100 text-amber-800' :
                      'bg-sky-100 text-sky-800'
                    }`}>
                      {rec.geofenceStatus || 'Office'}
                      {rec.checkInLocation?.distanceMeters ? ` (${rec.checkInLocation.distanceMeters}m)` : ''}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        rec.status === 'Present' ? 'bg-[#C7F436] text-black' :
                        rec.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                        rec.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rec.status}
                      </span>
                      {rec.approvalStatus === 'Pending' && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  {isPrivileged && (
                    <td className="py-3 text-right">
                      {rec.approvalStatus === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReview(rec._id, 'Approved')}
                            className="p-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                            title="Approve Outside Punch"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => handleReview(rec._id, 'Rejected')}
                            className="p-1 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition"
                            title="Reject Outside Punch"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geofence Locations Modal */}
      <OfficeLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}
