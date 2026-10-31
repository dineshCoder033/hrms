import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Coffee, 
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';
import { getExportUrl } from '../services/api';

export default function AttendancePage(props) {
  const context = useOutletContext() || {};
  const attendance = props.attendance ?? context.attendance ?? [];
  const onPunch = props.onPunch ?? context.onPunch;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPunchedIn, setIsPunchedIn] = useState(true);
  const [punchMessage, setPunchMessage] = useState(null);

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunchToggle = () => {
    const nextState = !isPunchedIn;
    setIsPunchedIn(nextState);
    const msg = nextState ? 'Successfully Punched IN at ' : 'Successfully Punched OUT at ';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setPunchMessage(msg + timeStr);
    onPunch && onPunch(nextState ? 'in' : 'out');
    setTimeout(() => setPunchMessage(null), 4000);
  };

  // Calendar mock days for October
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Time & Attendance</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time attendance logging, punch clock & monthly calendar</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getExportUrl('attendance')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2 rounded-full transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {/* Live Date/Time Badge */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200/80 shadow-soft-sm">
            <Clock className="w-4 h-4 text-gray-500 animate-spin-slow" />
            <span className="font-mono font-bold text-xs text-gray-800">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-semibold text-gray-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Punch Clock & Shift Stats Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hero Card: Punch Clock Action */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#111316] to-[#1E232A] text-white p-6 rounded-4xl shadow-soft-lg flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C7F436] tracking-wider uppercase">Live Biometric Terminal</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7F436] animate-ping" />
            </div>

            <div className="my-6 text-center">
              <p className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-400 mt-1">General Office Shift (09:00 AM - 06:00 PM)</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <button
              onClick={handlePunchToggle}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 active:scale-98 ${
                isPunchedIn
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-[#C7F436] hover:bg-[#B8E52B] text-black shadow-lime-glow'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>{isPunchedIn ? 'Punch OUT for Today' : 'Punch IN for Shift'}</span>
            </button>

            {punchMessage && (
              <div className="bg-white/10 border border-white/20 text-[#C7F436] p-2.5 rounded-xl text-xs font-semibold text-center animate-pulse">
                ✓ {punchMessage}
              </div>
            )}
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#C7F436]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Hero: Metric Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">Today's Logged Hours</span>
              <p className="text-3xl font-black text-gray-900 mt-2">7h 45m</p>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-[#C7F436] h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">On-Time Punctuality</span>
              <p className="text-3xl font-black text-gray-900 mt-2">96.4%</p>
            </div>
            <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Top 5% across organization
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">Break Balance</span>
              <p className="text-3xl font-black text-gray-900 mt-2">45 mins</p>
            </div>
            <span className="text-xs text-gray-500 mt-2">15 mins utilized for lunch</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400">Monthly Working Days</span>
              <p className="text-3xl font-black text-gray-900 mt-2">22 Days</p>
            </div>
            <span className="text-xs font-semibold text-gray-500 mt-2">18 Completed • 4 Remaining</span>
          </div>
        </div>

      </div>

      {/* Monthly Attendance Calendar Heatmap */}
      <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gray-700" />
            <h3 className="font-extrabold text-base text-gray-900">October 2026 Attendance Heatmap</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C7F436]" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Late</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Weekend</span>
          </div>
        </div>

        {/* 31 days calendar grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-16 gap-2">
          {daysInMonth.map((d) => {
            const isWeekend = d % 7 === 0 || d % 7 === 6;
            const isToday = d === 24;
            const isLate = d === 12;

            return (
              <div 
                key={d}
                className={`h-16 rounded-2xl p-2 flex flex-col justify-between text-xs transition select-none ${
                  isToday ? 'ring-2 ring-black bg-[#C7F436]/30 font-bold' :
                  isWeekend ? 'bg-gray-50 text-gray-400' :
                  isLate ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                  'bg-emerald-50/70 text-emerald-900 border border-emerald-100 hover:scale-105'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{d}</span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                </div>
                <span className="text-[10px] font-semibold opacity-80">
                  {isWeekend ? 'Off' : isLate ? '9:35 AM' : '8.5 hrs'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Team Check-In Table */}
      <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm">
        <h3 className="font-extrabold text-base text-gray-900 mb-4">Live Check-In Roster</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Check In</th>
                <th className="pb-3">Check Out</th>
                <th className="pb-3">Total Hours</th>
                <th className="pb-3">Work Mode</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3 font-bold text-gray-900">{rec.employeeName}</td>
                  <td className="py-3 text-gray-500">{rec.date}</td>
                  <td className="py-3 text-gray-700 font-semibold">{rec.checkIn}</td>
                  <td className="py-3 text-gray-700">{rec.checkOut}</td>
                  <td className="py-3 text-gray-900 font-bold">{rec.totalHours} hrs</td>
                  <td className="py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {rec.workType}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      rec.status === 'Present' ? 'bg-[#C7F436] text-black' :
                      rec.status === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
