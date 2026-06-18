import { Router } from 'express';
import * as userController from './user.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateBody, validateParams } from '@middleware/validation';
import { createUserSchema, updateUserSchema, updatePasswordSchema } from './user.validators';
import { idParamSchema } from '@utils/validators';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// Apply auth and tenancy middleware to all routes
router.use(authMiddleware);
router.use(tenancyMiddleware);

// List users
router.get('/', checkPermission('users', 'read'), asyncHandler(userController.listUsers));

// Create user
router.post(
  '/',
  checkPermission('users', 'create'),
  validateBody(createUserSchema),
  asyncHandler(userController.createUser)
);

// Get user by ID
router.get(
  '/:id',
  checkPermission('users', 'read'),
  validateParams(idParamSchema),
  asyncHandler(userController.getUserById)
);

// Update user
router.patch(
  '/:id',
  checkPermission('users', 'update'),
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  asyncHandler(userController.updateUser)
);

// Update password
router.patch(
  '/:id/password',
  validateParams(idParamSchema),
  validateBody(updatePasswordSchema),
  asyncHandler(userController.updatePassword)
);

// Delete user
router.delete(
  '/:id',
  checkPermission('users', 'delete'),
  validateParams(idParamSchema),
  asyncHandler(userController.deleteUser)
);

export default router;
