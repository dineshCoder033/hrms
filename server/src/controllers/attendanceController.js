const attendanceService = require('../services/attendanceService');
const { employeeScope } = require('../utils/scope');
const { punchSchema, reviewPunchSchema } = require('../validators/attendanceValidator');
const ApiError = require('../errors/ApiError');

const getAttendance = async (req, res, next) => {
  try {
    const scope = await employeeScope(req.user);
    const filter = { ...scope };

    if (req.query.date) filter.date = req.query.date;
    if (req.query.month) filter.date = new RegExp(`^${req.query.month}`);
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;

    const data = await attendanceService.getAllAttendance(filter);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const punch = async (req, res, next) => {
  try {
    // Validate request body
    const validated = punchSchema.parse(req.body);

    // Security: strictly use req.user.employeeId
    const employeeId = req.user.employeeId;

    const clientMeta = {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
      userAgent: req.headers['user-agent']
    };

    const result = await attendanceService.punchAttendance(employeeId, validated, clientMeta);
    res.json({
      success: true,
      data: result.record,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const reviewPunch = async (req, res, next) => {
  try {
    const validated = reviewPunchSchema.parse(req.body);
    const data = await attendanceService.reviewPunch(req.params.id, validated, req.user);
    res.json({
      success: true,
      message: `Outside punch marked as ${validated.status}`,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getNearestOffice = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      throw ApiError.badRequest('Query parameters lat and lng are required.');
    }
    const data = await attendanceService.getNearestOfficeInfo({
      lat: Number(lat),
      lng: Number(lng)
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const scope = await employeeScope(req.user);
    const filter = { ...scope };

    if (req.query.month) {
      filter.date = new RegExp(`^${req.query.month}`);
    }

    const data = await attendanceService.getMonthlyReport(filter);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  punch,
  reviewPunch,
  getNearestOffice,
  getMonthlyReport
};
