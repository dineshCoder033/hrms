import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Clock, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  AlertTriangle,
  Umbrella,
  HeartPulse
} from 'lucide-react';
import ApplyLeaveModal from '../components/ApplyLeaveModal';
import { useAuth } from '../context/AuthContext';

export default function LeavesPage(props) {
  const context = useOutletContext() || {};
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const leaves = props.leaves ?? context.leaves ?? [];
  const onApplyLeave = props.onApplyLeave ?? context.onApplyLeave;
  const onUpdateStatus = props.onUpdateStatus ?? context.onUpdateLeaveStatus ?? props.onUpdateStatus;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const filtered = leaves.filter(l => {
    if (filter === 'All') return true;
    return l.status === filter;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Time Off & Leaves</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage leave balances, approvals, and company holidays</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-full transition shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Annual Vacation</span>
            <p className="text-2xl font-black text-gray-900 mt-1">15 <span className="text-xs font-normal text-gray-400">/ 20 days</span></p>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-2">
              Available
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C7F436]/30 flex items-center justify-center text-black">
            <Umbrella className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Casual Leave</span>
            <p className="text-2xl font-black text-gray-900 mt-1">8 <span className="text-xs font-normal text-gray-400">/ 12 days</span></p>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-2">
              Available
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Sick & Medical</span>
            <p className="text-2xl font-black text-gray-900 mt-1">6 <span className="text-xs font-normal text-gray-400">/ 8 days</span></p>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-2">
              Available
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400">Pending Approvals</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{leaves.filter(l => l.status === 'Pending').length}</p>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-2">
              Requires Action
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Leave Requests Pipeline Table */}
      <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="font-extrabold text-base text-gray-900">Leave Requests & Approvals</h3>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-200/70">
            {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                  filter === tab ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((req) => (
            <div 
              key={req.id}
              className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <img 
                  src={req.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                  alt={req.employeeName} 
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-200" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-gray-900">{req.employeeName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                      {req.leaveType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">"{req.reason}"</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-left md:text-right">
                  <span className="text-xs font-bold text-gray-800">
                    {req.startDate} → {req.endDate}
                  </span>
                  <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{req.daysCount} Day(s) requested</p>
                </div>

                {req.status === 'Pending' ? (
                  isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onUpdateStatus(req.id, 'Approved')}
                        className="px-3.5 py-1.5 rounded-full bg-[#C7F436] hover:bg-[#B8E52B] text-black font-bold text-xs flex items-center gap-1 transition shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(req.id, 'Rejected')}
                        className="px-3.5 py-1.5 rounded-full bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-700 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Awaiting Admin Approval
                    </span>
                  )
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ApplyLeaveModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyLeave={onApplyLeave}
      />
    </div>
  );
}
