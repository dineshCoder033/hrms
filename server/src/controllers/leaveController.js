const leaveService = require('../services/leaveService');
const { employeeScope } = require('../utils/scope');

const getLeaves = async (req, res, next) => {
  try {
    const scope = await employeeScope(req.user);
    const filter = { ...scope };
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    const data = await leaveService.getAllLeaves(filter);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getBalance = async (req, res, next) => {
  try {
    const targetEmployeeId = ['Admin', 'HR'].includes(req.user.role) && req.query.employeeId
      ? req.query.employeeId
      : req.user.employeeId;

    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const data = await leaveService.getLeaveBalance(targetEmployeeId, year);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createLeave = async (req, res, next) => {
  try {
    const data = await leaveService.createLeave(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const data = await leaveService.updateLeaveStatus(req.params.id, req.body.status, req.user);
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
