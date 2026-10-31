const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validate = require('../middlewares/validate');
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidator');

router.get('/', taskController.getTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);

module.exports = router;
