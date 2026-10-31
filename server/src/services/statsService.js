const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const Goal = require('../models/Goal');
const Job = require('../models/Job');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('./dataService');
const ApiError = require('../errors/ApiError');

// Default initial goals
let memoryGoals = [
  {
    id: 'goal-1',
    title: 'Security Incident Mitigation Benchmark',
    description: 'Reduce the number of security incidents by 50%. This goal is quantitative and measurable.',
    ownerName: 'Alex Miller',
    ownerRole: 'Security Lead',
    progress: 68,
    deadline: 'Q4 2026',
    category: 'Engineering',
    status: 'On Track'
  },
  {
    id: 'goal-2',
    title: 'Workforce Retention & Culture Program',
    description: 'Achieve >95% employee satisfaction index and establish mentorship track for junior and mid-level engineers.',
    ownerName: 'Sophia Martinez',
    ownerRole: 'Head of People',
    progress: 84,
    deadline: 'Q4 2026',
    category: 'Culture',
    status: 'Exceeding'
  },
  {
    id: 'goal-3',
    title: 'Infrastructure Cloud Cost Optimization',
    description: 'Streamline container clusters and database read replicas to trim monthly cloud expenditure by 22%.',
    ownerName: 'Liam Anderson',
    ownerRole: 'Lead Financial Analyst',
    progress: 45,
    deadline: 'Q1 2027',
    category: 'Operations',
    status: 'In Progress'
  }
];

const getStats = async () => {
  if (getIsConnected()) {
    const today = new Date().toISOString().split('T')[0];
    const [empCount, pendingLeaves, payrolls, attendanceToday, jobsCount] = await Promise.all([
      Employee.countDocuments(),
      Leave.countDocuments({ status: 'Pending' }),
      Payroll.find(),
      Attendance.find({ date: today }),
      Job.countDocuments({ status: 'Active' })
    ]);

    const totalPayroll = payrolls.reduce((acc, curr) => acc + (curr.netPayable || 0), 0);
    const presentCount = attendanceToday.filter(a => a.status === 'Present').length;
    const attendanceRate = empCount > 0 ? Number(((presentCount / empCount) * 100).toFixed(1)) : 96.4;

    return {
      totalDeals: memoryStore.stats.totalDeals,
      dealsChange: memoryStore.stats.dealsChange,
      wonDeals: memoryStore.stats.wonDeals,
      wonChange: memoryStore.stats.wonChange,
      lostDeals: memoryStore.stats.lostDeals,
      lostChange: memoryStore.stats.lostChange,
      activeEmployees: empCount,
      totalPayroll: totalPayroll || memoryStore.stats.totalPayroll,
      attendanceRate: attendanceRate > 0 ? attendanceRate : 96.4,
      pendingLeaves,
      openJobs: jobsCount
    };
  }

  return memoryStore.stats;
};

const getSchedule = () => {
  return memoryStore.schedule;
};

const getSummary = () => {
  return memoryStore.summaryWidget;
};

const updateSummaryGoal = (description) => {
  if (description) {
    memoryStore.summaryWidget.goal.description = description;
  }
  return memoryStore.summaryWidget.goal;
};

// --- OKR / GOALS ENGINE ---
const getAllGoals = async () => {
  if (getIsConnected()) {
    const goals = await Goal.find().sort({ createdAt: -1 });
    if (goals.length > 0) return goals;
    // Auto-seed initial goals if empty
    return await Goal.insertMany(memoryGoals);
  }
  return memoryGoals;
};

const createGoal = async (data) => {
  if (getIsConnected()) {
    return await Goal.create(data);
  }
  const newGoal = { id: `goal-${Date.now()}`, ...data };
  memoryGoals.unshift(newGoal);
  return newGoal;
};

const updateGoalProgress = async (id, progress, status) => {
  if (getIsConnected()) {
    const update = { progress };
    if (status) update.status = status;
    const updated = await Goal.findByIdAndUpdate(id, update, { new: true });
    if (!updated) throw ApiError.notFound('Goal not found');
    return updated;
  }

  const goal = memoryGoals.find(g => g.id === id || g._id?.toString() === id);
  if (!goal) throw ApiError.notFound('Goal not found');
  goal.progress = progress;
  if (status) goal.status = status;
  return goal;
};

// --- HR ANALYTICS DASHBOARD ---
const getHrAnalytics = async () => {
  const employees = getIsConnected() ? await Employee.find() : memoryStore.employees;
  const leaves = getIsConnected() ? await Leave.find() : memoryStore.leaves;
  
  // Department Breakdown
  const deptCounts = {};
  employees.forEach(emp => {
    const dept = emp.department || 'General';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const departmentBreakdown = Object.entries(deptCounts).map(([department, count]) => ({
    department,
    count,
    percentage: Number(((count / (employees.length || 1)) * 100).toFixed(1))
  }));

  const avgSalary = employees.length > 0 
    ? Math.round(employees.reduce((acc, curr) => acc + (curr.salary || 65000), 0) / employees.length) 
    : 78500;

  return {
    headcount: employees.length,
    activeStaffToday: employees.filter(e => e.status === 'Active' || e.status === 'Remote').length,
    attritionRate: '2.8%',
    averageAnnualSalary: avgSalary,
    departmentBreakdown,
    leaveRequestsTotal: leaves.length,
    leaveApproved: leaves.filter(l => l.status === 'Approved').length,
    leavePending: leaves.filter(l => l.status === 'Pending').length
  };
};

// --- CSV EXPORT GENERATOR ---
const exportEmployeesCsv = async () => {
  const employees = getIsConnected() ? await Employee.find() : memoryStore.employees;
  const headers = ['ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Salary', 'Status', 'Location'];
  const rows = employees.map(e => [
    e.id || e._id,
    `"${e.name}"`,
    `"${e.role}"`,
    `"${e.department}"`,
    e.email,
    e.phone,
    e.salary,
    e.status,
    `"${e.location}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

const exportAttendanceCsv = async () => {
  const attendance = getIsConnected() ? await Attendance.find() : memoryStore.attendance;
  const headers = ['ID', 'EmployeeName', 'Date', 'CheckIn', 'CheckOut', 'TotalHours', 'Status', 'WorkType'];
  const rows = attendance.map(a => [
    a.id || a._id,
    `"${a.employeeName}"`,
    a.date,
    a.checkIn,
    a.checkOut,
    a.totalHours,
    a.status,
    a.workType
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

module.exports = {
  getStats,
  getSchedule,
  getSummary,
  updateSummaryGoal,
  getAllGoals,
  createGoal,
  updateGoalProgress,
  getHrAnalytics,
  exportEmployeesCsv,
  exportAttendanceCsv
};
