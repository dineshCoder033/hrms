import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  ArrowUpRight,
  Filter,
  DollarSign,
  Download
} from 'lucide-react';
import { getExportUrl } from '../services/api';

export default function EmployeesPage(props) {
  const context = useOutletContext() || {};
  const employees = props.employees ?? context.employees ?? [];
  const onOpenAddEmployee = props.onOpenAddEmployee ?? context.onOpenAddEmployee;
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const departments = ['All', 'Engineering', 'Human Resources', 'Finance', 'Operations', 'Design'];

  const filtered = employees.filter((emp) => {
    const matchesDept = selectedDept === 'All' ? true : emp.department === selectedDept;
    const matchesSearch = searchQuery === '' ? true : 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Team Directory</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage workforce profiles, roles, and compensation</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getExportUrl('employees')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2.5 rounded-full transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <button 
            onClick={onOpenAddEmployee}
            className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-full transition shadow-md active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-200/70 shadow-soft-sm">
          <span className="text-xs font-semibold text-gray-400">Total Workforce</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900">{employees.length}</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+4 this mo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200/70 shadow-soft-sm">
          <span className="text-xs font-semibold text-gray-400">Active Today</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900">
              {employees.filter(e => e.status === 'Active' || e.status === 'Remote').length}
            </span>
            <span className="text-[11px] font-bold text-gray-600 bg-[#C7F436] px-1.5 py-0.5 rounded-full">98% Online</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200/70 shadow-soft-sm">
          <span className="text-xs font-semibold text-gray-400">Remote Staff</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900">
              {employees.filter(e => e.status === 'Remote').length || 1}
            </span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Distributed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200/70 shadow-soft-sm">
          <span className="text-xs font-semibold text-gray-400">Average Performance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900">96.2%</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Top Tier</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border border-gray-200/70 shadow-soft-sm">
        {/* Department Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                selectedDept === dept
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 px-3.5 py-1.5 rounded-full text-xs">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, role or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none w-48 text-gray-800"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((emp) => (
          <div 
            key={emp.id}
            onClick={() => setSelectedEmployee(emp)}
            className="group bg-white hover:bg-[#FCFDFE] rounded-3xl p-5 border border-gray-200/70 hover:border-black/20 shadow-soft-sm hover:shadow-soft-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="relative">
                  <img 
                    src={emp.avatar} 
                    alt={emp.name} 
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 group-hover:scale-105 transition"
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                    emp.status === 'Active' ? 'bg-[#22C55E]' :
                    emp.status === 'Remote' ? 'bg-sky-500' : 'bg-amber-400'
                  }`} />
                </div>
                
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                  emp.status === 'Remote' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {emp.status}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-extrabold text-base text-gray-900 group-hover:text-black">
                  {emp.name}
                </h3>
                <p className="text-xs font-medium text-gray-500">{emp.role}</p>
                <span className="inline-block mt-1 text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  {emp.department}
                </span>
              </div>

              {/* Skills Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {emp.skills?.slice(0, 3).map((skill, i) => (
                  <span key={i} className="text-[10px] font-medium bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Contact & Salary */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="text-[11px]">{emp.location?.split(',')[0]}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400">Score</span>
                <span className="font-bold text-[11px] text-black bg-[#C7F436] px-2 py-0.5 rounded-full">
                  {emp.performanceScore}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Employee Slide-over / Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedEmployee.avatar} 
                  alt={selectedEmployee.name} 
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-100" 
                />
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">{selectedEmployee.name}</h3>
                  <p className="text-xs font-semibold text-gray-500">{selectedEmployee.role}</p>
                  <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    {selectedEmployee.department}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl">
                <div>
                  <span className="text-gray-400 font-medium">Work Email</span>
                  <p className="font-bold text-gray-800">{selectedEmployee.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Phone</span>
                  <p className="font-bold text-gray-800">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Annual Base Salary</span>
                  <p className="font-bold text-gray-800">${selectedEmployee.salary?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Reports To</span>
                  <p className="font-bold text-gray-800">{selectedEmployee.reportsTo}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-700 block mb-1">Competencies & Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmployee.skills?.map((sk, i) => (
                    <span key={i} className="bg-black/5 text-gray-700 font-medium px-2.5 py-1 rounded-full text-xs">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-xs font-bold rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Close
              </button>
              <button 
                onClick={() => alert(`Initiating direct sync call with ${selectedEmployee.name}`)}
                className="px-4 py-2 text-xs font-bold rounded-full bg-[#C7F436] hover:bg-[#B8E52B] text-black"
              >
                Schedule 1-on-1 Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
