import { Router } from 'express';
import * as vendorController from './vendor.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateBody, validateParams, validateQuery } from '@middleware/validation';
import { createVendorSchema, updateVendorSchema, createReviewSchema, listVendorsQuerySchema } from './vendor.validation';
import { idParamSchema } from '@utils/validators';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenancyMiddleware);

router.post(
  '/',
  checkPermission('vendor', 'create'),
  validateBody(createVendorSchema),
  asyncHandler(vendorController.createVendor)
);

router.get(
  '/',
  checkPermission('vendor', 'view'),
  validateQuery(listVendorsQuerySchema),
  asyncHandler(vendorController.listVendors)
);

router.get(
  '/:id/reviews',
  checkPermission('vendor', 'view'),
  validateParams(idParamSchema),
  asyncHandler(vendorController.listVendorReviews)
);

router.get(
  '/:id',
  checkPermission('vendor', 'view'),
  validateParams(idParamSchema),
  asyncHandler(vendorController.getVendorById)
);

router.patch(
  '/:id',
  checkPermission('vendor', 'update'),
  validateParams(idParamSchema),
  validateBody(updateVendorSchema),
  asyncHandler(vendorController.updateVendor)
);

router.delete(
  '/:id',
  checkPermission('vendor', 'delete'),
  validateParams(idParamSchema),
  asyncHandler(vendorController.deleteVendor)
);

router.post(
  '/:id/reviews',
  checkPermission('vendor', 'review'),
  validateParams(idParamSchema),
  validateBody(createReviewSchema),
  asyncHandler(vendorController.createVendorReview)
);

export default router;
