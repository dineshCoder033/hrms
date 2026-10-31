const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');
const User = require('../models/User');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'taskorbit_access_token_super_secret_jwt_key_2026';

/**
 * Middleware to authenticate requests using JWT Access Token
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is missing. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    
    // Attach user payload
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      employeeId: decoded.employeeId || null
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token expired. Please refresh token.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles (e.g. 'Admin', 'HR', 'Manager', 'Employee')
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
