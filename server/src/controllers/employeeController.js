const employeeService = require('../services/employeeService');

const getEmployees = async (req, res, next) => {
  try {
    const data = await employeeService.getAllEmployees();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const data = await employeeService.getEmployeeById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const data = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const data = await employeeService.updateEmployee(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee
};
