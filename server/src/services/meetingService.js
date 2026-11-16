const crypto = require('crypto');
const Meeting = require('../models/Meeting');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const ApiError = require('../errors/ApiError');
const { notifyByEmployeeId } = require('./notificationService');

/**
 * 4.3 Conflict Check Utility
 */
const checkMeetingConflicts = async ({ attendeeIds, startAt, endAt, excludeMeetingId = null }) => {
  const query = {
    status: 'Scheduled',
    'attendees.employee': { $in: attendeeIds },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt }
  };

  if (excludeMeetingId) {
    query._id = { $ne: excludeMeetingId };
  }

  const busyMeetings = await Meeting.find(query).populate('attendees.employee', 'name email');
  return busyMeetings;
};

/**
 * 4.2 Create Meeting with Conflict & Leave Checks
 */
const createMeeting = async (data, user) => {
  if (!user.employeeId) {
    throw ApiError.badRequest('No linked employee profile found to organize meetings.');
  }

  const start = new Date(data.startAt);
  const end = new Date(data.endAt);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw ApiError.badRequest('Invalid meeting start or end timestamp.');
  }

  if (start >= end) {
    throw ApiError.badRequest('Meeting end time must be after start time.');
  }

  // Ensure unique list of attendee ObjectIds
  const attendeeSet = new Set(data.attendeeIds || []);
  attendeeSet.add(user.employeeId); // Organizer is always an attendee
  const attendeeIds = Array.from(attendeeSet);

  // 1. Conflict Check: check if any participant is already booked
  if (!data.force) {
    const busyMeetings = await checkMeetingConflicts({
      attendeeIds,
      startAt: start,
      endAt: end
    });

    if (busyMeetings.length > 0) {
      const busyNames = new Set();
      busyMeetings.forEach(m => {
        m.attendees.forEach(a => {
          if (attendeeIds.includes(a.employee?._id?.toString() || a.employee?.toString())) {
            busyNames.add(a.employee?.name || 'A team member');
          }
        });
      });

      throw ApiError.conflict(
        `Participant conflict: ${Array.from(busyNames).join(', ')} is already scheduled for another meeting during this time.`
      );
    }
  }

  // 2. Leave Check: check if any participant is on approved leave on that date
  const dateStr = start.toISOString().split('T')[0];
  const onLeaveRecords = await Leave.find({
    employeeId: { $in: attendeeIds },
    status: 'Approved',
    startDate: { $lte: dateStr },
    endDate: { $gte: dateStr }
  }).populate('employeeId', 'name');

  let leaveWarning = null;
  if (onLeaveRecords.length > 0) {
    const names = onLeaveRecords.map(l => l.employeeName || l.employeeId?.name);
    leaveWarning = `Note: ${names.join(', ')} is currently on approved leave on ${dateStr}.`;
  }

  // Generate meeting link if online and none provided
  let meetLink = data.meetLink;
  if (data.mode === 'Online' && !meetLink) {
    const roomId = crypto.randomBytes(4).toString('hex');
    meetLink = `https://meet.jit.si/taskorbit-${roomId}`;
  }

  const attendeesPayload = attendeeIds.map(empId => ({
    employee: empId,
    response: empId === user.employeeId ? 'Accepted' : 'Pending'
  }));

  const meeting = await Meeting.create({
    title: data.title,
    description: data.description,
    organizer: user.employeeId,
    attendees: attendeesPayload,
    startAt: start,
    endAt: end,
    timezone: data.timezone || 'Asia/Kolkata',
    mode: data.mode || 'Online',
    meetLink,
    room: data.room,
    status: 'Scheduled'
  });

  // Notify invited attendees (excluding organizer)
  await Promise.all(
    attendeeIds
      .filter((id) => id !== user.employeeId)
      .map((empId) =>
        notifyByEmployeeId({
          employeeId: empId,
          title: 'New Meeting Invite',
          message: `You were invited to "${data.title}" on ${start.toISOString().slice(0, 10)}.`,
          type: 'meeting',
          link: '/'
        })
      )
  );

  const populated = await Meeting.findById(meeting._id)
    .populate('organizer', 'name email avatar')
    .populate('attendees.employee', 'name email avatar role department');

  return { meeting: populated, leaveWarning };
};

/**
 * 4.2 Get Meetings with Role & Hierarchy Scopes
 */
