import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Target, Award, TrendingUp, CheckCircle, Clock, Sparkles, Plus, X } from 'lucide-react';
import { fetchGoals, createGoal, updateGoalProgress } from '../services/api';

export default function PerformancePage(props) {
  const context = useOutletContext() || {};
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    owner: 'Alex Miller',
    targetQuarter: 'Q4 2026',
    progress: 0,
    status: 'In Progress'
  });

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await fetchGoals();
      setGoals(data || []);
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title) return;
    try {
      const created = await createGoal(goalForm);
      setGoals(prev => [created, ...prev]);
      setShowGoalModal(false);
      setGoalForm({
        title: '',
        description: '',
        owner: 'Alex Miller',
        targetQuarter: 'Q4 2026',
        progress: 0,
        status: 'In Progress'
      });
      if (context.showToast) context.showToast('New OKR Objective added!');
    } catch (err) {
      alert('Error creating goal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleProgressChange = async (goalId, newProgress) => {
    const prog = parseInt(newProgress, 10);
    const newStatus = prog >= 100 ? 'Completed' : prog >= 80 ? 'Exceeding' : prog >= 50 ? 'On Track' : 'In Progress';
    
    // Optimistic UI update
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress: prog, status: newStatus } : g));

    try {
      await updateGoalProgress(goalId, { progress: prog, status: newStatus });
    } catch (err) {
      console.error('Failed to update goal progress', err);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111317] tracking-tight">Goals & Performance (OKRs)</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Objective and Key Results tracking linked with organizational milestones</p>
        </div>

        <button 
          onClick={() => setShowGoalModal(true)}
          className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-full transition shadow-md active:scale-95"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Set New Objective</span>
        </button>
      </div>

      {/* Goal Cards */}
      <div className="space-y-4">
        {goals.map((g) => (
          <div 
            key={g.id}
            className="bg-white p-6 rounded-4xl border border-gray-200/70 shadow-soft-sm hover:shadow-soft-md transition flex flex-col justify-between"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    g.status === 'Completed' ? 'bg-emerald-100 text-emerald-900 font-extrabold' :
                    g.status === 'Exceeding' ? 'bg-[#C7F436] text-black font-extrabold' :
                    g.status === 'On Track' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {g.status}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">Deadline: {g.targetQuarter || g.deadline || 'Ongoing'}</span>
                </div>
                <h3 className="font-extrabold text-base text-gray-900 mt-2">{g.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{g.description}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-gray-900">{g.progress}%</span>
                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Owner: {g.owner}</p>
              </div>
            </div>

            {/* Progress Slider Bar */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Key Result Progress</span>
                <span className="font-mono">{g.progress}% of 100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={g.progress}
                onChange={(e) => handleProgressChange(g.id, e.target.value)}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          </div>
        ))}

        {goals.length === 0 && !loading && (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 text-gray-400 text-xs">
            No OKR goals defined yet. Click "Set New Objective" to create one.
          </div>
        )}
      </div>

      {/* Set New Objective Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">Set New OKR Objective</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Objective Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand Cloud Infrastructure Capacity"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description / Key Results</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details and quantitative targets..."
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Owner</label>
                  <input
                    type="text"
                    value={goalForm.owner}
                    onChange={(e) => setGoalForm({ ...goalForm, owner: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Target Quarter</label>
                  <input
                    type="text"
                    value={goalForm.targetQuarter}
                    onChange={(e) => setGoalForm({ ...goalForm, targetQuarter: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-black text-white rounded-full hover:bg-neutral-800 transition shadow-sm"
                >
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

