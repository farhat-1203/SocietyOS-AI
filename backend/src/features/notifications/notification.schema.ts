import { Schema } from 'mongoose';

export const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
      index: true,
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
      enum: [
        'Complaint Created',
        'Complaint Assigned',
        'Complaint Resolved',
        'Complaint Closed',
        'Facility Booking Created',
        'Facility Booking Approved',
        'Notice Published',
        'Vendor Assigned',
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Complaint', 'FacilityBooking', 'Notice'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false, // notifications are insert-only, but we may mark them as read, so updatedAt is optional. We will use timestamps: true to automatically maintain createdAt and updatedAt.
    },
  }
);

// Compound index for querying user's unread notifications
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
