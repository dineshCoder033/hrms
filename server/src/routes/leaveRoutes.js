const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const validate = require('../middlewares/validate');
const { createLeaveSchema, updateLeaveStatusSchema } = require('../validators/leaveValidator');

router.get('/', leaveController.getLeaves);
router.get('/balance', leaveController.getBalance);
router.post('/', validate(createLeaveSchema), leaveController.createLeave);
router.patch('/:id', validate(updateLeaveStatusSchema), leaveController.updateLeaveStatus);

module.exports = router;
