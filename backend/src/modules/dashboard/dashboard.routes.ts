import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { validateQuery } from '@middleware/validation';
import { dashboardQuerySchema } from './dashboard.validation';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

// GET /api/dashboard/overview
router.get(
  '/overview',
  checkPermission('dashboard', 'view'),
  validateQuery(dashboardQuerySchema),
  asyncHandler(dashboardController.getOverview)
);

// GET /api/dashboard/charts/status
router.get(
  '/charts/status',
  checkPermission('dashboard', 'view'),
  validateQuery(dashboardQuerySchema),
  asyncHandler(dashboardController.getChartsStatus)
);

// GET /api/dashboard/charts/category
router.get(
  '/charts/category',
  checkPermission('dashboard', 'view'),
  validateQuery(dashboardQuerySchema),
  asyncHandler(dashboardController.getChartsCategory)
);

// GET /api/dashboard/charts/monthly
router.get(
  '/charts/monthly',
  checkPermission('dashboard', 'view'),
  validateQuery(dashboardQuerySchema),
  asyncHandler(dashboardController.getChartsMonthly)
);

export default router;
