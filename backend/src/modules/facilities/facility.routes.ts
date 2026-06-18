import { Router } from 'express';
import * as facilityController from './facility.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateBody, validateParams, validateQuery } from '@middleware/validation';
import { createFacilitySchema, updateFacilitySchema, createBookingSchema, approveBookingSchema, rejectBookingSchema, cancelBookingSchema, listFacilitiesQuerySchema, listBookingsQuerySchema, idParamSchema } from './facility.validation';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenancyMiddleware);

router.get(
  '/',
  checkPermission('facility', 'view'),
  validateQuery(listFacilitiesQuerySchema),
  asyncHandler(facilityController.listFacilities)
);

router.get(
  '/bookings',
  checkPermission('booking', 'view'),
  validateQuery(listBookingsQuerySchema),
  asyncHandler(facilityController.listBookings)
);

router.get(
  '/bookings/:id',
  checkPermission('booking', 'view'),
  validateParams(idParamSchema),
  asyncHandler(facilityController.getBookingById)
);

router.get(
  '/',
  checkPermission('facility', 'view'),
  validateQuery(listFacilitiesQuerySchema),
  asyncHandler(facilityController.listFacilities)
);

router.get(
  '/:id',
  checkPermission('facility', 'view'),
  validateParams(idParamSchema),
  asyncHandler(facilityController.getFacilityById)
);

router.post(
  '/',
  checkPermission('facility', 'create'),
  validateBody(createFacilitySchema),
  asyncHandler(facilityController.createFacility)
);

router.patch(
  '/:id',
  checkPermission('facility', 'update'),
  validateParams(idParamSchema),
  validateBody(updateFacilitySchema),
  asyncHandler(facilityController.updateFacility)
);

router.patch(
  '/:id/activate',
  checkPermission('facility', 'update'),
  validateParams(idParamSchema),
  asyncHandler(facilityController.activateFacility)
);

router.patch(
  '/:id/deactivate',
  checkPermission('facility', 'update'),
  validateParams(idParamSchema),
  asyncHandler(facilityController.deactivateFacility)
);

router.delete(
  '/:id',
  checkPermission('facility', 'delete'),
  validateParams(idParamSchema),
  asyncHandler(facilityController.deleteFacility)
);

router.get(
  '/bookings',
  checkPermission('booking', 'view'),
  validateQuery(listBookingsQuerySchema),
  asyncHandler(facilityController.listBookings)
);

router.get(
  '/bookings/:id',
  checkPermission('booking', 'view'),
  validateParams(idParamSchema),
  asyncHandler(facilityController.getBookingById)
);

router.post(
  '/bookings',
  checkPermission('booking', 'create'),
  validateBody(createBookingSchema),
  asyncHandler(facilityController.createBooking)
);

router.patch(
  '/bookings/:id/approve',
  checkPermission('booking', 'approve'),
  validateParams(idParamSchema),
  validateBody(approveBookingSchema),
  asyncHandler(facilityController.approveBooking)
);

router.patch(
  '/bookings/:id/reject',
  checkPermission('booking', 'reject'),
  validateParams(idParamSchema),
  validateBody(rejectBookingSchema),
  asyncHandler(facilityController.rejectBooking)
);

router.patch(
  '/bookings/:id/cancel',
  checkPermission('booking', 'cancel'),
  validateParams(idParamSchema),
  validateBody(cancelBookingSchema),
  asyncHandler(facilityController.cancelBooking)
);

export default router;
