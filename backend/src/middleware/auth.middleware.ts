import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.util';
import { JWTPayload } from '../types/auth.types';

const prisma = new PrismaClient();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { id: string };
    }
  }
}

/**
 * Middleware to authenticate JWT token
 * Verifies access token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let payload: JWTPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
      select: { id: true, isActive: true, role: true, email: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to authorize based on roles
 * Must be used after authenticate middleware
 */
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for public endpoints that behave differently for authenticated users
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId, deletedAt: null },
        select: { id: true, isActive: true, role: true, email: true },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        };
      }
    } catch (error) {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    next();
  }
};
