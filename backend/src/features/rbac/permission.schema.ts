import { Schema } from 'mongoose';

export const permissionSchema = new Schema(
  {
    societyId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: [
        'complaints',
        'facilities',
        'notices',
        'vendors',
        'knowledge',
        'users',
        'rbac',
        'dashboard',
        'notifications',
      ],
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'assign', 'publish', 'manage', 'edit', 'view'],
    },
    description: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Unique index: one permission per society (resource + action)
permissionSchema.index({ societyId: 1, resource: 1, action: 1 }, { unique: true });
