import { Router } from 'express';
import { SuperAdminController } from './superadmin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
const Role = { SUPER_ADMIN: 'SUPER_ADMIN' } as const;

const router = Router();
const superAdminController = new SuperAdminController();

// System Settings
router.get('/system/settings', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.getSettings(req, res));
router.patch('/system/settings', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.updateSettings(req, res));

// Audit Logs
router.get('/audit/logs', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.getAuditLogs(req, res));

// Security Events
router.get('/security/events', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.getSecurityEvents(req, res));

// Revenue Analytics
router.get('/analytics/revenue', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.getRevenueAnalytics(req, res));

// Subscription Analytics
router.get('/analytics/subscriptions', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.getSubscriptionAnalytics(req, res));

// Instructor Payouts
router.get('/payouts/pending', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.getPendingPayouts(req, res));

// Permissions
router.get('/permissions', authenticate, authorize([Role.SUPER_ADMIN]), (req, res) => superAdminController.getPermissions(req, res));

export default router;