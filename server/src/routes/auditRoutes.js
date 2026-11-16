const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const auditService = require('../services/auditService');

router.use(authenticate, authorize('Admin', 'HR'));

router.get('/', async (req, res, next) => {
  try {
    const data = await auditService.getAuditLogs({
      page: req.query.page,
      limit: req.query.limit,
      entityType: req.query.entityType,
      action: req.query.action
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

