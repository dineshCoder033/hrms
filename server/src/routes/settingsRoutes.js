const express = require('express');
const router = express.Router();
const CompanySettings = require('../models/CompanySettings');
const { authenticate, authorize } = require('../middlewares/auth');
const ApiError = require('../errors/ApiError');

router.use(authenticate);

// Get System & Work Shift Settings (All authenticated users can view shift timings)
router.get('/', async (req, res, next) => {
  try {
    let settings = await CompanySettings.findOne({ key: 'default' });
    if (!settings) {
      settings = await CompanySettings.create({ key: 'default' });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// Update System & Punch In/Out Shift Settings (ADMIN ONLY)
router.patch('/', authorize('Admin'), async (req, res, next) => {
  try {
    const { name, address, taxId, currency, workShift } = req.body;
    let settings = await CompanySettings.findOne({ key: 'default' });
    if (!settings) {
      settings = new CompanySettings({ key: 'default' });
    }

    if (name) settings.name = name;
    if (address) settings.address = address;
    if (taxId) settings.taxId = taxId;
    if (currency) settings.currency = currency;

    if (workShift) {
      if (workShift.startTime) settings.workShift.startTime = workShift.startTime;
      if (workShift.endTime) settings.workShift.endTime = workShift.endTime;
      if (workShift.gracePeriodMinutes !== undefined) {
        settings.workShift.gracePeriodMinutes = Number(workShift.gracePeriodMinutes);
      }
      if (workShift.halfDayThresholdHours !== undefined) {
        settings.workShift.halfDayThresholdHours = Number(workShift.halfDayThresholdHours);
      }
      if (workShift.fullDayThresholdHours !== undefined) {
        settings.workShift.fullDayThresholdHours = Number(workShift.fullDayThresholdHours);
      }
    }

    await settings.save();
    res.json({
      success: true,
      message: 'System & Work Shift Settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

