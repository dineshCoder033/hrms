const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const Employee = require('../models/Employee');
const ApiError = require('../errors/ApiError');
const env = require('../config/env');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Generate Token Pair
const generateTokenPair = (user) => {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    employeeId: user.employeeId ? user.employeeId.toString() : null
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

// Set Refresh Cookie Helper (strictly HTTP-only; cross-origin safe in production)
const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.isAccountLocked()) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil) - Date.now()) / (60 * 1000));
      throw ApiError.forbidden(`Account is temporarily locked due to 5 failed attempts. Please try again in ${remainingMinutes} minutes.`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact HR.');
    }

    // Reset failed attempts upon successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(ApiError.badRequest(error.errors[0]?.message || 'Invalid input'));
    }
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || !user.refreshToken || user.refreshToken !== hashToken(token)) {
      throw ApiError.unauthorized('Invalid or expired refresh token. Please login again.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is inactive.');
    }

    const tokens = generateTokenPair(user);
    user.refreshToken = hashToken(tokens.refreshToken);
    await user.save();

    setRefreshCookie(res, tokens.refreshToken);

    return res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    next(ApiError.unauthorized('Invalid refresh token.'));
  }
};

const setPasswordSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number')
});

const setPassword = async (req, res, next) => {
  try {
    const { token, password } = setPasswordSchema.parse(req.body);
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      inviteTokenHash: tokenHash,
      inviteExpiresAt: { $gt: new Date() }
    }).select('+inviteTokenHash +inviteExpiresAt');

    if (!user) {
      throw ApiError.badRequest('Invalid or expired invitation token.');
    }

    user.password = password;
    user.mustChangePassword = false;
    user.inviteTokenHash = undefined;
    user.inviteExpiresAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password set successfully! You can now log in.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(ApiError.badRequest(error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('employeeId');
    if (!user) throw ApiError.notFound('User not found');
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'New password must contain at least one letter and one number')
});

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(ApiError.badRequest(error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().optional()
});

const updateProfile = async (req, res, next) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user.id);
    if (!user) throw ApiError.notFound('User not found');

    if (validated.email && validated.email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({
        email: validated.email.toLowerCase(),
        _id: { $ne: user._id }
      });
      if (emailTaken) {
        throw ApiError.badRequest('This email address is already in use by another account.');
      }
      user.email = validated.email.toLowerCase();
      if (user.employeeId) {
        await Employee.findByIdAndUpdate(user.employeeId, { email: user.email });
      }
    }

    if (validated.name) {
      user.name = validated.name;
      if (user.employeeId) {
        await Employee.findByIdAndUpdate(user.employeeId, { name: user.name });
      }
    }

    if (validated.avatar !== undefined) {
      user.avatar = validated.avatar;
      if (user.employeeId) {
        await Employee.findByIdAndUpdate(user.employeeId, { avatar: validated.avatar });
      }
    }

    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(ApiError.badRequest(error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refreshAccessToken,
  setPassword,
  changePassword,
  updateProfile,
  me,
  logout
};
