const meetingService = require('../services/meetingService');
const { generateIcs } = require('../utils/ics');
const {
  createMeetingSchema,
  updateMeetingSchema,
  respondMeetingSchema
} = require('../validators/meetingValidator');
const ApiError = require('../errors/ApiError');

const getMeetings = async (req, res, next) => {
  try {
    const data = await meetingService.getMeetings(req.query, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMeetingById = async (req, res, next) => {
  try {
    const data = await meetingService.getMeetingById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const validated = createMeetingSchema.parse(req.body);
    const result = await meetingService.createMeeting(validated, req.user);
    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: result.meeting,
      warning: result.leaveWarning
    });
  } catch (error) {
    next(error);
  }
};

const updateMeeting = async (req, res, next) => {
  try {
    const validated = updateMeetingSchema.parse(req.body);
    const data = await meetingService.updateMeeting(req.params.id, validated, req.user);
    res.json({ success: true, message: 'Meeting updated', data });
  } catch (error) {
    next(error);
  }
};

const cancelMeeting = async (req, res, next) => {
  try {
    const data = await meetingService.cancelMeeting(req.params.id, req.user);
    res.json({ success: true, message: 'Meeting cancelled', data });
  } catch (error) {
    next(error);
  }
};

const respondToMeeting = async (req, res, next) => {
  try {
    const { response } = respondMeetingSchema.parse(req.body);
    const data = await meetingService.respondToMeeting(req.params.id, response, req.user);
    res.json({ success: true, message: `Meeting invitation ${response.toLowerCase()}`, data });
  } catch (error) {
    next(error);
  }
};

const downloadIcs = async (req, res, next) => {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id);
    const icsContent = generateIcs(meeting);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="meeting-${meeting._id}.ics"`);
    res.send(icsContent);
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { employeeIds, date } = req.query;
    if (!employeeIds || !date) {
      throw ApiError.badRequest('employeeIds and date are required query parameters.');
    }
    const ids = Array.isArray(employeeIds) ? employeeIds : employeeIds.split(',');
    const data = await meetingService.checkAvailability({ employeeIds: ids, date });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  cancelMeeting,
  respondToMeeting,
  downloadIcs,
  getAvailability
};

