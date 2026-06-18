import { Router } from 'express';
import * as rbacController from './rbac.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { requireSuperAdmin } from '@middleware/permission';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateBody, validateParams } from '@middleware/validation';
import { idParamSchema } from '@utils/validators';
import { z } from 'zod';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// Apply auth and tenancy middleware to all routes
router.use(authMiddleware);
router.use(tenancyMiddleware);

// List roles
router.get('/roles', checkPermission('rbac', 'manage'), asyncHandler(rbacController.listRoles));

// List permissions
router.get(
  '/permissions',
  checkPermission('rbac', 'manage'),
  asyncHandler(rbacController.listPermissions)
);

// Assign permissions to role
router.patch(
  '/roles/:roleId/permissions',
  checkPermission('rbac', 'manage'),
  validateParams(idParamSchema.extend({ roleId: idParamSchema.shape.id })),
  validateBody(
    z.object({
      permissionIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)),
    })
  ),
  asyncHandler(rbacController.assignPermissionsToRole)
);

// Get user permissions
router.get(
  '/users/:userId/permissions',
  validateParams(idParamSchema.extend({ userId: idParamSchema.shape.id })),
  asyncHandler(rbacController.getUserPermissions)
);

// Initialize roles and permissions (super admin only)
router.post(
  '/initialize',
  requireSuperAdmin,
  asyncHandler(rbacController.initializeRolesAndPermissions)
);

export default router;
