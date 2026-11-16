import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  Check, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Users, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import { 
  fetchMeetings, 
  respondToMeetingApi, 
  cancelMeetingApi, 
  getMeetingIcsUrl 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import NewMeetingModal from './NewMeetingModal';

export default function MeetingsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const isPrivileged = ['Admin', 'HR', 'Manager'].includes(user?.role);

  useEffect(() => {
    if (isOpen) {
      loadMeetings();
    }
  }, [isOpen]);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (id, response) => {
    try {
      await respondToMeetingApi(id, response);
      await loadMeetings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      await cancelMeetingApi(id);
      await loadMeetings();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-[#C7F436]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Meetings & Calendar Sync</h3>
              <p className="text-xs text-gray-500 font-medium">HR check-ins, team syncs, and 1-on-1s</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPrivileged && (
              <button
                onClick={() => setIsNewMeetingOpen(true)}
                className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2 rounded-full transition shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Schedule Meeting</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {meetings.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No meetings scheduled yet. Click "Schedule Meeting" to create one.
            </div>
          ) : (
            meetings.map((m) => {
              const start = new Date(m.startAt);
              const end = new Date(m.endAt);
              const dateStr = start.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              // Check current user RSVP
              const myRsvp = m.attendees.find(
                a => a.employee?._id === user?.employeeId || a.employee === user?.employeeId
              );

              const isCancelled = m.status === 'Cancelled';
              const isOrganizer = m.organizer?._id === user?.employeeId || m.organizer === user?.employeeId;

              return (
                <div
                  key={m._id}
                  className={`p-5 rounded-3xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCancelled 
                      ? 'bg-gray-50/70 border-gray-200 opacity-60' 
                      : 'bg-white border-gray-200/80 hover:border-black shadow-soft-sm'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900">{m.title}</span>
                      {isCancelled ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Cancelled
                        </span>
                      ) : (
                        <span className="bg-[#C7F436]/40 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {m.mode}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{dateStr}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{timeStr}</span>
                      </span>
                      {m.mode === 'Online' && m.meetLink && !isCancelled && (
                        <a
                          href={m.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Online Call</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {m.mode === 'Office' && m.room && (
                        <span className="flex items-center gap-1 text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{m.room}</span>
                        </span>
                      )}
                    </div>

                    {/* Attendees Avatar Stack */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                      <div className="flex -space-x-1.5">
                        {m.attendees.slice(0, 5).map((a, i) => (
                          <span
                            key={i}
                            title={`${a.employee?.name || 'Attendee'} (${a.response})`}
                            className="w-5 h-5 rounded-full bg-gray-200 border border-white text-[9px] font-bold flex items-center justify-center text-gray-700"
                          >
                            {a.employee?.name?.charAt(0) || 'U'}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] font-medium">
                        {m.attendees.length} participant{m.attendees.length > 1 ? 's' : ''} • Organized by {m.organizer?.name || 'HR'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & RSVP */}
                  {!isCancelled && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Calendar ICS Download */}
                      <a
                        href={getMeetingIcsUrl(m._id)}
                        target="_blank"
                        rel="noreferrer"
                        title="Download .ICS for Google / Apple / Outlook Calendar"
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {/* Attendee RSVP buttons */}
                      {myRsvp && myRsvp.response === 'Pending' && (
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                          <button
                            onClick={() => handleRsvp(m._id, 'Accepted')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRsvp(m._id, 'Declined')}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-600 hover:text-rose-600 transition"
                          >
                            <X className="w-3 h-3 stroke-[3]" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}

                      {myRsvp && myRsvp.response !== 'Pending' && (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          myRsvp.response === 'Accepted' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {myRsvp.response}
                        </span>
                      )}

                      {/* Cancel Meeting button */}
                      {(isOrganizer || ['Admin', 'HR'].includes(user?.role)) && (
                        <button
                          onClick={() => handleCancel(m._id)}
                          title="Cancel Meeting"
                          className="p-2 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      <NewMeetingModal
        isOpen={isNewMeetingOpen}
        onClose={() => setIsNewMeetingOpen(false)}
        onMeetingCreated={loadMeetings}
      />
    </div>
  );
}

