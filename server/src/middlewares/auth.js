const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../errors/ApiError');

/**
 * Middleware to authenticate requests using JWT Access Token and reload user from MongoDB
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) throw ApiError.unauthorized('Please log in.');

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('name email role employeeId isActive');

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Account inactive.');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId?.toString() || null
    };

    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('TOKEN_EXPIRED'));
    }
    if (e.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }
    next(e);
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('Admin', 'HR', 'Manager', 'Employee')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User is not authenticated.'));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied: Requires ${roles.join(' or ')} privileges.`));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