const getMeetings = async (query = {}, user) => {
  const filter = {};

  if (query.from || query.to) {
    filter.startAt = {};
    if (query.from) filter.startAt.$gte = new Date(query.from);
    if (query.to) filter.startAt.$lte = new Date(query.to);
  }

  if (query.status) {
    filter.status = query.status;
  }

  // Scope filter:
  const scope = query.scope || 'auto';

  if (scope === 'mine' || user.role === 'Employee') {
    filter.$or = [
      { organizer: user.employeeId },
      { 'attendees.employee': user.employeeId }
    ];
  } else if (scope === 'team' || user.role === 'Manager') {
    const team = await Employee.find({ manager: user.employeeId }).distinct('_id');
    const teamMembers = [...team, user.employeeId];
    filter.$or = [
      { organizer: { $in: teamMembers } },
      { 'attendees.employee': { $in: teamMembers } }
    ];
  }
  // Admin / HR see all if no scope specified

  return await Meeting.find(filter)
    .populate('organizer', 'name email avatar')
    .populate('attendees.employee', 'name email avatar role department')
    .sort({ startAt: 1 });
};

const getMeetingById = async (id) => {
  const meeting = await Meeting.findById(id)
    .populate('organizer', 'name email avatar phone')
    .populate('attendees.employee', 'name email avatar role department');
  if (!meeting) throw ApiError.notFound('Meeting not found');
  return meeting;
};

/**
 * Update Meeting
 */
const updateMeeting = async (id, data, user) => {
  const meeting = await Meeting.findById(id);
  if (!meeting) throw ApiError.notFound('Meeting not found');

  const isPrivileged = ['Admin', 'HR'].includes(user.role);
  const isOrganizer = meeting.organizer.toString() === user.employeeId;

  if (!isPrivileged && !isOrganizer) {
    throw ApiError.forbidden('Only the meeting organizer or an Admin/HR can modify meeting details.');
  }

  if (data.startAt && data.endAt) {
    data.startAt = new Date(data.startAt);
    data.endAt = new Date(data.endAt);
  }

  const updated = await Meeting.findByIdAndUpdate(id, data, { new: true })
    .populate('organizer', 'name email avatar')
    .populate('attendees.employee', 'name email avatar role department');

  return updated;
};

/**
 * Cancel Meeting (Soft delete -> status: 'Cancelled')
 */
const cancelMeeting = async (id, user) => {
  const meeting = await Meeting.findById(id);
  if (!meeting) throw ApiError.notFound('Meeting not found');

  const isPrivileged = ['Admin', 'HR'].includes(user.role);
  const isOrganizer = meeting.organizer.toString() === user.employeeId;

  if (!isPrivileged && !isOrganizer) {
    throw ApiError.forbidden('Only the meeting organizer or an Admin/HR can cancel this meeting.');
  }

  meeting.status = 'Cancelled';
  await meeting.save();
  return meeting;
};

/**
 * 4.2 Attendee RSVP (Accept / Decline)
 */
const respondToMeeting = async (id, response, user) => {
  if (!user.employeeId) {
    throw ApiError.badRequest('No linked employee record found.');
  }

  const meeting = await Meeting.findById(id);
  if (!meeting) throw ApiError.notFound('Meeting not found');

  const attendee = meeting.attendees.find(
    a => a.employee.toString() === user.employeeId
  );

  if (!attendee) {
    throw ApiError.forbidden('You are not listed as an attendee for this meeting.');
  }

  attendee.response = response;
  await meeting.save();

  return await Meeting.findById(id)
    .populate('organizer', 'name email avatar')
    .populate('attendees.employee', 'name email avatar role department');
};

/**
 * Availability Checker: finds busy blocks for specified employee IDs on a given day
 */
const checkAvailability = async ({ employeeIds, date }) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const empIds = Array.isArray(employeeIds) ? employeeIds : [employeeIds];

  const meetings = await Meeting.find({
    status: 'Scheduled',
    'attendees.employee': { $in: empIds },
    startAt: { $gte: startOfDay, $lte: endOfDay }
  }).select('title startAt endAt attendees');

  return {
    date,
    bookedSlots: meetings.map(m => ({
      id: m._id,
      title: m.title,
      startAt: m.startAt,
      endAt: m.endAt
    }))
  };
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  cancelMeeting,
  respondToMeeting,
  checkAvailability
};

