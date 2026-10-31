const leaveService = require('../services/leaveService');

const getLeaves = async (req, res, next) => {
  try {
    const data = await leaveService.getAllLeaves(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getBalance = async (req, res, next) => {
  try {
    const employeeId = req.query.employeeId || req.user?.employeeId || 'emp-1';
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const data = await leaveService.getLeaveBalance(employeeId, year);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createLeave = async (req, res, next) => {
  try {
    const leavePayload = {
      ...req.body,
      employeeId: req.user?.employeeId || req.user?.id || req.body.employeeId,
      employeeName: req.user?.name || req.body.employeeName
    };
    const data = await leaveService.createLeave(leavePayload);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const reviewer = req.user?.name || 'HR Manager';
    const data = await leaveService.updateLeaveStatus(req.params.id, req.body.status, reviewer);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaves,
  getBalance,
  createLeave,
  updateLeaveStatus
};
