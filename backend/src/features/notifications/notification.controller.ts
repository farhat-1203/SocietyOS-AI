import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { sendSuccess, sendSuccessWithPagination, sendNoContent } from '@utils/response';
import { ValidationError, NotFoundError } from '@utils/errors';
import { getPaginationFromQuery, formatPaginationMeta } from '@utils/helpers';
import { notificationService } from './notification.service';

// ─── Helper ───────────────────────────────────────────────────────────────────

const isSuperAdmin = (req: AuthenticatedRequest): boolean =>
  req.user?.roles?.includes('Super Admin') ?? false;

// ─── List Notifications ───────────────────────────────────────────────────────

export const listNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { page, limit } = getPaginationFromQuery(req.query as Record<string, unknown>);

  // Optional filter: ?isRead=true / ?isRead=false
  let isRead: boolean | undefined;
  if (req.query.isRead === 'true') isRead = true;
  else if (req.query.isRead === 'false') isRead = false;

  // Super Admin: cross-society access
  if (isSuperAdmin(req)) {
    const { notifications, total } = await notificationService.listAllNotifications({
      page,
      limit,
      isRead,
    });

    return sendSuccessWithPagination(
      res,
      notifications,
      formatPaginationMeta(page, limit, total)
    );
  }

  // Regular users: only their own notifications within their society
  const { notifications, total } = await notificationService.listNotifications(
    req.user.userId,
    req.tenancy.societyId,
    { page, limit, isRead }
  );

  return sendSuccessWithPagination(
    res,
    notifications,
    formatPaginationMeta(page, limit, total)
  );
};

// ─── Get Unread Count ─────────────────────────────────────────────────────────

export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  // Super Admin: global unread count
  if (isSuperAdmin(req)) {
    const unreadCount = await notificationService.getGlobalUnreadCount();
    return sendSuccess(res, { unreadCount });
  }

  const unreadCount = await notificationService.getUnreadCount(
    req.user.userId,
    req.tenancy.societyId
  );

  return sendSuccess(res, { unreadCount });
};

// ─── Mark Single Notification as Read ─────────────────────────────────────────

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;

  // Super Admin: no user/society scoping
  if (isSuperAdmin(req)) {
    const notification = await notificationService.markAsReadAdmin(id);

    if (!notification) {
      throw new NotFoundError('Notification', id);
    }

    return sendSuccess(res, notification, { message: 'Notification marked as read' });
  }

  const notification = await notificationService.markAsRead(
    id,
    req.user.userId,
    req.tenancy.societyId
  );

  if (!notification) {
    throw new NotFoundError('Notification', id);
  }

  return sendSuccess(res, notification, { message: 'Notification marked as read' });
};

// ─── Mark All Notifications as Read ───────────────────────────────────────────

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  // Super Admin: mark all globally
  if (isSuperAdmin(req)) {
    const result = await notificationService.markAllAsReadAdmin();
    return sendSuccess(res, result, { message: 'All notifications marked as read' });
  }

  const result = await notificationService.markAllAsRead(
    req.user.userId,
    req.tenancy.societyId
  );

  return sendSuccess(res, result, { message: 'All notifications marked as read' });
};

// ─── Delete Notification ──────────────────────────────────────────────────────

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params;

  // Super Admin: no user/society scoping
  if (isSuperAdmin(req)) {
    const deleted = await notificationService.deleteNotificationAdmin(id);

    if (!deleted) {
      throw new NotFoundError('Notification', id);
    }

    return sendNoContent(res);
  }

  const deleted = await notificationService.deleteNotification(
    id,
    req.user.userId,
    req.tenancy.societyId
  );

  if (!deleted) {
    throw new NotFoundError('Notification', id);
  }

  return sendNoContent(res);
};
