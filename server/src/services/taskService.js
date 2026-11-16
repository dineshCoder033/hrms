const Task = require('../models/Task');
const ApiError = require('../errors/ApiError');

const getAllTasks = async () => {
  return await Task.find().sort({ createdAt: -1 });
};

const getTaskById = async (id) => {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

const createTask = async (data) => {
  return await Task.create(data);
};

const updateTask = async (id, data) => {
  const updated = await Task.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  if (!updated) throw ApiError.notFound('Task not found');
  return updated;
};

const deleteTask = async (id) => {
  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound('Task not found');
  return deleted;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
