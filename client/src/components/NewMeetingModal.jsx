import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Users, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { createMeetingApi, fetchEmployees } from '../services/api';

export default function NewMeetingModal({ isOpen, onClose, onMeetingCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attendeeIds, setAttendeeIds] = useState([]);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [mode, setMode] = useState('Online');
  const [meetLink, setMeetLink] = useState('');
  const [room, setRoom] = useState('');
  const [force, setForce] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [conflictPrompt, setConflictPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set default start time (next hour) & end time (+45m)
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      const end = new Date(now.getTime() + 45 * 60000);

      // Format for datetime-local input
      const pad = (n) => String(n).padStart(2, '0');
      const formatLocal = (d) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

      setStartAt(formatLocal(now));
      setEndAt(formatLocal(end));

      fetchEmployees().then(setEmployees).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAttendee = (empId) => {
    setAttendeeIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleSubmit = async (e, forceSchedule = false) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError(null);
    setWarning(null);

    if (attendeeIds.length === 0) {
      setError('Please select at least one colleague to attend.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await createMeetingApi({
        title,
        description,
        attendeeIds,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        mode,
        meetLink,
        room,
        force: forceSchedule || force
      });

      if (res.warning) {
        setWarning(res.warning);
      }

      if (onMeetingCreated) {
        onMeetingCreated(res.data);
      }

      setTimeout(() => {
        onClose();
        resetForm();
      }, res.warning ? 2000 : 400);

    } catch (err) {
      if (err.message && err.message.includes('Participant conflict')) {
        setConflictPrompt(true);
      }
      setError(err.message || 'Failed to schedule meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAttendeeIds([]);
    setMode('Online');
    setMeetLink('');
    setRoom('');
    setForce(false);
    setError(null);
    setWarning(null);
    setConflictPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-[#C7F436]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Schedule New Meeting</h3>
              <p className="text-xs text-gray-500 font-medium">Automatic participant conflict checking and calendar syncing</p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); onClose(); }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              {conflictPrompt && (
                <button
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  className="self-start text-[11px] underline font-bold text-rose-900 hover:text-black"
                >
                  Override conflict and Force Schedule anyway →
                </button>
              )}
            </div>
          )}

          {warning && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-500 font-semibold mb-1">Meeting Title</label>
            <input
              type="text"
              placeholder="e.g. Q4 Strategy Alignment or 1-on-1 Performance Check-In"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs focus:outline-none focus:border-black font-semibold"
              >
                <option value="Online">Online Video Call</option>
                <option value="Office">In-Office Conference Room</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">
                {mode === 'Online' ? 'Meeting Link (Optional - Auto generated if blank)' : 'Conference Room Name'}
              </label>
              <input
                type="text"
                placeholder={mode === 'Online' ? 'https://meet.google.com/...' : 'e.g. Room 4B - Andromeda'}
                value={mode === 'Online' ? meetLink : room}
                onChange={(e) => mode === 'Online' ? setMeetLink(e.target.value) : setRoom(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Attendee Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-500 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-600" />
                <span>Select Attendees ({attendeeIds.length} chosen)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-200">
              {employees.map(emp => {
                const selected = attendeeIds.includes(emp._id || emp.id);
                return (
                  <button
                    key={emp._id || emp.id}
                    type="button"
                    onClick={() => toggleAttendee(emp._id || emp.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition ${
                      selected 
                        ? 'bg-black text-white font-bold shadow-sm' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80 font-medium'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selected ? 'bg-[#C7F436]' : 'bg-gray-300'}`} />
                    <span className="truncate text-[11px]">{emp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-gray-500 font-semibold mb-1">Description / Agenda</label>
            <textarea
              rows={2}
              placeholder="Outline meeting discussion topics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-full transition shadow-md active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Schedule Meeting</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

