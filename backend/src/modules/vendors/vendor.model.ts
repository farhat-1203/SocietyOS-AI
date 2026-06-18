import mongoose, { Document, Schema } from 'mongoose';

export type VendorType =
  | 'Electrician'
  | 'Plumber'
  | 'Housekeeping'
  | 'Security'
  | 'Carpenter'
  | 'Painter'
  | 'Appliance Repair'
  | 'Pest Control'
  | 'Other';

export interface IVendor extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  businessName: string;
  vendorType: VendorType;
  phone: string;
  email: string;
  address: string;
  description: string;
  services: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  societyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorReview extends Document {
  _id: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  societyId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    vendorType: {
      type: String,
      required: true,
      enum: [
        'Electrician',
        'Plumber',
        'Housekeeping',
        'Security',
        'Carpenter',
        'Painter',
        'Appliance Repair',
        'Pest Control',
        'Other',
      ],
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    services: {
      type: [String],
      required: true,
      default: [],
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
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
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const reviewSchema = new Schema<IVendorReview>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    residentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

vendorSchema.index({ societyId: 1 });
vendorSchema.index({ vendorType: 1 });
vendorSchema.index({ isActive: 1 });

reviewSchema.index({ vendorId: 1, societyId: 1 });

const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);
const VendorReview = mongoose.model<IVendorReview>('VendorReview', reviewSchema);

export default Vendor;
export { VendorReview };
