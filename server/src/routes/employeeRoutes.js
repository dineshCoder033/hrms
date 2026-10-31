const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const validate = require('../middlewares/validate');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validators/employeeValidator');

router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', validate(createEmployeeSchema), employeeController.createEmployee);
router.patch('/:id', validate(updateEmployeeSchema), employeeController.updateEmployee);

module.exports = router;
