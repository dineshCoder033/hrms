const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const ApiError = require('../errors/ApiError');
const { getIsConnected } = require('../config/db');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'taskorbit_access_token_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'taskorbit_refresh_token_super_secret_jwt_key_2026';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate Token Pair
const generateTokenPair = (user) => {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    employeeId: user.employeeId ? user.employeeId.toString() : null
  };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

// Set Refresh Cookie Helper
const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'Employee', employeeId } = req.body;

    if (!email || !password || !name) {
      throw ApiError.badRequest('Name, email, and password are required');
    }

    if (getIsConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        throw ApiError.badRequest('An account with this email already exists.');
      }

      // Automatically link to existing employee record if matches email
      let linkedEmployeeId = employeeId || null;
      if (!linkedEmployeeId) {
        const emp = await Employee.findOne({ email: email.toLowerCase() });
        if (emp) linkedEmployeeId = emp._id;
      }

      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        role,
        employeeId: linkedEmployeeId
      });

      const { accessToken, refreshToken } = generateTokenPair(user);
      user.refreshToken = refreshToken;
      await user.save();

      setRefreshCookie(res, refreshToken);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: user.toJSON(),
          accessToken
        }
      });
    }

    // Fallback demo user
    const mockUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      employeeId: null
    };
    const { accessToken, refreshToken } = generateTokenPair(mockUser);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user: mockUser,
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    if (getIsConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        throw ApiError.unauthorized('Invalid email or password.');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password.');
      }

      if (!user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated. Please contact HR.');
      }

      const { accessToken, refreshToken } = generateTokenPair(user);
      user.refreshToken = refreshToken;
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
    }

    // In-memory demo fallback for test users
    const mockUser = {
      id: 'usr-admin',
      name: 'Admin User',
      email: email.toLowerCase(),
      role: 'Admin',
      employeeId: 'emp-1'
    };
    const { accessToken, refreshToken } = generateTokenPair(mockUser);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful (Dev Mode)',
      data: {
        user: mockUser,
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    if (getIsConnected()) {
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== token) {
        throw ApiError.unauthorized('Invalid or expired refresh token. Please login again.');
      }

      const tokens = generateTokenPair(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      setRefreshCookie(res, tokens.refreshToken);

      return res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken
        }
      });
    }

    // Fallback
    const tokens = generateTokenPair({ id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name });
    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    next(ApiError.unauthorized('Invalid refresh token.'));
  }
};

const me = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const user = await User.findById(req.user.id).populate('employeeId');
      if (!user) throw ApiError.notFound('User not found');
      return res.json({ success: true, data: user });
    }

    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (getIsConnected() && req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  me,
  logout
};
