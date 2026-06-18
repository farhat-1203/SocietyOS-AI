import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { sendSuccess, sendCreated, sendSuccessWithPagination } from '@utils/response';
import { ValidationError, AuthorizationError, ConflictError } from '@utils/errors';
import { userService } from './user.service';
import { authService } from '@features/auth/auth.service';
import { getPaginationFromQuery, formatPaginationMeta } from '@utils/helpers';

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { email, password, name, societyId, roles, status } = req.body;

  // Verify user is creating user in their own society
  if (req.user?.societyId !== societyId && req.user?.roles?.[0] !== 'Super Admin') {
    throw new AuthorizationError('Can only create users in your own society');
  }

  // Check if email already exists in this society
  const existingUser = await userService.getUserByEmail(email, societyId);
  if (existingUser) {
    throw new ConflictError('Email already in use in this society');
  }

  const user = await userService.createUser({
    email,
    password,
    name,
    societyId,
    roles,
    status,
  });

  return sendCreated(res, user);
};

export const listUsers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  const { page, limit, skip } = getPaginationFromQuery(req.query as Record<string, unknown>);

  const users = await userService.listUsers(req.tenancy.societyId, {
    skip,
    limit,
  });

  const total = await userService.countUsers(req.tenancy.societyId);

  return sendSuccessWithPagination(res, users, formatPaginationMeta(page, limit, total));
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { id } = req.params;

  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  const user = await userService.getUserById(id, req.tenancy.societyId);
  if (!user) {
    throw new ValidationError(`User ${id} not found`);
  }

  // User can view themselves or admins can view any user in society
  if (user._id.toString() !== req.user?.userId && req.user?.roles?.[0] !== 'Society Admin') {
    throw new AuthorizationError('Cannot view other users');
  }

  return sendSuccess(res, user);
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const updateData = req.body;

  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  const user = await userService.getUserById(id, req.tenancy.societyId);
  if (!user) {
    throw new ValidationError(`User ${id} not found`);
  }

  // User can only update themselves or admins can update any user
  if (user._id.toString() !== req.user?.userId && req.user?.roles?.[0] !== 'Society Admin') {
    throw new AuthorizationError('Cannot update other users');
  }

  const updatedUser = await userService.updateUser(id, req.tenancy.societyId, updateData);

  return sendSuccess(res, updatedUser);
};

export const updatePassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  // User can only change their own password
  if (id !== req.user?.userId) {
    throw new AuthorizationError('Can only change your own password');
  }

  const user = await userService.getUserById(id, req.tenancy.societyId);
  if (!user) {
    throw new ValidationError(`User ${id} not found`);
  }

  // Verify current password
  const isPasswordValid = await authService.verifyPassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ValidationError('Current password is incorrect');
  }

  // Update password
  await userService.updatePassword(id, req.tenancy.societyId, newPassword);

  return sendSuccess(res, {
    message: 'Password updated successfully',
  });
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { id } = req.params;

  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  // Only admins can delete users
  if (req.user?.roles?.[0] !== 'Society Admin' && req.user?.roles?.[0] !== 'Super Admin') {
    throw new AuthorizationError('Only admins can delete users');
  }

  const user = await userService.getUserById(id, req.tenancy.societyId);
  if (!user) {
    throw new ValidationError(`User ${id} not found`);
  }

  // Cannot delete super admin
  if (user.roles?.some((role: any) => role.name === 'Super Admin')) {
    throw new ValidationError('Cannot delete Super Admin');
  }

  await userService.deleteUser(id, req.tenancy.societyId);

  return sendSuccess(res, {
    message: 'User deleted successfully',
  });
};
