import React, { useState } from 'react';
import { X, Calendar, Clock, Video, User } from 'lucide-react';

export default function NewTaskModal({ isOpen, onClose, onAddTask }) {
  const [formData, setFormData] = useState({
    title: 'Google Meet Call',
    clientName: '',
    clientRole: '',
    taskType: 'Google Meet Call',
    scheduledDate: '28.03.2023',
    scheduledTime: '2 pm',
    category: 'Hot',
    amount: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName) return;
    onAddTask({
      ...formData,
      clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      status: 'Call scheduled',
      isHighlight: formData.category === 'Hot'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C7F436]" />
            <h3 className="font-extrabold text-lg text-gray-900">Create New HR Task</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Client / Employee Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. David Thompson"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Designation & Company</label>
            <input 
              type="text" 
              placeholder="e.g. CEO at Innovatek"
              value={formData.clientRole}
              onChange={(e) => setFormData({ ...formData, clientRole: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Task Type</label>
              <select 
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value, title: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
              >
                <option value="Google Meet Call">Google Meet Call</option>
                <option value="Send Proposal">Send Proposal</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Quarterly Review">Quarterly Review</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Priority / Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
              >
                <option value="Hot">🔥 Hot (Lime Highlight)</option>
                <option value="Due Today">Due Today</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Date</label>
              <input 
                type="text" 
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Time</label>
              <input 
                type="text" 
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {formData.taskType === 'Send Proposal' && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Amount / Package</label>
              <input 
                type="text" 
                placeholder="$20,000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-xs font-bold rounded-full bg-black hover:bg-gray-800 text-white transition shadow-md"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
