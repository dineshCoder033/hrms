const Employee = require('../models/Employee');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('./dataService');
const ApiError = require('../errors/ApiError');

const getAllEmployees = async () => {
  if (getIsConnected()) {
    return await Employee.find().sort({ createdAt: -1 });
  }
  return memoryStore.employees;
};

const getEmployeeById = async (id) => {
  if (getIsConnected()) {
    const employee = await Employee.findById(id);
    if (!employee) throw ApiError.notFound('Employee not found');
    return employee;
  }
  const employee = memoryStore.employees.find(e => e.id === id || e._id?.toString() === id);
  if (!employee) throw ApiError.notFound('Employee not found');
  return employee;
};

const createEmployee = async (data) => {
  if (getIsConnected()) {
    return await Employee.create(data);
  }
  const newEmp = {
    ...data,
    id: `emp-${Date.now()}`
  };
  memoryStore.employees.unshift(newEmp);
  return newEmp;
};

const updateEmployee = async (id, data) => {
  if (getIsConnected()) {
    const updated = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw ApiError.notFound('Employee not found');
    return updated;
  }
  const emp = memoryStore.employees.find(e => e.id === id || e._id?.toString() === id);
  if (!emp) throw ApiError.notFound('Employee not found');
  Object.assign(emp, data);
  return emp;
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee
};
