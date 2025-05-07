import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Default global rate limiter - 100 requests per minute
const globalLimiter = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 60, // Per 60 seconds
});

// Auth endpoints rate limiter - 10 requests per minute
const authLimiter = new RateLimiterMemory({
  points: 10, // Number of points
  duration: 60, // Per 60 seconds
  blockDuration: 120, // Block for 2 minutes if exceeded
});

// Admin endpoints rate limiter - 30 requests per minute
const adminLimiter = new RateLimiterMemory({
  points: 30, // Number of points
  duration: 60, // Per 60 seconds
});

// Messaging endpoints rate limiter - 50 requests per minute
const messagingLimiter = new RateLimiterMemory({
  points: 50, // Number of points
  duration: 60, // Per 60 seconds
});

// Rate limiter middleware generator
const createRateLimiterMiddleware = (limiter: RateLimiterMemory) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get identifier - use user ID if authenticated, otherwise IP
    const key = req.user?.id?.toString() || req.ip;
    
    try {
      await limiter.consume(key);
      next();
    } catch (error) {
      // Rate limit exceeded
      return res.status(429).json({
        message: 'Too many requests, please try again later.',
      });
    }
  };
};

// Export middleware functions
export const globalRateLimiter = createRateLimiterMiddleware(globalLimiter);
export const authRateLimiter = createRateLimiterMiddleware(authLimiter);
export const adminRateLimiter = createRateLimiterMiddleware(adminLimiter);
export const messagingRateLimiter = createRateLimiterMiddleware(messagingLimiter);
