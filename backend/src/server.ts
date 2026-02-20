import express from 'express';
import { PrismaClient } from '@prisma/client';
import { setupSecurity } from './middleware/security.middleware';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter.middleware';
import { requestLogger, errorLogger, logger } from './middleware/logger.middleware';

// Import routes
import authRoutes from './auth/auth.routes';
import userRoutes from './users/user.routes';
import courseRoutes from './courses/course.routes';
import lessonRoutes from './lessons/lesson.routes';
import enrollmentRoutes from './enrollments/enrollment.routes';
import progressRoutes from './progress/progress.routes';
import analyticsRoutes from './analytics/analytics.routes';
import moduleRoutes from './modules/module.routes';
import superAdminRoutes from './superadmin/superadmin.routes';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security
setupSecurity(app);

// Logging
app.use(requestLogger);

// Rate limiting
app.use(globalRateLimiter);

// Health check (no rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorLogger);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server only if not in serverless environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

export default app;
