import React, { useState } from 'react';
import { Calendar, Bell, ArrowUpRight, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopScheduleBar({ schedule, onOpenNotifications, onOpenProfile }) {
  const [activeDate] = useState(schedule?.date || '28 March');
  const [hasUnread, setHasUnread] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="w-full flex items-center justify-between gap-4 py-1 sm:py-1.5 px-1 shrink-0">
      {/* Left Logo: TaskOrbit CRM */}
      <div className="flex items-center gap-2.5 shrink-0 select-none">
        <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center p-1.5 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.8 3.8L12 11.8 5.2 8 12 4.2zM5 9.8l6 3.4v6.6l-6-3.3V9.8zm8 10v-6.6l6-3.4v6.7l-6 3.3z" fill="#C7F436" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-lg tracking-tight text-[#111317]">TaskOrbit</span>
          </div>
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase -mt-1 block">HRMS • CRM</span>
        </div>
      </div>

      {/* Center: Iconic Pill Schedule Bar */}
      <div className="hidden lg:flex items-center bg-[#111315] text-white rounded-full p-1 pl-3.5 pr-1.5 shadow-soft-md border border-black/80 max-w-[760px] w-full justify-between">
        <span className="text-xs font-semibold tracking-wide text-gray-200 shrink-0 mr-1">
          Your Schedule
        </span>

        {/* Date badge */}
        <div className="flex items-center gap-1.5 bg-[#1F2327] hover:bg-[#2A2F35] transition px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{activeDate}</span>
        </div>

        {/* Schedule Timeline Track */}
        <div className="relative flex items-center gap-3 bg-[#C7F436] text-black px-4 py-1.5 rounded-full font-medium text-xs shadow-inner">
          <div className="flex items-center gap-1.5 bg-black/10 hover:bg-black/20 px-2.5 py-1 rounded-full cursor-pointer transition">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" 
              alt="Sophia" 
              className="w-4 h-4 rounded-full object-cover ring-1 ring-black/20"
            />
            <span className="font-bold text-[11px]">30 min</span>
            <ArrowUpRight className="w-3 h-3 text-black stroke-[2.5]" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-800">2:00 pm</span>
            <div className="flex -space-x-1.5">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" 
                alt="Attendee 1" 
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white"
              />
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80" 
                alt="Attendee 2" 
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white"
              />
            </div>
          </div>

          {/* Current Live Time Indicator */}
          <div className="flex items-center justify-center">
            <span className="bg-black text-[#C7F436] font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              2:15 pm
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white flex items-center justify-center p-0.5 shadow-xs">
              <span className="text-[9px] font-black text-[#00832d]">M</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-800">3:00 pm</span>
            <div className="flex -space-x-1.5">
              <img 
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80" 
                alt="Attendee 3" 
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white"
              />
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=80" 
                alt="Attendee 4" 
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white"
              />
            </div>
          </div>
        </div>

        <button 
          title="Open Calendar Schedule"
          className="w-7 h-7 rounded-full bg-[#1F2327] hover:bg-[#2F353C] flex items-center justify-center text-white transition ml-1"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-3 shrink-0 relative">
        <button 
          onClick={() => { setHasUnread(false); onOpenNotifications && onOpenNotifications(); }}
          className="relative w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200/70 flex items-center justify-center transition shadow-soft-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-gray-700" />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* User Profile & Menu */}
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(prev => !prev)}
            className="flex items-center gap-2 cursor-pointer group bg-white hover:bg-gray-50 border border-gray-200/70 rounded-full py-1 px-2.5 shadow-soft-sm transition"
            title={`${user?.name || 'User'} Profile`}
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                alt="Profile" 
                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#C7F436] ring-1 ring-white"></span>
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-extrabold text-gray-900 leading-tight truncate max-w-[100px]">
                {user?.name || 'Workspace User'}
              </p>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                {user?.role || 'Staff'}
              </span>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-bold text-xs text-gray-800">{user?.name || 'Current User'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || 'user@taskorbit.com'}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); onOpenProfile && onOpenProfile(); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Team Directory
              </button>
              <button
                onClick={() => { setShowUserMenu(false); logout && logout(); }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
