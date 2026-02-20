import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { canManageUsers, checkUserAccess, canManageRole } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Admin: List all users
router.get(
  '/users',
  authenticate,
  canManageUsers,
  (req, res) => {
    res.json({ message: 'List all users' });
  }
);

// Admin: Get user by ID
router.get(
  '/users/:id',
  authenticate,
  checkUserAccess,
  (req, res) => {
    res.json({ message: 'Get user details' });
  }
);

// Admin: Create user
router.post(
  '/users',
  authenticate,
  canManageUsers,
  (req, res) => {
    res.json({ message: 'Create user' });
  }
);

// Admin/Self: Update user
router.put(
  '/users/:id',
  authenticate,
  checkUserAccess,
  (req, res) => {
    res.json({ message: 'Update user' });
  }
);

// Admin: Delete user
router.delete(
  '/users/:id',
  authenticate,
  canManageUsers,
  (req, res) => {
    res.json({ message: 'Delete user (soft delete)' });
  }
);

// Admin: Deactivate user
router.post(
  '/users/:id/deactivate',
  authenticate,
  canManageUsers,
  (req, res) => {
    res.json({ message: 'Deactivate user' });
  }
);

// Admin: Activate user
router.post(
  '/users/:id/activate',
  authenticate,
  canManageUsers,
  (req, res) => {
    res.json({ message: 'Activate user' });
  }
);

// Super Admin: Promote user to admin
router.post(
  '/users/:id/promote',
  authenticate,
  authorize([Role.SUPER_ADMIN]),
  canManageRole(Role.ADMIN),
  (req, res) => {
    res.json({ message: 'Promote user to admin' });
  }
);

export default router;
