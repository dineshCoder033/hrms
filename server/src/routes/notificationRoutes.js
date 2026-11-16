const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const notificationService = require('../services/notificationService');
const ApiError = require('../errors/ApiError');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotifications(req.user.id, {
      limit: req.query.limit
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const item = await notificationService.markAsRead(req.params.id, req.user.id);
    if (!item) throw ApiError.notFound('Notification not found');
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

