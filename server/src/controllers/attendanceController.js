const attendanceService = require('../services/attendanceService');

const getAttendance = async (req, res, next) => {
  try {
    const data = await attendanceService.getAllAttendance(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const punch = async (req, res, next) => {
  try {
    const employeeId = req.user?.employeeId || req.user?.id || req.body.employeeId;
    const { type } = req.body;
    const result = await attendanceService.punchAttendance(employeeId, type);
    res.json({
      success: true,
      data: result.record,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const employeeId = req.query.employeeId || req.user?.employeeId || null;
    const month = req.query.month; // e.g. "2026-03"
    const data = await attendanceService.getMonthlyReport(employeeId, month);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  punch,
  getMonthlyReport
};
