import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bell, ArrowUpRight, LogOut, Video, CheckCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

export default function TopScheduleBar({ meetings = [], onOpenMeetings, onOpenNotifications, onOpenProfile }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(15);
      setNotifications(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Non-fatal if notifications fail
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short'
  });

  const liveTimeFormatted = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const activeMeetings = meetings.filter(m => m.status === 'Scheduled');
  const nextMeeting = activeMeetings[0];

  return (
    <header className="w-full flex items-center justify-between gap-4 py-1 sm:py-1.5 px-1 shrink-0">
      {/* Left Logo: TaskOrbit HRMS */}
      <div className="flex items-center gap-2.5 shrink-0 select-none">
        <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center p-1.5 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.8 3.8L12 11.8 5.2 8 12 4.2zM5 9.8l6.8 3.4v6.6l-6-3.3V9.8zm8 10v-6.6l6-3.4v6.7l-6 3.3z" fill="#C7F436" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-lg tracking-tight text-[#111317]">TaskOrbit</span>
          </div>
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase -mt-1 block">HRMS • SUITE</span>
        </div>
      </div>

      {/* Center: Live Pill Schedule Bar */}
      <div 
        onClick={() => onOpenMeetings && onOpenMeetings()}
        className="hidden lg:flex items-center bg-[#111315] text-white rounded-full p-1 pl-3.5 pr-1.5 shadow-soft-md border border-black/80 max-w-[760px] w-full justify-between cursor-pointer hover:border-white/30 transition"
        title="Click to view and schedule HR meetings"
      >
        <span className="text-xs font-semibold tracking-wide text-gray-200 shrink-0 mr-1">
          Your Schedule
        </span>

        {/* Live Date Badge */}
        <div className="flex items-center gap-1.5 bg-[#1F2327] px-3 py-1.5 rounded-full text-xs font-medium text-gray-300">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{todayFormatted}</span>
        </div>

        {/* Live Schedule Timeline Track */}
        <div className="relative flex items-center gap-3 bg-[#C7F436] text-black px-4 py-1.5 rounded-full font-medium text-xs shadow-inner">
          {nextMeeting ? (
            <>
              <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-0.5 rounded-full">
                <Video className="w-3.5 h-3.5 text-black" />
                <span className="font-bold text-[11px] truncate max-w-[140px]">{nextMeeting.title}</span>
              </div>

              <span className="text-[11px] font-extrabold text-gray-900">
                {new Date(nextMeeting.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div className="flex -space-x-1.5">
                {nextMeeting.attendees?.slice(0, 3).map((att, idx) => (
                  <span
                    key={idx}
                    className="w-5 h-5 rounded-full bg-black text-[#C7F436] text-[9px] font-bold flex items-center justify-center ring-1 ring-white"
                  >
                    {att.employee?.name?.charAt(0) || 'U'}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 px-2 py-0.5">
              <span className="text-[11px] font-bold text-gray-800">No upcoming meetings today</span>
              <span className="bg-black text-[#C7F436] font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                {liveTimeFormatted}
              </span>
            </div>
          )}
        </div>

        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenMeetings && onOpenMeetings(); }}
          title="Open Meetings Scheduler"
          className="w-7 h-7 rounded-full bg-[#1F2327] hover:bg-[#2F353C] flex items-center justify-center text-white transition ml-1"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-3 shrink-0 relative">
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu((prev) => !prev);
              setShowUserMenu(false);
              onOpenNotifications && onOpenNotifications();
            }}
            className="relative w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200/70 flex items-center justify-center transition shadow-soft-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-3.5 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await markAllNotificationsRead();
                      loadNotifications();
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={async () => {
                        if (!n.isRead) {
                          await markNotificationRead(n._id);
                          loadNotifications();
                        }
                        setShowNotifMenu(false);
                        if (n.link) navigate(n.link);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-gray-50 transition ${
                        !n.isRead ? 'bg-lime-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate">{n.title}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Menu */}
        <div className="relative">
          <div 
            onClick={() => { setShowUserMenu(prev => !prev); setShowNotifMenu(false); }}
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
                onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
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
