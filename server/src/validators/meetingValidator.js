const { z } = require('zod');

const createMeetingSchema = z.object({
  title: z.string().min(2, 'Meeting title is required'),
  description: z.string().optional(),
  attendeeIds: z.array(z.string()).min(1, 'Please select at least one attendee'),
  startAt: z.string().min(1, 'Start time is required'),
  endAt: z.string().min(1, 'End time is required'),
  timezone: z.string().default('Asia/Kolkata'),
  mode: z.enum(['Online', 'Office']).default('Online'),
  meetLink: z.string().optional(),
  room: z.string().optional(),
  force: z.boolean().default(false)
});

const updateMeetingSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  attendeeIds: z.array(z.string()).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  mode: z.enum(['Online', 'Office']).optional(),
  meetLink: z.string().optional(),
  room: z.string().optional(),
  status: z.enum(['Scheduled', 'Cancelled', 'Completed']).optional()
});

const respondMeetingSchema = z.object({
  response: z.enum(['Accepted', 'Declined'])
});

module.exports = {
  createMeetingSchema,
  updateMeetingSchema,
  respondMeetingSchema
};

