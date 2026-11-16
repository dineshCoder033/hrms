const { z } = require('zod');

const punchSchema = z.object({
  type: z.enum(['in', 'out']),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  accuracy: z.coerce.number().positive().optional()
});

const reviewPunchSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
  reason: z.string().optional()
});

const regularizeAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  checkIn: z.string().min(1, 'Check-in time is required'),
  checkOut: z.string().min(1, 'Check-out time is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters')
});

module.exports = {
  punchSchema,
  reviewPunchSchema,
  regularizeAttendanceSchema
};
