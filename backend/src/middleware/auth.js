const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found.'
        });
      }

      req.user = user;
      next();
    } catch (tokenError) {
      logger.error('Token verification error:', tokenError);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};

const optional = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const hasToken = !!(authHeader && authHeader.startsWith('Bearer '));

  logger.info('[Auth] optional middleware', {
    hasToken,
    path: req.originalUrl
  });

  if (hasToken) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
        logger.info('[Auth] optional token verified successfully', {
          userId: user._id,
          path: req.originalUrl
        });
      } else {
        logger.warn('[Auth] optional token valid but user not found or inactive', {
          path: req.originalUrl
        });
      }
    } catch (error) {
      // Ignore token errors in optional auth
      logger.warn('[Auth] optional token verification failed', {
        errorMessage: error.message,
        path: req.originalUrl
      });
    }
  }

  next();
};

module.exports = { authenticate, authorize, optional };