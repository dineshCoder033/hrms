const express = require('express');
const { z } = require('zod');
const router = express.Router();
const Holiday = require('../models/Holiday');
const { authenticate, authorize } = require('../middlewares/auth');
const ApiError = require('../errors/ApiError');

router.use(authenticate);

const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  name: z.string().min(2, 'Holiday name is required'),
  type: z.enum(['Public', 'Company']).default('Public')
});

// Get holidays
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.year) filter.year = Number(req.query.year);
    const holidays = await Holiday.find(filter).sort({ date: 1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
});

// Get single holiday
router.get('/:id', async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) throw ApiError.notFound('Holiday not found');
    res.json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
});

// Create holiday (Admin / HR only)
router.post('/', authorize('Admin', 'HR'), async (req, res, next) => {
  try {
    const validated = holidaySchema.parse(req.body);
    const year = Number(validated.date.split('-')[0]);
    const holiday = await Holiday.create({ ...validated, year });
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(ApiError.badRequest(error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
});

// Update holiday (Admin / HR only)
router.patch('/:id', authorize('Admin', 'HR'), async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) throw ApiError.notFound('Holiday not found');

    if (req.body.name) holiday.name = req.body.name;
    if (req.body.date) {
      holiday.date = req.body.date;
      holiday.year = Number(req.body.date.split('-')[0]);
    }
    if (req.body.type) holiday.type = req.body.type;
    if (req.body.isOptional !== undefined) holiday.isOptional = req.body.isOptional;

    await holiday.save();
    res.json({ success: true, message: 'Holiday updated', data: holiday });
  } catch (error) {
    next(error);
  }
});

// Delete holiday (Admin / HR only)
router.delete('/:id', authorize('Admin', 'HR'), async (req, res, next) => {
  try {
    const deleted = await Holiday.findByIdAndDelete(req.params.id);
    if (!deleted) throw ApiError.notFound('Holiday not found');
    res.json({ success: true, message: 'Holiday deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

