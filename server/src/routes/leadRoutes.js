const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createLeadSchema } = require('../validators/leadValidator');

router.use(authenticate);

router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.post('/', validate(createLeadSchema), leadController.createLead);
router.patch('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;
