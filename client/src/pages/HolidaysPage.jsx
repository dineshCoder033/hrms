import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday } from '../services/api';

export default function HolidaysPage() {
  const { user } = useAuth();
  const isAdminOrHr = ['Admin', 'HR'].includes(user?.role);

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isOptional, setIsOptional] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editIsOptional, setEditIsOptional] = useState(false);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const data = await fetchHolidays();
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createHoliday({ name, date, isOptional });
      setName('');
      setDate('');
      setIsOptional(false);
      loadHolidays();
    } catch (err) {
      setError(err.message || 'Failed to add holiday');
    }
  };

  const startEdit = (holiday) => {
    setEditingId(holiday._id);
    setEditName(holiday.name);
    setEditDate(holiday.date);
    setEditIsOptional(!!holiday.isOptional);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDate('');
    setEditIsOptional(false);
  };

  const handleUpdate = async (id) => {
    setError('');
    try {
      await updateHoliday(id, {
        name: editName,
        date: editDate,
        isOptional: editIsOptional
      });
      cancelEdit();
      loadHolidays();
    } catch (err) {
      setError(err.message || 'Failed to update holiday');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await deleteHoliday(id);
      loadHolidays();
    } catch (err) {
      setError(err.message || 'Failed to delete holiday');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Company Holidays</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Official holiday calendar used for Leave & Payroll working-day calculations
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isAdminOrHr && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-3xl p-4 border border-gray-100 shadow-soft-sm flex flex-wrap items-end gap-3 text-xs"
        >
          <div className="flex-1 min-w-[180px]">
            <label className="block font-semibold text-gray-600 mb-1">Holiday Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Independence Day"
              className="w-full px-3 py-2 rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-600 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200"
            />
          </div>
          <label className="flex items-center gap-1.5 py-2 cursor-pointer font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={isOptional}
              onChange={(e) => setIsOptional(e.target.checked)}
            />
            Optional
          </label>
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-black text-white font-bold flex items-center gap-1.5 hover:bg-gray-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Holiday
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-xs text-gray-400">Loading holidays...</p>
        ) : holidays.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">No holidays configured yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {holidays.map((h) => {
              const isEditing = editingId === h._id;
              return (
                <div key={h._id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {isEditing ? (
                    <div className="flex-1 flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                        placeholder="Holiday Name"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700"
                      />
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-600">
                        <input
                          type="checkbox"
                          checked={editIsOptional}
                          onChange={(e) => setEditIsOptional(e.target.checked)}
                        />
                        Optional
                      </label>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-gray-900">{h.name}</p>
                      <p className="text-gray-500">{h.date}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(h._id)}
                          className="px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold flex items-center gap-1 hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center gap-1 hover:bg-gray-200"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            h.isOptional ? 'bg-amber-50 text-amber-700' : 'bg-lime-100 text-gray-900'
                          }`}
                        >
                          {h.isOptional ? 'Optional' : 'Mandatory'}
                        </span>
                        {isAdminOrHr && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(h)}
                              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                              title="Edit Holiday"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(h._id)}
                              className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

