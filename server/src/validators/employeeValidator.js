const { z } = require('zod');

const createEmployeeSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.string().min(2, 'Role must be at least 2 characters'),
    department: z.string().min(2, 'Department is required'),
    email: z.string().email('Valid email address is required'),
    phone: z.string().optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
    salary: z.coerce.number().positive('Salary must be a positive number').optional().default(65000),
    status: z.enum(['Active', 'On Leave', 'Probation', 'Remote']).optional().default('Active'),
    joinDate: z.string().optional(),
    location: z.string().optional().default('New York, USA'),
    performanceScore: z.coerce.number().min(0).max(100).optional().default(90),
    skills: z.union([z.array(z.string()), z.string()]).optional().transform(val => {
      if (!val) return ['Problem Solving'];
      if (Array.isArray(val)) return val;
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }),
    reportsTo: z.string().optional().default('CEO')
  })
};

const updateEmployeeSchema = {
  params: z.object({
    id: z.string().min(1, 'Employee ID is required')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.string().min(2).optional(),
    department: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    salary: z.coerce.number().positive().optional(),
    status: z.enum(['Active', 'On Leave', 'Probation', 'Remote']).optional(),
    location: z.string().optional(),
    performanceScore: z.coerce.number().min(0).max(100).optional(),
    skills: z.union([z.array(z.string()), z.string()]).optional(),
    reportsTo: z.string().optional()
  })
};

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema
};
