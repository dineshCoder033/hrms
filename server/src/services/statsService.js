const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const Goal = require('../models/Goal');
const Job = require('../models/Job');
const ApiError = require('../errors/ApiError');

const getStats = async () => {
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
  const attendanceRate = empCount > 0 ? Number(((presentCount / empCount) * 100).toFixed(1)) : 100.0;

  return {
    totalDeals: 124,
    dealsChange: '+12%',
    wonDeals: 88,
    wonChange: '+8%',
    lostDeals: 36,
    lostChange: '-4%',
    activeEmployees: empCount,
    totalPayroll: totalPayroll,
    attendanceRate: attendanceRate,
    pendingLeaves,
    openJobs: jobsCount
  };
};

const getSchedule = () => {
  return [
    { id: 1, title: 'Weekly Sprint Standup', time: '10:00 AM', type: 'Engineering' },
    { id: 2, title: 'All-Hands Product Review', time: '02:00 PM', type: 'Company' },
    { id: 3, title: 'HR Policy Alignment Meeting', time: '04:30 PM', type: 'HR' }
  ];
};

const getSummary = () => {
  return {
    progress: 74,
    goal: {
      target: 'Q1 Workforce Target',
      description: 'Streamline team onboarding efficiency and automated attendance compliance.'
    }
  };
};

const updateSummaryGoal = (description) => {
  return {
    target: 'Q1 Workforce Target',
    description: description || 'Streamline team onboarding efficiency.'
  };
};

// --- OKR / GOALS ENGINE ---
const getAllGoals = async () => {
  return await Goal.find().sort({ createdAt: -1 });
};

const createGoal = async (data) => {
  return await Goal.create(data);
};

const updateGoalProgress = async (id, progress, status) => {
  const update = { progress };
  if (status) update.status = status;
  const updated = await Goal.findByIdAndUpdate(id, update, { new: true });
  if (!updated) throw ApiError.notFound('Goal not found');
  return updated;
};

// --- HR ANALYTICS DASHBOARD ---
const getHrAnalytics = async () => {
  const [employees, leaves] = await Promise.all([
    Employee.find(),
    Leave.find()
  ]);

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
  const employees = await Employee.find();
  const headers = ['ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Salary', 'Status', 'Location'];
  const rows = employees.map(e => [
    e._id,
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
  const attendance = await Attendance.find();
  const headers = ['ID', 'EmployeeName', 'Date', 'CheckIn', 'CheckOut', 'TotalHours', 'Status', 'WorkType'];
  const rows = attendance.map(a => [
    a._id,
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
