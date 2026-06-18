import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from '@middleware/auth';
import { validateBody } from '@middleware/validation';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validators';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

// Public routes (no authentication required)
router.post('/register', validateBody(registerSchema), asyncHandler(authController.register));

router.post('/login', validateBody(loginSchema), asyncHandler(authController.login));

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  asyncHandler(authController.refreshToken)
);

// Protected routes (authentication required)
router.get('/me', authMiddleware, asyncHandler(authController.getCurrentUser));

router.post('/logout', authMiddleware, asyncHandler(authController.logout));

export default router;
