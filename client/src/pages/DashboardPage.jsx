import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';

import LeadCard from '../components/LeadCard';
import TaskCard from '../components/TaskCard';
import LiveVideoWidget from '../components/LiveVideoWidget';
import SummaryWidget from '../components/SummaryWidget';

export default function DashboardPage(props) {
  const context = useOutletContext() || {};
  const stats = props.stats ?? context.stats;
  const leads = props.leads ?? context.leads ?? [];
  const tasks = props.tasks ?? context.tasks ?? [];
  const summary = props.summary ?? context.summary;
  const onOpenNewTask = props.onOpenNewTask ?? context.onOpenNewTask;
  const onUpdateTaskStatus = props.onUpdateTaskStatus ?? context.onUpdateTaskStatus;
  const onUpdateGoal = props.onUpdateGoal ?? context.onUpdateGoal;
  const [selectedLeadFilter, setSelectedLeadFilter] = useState('All');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('All');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [showLeadSearchInput, setShowLeadSearchInput] = useState(false);
  const [showTaskSearchInput, setShowTaskSearchInput] = useState(false);

  const containerRef = useRef(null);
  const leadsContainerRef = useRef(null);
  const tasksContainerRef = useRef(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate top header
      gsap.from('.dash-header', {
        y: -15,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Animate lead cards
      gsap.from('.lead-card', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.1
      });

      // Animate task cards
      gsap.from('.task-card', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.2
      });

      // Animate right widgets
      gsap.from('.right-widget', {
        x: 20,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.15
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = 
      selectedLeadFilter === 'All' ? true :
      selectedLeadFilter === '🔥 Hot Client' ? (lead.interestLevel === 'Hot Client') :
      lead.interestLevel.toLowerCase().includes(selectedLeadFilter.toLowerCase());
    
    const matchesSearch = leadSearchQuery === '' ? true :
      lead.name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      lead.role.toLowerCase().includes(leadSearchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = 
      selectedTaskFilter === 'All' ? true :
      selectedTaskFilter === '🔥 Hot' ? (task.category === 'Hot' || task.isHighlight) :
      selectedTaskFilter === 'Due Today' ? (task.category === 'Due Today') :
      selectedTaskFilter === 'Overdue' ? (task.category === 'Overdue' || task.status === 'Overdue') :
      selectedTaskFilter === 'Completed' ? (task.status === 'Completed') : true;

    const matchesSearch = taskSearchQuery === '' ? true :
      task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      task.clientName.toLowerCase().includes(taskSearchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-2.5 sm:gap-3 min-h-full justify-between pb-6">
      {/* Top Main Workspace Header: Back Button, HELIXCRM Title, New Task Button, Stats */}
      <div className="dash-header flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Back Arrow + Brand Title + New Task Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            title="Previous View"
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-50 border border-gray-200/70 flex items-center justify-center transition shadow-soft-sm text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Title: HELIXCRM with stylized X */}
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-[#111317] flex items-center">
              <span>HELIX</span>
              <span className="text-[#C7F436] inline-block font-black relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                <span className="text-[#98D80A]">C</span>RM
              </span>
            </h1>
          </div>

          {/* + New Task Black Pill Button */}
          <button 
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-3.5 py-2 rounded-full transition shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Task</span>
          </button>
        </div>

        {/* Right Stats Badges: 34 Deals ↑3, 20 Won ↑2, 3 Lost ↑1 */}
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Deals */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-[#111317]">
              {stats?.totalDeals || 34}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-gray-400">Deals</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-[#D4F83A] px-1.5 py-0.5 rounded-full">
                ↑ 3
              </span>
            </div>
          </div>

          {/* Won */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-[#111317]">
              {stats?.wonDeals || 20}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-gray-400">won</span>
              <span className="text-[10px] font-bold text-orange-700 bg-[#FED7AA] px-1.5 py-0.5 rounded-full">
                ↑ 2
              </span>
            </div>
          </div>

          {/* Lost */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-black tracking-tight text-[#111317]">
              {stats?.lostDeals || 3}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-gray-400">lost</span>
              <span className="text-[10px] font-bold text-rose-700 bg-[#FECDD3] px-1.5 py-0.5 rounded-full">
                ↑ 1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Columns (Leads & Tasks) + Right 1 Column (Live Video & Summary) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 lg:gap-4 flex-1 min-h-0">
        
        {/* Left 8 or 9 Columns: New Leads + Your Days Tasks */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col justify-between gap-2.5 sm:gap-3">
          
          {/* ========================================= */}
          {/* SECTION 1: NEW LEADS / CANDIDATES */}
          {/* ========================================= */}
          <div className="flex flex-col gap-2">
            {/* Header: Title, Count, Search, Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#111317] tracking-tight">New Leads</h2>
                <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200/80 px-2 py-0.5 rounded-full shadow-xs">
                  {leads.length} Leads
                </span>
              </div>

              {/* Filter Tabs and Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Toggle */}
                {showLeadSearchInput ? (
                  <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-xs">
                    <input 
                      type="text" 
                      placeholder="Search leads..." 
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                      className="bg-transparent focus:outline-none w-32"
                      autoFocus
                    />
                    <button onClick={() => { setShowLeadSearchInput(false); setLeadSearchQuery(''); }}>✕</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowLeadSearchInput(true)}
                    title="Search Leads"
                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 transition shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                )}

                <button 
                  title="Filter options"
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 transition shadow-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', '🔥 Hot Client', 'Great interest', 'Medium interest', 'Low interest', 'Non interest'].map((tab) => {
                    const isActive = selectedLeadFilter === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSelectedLeadFilter(tab)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 ${
                          isActive 
                            ? 'bg-white text-black border border-gray-200/90 shadow-soft-sm font-bold' 
                            : 'text-gray-500 hover:text-black hover:bg-white/60'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Horizontal Cards Row */}
            <div 
              ref={leadsContainerRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                />
              ))}
            </div>
          </div>


          {/* ========================================= */}
          {/* SECTION 2: YOUR DAYS TASKS */}
          {/* ========================================= */}
          <div className="flex flex-col gap-2">
            {/* Header: Title, Count, Search, Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#111317] tracking-tight">Your Days Tasks</h2>
                <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200/80 px-2 py-0.5 rounded-full shadow-xs">
                  {tasks.length} Tasks
                </span>
              </div>

              {/* Actions & Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {showTaskSearchInput ? (
                  <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-xs">
                    <input 
                      type="text" 
                      placeholder="Search tasks..." 
                      value={taskSearchQuery}
                      onChange={(e) => setTaskSearchQuery(e.target.value)}
                      className="bg-transparent focus:outline-none w-32"
                      autoFocus
                    />
                    <button onClick={() => { setShowTaskSearchInput(false); setTaskSearchQuery(''); }}>✕</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowTaskSearchInput(true)}
                    title="Search Tasks"
                    className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 transition shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                )}

                <button 
                  title="Filter options"
                  className="w-7 h-7 rounded-full bg-white hover:bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 transition shadow-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', '🔥 Hot', 'Due Today', 'Overdue', 'Completed'].map((tab) => {
                    const isActive = selectedTaskFilter === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSelectedTaskFilter(tab)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150 ${
                          isActive 
                            ? 'bg-white text-black border border-gray-200/90 shadow-soft-sm font-bold' 
                            : 'text-gray-500 hover:text-black hover:bg-white/60'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tasks Cards Row */}
            <div 
              ref={tasksContainerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {filteredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={onUpdateTaskStatus}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 or 3 Columns: Live Video Call Widget & Summary Dark Widget */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col justify-between gap-3">
          {/* Top Right Widget: Live Video Call preview */}
          <div className="right-widget">
            <LiveVideoWidget />
          </div>

          {/* Bottom Right Widget: Sleek Obsidian Dark Summary Widget */}
          <div className="right-widget flex-1">
            <SummaryWidget 
              summary={summary} 
              onGoalUpdate={onUpdateGoal}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
