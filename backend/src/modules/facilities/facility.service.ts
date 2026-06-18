import mongoose from 'mongoose';
import { Facility, Booking, IFacility, IBooking, BookingStatus } from './facility.model';
import type { AuthenticatedRequest } from '@/types/express';
import { ValidationError, AuthorizationError, NotFoundError } from '@utils/errors';

export interface FacilityListQuery {
  onlyActive?: boolean;
}

export interface BookingListQuery {
  facilityId?: string;
  bookingDate?: string;
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const validateOperatingWindow = (facility: IFacility, startTime: string, endTime: string): void => {
  const operatingStart = parseTime(facility.operatingHours.start);
  const operatingEnd = parseTime(facility.operatingHours.end);
  const requestedStart = parseTime(startTime);
  const requestedEnd = parseTime(endTime);

  if (requestedStart < operatingStart || requestedEnd > operatingEnd) {
    throw new ValidationError('Booking time falls outside facility operating hours');
  }
};

const ensureApprovedBookingDoesNotOverlap = async (
  facilityId: mongoose.Types.ObjectId,
  bookingDate: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: mongoose.Types.ObjectId
) => {
  const overlapFilter: Record<string, any> = {
    facilityId,
    bookingDate,
    status: 'Approved',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };

  if (excludeBookingId) {
    overlapFilter._id = { $ne: excludeBookingId };
  }

  const existing = await Booking.findOne(overlapFilter).lean();

  if (existing) {
    throw new ValidationError('Booking overlaps with an existing approved booking');
  }
};

const buildFacilityScope = (user: AuthenticatedRequest['user'], query: FacilityListQuery = {}) => {
  const filter: Record<string, any> = {};

  if (!user?.roles.includes('Super Admin')) {
    filter.societyId = new mongoose.Types.ObjectId(user?.societyId);
  }

  if (!user?.roles.includes('Super Admin') && !user?.roles.includes('Society Admin')) {
    filter.isActive = query.onlyActive !== false;
  } else if (query.onlyActive === true) {
    filter.isActive = true;
  }

  return filter;
};

const buildBookingScope = (user: AuthenticatedRequest['user'], query: BookingListQuery = {}) => {
  const filter: Record<string, any> = {};

  if (!user?.roles.includes('Super Admin')) {
    filter.societyId = new mongoose.Types.ObjectId(user?.societyId);
  }

  if (!user?.roles.includes('Super Admin') && !user?.roles.includes('Society Admin')) {
    filter.residentId = new mongoose.Types.ObjectId(user?.userId);
  }

  if (query.facilityId) {
    filter.facilityId = new mongoose.Types.ObjectId(query.facilityId);
  }
  if (query.bookingDate) {
    filter.bookingDate = query.bookingDate;
  }
  if (query.status) {
    filter.status = query.status;
  }

  return filter;
};

const ensureFacilityAccess = async (user: AuthenticatedRequest['user'], facilityId: string) => {
  const facility = await Facility.findById(facilityId).lean();

  if (!facility) {
    throw new NotFoundError('Facility', facilityId);
  }

  if (!user?.roles.includes('Super Admin') && facility.societyId.toString() !== user?.societyId) {
    throw new AuthorizationError('Access denied to facility');
  }

  return facility;
};

const ensureBookingAccess = async (user: AuthenticatedRequest['user'], bookingId: string) => {
  const booking = await Booking.findById(bookingId).lean();

  if (!booking) {
    throw new NotFoundError('Booking', bookingId);
  }

  if (user?.roles.includes('Super Admin')) {
    return booking;
  }

  if (user?.roles.includes('Society Admin')) {
    if (booking.societyId.toString() !== user.societyId) {
      throw new AuthorizationError('Access denied to booking');
    }
    return booking;
  }

  if (booking.residentId.toString() !== user?.userId) {
    throw new AuthorizationError('Access denied to booking');
  }

  return booking;
};

export const facilityService = {
  createFacility: async (user: AuthenticatedRequest['user'], payload: Omit<IFacility, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    return Facility.create({
      ...payload,
      societyId: new mongoose.Types.ObjectId(user.societyId),
      createdBy: new mongoose.Types.ObjectId(user.userId),
    });
  },

  updateFacility: async (user: AuthenticatedRequest['user'], facilityId: string, payload: Partial<IFacility>) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const facility = await ensureFacilityAccess(user, facilityId);

    const result = await Facility.findOneAndUpdate(
      { _id: facility._id },
      { $set: payload },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Facility', facilityId);
    }

    return result;
  },

  deleteFacility: async (user: AuthenticatedRequest['user'], facilityId: string) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const facility = await ensureFacilityAccess(user, facilityId);

    const result = await Facility.deleteOne({ _id: facility._id });

