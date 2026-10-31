const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const validate = require('../middlewares/validate');
const { createLeadSchema } = require('../validators/leadValidator');

router.get('/', leadController.getLeads);
router.post('/', validate(createLeadSchema), leadController.createLead);

module.exports = router;
