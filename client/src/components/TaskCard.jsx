import React, { useState } from 'react';
import { 
  Bell, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  Video, 
  ChevronDown, 
  FileText 
} from 'lucide-react';

export default function TaskCard({ task, onVideoJoin, onSendEmail, onStatusChange }) {
  const [status, setStatus] = useState(task.status);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isLime = task.isHighlight;

  const handleStatusSelect = (newStatus) => {
    setStatus(newStatus);
    setDropdownOpen(false);
    onStatusChange && onStatusChange(task.id, newStatus);
  };

  // Google Meet Multi-Color Icon SVG
  const GoogleMeetIcon = () => (
    <div className="w-8 h-8 rounded-xl bg-white shadow-xs p-1.5 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path fill="#00832d" d="M3 7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
        <path fill="#00ac47" d="M15 10l5-4v12l-5-4v-4z"/>
        <path fill="#ffba00" d="M15 10v4l5-4-5 0z"/>
        <path fill="#ea4335" d="M20 6l-5 4v-4h5z"/>
        <path fill="#2684fc" d="M3 7l6 5-6 5V7z"/>
      </svg>
    </div>
  );

  return (
    <div 
      className={`task-card group rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 flex-1 select-none relative ${
        isLime 
          ? 'bg-[#C7F436] text-black shadow-lime-glow hover:shadow-soft-lg' 
          : 'bg-white hover:bg-[#FCFDFE] text-[#111317] border border-gray-200/70 shadow-soft-sm hover:shadow-soft-md'
      }`}
    >
      {/* Top Header: Client Info & Icons */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <img 
            src={task.clientAvatar} 
            alt={task.clientName} 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-black/10"
          />
          <div>
            <h4 className="font-bold text-[13.5px] leading-tight text-inherit">
              {task.clientName}
            </h4>
            <p className={`text-[10.5px] leading-tight mt-0.5 ${isLime ? 'text-black/75' : 'text-gray-500'}`}>
              {task.clientRole}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            title="Set Reminder"
            className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
              isLime ? 'hover:bg-black/10 text-black' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Bell className="w-3 h-3" />
          </button>
          <button 
            title="Open Task Details"
            className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
              isLime ? 'hover:bg-black/10 text-black' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Center Details: Task Type & Schedule / Amount */}
      <div className="my-2.5 sm:my-3">
        <div className="flex items-center gap-3">
          {task.taskType === 'Google Meet Call' ? (
            <GoogleMeetIcon />
          ) : (
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLime ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
              <FileText className="w-4 h-4" />
            </div>
          )}

          <div>
            <h3 className="font-extrabold text-[16px] tracking-tight leading-snug">
              {task.title}
            </h3>
            
            {task.amount ? (
              <p className={`text-xs font-semibold mt-0.5 ${isLime ? 'text-black/80' : 'text-gray-600'}`}>
                Amount <span className="font-bold text-inherit">{task.amount}</span>
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                {task.attendees && task.attendees.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {task.attendees.map((att, i) => (
                      <img 
                        key={i} 
                        src={att.avatar} 
                        alt={att.name} 
                        className="w-4 h-4 rounded-full object-cover ring-1 ring-white" 
                      />
                    ))}
                  </div>
                )}
                <span className={`text-[11px] font-semibold ${isLime ? 'text-black/75' : 'text-gray-500'}`}>
                  {task.scheduledDate} at {task.scheduledTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls: Status Dropdown & Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-2 relative">
        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              isLime 
                ? 'bg-black/10 hover:bg-black/15 text-black' 
                : 'bg-gray-100 hover:bg-gray-200/80 text-gray-800'
            }`}
          >
            {task.taskType === 'Google Meet Call' && <Phone className="w-3 h-3 stroke-[2.5]" />}
            <span>{status}</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute bottom-10 left-0 bg-white text-gray-900 border border-gray-100 rounded-2xl shadow-soft-lg py-1.5 w-44 z-50 animate-in fade-in zoom-in-95">
              {['Call scheduled', 'Waiting Proposal', 'In Review', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusSelect(st)}
                  className="w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-100 transition"
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons: Email & Video Call */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => onSendEmail && onSendEmail(task)}
            title="Compose Email"
            className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition shadow-sm"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>

          {task.taskType === 'Google Meet Call' && (
            <button 
              onClick={() => onVideoJoin && onVideoJoin(task)}
              title="Launch Instant Meeting"
              className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center transition shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
