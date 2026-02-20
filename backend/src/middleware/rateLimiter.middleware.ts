import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

// Redis client (optional, falls back to memory store)
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args: string[]) => redisClient.call(...args),
        prefix: 'rl:global:',
      })
    : undefined,
});

// Auth rate limiter (stricter)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args: string[]) => redisClient.call(...args),
        prefix: 'rl:auth:',
      })
    : undefined,
});

// API rate limiter (per endpoint)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Rate limit exceeded',
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args: string[]) => redisClient.call(...args),
        prefix: 'rl:api:',
      })
    : undefined,
});
