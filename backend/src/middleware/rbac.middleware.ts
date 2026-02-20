import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Check if user owns a course
 */
export const checkCourseOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Super Admin and Admin bypass ownership check
    if ([Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
      next();
      return;
    }

    const courseId = req.params.courseId || req.params.id;

    if (!courseId) {
      res.status(400).json({ error: 'Course ID required' });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
      select: { instructorId: true },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.instructorId !== req.user.userId) {
      res.status(403).json({ error: 'You do not own this course' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Check if user is enrolled in a course
 */
export const checkEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Admins bypass enrollment check
    if ([Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
      next();
      return;
    }

    const courseId = req.params.courseId || req.params.id;

    if (!courseId) {
      res.status(400).json({ error: 'Course ID required' });
      return;
    }

    // Instructors can access their own courses
    if (req.user.role === Role.INSTRUCTOR) {
      const course = await prisma.course.findUnique({
        where: { id: courseId, deletedAt: null },
        select: { instructorId: true },
      });

      if (course?.instructorId === req.user.userId) {
        next();
        return;
      }
    }

    // Students must be enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        studentId: req.user.userId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    if (!enrollment) {
      res.status(403).json({ error: 'You are not enrolled in this course' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Check if user can access another user's data
 */
export const checkUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const targetUserId = req.params.userId || req.params.id;

    if (!targetUserId) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    // Admins can access any user
    if ([Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
      next();
      return;
    }

    // Users can only access their own data
    if (req.user.userId !== targetUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Check if instructor can access student data in their course
 */
export const checkInstructorStudentAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Admins bypass check
    if ([Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
      next();
      return;
    }

    const { courseId, studentId } = req.params;

    if (!courseId || !studentId) {
      res.status(400).json({ error: 'Course ID and Student ID required' });
      return;
    }

    // Verify instructor owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId, deletedAt: null },
      select: { instructorId: true },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (course.instructorId !== req.user.userId) {
      res.status(403).json({ error: 'You do not own this course' });
      return;
    }

    // Verify student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        studentId,
        deletedAt: null,
      },
    });

    if (!enrollment) {
      res.status(404).json({ error: 'Student not enrolled in this course' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Generic ownership checker factory
 */
export const checkOwnership = (
  model: 'course' | 'enrollment' | 'lesson' | 'module',
  ownerField: string = 'instructorId',
  idParam: string = 'id'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Admins bypass ownership
      if ([Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
        next();
        return;
      }

      const resourceId = req.params[idParam];

      if (!resourceId) {
        res.status(400).json({ error: `${model} ID required` });
        return;
      }

      const resource = await (prisma[model] as any).findUnique({
        where: { id: resourceId, deletedAt: null },
        select: { [ownerField]: true },
      });

      if (!resource) {
        res.status(404).json({ error: `${model} not found` });
        return;
      }

      if (resource[ownerField] !== req.user.userId) {
        res.status(403).json({ error: `You do not own this ${model}` });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

/**
 * Check if user can manage users (create, update, delete)
 */
export const canManageUsers = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (![Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
    res.status(403).json({ error: 'Only admins can manage users' });
    return;
  }

  next();
};

/**
 * Check if user can manage specific role
 */
export const canManageRole = (targetRole: Role) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Super Admin can manage anyone
    if (req.user.role === Role.SUPER_ADMIN) {
      next();
      return;
    }

    // Admin cannot manage Super Admin or other Admins
    if (req.user.role === Role.ADMIN) {
      if ([Role.SUPER_ADMIN, Role.ADMIN].includes(targetRole)) {
        res.status(403).json({ error: 'Cannot manage admin users' });
        return;
      }
      next();
      return;
    }

    res.status(403).json({ error: 'Insufficient permissions' });
  };
};

/**
 * Check if user can access analytics
 */
export const canAccessAnalytics = (scope: 'platform' | 'course' | 'student') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      switch (scope) {
        case 'platform':
          // Only admins can access platform-wide analytics
          if (![Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
            res.status(403).json({ error: 'Admin access required' });
            return;
          }
          break;

        case 'course':
          // Admins can access all, instructors only their own
          if ([Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
            next();
            return;
          }

          if (req.user.role === Role.INSTRUCTOR) {
            const courseId = req.params.courseId || req.params.id;
            const course = await prisma.course.findUnique({
              where: { id: courseId, deletedAt: null },
              select: { instructorId: true },
            });

            if (!course || course.instructorId !== req.user.userId) {
              res.status(403).json({ error: 'Access denied' });
              return;
            }
          } else {
            res.status(403).json({ error: 'Instructor access required' });
            return;
          }
          break;

        case 'student':
          // Students can only access their own analytics
          const studentId = req.params.studentId || req.params.id;

          if ([Role.SUPER_ADMIN, Role.ADMIN].includes(req.user.role)) {
            next();
            return;
          }

          if (req.user.userId !== studentId) {
            res.status(403).json({ error: 'Access denied' });
            return;
          }
          break;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};
