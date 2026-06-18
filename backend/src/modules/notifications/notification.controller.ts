import { Response } from 'express';
import { sendSuccess, sendNoContent, sendNotFound } from '@utils/response';
import { ValidationError, NotFoundError } from '@utils/errors';
import { AuthenticatedRequest } from '@/types/express';
import { notificationService } from './notification.service';

export const listNotifications = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const query = req.query as any;
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const isRead = typeof query.isRead === 'boolean' ? query.isRead : undefined;

  const result = await notificationService.listNotifications(req.user, { page, limit, isRead });

  return sendSuccess(res, result, { message: 'Notifications retrieved successfully' });
};

export const getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const count = await notificationService.getUnreadCount(req.user);
  return sendSuccess(res, { unreadCount: count }, { message: 'Unread notification count retrieved' });
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as { id: string };
  const notification = await notificationService.markAsRead(req.user, id);

  if (!notification) {
    throw new NotFoundError('Notification', id);
  }

  return sendSuccess(res, notification, { message: 'Notification marked as read' });
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const result = await notificationService.markAllAsRead(req.user);
  return sendSuccess(res, result, { message: 'All notifications marked as read' });
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as { id: string };
  const deleted = await notificationService.deleteNotification(req.user, id);

  if (!deleted) {
    throw new NotFoundError('Notification', id);
  }

  return sendNoContent(res);
};
