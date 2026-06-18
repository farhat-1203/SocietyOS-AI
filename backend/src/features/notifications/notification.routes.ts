import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateParams } from '@middleware/validation';
import { idParamSchema } from '@utils/validators';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// Apply auth + tenancy to all notification routes
router.use(authMiddleware);
router.use(tenancyMiddleware);

// ─── GET /api/notifications ───────────────────────────────────────────────────
// List paginated notifications for the authenticated user
// Super Admin sees all notifications across societies
router.get(
  '/',
  checkPermission('notifications', 'read'),
  asyncHandler(notificationController.listNotifications)
);

// ─── GET /api/notifications/unread-count ──────────────────────────────────────
// Get count of unread notifications for the authenticated user
// NOTE: must be defined before /:id routes to avoid 'unread-count' being treated as an ID
router.get(
  '/unread-count',
  checkPermission('notifications', 'read'),
  asyncHandler(notificationController.getUnreadCount)
);

// ─── PATCH /api/notifications/read-all ────────────────────────────────────────
// Mark all unread notifications as read for the authenticated user
// NOTE: must be defined before /:id/read to avoid 'read-all' being treated as an ID
router.patch(
  '/read-all',
  checkPermission('notifications', 'read'),
  asyncHandler(notificationController.markAllAsRead)
);

// ─── PATCH /api/notifications/:id/read ────────────────────────────────────────
// Mark a single notification as read
router.patch(
  '/:id/read',
  checkPermission('notifications', 'read'),
  validateParams(idParamSchema),
  asyncHandler(notificationController.markAsRead)
);

// ─── DELETE /api/notifications/:id ────────────────────────────────────────────
// Delete a single notification
router.delete(
  '/:id',
  checkPermission('notifications', 'read'),
  validateParams(idParamSchema),
  asyncHandler(notificationController.deleteNotification)
);

export default router;
