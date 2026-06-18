import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface IFacility extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  bookingDurationMinutes: number;
  operatingHours: {
    start: string;
    end: string;
  };
  isActive: boolean;
  societyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  societyId: mongoose.Types.ObjectId;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  approvedBy?: mongoose.Types.ObjectId | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const operatingHoursSchema = new Schema(
  {
    start: {
      type: String,
      required: true,
      trim: true,
    },
    end: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const facilitySchema = new Schema<IFacility>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    bookingDurationMinutes: {
      type: Number,
      required: true,
      min: 15,
    },
    operatingHours: {
      type: operatingHoursSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
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
    },
  },
  {
    timestamps: true,
  }
);

const bookingSchema = new Schema<IBooking>(
  {
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
      index: true,
    },
    residentId: {
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
    bookingDate: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

facilitySchema.index({ societyId: 1, isActive: 1 });
bookingSchema.index({ societyId: 1 });
bookingSchema.index({ facilityId: 1, bookingDate: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ residentId: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });

const Facility = mongoose.model<IFacility>('Facility', facilitySchema);
const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export { Facility, Booking };
