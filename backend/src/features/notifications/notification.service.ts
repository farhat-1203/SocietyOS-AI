import mongoose from 'mongoose';
import Notification, { INotification } from './notification.model';
import type { CreateNotificationInput } from './notification.validation';

// ─── Notification Service ─────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Create a new notification
   */
  createNotification: async (data: CreateNotificationInput): Promise<INotification> => {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(data.userId),
      societyId: new mongoose.Types.ObjectId(data.societyId),
      title: data.title,
      message: data.message,
      type: data.type,
      entityType: data.entityType,
      entityId: new mongoose.Types.ObjectId(data.entityId),
      isRead: false,
    });

    return notification.save();
  },

  /**
   * List paginated notifications for a specific user within a society
   */
  listNotifications: async (
    userId: string,
    societyId: string,
    options: { page?: number; limit?: number; isRead?: boolean } = {}
  ): Promise<{ notifications: INotification[]; total: number }> => {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
      societyId: new mongoose.Types.ObjectId(societyId),
    };

    if (options.isRead !== undefined) {
      filter.isRead = options.isRead;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    return { notifications, total };
  },

  /**
   * List all notifications across all societies (Super Admin)
   */
  listAllNotifications: async (
    options: { page?: number; limit?: number; isRead?: boolean } = {}
  ): Promise<{ notifications: INotification[]; total: number }> => {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (options.isRead !== undefined) {
      filter.isRead = options.isRead;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    return { notifications, total };
  },

  /**
   * Get unread notification count for a specific user
   */
  getUnreadCount: async (userId: string, societyId: string): Promise<number> => {
    return Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      societyId: new mongoose.Types.ObjectId(societyId),
      isRead: false,
    });
  },

  /**
   * Get global unread notification count (Super Admin)
   */
  getGlobalUnreadCount: async (): Promise<number> => {
    return Notification.countDocuments({ isRead: false });
  },

  /**
   * Mark a single notification as read (scoped to user + society)
   */
  markAsRead: async (
    id: string,
    userId: string,
    societyId: string
  ): Promise<INotification | null> => {
    return Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
        societyId: new mongoose.Types.ObjectId(societyId),
      },
      { $set: { isRead: true } },
      { new: true }
    );
  },

  /**
   * Mark a single notification as read (Super Admin — no user/society scope)
   */
  markAsReadAdmin: async (id: string): Promise<INotification | null> => {
    return Notification.findByIdAndUpdate(id, { $set: { isRead: true } }, { new: true });
  },

  /**
   * Mark all unread notifications as read for a specific user
   */
  markAllAsRead: async (
    userId: string,
    societyId: string
  ): Promise<{ modifiedCount: number }> => {
    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        societyId: new mongoose.Types.ObjectId(societyId),
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return { modifiedCount: result.modifiedCount };
  },

  /**
   * Mark all unread notifications as read (Super Admin — global)
   */
  markAllAsReadAdmin: async (): Promise<{ modifiedCount: number }> => {
    const result = await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });

    return { modifiedCount: result.modifiedCount };
  },

  /**
   * Delete a specific notification (scoped to user + society)
   */
  deleteNotification: async (
    id: string,
    userId: string,
    societyId: string
  ): Promise<boolean> => {
    const result = await Notification.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
      societyId: new mongoose.Types.ObjectId(societyId),
    });

    return result.deletedCount > 0;
  },

  /**
   * Delete a notification by ID (Super Admin — no user/society scope)
   */
  deleteNotificationAdmin: async (id: string): Promise<boolean> => {
    const result = await Notification.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    return result.deletedCount > 0;
  },
};
