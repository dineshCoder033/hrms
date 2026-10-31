import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, Plus, UserPlus, CheckCircle, Clock, ArrowUpRight, Search, X, Building, DollarSign, MapPin } from 'lucide-react';
import { fetchJobs, createJob, fetchCandidates, updateCandidateStage } from '../services/api';

export default function RecruitmentPage(props) {
  const context = useOutletContext() || {};
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Job modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salaryRange: '$120k - $150k'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, candsData] = await Promise.all([
        fetchJobs().catch(() => []),
        fetchCandidates().catch(() => [])
      ]);
      setJobs(jobsData || []);
      setCandidates(candsData || []);
    } catch (err) {
      console.error('Failed to load recruitment data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title) return;
    try {
      const created = await createJob(jobForm);
      setJobs(prev => [created, ...prev]);
      setShowJobModal(false);
      setJobForm({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        salaryRange: '$120k - $150k'
      });
      if (context.showToast) context.showToast('Job opening posted successfully!');
    } catch (err) {
      alert('Error creating job: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStageChange = async (candId, newStage) => {
    try {
      await updateCandidateStage(candId, newStage);
      setCandidates(prev => prev.map(c => c.id === candId ? { ...c, stage: newStage } : c));
      if (context.showToast) context.showToast(`Candidate stage moved to ${newStage}`);
    } catch (err) {
      alert('Error updating stage: ' + (err.response?.data?.message || err.message));
    }
  };

  const stages = ['All', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

  const filteredCandidates = candidates.filter(cand => {
    const matchesStage = selectedStage === 'All' || cand.stage === selectedStage;
    const matchesSearch = !searchQuery || 
      (cand.name && cand.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cand.jobTitle && cand.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Recruitment & Talent CRM</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Applicant tracking pipeline, hiring workflows, and active requisitions</p>
        </div>

        <button 
          onClick={() => setShowJobModal(true)}
          className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-full transition shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Active Job Openings Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-base text-gray-900">Active Job Requisitions</h3>
          <span className="text-xs font-bold text-gray-400">{jobs.length} Positions</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobs.map((job, idx) => (
            <div 
              key={job.id || idx}
              className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-soft-sm hover:shadow-soft-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#648F00] bg-[#C7F436]/40 px-2.5 py-0.5 rounded-full">
                    {job.status || 'Active'}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">{job.type || 'Full-time'}</span>
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 mt-2.5 leading-snug">{job.title}</h4>
                <p className="text-xs text-gray-400 font-medium mt-1">{job.department} • {job.location}</p>
                {job.salaryRange && (
                  <p className="text-[11px] font-mono text-gray-600 mt-1 font-semibold">{job.salaryRange}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">{job.applicantsCount || 0} Candidates</span>
                <span className="text-[11px] text-gray-400 font-medium">Auto-Tracking</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates Pipeline */}
      <div className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-gray-900">Candidate Pipeline Evaluation</h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {filteredCandidates.length} Active Candidates
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Stage Filters */}
        <div className="flex items-center gap-1.5 flex-wrap mb-5">
          {stages.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStage(st)}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                selectedStage === st ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((cand) => (
            <div 
              key={cand.id}
              className="bg-white border border-gray-200/80 hover:border-black/30 rounded-3xl p-5 shadow-soft-sm hover:shadow-soft-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img 
                    src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'} 
                    alt={cand.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">{cand.name}</h4>
                    <p className="text-xs text-gray-400 font-medium">{cand.jobTitle || 'Applicant'}</p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">{cand.email}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Experience: {cand.experienceYears || 3} yrs</span>
                  <span className="font-bold text-amber-500">★ {cand.rating || 5}.0</span>
                </div>
              </div>

              {/* Stage Selector */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">Stage:</span>
                <select
                  value={cand.stage || 'Screening'}
                  onChange={(e) => handleStageChange(cand.id, e.target.value)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border border-gray-200 outline-none transition cursor-pointer ${
                    cand.stage === 'Hired' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    cand.stage === 'Offer' ? 'bg-[#C7F436]/40 text-black border-[#C7F436]' :
                    cand.stage === 'Interview' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    cand.stage === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
          {filteredCandidates.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 text-xs font-medium">
              No candidates found for stage: {selectedStage}
            </div>
          )}
        </div>
      </div>

      {/* Post New Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">Post New Job Opening</h3>
              <button onClick={() => setShowJobModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Frontend Architect"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Department</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  >
                    <option>Engineering</option>
                    <option>Infrastructure</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Human Resources</option>
                    <option>Sales & Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Type</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-black text-white rounded-full hover:bg-neutral-800 transition shadow-sm"
                >
                  Create Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

