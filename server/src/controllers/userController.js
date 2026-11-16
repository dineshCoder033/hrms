const { z } = require('zod');
const User = require('../models/User');
const Employee = require('../models/Employee');
const ApiError = require('../errors/ApiError');

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  role: z.enum(['Admin', 'HR', 'Manager', 'Employee']).default('Employee'),
  employeeId: z.string().optional()
});

const createUser = async (req, res, next) => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    // Security Guard: HR cannot create Admin roles. Only Admin can create Admin.
    if (validatedData.role === 'Admin' && req.user.role !== 'Admin') {
      throw ApiError.forbidden('Only Administrators can create an Admin user account.');
    }

    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      throw ApiError.badRequest('A user with this email address already exists.');
    }

    let linkedEmployeeId = validatedData.employeeId || null;
    if (!linkedEmployeeId) {
      const emp = await Employee.findOne({ email: validatedData.email.toLowerCase() });
      if (emp) linkedEmployeeId = emp._id;
    }

    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: validatedData.password,
      role: validatedData.role,
      employeeId: linkedEmployeeId,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      data: newUser.toJSON()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(ApiError.badRequest(error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('employeeId', 'name role department email');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers
};

