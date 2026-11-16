const taskService = require('../services/taskService');

const getTasks = async (req, res, next) => {
  try {
    const data = await taskService.getAllTasks();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const data = await taskService.getTaskById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const data = await taskService.createTask(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const data = await taskService.updateTask(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const data = await taskService.deleteTask(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
