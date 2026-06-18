import { Response } from 'express';
import { sendCreated, sendSuccess, sendNoContent } from '@utils/response';
import { ValidationError, NotFoundError } from '@utils/errors';
import type { AuthenticatedRequest } from '@/types/express';
import { facilityService } from './facility.service';
import type {
  CreateFacilityInput,
  UpdateFacilityInput,
  CreateBookingInput,
  ApproveBookingInput,
  RejectBookingInput,
  CancelBookingInput,
  ListFacilitiesQueryInput,
  ListBookingsQueryInput,
  IdParamInput,
} from './facility.validation';

export const listFacilities = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const query = req.query as ListFacilitiesQueryInput;
  const facilities = await facilityService.listFacilities(req.user, query);

  return sendSuccess(res, facilities, { message: 'Facilities retrieved successfully' });
};

export const getFacilityById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const facility = await facilityService.getFacilityById(req.user, id);

  return sendSuccess(res, facility, { message: 'Facility retrieved successfully' });
};

export const createFacility = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const payload = req.body as CreateFacilityInput;
  const facility = await facilityService.createFacility(req.user, payload);

  return sendCreated(res, facility, 'Facility created successfully');
};

export const updateFacility = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const payload = req.body as UpdateFacilityInput;
  const facility = await facilityService.updateFacility(req.user, id, payload);

  return sendSuccess(res, facility, { message: 'Facility updated successfully' });
};

export const activateFacility = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const facility = await facilityService.setFacilityActiveState(req.user, id, true);

  return sendSuccess(res, facility, { message: 'Facility activated successfully' });
};

export const deactivateFacility = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const facility = await facilityService.setFacilityActiveState(req.user, id, false);

  return sendSuccess(res, facility, { message: 'Facility deactivated successfully' });
};

export const deleteFacility = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const deleted = await facilityService.deleteFacility(req.user, id);

  if (!deleted) {
    throw new NotFoundError('Facility', id);
  }

  return sendNoContent(res);
};

export const listBookings = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const query = req.query as ListBookingsQueryInput;
  const result = await facilityService.listBookings(req.user, query);

  return sendSuccess(res, result, { message: 'Bookings retrieved successfully' });
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const booking = await facilityService.getBookingById(req.user, id);

  return sendSuccess(res, booking, { message: 'Booking retrieved successfully' });
};

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const payload = req.body as CreateBookingInput;
  const booking = await facilityService.createBooking(req.user, payload);

  return sendCreated(res, booking, 'Booking created successfully');
};

export const approveBooking = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const payload = req.body as ApproveBookingInput;
  const booking = await facilityService.approveBooking(req.user, id, payload.notes);

  return sendSuccess(res, booking, { message: 'Booking approved successfully' });
};

export const rejectBooking = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const payload = req.body as RejectBookingInput;
  const booking = await facilityService.rejectBooking(req.user, id, payload.notes);

  return sendSuccess(res, booking, { message: 'Booking rejected successfully' });
};

export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const payload = req.body as CancelBookingInput;
  const booking = await facilityService.cancelBooking(req.user, id, payload.notes);

  return sendSuccess(res, booking, { message: 'Booking cancelled successfully' });
};
