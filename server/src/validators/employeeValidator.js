const { z } = require('zod');

const educationItemSchema = z.object({
  degree: z.string().optional(),
  institution: z.string().optional(),
  yearOfPassing: z.string().optional(),
  percentageOrCgpa: z.string().optional()
});

const bankSchema = z.object({
  holderName: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  ifsc: z.string().optional(),
  pincode: z.string().optional(),
  accountNumber: z.string().optional()
}).optional();

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional()
}).optional();

const createEmployeeSchema = {
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    avatar: z.string().optional(),
    email: z.string().email('Valid email address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional(),
    bloodGroup: z.string().optional(),
    maritalStatus: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    joinDate: z.string().optional(),

    role: z.string().min(2, 'Role must be at least 2 characters'),
    department: z.string().min(2, 'Department is required'),
    designation: z.string().optional(),
    workMode: z.enum(['Office', 'Remote', 'Hybrid']).optional().default('Office'),
    status: z.enum(['Active', 'On Leave', 'Probation', 'Remote', 'Resigned', 'Terminated']).optional().default('Active'),
    experienceYears: z.coerce.number().min(0).optional().default(0),

    annualCtc: z.coerce.number().positive('Salary must be a positive number').optional().default(65000),
    salary: z.coerce.number().positive().optional(),
    isPfEligible: z.boolean().optional().default(true),
    pfNumber: z.string().optional(),
    isEsiEligible: z.boolean().optional().default(false),
    esiNumber: z.string().optional(),

    aadhaarNumber: z.string().optional(),
    panNumber: z.string().optional(),

    education: z.array(educationItemSchema).optional(),
    bank: bankSchema,
    address: addressSchema,
    skills: z.union([z.array(z.string()), z.string()]).optional().transform(val => {
      if (!val) return ['Problem Solving'];
      if (Array.isArray(val)) return val;
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }),
    reportsTo: z.string().optional()
  })
};

const updateEmployeeSchema = {
  params: z.object({
    id: z.string().min(1, 'Employee ID is required')
  }),
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    avatar: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    bloodGroup: z.string().optional(),
    maritalStatus: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    joinDate: z.string().optional(),

    role: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    workMode: z.enum(['Office', 'Remote', 'Hybrid']).optional(),
    status: z.enum(['Active', 'On Leave', 'Probation', 'Remote', 'Resigned', 'Terminated']).optional(),
    experienceYears: z.coerce.number().min(0).optional(),

    annualCtc: z.coerce.number().positive().optional(),
    salary: z.coerce.number().positive().optional(),
    isPfEligible: z.boolean().optional(),
    pfNumber: z.string().optional(),
    isEsiEligible: z.boolean().optional(),
    esiNumber: z.string().optional(),

    aadhaarNumber: z.string().optional(),
    panNumber: z.string().optional(),

    education: z.array(educationItemSchema).optional(),
    bank: bankSchema,
    address: addressSchema,
    skills: z.union([z.array(z.string()), z.string()]).optional(),
    reportsTo: z.string().optional()
  })
};

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema
};
