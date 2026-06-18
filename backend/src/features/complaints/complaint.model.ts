import mongoose, { Schema, Document } from 'mongoose';

export type ComplaintCategory =
  | 'Maintenance'
  | 'Plumbing'
  | 'Electrical'
  | 'Security'
  | 'Housekeeping'
  | 'Other';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface IComplaint extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  attachments: string[];
  societyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  resolvedBy?: mongoose.Types.ObjectId | null;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Maintenance', 'Plumbing', 'Electrical', 'Security', 'Housekeeping', 'Other'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    attachments: {
      type: [String],
      default: [],
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
complaintSchema.index({ societyId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ createdBy: 1 });

// Compound indexes for optimization
complaintSchema.index({ societyId: 1, status: 1 });
complaintSchema.index({ societyId: 1, createdBy: 1 });

const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);

export default Complaint;
