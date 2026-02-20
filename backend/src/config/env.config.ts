import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment schema validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),

  // CORS
  CORS_ORIGIN: z.string().url(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Optional
  REDIS_URL: z.string().url().optional(),
});

// Validate environment variables
export const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
};

// Export validated env
export const env = validateEnv();

// Mask sensitive values for logging
export const maskSecret = (secret: string): string => {
  if (secret.length <= 8) return '***';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
};

// Check if running in production
export const isProduction = () => env.NODE_ENV === 'production';

// Check if running in development
export const isDevelopment = () => env.NODE_ENV === 'development';
