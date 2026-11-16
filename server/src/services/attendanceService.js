const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const OfficeLocation = require('../models/OfficeLocation');
const CompanySettings = require('../models/CompanySettings');
const { distanceMeters, getCompanyDateTime } = require('../utils/geo');
const ApiError = require('../errors/ApiError');

const getAllAttendance = async (filter = {}) => {
  return await Attendance.find(filter)
    .populate('checkInLocation.officeId', 'name address radiusMeters')
    .sort({ date: -1, createdAt: -1 });
};

/**
 * 3.3 Core Location-Based Punch Engine with Dynamic System Shift Settings
 */
const punchAttendance = async (employeeId, { type = 'in', lat, lng, accuracy }, { ip, userAgent }) => {
  if (!employeeId) {
    throw ApiError.badRequest('No linked employee profile found for this account.');
  }

  const emp = await Employee.findById(employeeId).populate('officeLocation');
  if (!emp) {
    throw ApiError.notFound('Employee profile not found.');
  }

  const settings = await CompanySettings.findOne({ key: 'default' });
  const shift = settings?.workShift || {
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    halfDayThresholdHours: 4,
    fullDayThresholdHours: 8
  };

  const [shiftStartH, shiftStartM] = (shift.startTime || '09:00').split(':').map(Number);
  const graceMinutes = Number(shift.gracePeriodMinutes || 15);
  const minHalfDayHours = Number(shift.halfDayThresholdHours || 4);

  const now = new Date();
  const { dateStr, timeStr, hour, minute } = getCompanyDateTime(now);

  // Check if late based on dynamic system settings
  const checkInTotalMinutes = hour * 60 + minute;
  const shiftCutoffMinutes = shiftStartH * 60 + shiftStartM + graceMinutes;
  const isLate = checkInTotalMinutes > shiftCutoffMinutes;
  const initialStatus = isLate ? 'Late' : 'Present';

  // Geofence & Location Validation
  let geofenceStatus = 'Inside';
  let approvalStatus = 'Auto';
  let nearestOffice = null;
  let computedDistance = null;

  if (emp.workMode === 'Remote') {
    geofenceStatus = 'Remote';
    approvalStatus = 'Auto';
  } else {
    // Office / Hybrid Mode
    if (lat === undefined || lng === undefined) {
      throw ApiError.badRequest('GPS coordinates (lat, lng) are required for Office/Hybrid check-in.');
    }

    // 4. GPS accuracy check: Reject if > 100 meters
    if (accuracy && accuracy > 100) {
      throw ApiError.badRequest('GPS accuracy is too low (>100m). Please move to an open area and try again.');
    }

    // Find all active offices
    const offices = await OfficeLocation.find({ isActive: true });
    if (offices.length === 0) {
      throw ApiError.badRequest('No active office location is configured by Admin in System Settings. Please contact HR/Admin.');
    }

    // Find nearest office
    let minDistance = Infinity;
    for (const office of offices) {
      const d = distanceMeters({ lat, lng }, { lat: office.lat, lng: office.lng });
      if (d < minDistance) {
        minDistance = d;
        nearestOffice = office;
      }
    }

    computedDistance = Math.round(minDistance);
    const allowedRadius = nearestOffice?.radiusMeters || 100;

    // Strict Rule: Must be within allowed radius (<= 100m)
    if (computedDistance > allowedRadius) {
      throw ApiError.badRequest(
        `Punch rejected! You are ${computedDistance} meters away from ${nearestOffice.name}. Attendance is only allowed within ${allowedRadius} meters.`
      );
    }

    geofenceStatus = 'Inside';
    approvalStatus = 'Auto';
  }

  // 6. Check existing punch for today in COMPANY_TZ
  let record = await Attendance.findOne({ employeeId, date: dateStr });

  if (type === 'in') {
    if (record) {
      throw ApiError.conflict(`Already checked IN today at ${record.checkIn}. Cannot check-in twice.`);
    }

    record = await Attendance.create({
      employeeId,
      employeeName: emp.name,
      date: dateStr,
      checkInTime: now,
      checkIn: timeStr,
      checkOutTime: null,
      checkOut: '-',
      checkInLocation: {
        lat,
        lng,
        accuracy,
        distanceMeters: computedDistance,
        officeId: nearestOffice?._id || null
      },
      geofenceStatus,
      approvalStatus,
      ip,
      userAgent,
      totalHours: 0,
      status: initialStatus,
      workType: emp.workMode || 'Office'
    });

    const statusMsg = approvalStatus === 'Pending'
      ? `Checked IN at ${timeStr} (Outside Geofence: ${computedDistance}m away, Pending Manager Approval)`
      : `Successfully Checked IN at ${timeStr} (${initialStatus})`;

    return { record, message: statusMsg };
  }

  if (type === 'out') {
    if (!record || !record.checkInTime) {
      throw ApiError.badRequest('Cannot punch OUT without checking IN first today.');
    }

    if (record.checkOutTime) {
      throw ApiError.conflict(`Already checked OUT today at ${record.checkOut}.`);
    }

    record.checkOutTime = now;
    record.checkOut = timeStr;
    record.checkOutLocation = {
      lat,
      lng,
      accuracy,
      distanceMeters: computedDistance
    };

    // 7. Calculate real total hours (out - in)
    const diffMs = now.getTime() - new Date(record.checkInTime).getTime();
    const diffHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    record.totalHours = diffHours;

    const settings = await CompanySettings.findOne({ key: 'default' });
    const minHalfDay = Number(settings?.workShift?.halfDayThresholdHours || 4);
    if (diffHours < minHalfDay) {
      record.status = 'Half Day';
    }

    await record.save();

    return {
      record,
      message: `Successfully Checked OUT at ${timeStr} (Total: ${record.totalHours} hrs)`
    };
  }

  throw ApiError.badRequest("Invalid punch type. Must be 'in' or 'out'.");
};

/**
 * 3.4 Manager / Admin Review of Outside Punches
 */
const reviewPunch = async (id, { status, reason }, user) => {
  const attendance = await Attendance.findById(id);
  if (!attendance) throw ApiError.notFound('Attendance record not found.');

  // If Manager, check that the employee belongs to their team
  if (user.role === 'Manager') {
    const isTeamMember = await Employee.exists({ _id: attendance.employeeId, manager: user.employeeId });
    if (!isTeamMember) {
      throw ApiError.forbidden('Managers are only authorized to review punches for their assigned team members.');
    }
  }

  attendance.approvalStatus = status;
  attendance.reviewedBy = user.name;
  if (reason) attendance.rejectionReason = reason;

  if (status === 'Rejected') {
    attendance.status = 'Absent';
  }

  await attendance.save();
  return attendance;
};

/**
 * Get nearest office & live distance calculation for frontend pill
 */
const getNearestOfficeInfo = async ({ lat, lng }) => {
  const offices = await OfficeLocation.find({ isActive: true });
  if (!offices.length) return null;

  let nearest = null;
  let minDistance = Infinity;

  for (const office of offices) {
    const d = distanceMeters({ lat, lng }, { lat: office.lat, lng: office.lng });
    if (d < minDistance) {
      minDistance = d;
      nearest = office;
    }
  }

  return {
    office: nearest,
    distanceMeters: minDistance,
    isInside: minDistance <= (nearest?.radiusMeters || 150)
  };
};

const getMonthlyReport = async (filter = {}) => {
  return await Attendance.find(filter).sort({ date: 1 });
};

module.exports = {
  getAllAttendance,
  punchAttendance,
  reviewPunch,
  getNearestOfficeInfo,
  getMonthlyReport
};
