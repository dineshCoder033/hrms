const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');
const Holiday = require('../models/Holiday');
const ApiError = require('../errors/ApiError');
const { logAudit } = require('./auditService');
const { notifyByEmployeeId } = require('./notificationService');

/**
 * Accurately calculate working days excluding Saturdays, Sundays & Company Holidays from DB
 */
const calculateWorkingDays = async (startDateStr, endDateStr, customHolidays = null) => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw ApiError.badRequest('Invalid start or end date format. Use YYYY-MM-DD.');
  }

  if (start > end) {
    throw ApiError.badRequest('Start date cannot be after end date.');
  }

  let holidays = customHolidays;
  if (!holidays) {
    const dbHolidays = await Holiday.find({
      date: { $gte: startDateStr, $lte: endDateStr }
    }).distinct('date');
    holidays = dbHolidays;
  }

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isoDate = current.toISOString().split('T')[0];
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
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
};

/**
 * Retrieve or initialize LeaveBalance record
 */
const getLeaveBalance = async (employeeId, year = new Date().getFullYear()) => {
  let balance = await LeaveBalance.findOne({ employeeId, year });
  if (!balance) {
    balance = await LeaveBalance.create({ employeeId, year });
  }
  return balance;
};

const getAllLeaves = async (filter = {}) => {
  return await Leave.find(filter).sort({ createdAt: -1 });
};

const createLeave = async (data, user) => {
  const { startDate, endDate, leaveType, reason } = data;

  if (!startDate || !endDate || !leaveType || !reason) {
    throw ApiError.badRequest('startDate, endDate, leaveType, and reason are required');
  }

  // Security: Always bind leave to logged-in user's employeeId
  const empId = user.employeeId;
  if (!empId) {
    throw ApiError.badRequest('No linked employee record found for this user account.');
  }

  const calculatedDays = await calculateWorkingDays(startDate, endDate);
  if (calculatedDays <= 0) {
    throw ApiError.badRequest('Selected date range contains no working days (all dates fall on weekends or holidays).');
  }

  // Check for overlapping leaves
  const overlapping = await checkLeaveOverlap(empId, startDate, endDate);
  if (overlapping) {
    throw ApiError.badRequest(
      `Overlapping leave conflict: You already have a ${overlapping.status} leave (${overlapping.leaveType}) from ${overlapping.startDate} to ${overlapping.endDate}.`
    );
  }

  // Verify leave balance
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

  const emp = await Employee.findById(empId);
  const empName = emp ? emp.name : user.name;
  const empAvatar = emp ? emp.avatar : undefined;

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
};

const updateLeaveStatus = async (id, status, reviewerUser) => {
  if (!['Approved', 'Rejected'].includes(status)) {
    throw ApiError.badRequest("Status must be 'Approved' or 'Rejected'");
  }

  const leave = await Leave.findById(id);
  if (!leave) throw ApiError.notFound('Leave request not found');

  // Prevent self-approval
  if (leave.employeeId.toString() === reviewerUser.employeeId) {
    throw ApiError.forbidden('You cannot approve or reject your own leave request.');
  }

  // If Manager, check that the employee belongs to their team
  if (reviewerUser.role === 'Manager') {
    const isTeamMember = await Employee.exists({ _id: leave.employeeId, manager: reviewerUser.employeeId });
    if (!isTeamMember) {
      throw ApiError.forbidden('Managers are only authorized to review leave requests for their assigned team members.');
    }
  }

  const prevStatus = leave.status;
  leave.status = status;
  leave.reviewedBy = reviewerUser.name;
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

  await logAudit({
    user: reviewerUser,
    action: `LEAVE_${status.toUpperCase()}`,
    entityType: 'Leave',
    entityId: leave._id,
    details: { employeeName: leave.employeeName, leaveType: leave.leaveType, daysCount: leave.daysCount }
  });

  await notifyByEmployeeId({
    employeeId: leave.employeeId,
    title: `Leave Request ${status}`,
    message: `Your ${leave.leaveType} leave (${leave.startDate} to ${leave.endDate}) was ${status.toLowerCase()} by ${reviewerUser.name}.`,
    type: 'leave',
    link: '/leaves'
  });

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
