const Task = require('../models/Task');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('./dataService');
const ApiError = require('../errors/ApiError');

const getAllTasks = async () => {
  if (getIsConnected()) {
    return await Task.find().sort({ createdAt: -1 });
  }
  return memoryStore.tasks;
};

const createTask = async (data) => {
  if (getIsConnected()) {
    return await Task.create(data);
  }
  const newTask = {
    ...data,
    id: `task-${Date.now()}`
  };
  memoryStore.tasks.push(newTask);
  return newTask;
};

const updateTask = async (id, data) => {
  if (getIsConnected()) {
    const updated = await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw ApiError.notFound('Task not found');
    return updated;
  }
  const task = memoryStore.tasks.find(t => t.id === id || t._id?.toString() === id);
  if (!task) throw ApiError.notFound('Task not found');
  Object.assign(task, data);
  return task;
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask
};
