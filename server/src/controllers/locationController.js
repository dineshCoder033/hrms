const { z } = require('zod');
const OfficeLocation = require('../models/OfficeLocation');
const ApiError = require('../errors/ApiError');

const locationSchema = z.object({
  name: z.string().min(2, 'Location name is required'),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().min(10).default(150),
  address: z.string().optional(),
  isActive: z.boolean().default(true)
});

const getLocations = async (req, res, next) => {
  try {
    const locations = await OfficeLocation.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const validated = locationSchema.parse(req.body);
    const location = await OfficeLocation.create(validated);
    res.status(201).json({ success: true, message: 'Office location added', data: location });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(ApiError.badRequest(error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const updated = await OfficeLocation.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });
    if (!updated) throw ApiError.notFound('Office location not found');
    res.json({ success: true, message: 'Office location updated', data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const deleted = await OfficeLocation.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!deleted) throw ApiError.notFound('Office location not found');
    res.json({ success: true, message: 'Office location deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
};

