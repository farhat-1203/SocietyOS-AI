import mongoose, { Schema, Document } from 'mongoose';

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType =
  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_ASSIGNED'
  | 'COMPLAINT_RESOLVED'
  | 'COMPLAINT_CLOSED'
  | 'FACILITY_BOOKING_CREATED'
  | 'FACILITY_BOOKING_APPROVED'
  | 'NOTICE_PUBLISHED';

export const NOTIFICATION_TYPES: NotificationType[] = [
  'COMPLAINT_CREATED',
  'COMPLAINT_ASSIGNED',
  'COMPLAINT_RESOLVED',
  'COMPLAINT_CLOSED',
  'FACILITY_BOOKING_CREATED',
  'FACILITY_BOOKING_APPROVED',
  'NOTICE_PUBLISHED',
];

export type NotificationEntityType = 'Complaint' | 'FacilityBooking' | 'Notice';

export const NOTIFICATION_ENTITY_TYPES: NotificationEntityType[] = [
  'Complaint',
  'FacilityBooking',
  'Notice',
];

// ─── Interface ────────────────────────────────────────────────────────────────

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  societyId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: NOTIFICATION_TYPES,
    },
    entityType: {
      type: String,
      required: true,
      enum: NOTIFICATION_ENTITY_TYPES,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

notificationSchema.index({ userId: 1 });
notificationSchema.index({ societyId: 1 });
notificationSchema.index({ isRead: 1 });

// Compound indexes for common query patterns
notificationSchema.index({ userId: 1, societyId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, societyId: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
