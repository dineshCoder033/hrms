const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('./dataService');
const ApiError = require('../errors/ApiError');

// Company Public Holidays List (can be expanded/configured)
const COMPANY_HOLIDAYS_2026 = [
  '2026-01-01', // New Year's Day
  '2026-01-26', // Republic Day
  '2026-05-01', // Labor Day
  '2026-08-15', // Independence Day
  '2026-10-02', // Gandhi Jayanti
  '2026-12-25'  // Christmas
];

/**
 * Accurately calculate working days excluding Saturdays, Sundays & Public Holidays
 */
const calculateWorkingDays = (startDateStr, endDateStr, holidays = COMPANY_HOLIDAYS_2026) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw ApiError.badRequest('Invalid start or end date format. Use YYYY-MM-DD.');
  }

  if (start > end) {
    throw ApiError.badRequest('Start date cannot be after end date.');
  }

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isoDate = current.toISOString().split('T')[0];
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 = Sunday, 6 = Saturday
    const isHoliday = holidays.includes(isoDate);

    if (!isWeekend && !isHoliday) {
      workingDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return workingDays;
};

/**
 * Check for overlapping approved or pending leaves
 */
const checkLeaveOverlap = async (employeeId, startDate, endDate, excludeId = null) => {
  if (getIsConnected()) {
    const query = {
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Leave.findOne(query);
  }

  return memoryStore.leaves.find(l => 
    l.employeeId === employeeId && 
    ['Pending', 'Approved'].includes(l.status) && 
    l.startDate <= endDate && 
    l.endDate >= startDate &&
    l.id !== excludeId
  );
};

/**
 * Retrieve or initialize LeaveBalance record
 */
const getLeaveBalance = async (employeeId, year = new Date().getFullYear()) => {
  if (getIsConnected()) {
    let balance = await LeaveBalance.findOne({ employeeId, year });
    if (!balance) {
      balance = await LeaveBalance.create({ employeeId, year });
    }
    return balance;
  }

  // Dev fallback balance
  return {
    employeeId: employeeId || 'emp-1',
    year,
    balances: {
      'Annual Leave': { total: 20, used: 5, remaining: 15 },
      'Casual Leave': { total: 10, used: 2, remaining: 8 },
      'Sick Leave': { total: 10, used: 1, remaining: 9 },
      'Maternity/Paternity': { total: 90, used: 0, remaining: 90 },
      'Unpaid': { total: 0, used: 0, remaining: 0 }
    }
  };
};

const getAllLeaves = async (query = {}) => {
  if (getIsConnected()) {
    const filter = {};
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.status && query.status !== 'All') filter.status = query.status;
    return await Leave.find(filter).sort({ createdAt: -1 });
  }

  let list = memoryStore.leaves;
  if (query.employeeId) list = list.filter(l => l.employeeId === query.employeeId);
  if (query.status && query.status !== 'All') list = list.filter(l => l.status === query.status);
  return list;
};

const createLeave = async (data) => {
  const { startDate, endDate, leaveType, reason, employeeId } = data;

  if (!startDate || !endDate || !leaveType || !reason) {
    throw ApiError.badRequest('startDate, endDate, leaveType, and reason are required');
  }

  // 1. Calculate actual working days excluding weekends & holidays
  const calculatedDays = calculateWorkingDays(startDate, endDate);
  if (calculatedDays <= 0) {
    throw ApiError.badRequest('Selected date range contains no working days (all dates fall on weekends or holidays).');
  }

  const empId = employeeId || 'emp-1';

  // 2. Check for overlapping leaves
  const overlapping = await checkLeaveOverlap(empId, startDate, endDate);
  if (overlapping) {
    throw ApiError.badRequest(
      `Overlapping leave conflict: You already have a ${overlapping.status} leave (${overlapping.leaveType}) from ${overlapping.startDate} to ${overlapping.endDate}.`
    );
  }

  // 3. Verify leave balance
  const year = new Date(startDate).getFullYear();
  const balanceRecord = await getLeaveBalance(empId, year);

  if (leaveType !== 'Unpaid') {
    const category = balanceRecord.balances ? balanceRecord.balances[leaveType] : null;
    const remaining = category?.remaining ?? (category ? category.total - category.used : 10);

    if (remaining < calculatedDays) {
      throw ApiError.badRequest(
        `Insufficient ${leaveType} balance. You have ${remaining} day(s) remaining, but requested ${calculatedDays} working day(s).`
      );
    }
  }

  // Resolve employee name/avatar
  let empName = data.employeeName || 'Sophia Martinez';
  let empAvatar = data.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  if (getIsConnected()) {
    const emp = await Employee.findById(empId).catch(() => null);
    if (emp) {
      empName = emp.name;
      empAvatar = emp.avatar || empAvatar;
    }

    const created = await Leave.create({
      employeeId: empId,
      employeeName: empName,
      employeeAvatar: empAvatar,
      leaveType,
      startDate,
      endDate,
      daysCount: calculatedDays,
      reason,
      status: 'Pending',
      appliedAt: new Date()
    });

    return created;
  }

  const newLeave = {
    id: `lev-${Date.now()}`,
    employeeId: empId,
    employeeName: empName,
    employeeAvatar: empAvatar,
    leaveType,
    startDate,
    endDate,
    daysCount: calculatedDays,
    reason,
    status: 'Pending',
    appliedAt: new Date().toISOString()
  };
  memoryStore.leaves.unshift(newLeave);
  return newLeave;
};

const updateLeaveStatus = async (id, status, reviewer = 'HR Manager') => {
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    throw ApiError.badRequest("Status must be 'Pending', 'Approved', or 'Rejected'");
  }

  if (getIsConnected()) {
    const leave = await Leave.findById(id);
    if (!leave) throw ApiError.notFound('Leave request not found');

    const prevStatus = leave.status;
    leave.status = status;
    leave.reviewedBy = reviewer;
    await leave.save();

    // Deduct from LeaveBalance if Approved
    const year = new Date(leave.startDate).getFullYear();
    const balance = await getLeaveBalance(leave.employeeId, year);

    if (leave.leaveType !== 'Unpaid' && balance.balances && balance.balances[leave.leaveType]) {
      if (prevStatus !== 'Approved' && status === 'Approved') {
        balance.balances[leave.leaveType].used += leave.daysCount;
        await balance.save();
      } else if (prevStatus === 'Approved' && status === 'Rejected') {
        balance.balances[leave.leaveType].used = Math.max(0, balance.balances[leave.leaveType].used - leave.daysCount);
        await balance.save();
      }
    }

    return leave;
  }

  const leave = memoryStore.leaves.find(l => l.id === id || l._id?.toString() === id);
  if (!leave) throw ApiError.notFound('Leave request not found');
  leave.status = status;
  leave.reviewedBy = reviewer;
  return leave;
};

module.exports = {
  calculateWorkingDays,
  checkLeaveOverlap,
  getLeaveBalance,
  getAllLeaves,
  createLeave,
  updateLeaveStatus
};
