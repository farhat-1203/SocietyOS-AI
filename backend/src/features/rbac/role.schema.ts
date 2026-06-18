import { Schema } from 'mongoose';

export const roleSchema = new Schema(
  {
    societyId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      enum: ['Super Admin', 'Society Admin', 'Resident', 'Vendor'],
    },
    description: {
      type: String,
      default: '',
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false, // System roles cannot be deleted
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique index: one role per society (except Super Admin which is global)
roleSchema.index({ societyId: 1, name: 1 }, { unique: true, sparse: true });

// Composite index for queries
roleSchema.index({ societyId: 1, createdAt: -1 });
