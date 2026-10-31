const { z } = require('zod');

const createLeaveSchema = {
  body: z.object({
    employeeId: z.string().optional(),
    employeeName: z.string().optional(),
    employeeAvatar: z.string().optional(),
    leaveType: z.enum(['Casual Leave', 'Sick Leave', 'Annual Leave', 'Maternity/Paternity', 'Unpaid']),
    startDate: z.string().min(4, 'Start date is required'),
    endDate: z.string().min(4, 'End date is required'),
    daysCount: z.coerce.number().positive('Days count must be at least 1').optional().default(1),
    reason: z.string().min(3, 'Reason must be at least 3 characters')
  })
};

const updateLeaveStatusSchema = {
  params: z.object({
    id: z.string().min(1, 'Leave ID is required')
  }),
  body: z.object({
    status: z.enum(['Pending', 'Approved', 'Rejected'])
  })
};

module.exports = {
  createLeaveSchema,
  updateLeaveStatusSchema
};
