const statsService = require('../services/statsService');

const getStats = async (req, res, next) => {
  try {
    const data = await statsService.getStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSchedule = (req, res, next) => {
  try {
    const data = statsService.getSchedule();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSummary = (req, res, next) => {
  try {
    const data = statsService.getSummary();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateGoal = (req, res, next) => {
  try {
    const data = statsService.updateSummaryGoal(req.body.description);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// --- OKR / GOALS ---
const getGoals = async (req, res, next) => {
  try {
    const data = await statsService.getAllGoals();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const data = await statsService.createGoal(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateGoalProgress = async (req, res, next) => {
  try {
    const { progress, status } = req.body;
    const data = await statsService.updateGoalProgress(req.params.id, progress, status);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// --- HR ANALYTICS ---
const getAnalytics = async (req, res, next) => {
  try {
    const data = await statsService.getHrAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// --- CSV EXPORTS ---
const exportEmployees = async (req, res, next) => {
  try {
    const csvData = await statsService.exportEmployeesCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_directory.csv');
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

const exportAttendance = async (req, res, next) => {
  try {
    const csvData = await statsService.exportAttendanceCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_logs.csv');
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getSchedule,
  getSummary,
  updateGoal,
  getGoals,
  createGoal,
  updateGoalProgress,
  getAnalytics,
  exportEmployees,
  exportAttendance
};
