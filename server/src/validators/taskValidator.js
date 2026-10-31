const { z } = require('zod');

const createTaskSchema = {
  body: z.object({
    title: z.string().min(2, 'Task title is required'),
    clientName: z.string().min(2, 'Client/assignee name is required'),
    clientRole: z.string().min(2, 'Client/assignee role is required'),
    clientAvatar: z.string().optional(),
    taskType: z.enum(['Google Meet Call', 'Send Proposal', 'Review Document', 'Interview', 'Contract Signing']).optional().default('Google Meet Call'),
    scheduledTime: z.string().optional().default('2:00 pm'),
    scheduledDate: z.string().optional().default('Today'),
    amount: z.string().nullable().optional(),
    status: z.enum(['Call scheduled', 'Waiting Proposal', 'Overdue', 'Completed', 'In Review']).optional().default('Call scheduled'),
    category: z.enum(['Hot', 'Due Today', 'Overdue', 'Completed']).optional().default('Due Today'),
    attendees: z.array(z.object({
      name: z.string(),
      avatar: z.string().optional()
    })).optional().default([]),
    isHighlight: z.boolean().optional().default(false)
  })
};

const updateTaskSchema = {
  params: z.object({
    id: z.string().min(1, 'Task ID is required')
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    clientName: z.string().optional(),
    clientRole: z.string().optional(),
    clientAvatar: z.string().optional(),
    taskType: z.string().optional(),
    scheduledTime: z.string().optional(),
    scheduledDate: z.string().optional(),
    amount: z.string().nullable().optional(),
    status: z.enum(['Call scheduled', 'Waiting Proposal', 'Overdue', 'Completed', 'In Review']).optional(),
    category: z.enum(['Hot', 'Due Today', 'Overdue', 'Completed']).optional(),
    attendees: z.array(z.object({
      name: z.string(),
      avatar: z.string().optional()
    })).optional(),
    isHighlight: z.boolean().optional()
  })
};

module.exports = {
  createTaskSchema,
  updateTaskSchema
};
