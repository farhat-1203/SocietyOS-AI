import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateParams, validateQuery } from '@middleware/validation';
import { idParamSchema, listNotificationsQuerySchema } from './notification.validation';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenancyMiddleware);

router.get(
  '/',
  checkPermission('notifications', 'read'),
  validateQuery(listNotificationsQuerySchema),
  asyncHandler(notificationController.listNotifications)
);

router.get(
  '/unread-count',
  checkPermission('notifications', 'read'),
  asyncHandler(notificationController.getUnreadCount)
);

router.patch(
  '/read-all',
  checkPermission('notifications', 'read'),
  asyncHandler(notificationController.markAllAsRead)
);

router.patch(
  '/:id/read',
  checkPermission('notifications', 'read'),
  validateParams(idParamSchema),
  asyncHandler(notificationController.markAsRead)
);

router.delete(
  '/:id',
  checkPermission('notifications', 'read'),
  validateParams(idParamSchema),
  asyncHandler(notificationController.deleteNotification)
);

export default router;
