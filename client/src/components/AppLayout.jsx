import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopScheduleBar from './TopScheduleBar';
import SidebarNav from './SidebarNav';
import NewTaskModal from './NewTaskModal';
import NewEmployeeModal from './NewEmployeeModal';
import { 
  fetchStats, 
  fetchSchedule, 
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
  processPayroll,
  updateGoal
} from '../services/api';

export default function AppLayout() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState(null);
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
        const [st, sc, ld, tk, emp, att, lev, pay, sm] = await Promise.all([
          fetchStats(),
          fetchSchedule(),
          fetchLeads(),
          fetchTasks(),
          fetchEmployees(),
          fetchAttendance(),
          fetchLeaves(),
          fetchPayroll(),
          fetchSummary()
        ]);

        setStats(st);
        setSchedule(sc);
        setLeads(ld || []);
        setTasks(tk || []);
        setEmployees(emp || []);
        setAttendance(att || []);
        setLeaves(lev || []);
        setPayrolls(pay || []);
        setSummary(sm);
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
      const created = await createEmployee(empData);
      setEmployees(prev => [created, ...prev]);
      showToast(`Team member "${created.name}" onboarded!`);
    } catch (err) {
      showToast(`Failed to onboard employee: ${err.message}`);
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

  const handleProcessPayroll = async () => {
    try {
      await processPayroll();
      setPayrolls(prev => prev.map(p => ({ ...p, paymentStatus: 'Paid' })));
      showToast(`All salaries processed & bank deposits triggered!`);
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
    leads,
    tasks,
    employees,
    attendance,
    leaves,
    payrolls,
    summary,
    showToast,
    onOpenNewTask: () => setIsTaskModalOpen(true),
    onOpenAddEmployee: () => setIsEmployeeModalOpen(true),
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
        schedule={schedule}
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
    </div>
  );
}
