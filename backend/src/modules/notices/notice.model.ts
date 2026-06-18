import mongoose, { Document, Schema } from 'mongoose';

export type NoticeStatus = 'Draft' | 'Published' | 'Archived';

export interface INotice extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  attachments: string[];
  status: NoticeStatus;
  societyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  publishedBy?: mongoose.Types.ObjectId | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
      index: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ societyId: 1, status: 1 });
noticeSchema.index({ createdBy: 1 });
noticeSchema.index({ publishedAt: -1 });

const Notice = mongoose.model<INotice>('Notice', noticeSchema);

export default Notice;
