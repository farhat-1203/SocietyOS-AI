import mongoose from 'mongoose';
import Notification, { INotification } from './notification.model';
import type { AuthenticatedRequest } from '@/types/express';

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  societyId?: string;
}

export const notificationService = {
  createNotification: async (payload: Omit<INotification, '_id' | 'createdAt' | 'updatedAt'>) => {
    return Notification.create(payload);
  },

  listNotifications: async (user: AuthenticatedRequest['user'], query: NotificationQuery) => {
    const filter: Record<string, any> = {};

    if (!user) {
      throw new Error('Authenticated user required');
    }

    if (!user.roles.includes('Super Admin')) {
      filter.userId = new mongoose.Types.ObjectId(user.userId);
      filter.societyId = new mongoose.Types.ObjectId(user.societyId);
    } else if (query.societyId) {
      filter.societyId = new mongoose.Types.ObjectId(query.societyId);
    }

    if (typeof query.isRead === 'boolean') {
      filter.isRead = query.isRead;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  getUnreadCount: async (user: AuthenticatedRequest['user']) => {
    if (!user) {
      throw new Error('Authenticated user required');
    }

    const filter: Record<string, any> = {
      isRead: false,
    };

    if (!user.roles.includes('Super Admin')) {
      filter.userId = new mongoose.Types.ObjectId(user.userId);
      filter.societyId = new mongoose.Types.ObjectId(user.societyId);
    }

    return Notification.countDocuments(filter);
  },

  markAsRead: async (user: AuthenticatedRequest['user'], notificationId: string) => {
    if (!user) {
      throw new Error('Authenticated user required');
    }

    const filter: Record<string, any> = { _id: new mongoose.Types.ObjectId(notificationId) };

    if (!user.roles.includes('Super Admin')) {
      filter.userId = new mongoose.Types.ObjectId(user.userId);
      filter.societyId = new mongoose.Types.ObjectId(user.societyId);
    }

    const notification = await Notification.findOneAndUpdate(filter, { isRead: true }, { new: true }).lean();

    return notification;
  },

  markAllAsRead: async (user: AuthenticatedRequest['user']) => {
    if (!user) {
      throw new Error('Authenticated user required');
    }

    const filter: Record<string, any> = {
      isRead: false,
    };

    if (!user.roles.includes('Super Admin')) {
      filter.userId = new mongoose.Types.ObjectId(user.userId);
      filter.societyId = new mongoose.Types.ObjectId(user.societyId);
    }

    const result = await Notification.updateMany(filter, { isRead: true });

    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    };
  },

  deleteNotification: async (user: AuthenticatedRequest['user'], notificationId: string) => {
    if (!user) {
      throw new Error('Authenticated user required');
    }

    const filter: Record<string, any> = { _id: new mongoose.Types.ObjectId(notificationId) };

    if (!user.roles.includes('Super Admin')) {
      filter.userId = new mongoose.Types.ObjectId(user.userId);
      filter.societyId = new mongoose.Types.ObjectId(user.societyId);
    }

    const result = await Notification.deleteOne(filter);

    return result.deletedCount === 1;
  },
};
