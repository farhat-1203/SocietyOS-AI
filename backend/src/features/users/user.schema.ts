import { Schema } from 'mongoose';

export const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Never return password in queries
    },
    name: {
      type: String,
      required: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
      index: true,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
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

// Composite indices for common queries
userSchema.index({ societyId: 1, email: 1 });
userSchema.index({ societyId: 1, status: 1 });
userSchema.index({ societyId: 1, createdAt: -1 });

// Ensure password is never selected by default
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});
