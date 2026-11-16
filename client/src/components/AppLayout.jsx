import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopScheduleBar from './TopScheduleBar';
import SidebarNav from './SidebarNav';
import NewTaskModal from './NewTaskModal';
import NewEmployeeModal from './NewEmployeeModal';
import MeetingsModal from './MeetingsModal';
import { 
  fetchStats, 
  fetchSchedule, 
  fetchMeetings,
  fetchLeads, 
  fetchTasks, 
  fetchEmployees, 
  fetchAttendance, 
  fetchLeaves, 
  fetchPayroll, 
  fetchSummary,
  createTask,
  updateTask,
  createEmployee,
  punchAttendance,
  createLeave,
  updateLeaveStatus,
  executeSalaryPayouts,
  updateGoal
} from '../services/api';

export default function AppLayout() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState(null);

  // Modals & Toast
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isMeetingsModalOpen, setIsMeetingsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          fetchStats(),
          fetchSchedule(),
          fetchLeads(),
          fetchTasks(),
          fetchEmployees(),
          fetchAttendance(),
          fetchLeaves(),
          fetchPayroll(),
          fetchSummary(),
          fetchMeetings()
        ]);

        const val = (idx, fallback = null) =>
          results[idx]?.status === 'fulfilled' ? results[idx].value : fallback;

        setStats(val(0));
        setSchedule(val(1));
        setLeads(val(2, []));
        setTasks(val(3, []));
        setEmployees(val(4, []));
        setAttendance(val(5, []));
        setLeaves(val(6, []));
        setPayrolls(val(7, []));
        setSummary(val(8));
        setMeetings(val(9, []));
      } catch (err) {
        console.error('Failed to load workspace data:', err);
        showToast(`Backend connection notice: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleAddTask = async (taskData) => {
    try {
      const created = await createTask(taskData);
      setTasks(prev => [created, ...prev]);
      showToast(`Task "${created.title}" scheduled successfully!`);
    } catch (err) {
      showToast(`Failed to add task: ${err.message}`);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => (t.id === taskId || t._id === taskId) ? { ...t, status: newStatus } : t));
      showToast(`Task status updated to ${newStatus}`);
    } catch (err) {
      showToast(`Failed to update task: ${err.message}`);
    }
  };

  const handleAddEmployee = async (empData) => {
    try {
      const res = await createEmployee(empData);
      const newEmp = res?.employee || res;
      setEmployees(prev => [newEmp, ...prev]);
      showToast(`Team member "${newEmp.name || newEmp.firstName || 'New Employee'}" onboarded!`);
    } catch (err) {
      showToast(`Failed to onboard employee: ${err.message}`);
    }
  };

  const reloadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to reload employees:', err);
    }
  };

  const handlePunchAttendance = async (type) => {
    try {
      const res = await punchAttendance(type);
      showToast(res.message || `Biometric punch ${type} recorded`);
      const updatedAttendance = await fetchAttendance();
      setAttendance(updatedAttendance || []);
    } catch (err) {
      showToast(`Punch failed: ${err.message}`);
    }
  };

  const handleApplyLeave = async (leaveData) => {
    try {
      const created = await createLeave(leaveData);
      setLeaves(prev => [created, ...prev]);
      showToast(`Leave application submitted for approval!`);
    } catch (err) {
      showToast(`Leave application failed: ${err.message}`);
    }
  };

  const handleUpdateLeaveStatus = async (leaveId, status) => {
    try {
      await updateLeaveStatus(leaveId, status);
      setLeaves(prev => prev.map(l => (l.id === leaveId || l._id === leaveId) ? { ...l, status } : l));
      showToast(`Leave request ${status.toLowerCase()}!`);
    } catch (err) {
      showToast(`Failed to update leave: ${err.message}`);
    }
  };

  const handleProcessPayroll = async (month) => {
    try {
      const targetMonth = month || new Date().toISOString().slice(0, 7);
      await executeSalaryPayouts(targetMonth);
      const updated = await fetchPayroll();
      setPayrolls(updated || []);
      showToast(`Salaries for ${targetMonth} processed & bank payouts triggered!`);
    } catch (err) {
      showToast(`Payroll processing notice: ${err.message}`);
    }
  };

  const handleUpdateGoal = async (description) => {
    try {
      await updateGoal(description);
      setSummary(prev => ({
        ...prev,
        goal: { ...prev?.goal, description }
      }));
      showToast(`Goal benchmark updated successfully!`);
    } catch (err) {
      showToast(`Failed to update goal: ${err.message}`);
    }
  };

  const contextValue = {
    loading,
    stats,
    schedule,
    meetings,
    leads,
    tasks,
    employees,
    setEmployees,
    reloadEmployees,
    fetchEmployees: reloadEmployees,
    attendance,
    leaves,
    payrolls,
    summary,
    showToast,
    onOpenNewTask: () => setIsTaskModalOpen(true),
    onOpenAddEmployee: () => setIsEmployeeModalOpen(true),
    onOpenMeetings: () => setIsMeetingsModalOpen(true),
    onUpdateTaskStatus: handleUpdateTaskStatus,
    onPunch: handlePunchAttendance,
    onApplyLeave: handleApplyLeave,
    onUpdateLeaveStatus: handleUpdateLeaveStatus,
    onProcessPayroll: handleProcessPayroll,
    onUpdateGoal: handleUpdateGoal
  };

  return (
    <div className="w-full h-screen bg-[#F4F6F8] text-[#111317] p-3 sm:p-4 lg:p-5 flex flex-col overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-6 z-50 bg-black text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C7F436] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <TopScheduleBar 
        meetings={meetings}
        onOpenMeetings={() => setIsMeetingsModalOpen(true)}
        onOpenNotifications={() => showToast('You have upcoming calendar syncs today.')}
        onOpenProfile={() => navigate('/employees')}
      />

      {/* Workspace Body: Left Nav + Outlet inside Scrollable Main */}
      <div className="flex-1 flex gap-3 sm:gap-4 lg:gap-5 items-stretch min-h-0 pt-2 pb-1">
        <SidebarNav />

        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 pb-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-black border-t-[#C7F436] rounded-full animate-spin" />
              <span className="text-xs font-semibold text-gray-500">Loading TaskOrbit Workspace...</span>
            </div>
          ) : (
            <Outlet context={contextValue} />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewTaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <NewEmployeeModal 
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <MeetingsModal
        isOpen={isMeetingsModalOpen}
        onClose={() => {
          setIsMeetingsModalOpen(false);
          fetchMeetings().then(setMeetings).catch(() => {});
        }}
      />
    </div>
  );
}
