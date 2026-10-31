import React, { useState } from 'react';
import { X, UserPlus, Briefcase, Mail, Phone, DollarSign, MapPin } from 'lucide-react';

export default function NewEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Engineering',
    email: '',
    phone: '',
    salary: 85000,
    location: 'Remote, US',
    status: 'Active',
    skills: 'React, Node.js, System Design',
    reportsTo: 'Engineering VP'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    onAddEmployee({
      ...formData,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      skills: formData.skills.split(',').map(s => s.trim()),
      salary: Number(formData.salary)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#C7F436]" />
            <h3 className="font-extrabold text-lg text-gray-900">Add Team Member</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Job Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Senior Frontend Dev"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Department</label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
              >
                <option value="Active">Active</option>
                <option value="Remote">Remote</option>
                <option value="Probation">Probation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Work Email</label>
              <input 
                type="email" 
                required
                placeholder="sarah@taskorbit.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Annual Salary ($)</label>
              <input 
                type="number" 
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Core Skills (comma separated)</label>
            <input 
              type="text" 
              placeholder="React, TypeScript, GraphQL"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold rounded-full bg-black hover:bg-gray-800 text-white transition shadow-md flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
