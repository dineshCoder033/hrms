const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const payrollService = require('../services/payrollService');
const env = require('../config/env');
const ApiError = require('../errors/ApiError');

/**
 * POST /api/webhooks/payout
 * Mounted BEFORE express.json() using express.raw({ type: 'application/json' })
 */
router.post('/payout', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['x-payout-signature'];
    const webhookSecret = process.env.PAYOUT_WEBHOOK_SECRET || env.JWT_REFRESH_SECRET;

    if (!signature) {
      throw ApiError.unauthorized('Missing webhook signature header.');
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw ApiError.unauthorized('Invalid webhook HMAC signature.');
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const { providerRef, status, failureReason } = payload;

    if (!providerRef || !['Paid', 'Failed'].includes(status)) {
      throw ApiError.badRequest('Invalid webhook payload.');
    }

    const payout = await payrollService.processPayoutWebhook({
      providerRef,
      status,
      failureReason
    });

    res.json({ success: true, data: payout });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

