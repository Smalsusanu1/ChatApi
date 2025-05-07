import { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Configure rate limits for different types of routes
export const applyRateLimits = (app: Express) => {
  // Default rate limit for all routes
  const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        message: options.message
      });
    }
  });

  // Strict rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts, please try again after 1 hour',
    handler: (req, res, next, options) => {
      logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        message: options.message
      });
    }
  });

  // Moderate rate limit for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many API requests, please try again after 15 minutes',
    handler: (req, res, next, options) => {
      logger.warn(`API rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        message: options.message
      });
    }
  });

  // Apply limiters to specific routes
  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/admin', apiLimiter);
  app.use('/api/v1/users', apiLimiter);
  app.use('/api/v1/messages', apiLimiter);
  app.use('/api/v1/groups', apiLimiter);
  
  // Apply default limiter to all other routes
  app.use(defaultLimiter);

  logger.info('Rate limiting middleware applied');
};
