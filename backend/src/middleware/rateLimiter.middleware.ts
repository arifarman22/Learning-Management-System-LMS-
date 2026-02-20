import rateLimit from 'express-rate-limit';

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

// API rate limiter (per endpoint)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Rate limit exceeded',
});