    return result.deletedCount === 1;
  },

  setFacilityActiveState: async (user: AuthenticatedRequest['user'], facilityId: string, isActive: boolean) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const facility = await ensureFacilityAccess(user, facilityId);

    const result = await Facility.findOneAndUpdate(
      { _id: facility._id },
      { $set: { isActive } },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Facility', facilityId);
    }

    return result;
  },

  getFacilityById: async (user: AuthenticatedRequest['user'], facilityId: string) => {
    const facility = await ensureFacilityAccess(user, facilityId);
    return facility;
  },

  listFacilities: async (user: AuthenticatedRequest['user'], query: FacilityListQuery = {}) => {
    const filter = buildFacilityScope(user, query);

    return Facility.find(filter).sort({ name: 1 }).lean();
  },

  createBooking: async (
    user: AuthenticatedRequest['user'],
    payload: {
      facilityId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      notes?: string;
    }
  ) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const facility = await ensureFacilityAccess(user, payload.facilityId);

    if (!facility.isActive) {
      throw new ValidationError('Cannot book an inactive facility');
    }

    validateOperatingWindow(facility as IFacility, payload.startTime, payload.endTime);

    await ensureApprovedBookingDoesNotOverlap(
      new mongoose.Types.ObjectId(payload.facilityId),
      payload.bookingDate,
      payload.startTime,
      payload.endTime
    );

    return Booking.create({
      facilityId: new mongoose.Types.ObjectId(payload.facilityId),
      residentId: new mongoose.Types.ObjectId(user.userId),
      societyId: new mongoose.Types.ObjectId(user.societyId),
      bookingDate: payload.bookingDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      notes: payload.notes ?? '',
      status: 'Pending',
    });
  },

  listBookings: async (user: AuthenticatedRequest['user'], query: BookingListQuery = {}) => {
    const filter = buildBookingScope(user, query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ bookingDate: -1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  getBookingById: async (user: AuthenticatedRequest['user'], bookingId: string) => {
    const booking = await ensureBookingAccess(user, bookingId);
    return booking;
  },

  approveBooking: async (user: AuthenticatedRequest['user'], bookingId: string, notes?: string) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!user.roles.includes('Super Admin') && !user.roles.includes('Society Admin')) {
      throw new AuthorizationError('Only administrators may approve bookings');
    }

    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (booking.status !== 'Pending') {
      throw new ValidationError('Only pending bookings can be approved');
    }

    await ensureApprovedBookingDoesNotOverlap(
      new mongoose.Types.ObjectId(booking.facilityId),
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
      new mongoose.Types.ObjectId(bookingId)
    );

    const result = await Booking.findOneAndUpdate(
      { _id: booking._id },
      {
        $set: {
          status: 'Approved',
          approvedBy: new mongoose.Types.ObjectId(user.userId),
          approvedAt: new Date(),
          notes: notes ?? booking.notes,
        },
      },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Booking', bookingId);
    }

    return result;
  },

  rejectBooking: async (user: AuthenticatedRequest['user'], bookingId: string, notes?: string) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!user.roles.includes('Super Admin') && !user.roles.includes('Society Admin')) {
      throw new AuthorizationError('Only administrators may reject bookings');
    }

    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (booking.status !== 'Pending') {
      throw new ValidationError('Only pending bookings can be rejected');
    }

    const result = await Booking.findOneAndUpdate(
      { _id: booking._id },
      {
        $set: {
          status: 'Rejected',
          approvedBy: new mongoose.Types.ObjectId(user.userId),
          approvedAt: new Date(),
          notes: notes ?? booking.notes,
        },
      },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Booking', bookingId);
    }

    return result;
  },

  cancelBooking: async (user: AuthenticatedRequest['user'], bookingId: string, notes?: string) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (
      !user.roles.includes('Super Admin') &&
      !user.roles.includes('Society Admin') &&
      booking.residentId.toString() !== user.userId
    ) {
      throw new AuthorizationError('Access denied to cancel this booking');
    }

    if (booking.status === 'Cancelled' || booking.status === 'Rejected') {
      throw new ValidationError('Booking is no longer active');
    }

    const result = await Booking.findOneAndUpdate(
      { _id: booking._id },
      {
        $set: {
          status: 'Cancelled',
          notes: notes ?? booking.notes,
        },
      },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Booking', bookingId);
    }

    return result;
  },

  getTotalFacilities: async (user: AuthenticatedRequest['user']) => {
    const filter = buildFacilityScope(user);
    return Facility.countDocuments(filter);
  },

  getActiveFacilities: async (user: AuthenticatedRequest['user']) => {
    const filter = buildFacilityScope(user, { onlyActive: true });
    return Facility.countDocuments(filter);
  },

  getTotalBookings: async (user: AuthenticatedRequest['user']) => {
    const filter = buildBookingScope(user);
    return Booking.countDocuments(filter);
  },

  getPendingBookings: async (user: AuthenticatedRequest['user']) => {
    const filter = { ...buildBookingScope(user), status: 'Pending' as BookingStatus };
    return Booking.countDocuments(filter);
  },

  getApprovedBookings: async (user: AuthenticatedRequest['user']) => {
    const filter = { ...buildBookingScope(user), status: 'Approved' as BookingStatus };
    return Booking.countDocuments(filter);
  },
};
