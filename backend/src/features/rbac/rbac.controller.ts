import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { sendSuccess } from '@utils/response';
import { ValidationError, AuthorizationError } from '@utils/errors';
import { rbacService } from './rbac.service';
import User from '@features/users/user.model';
import { IRole } from '@features/rbac/role.model';

export const listRoles = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  const roles = await rbacService.listRoles(req.tenancy.societyId);

  return sendSuccess(res, roles);
};

export const listPermissions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  const permissions = await rbacService.listPermissions(req.tenancy.societyId);

  return sendSuccess(res, permissions);
};

export const assignPermissionsToRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;

  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  // Verify role exists
  const role = await rbacService.getRoleById(roleId, req.tenancy.societyId);
  if (!role) {
    throw new ValidationError('Role not found');
  }

  // Cannot modify system roles
  if (role.isSystem) {
    throw new AuthorizationError('Cannot modify system roles');
  }

  const updatedRole = await rbacService.assignPermissionsToRole(
    roleId,
    req.tenancy.societyId,
    permissionIds
  );

  return sendSuccess(res, updatedRole);
};

export const getUserPermissions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  // User can view their own permissions or admins can view any user
  const userRoles = req.user?.roles || [];
  if (userId !== req.user?.userId && !['Society Admin', 'Super Admin'].includes(userRoles[0])) {
    throw new AuthorizationError('Cannot view other users permissions');
  }

  const user = await User.findOne({
    _id: userId,
    societyId: req.tenancy.societyId,
  }).populate('roles');

  if (!user) {
    throw new ValidationError('User not found');
  }

  // Cast populated roles
  const populatedRoles = user.roles as unknown as IRole[];

  const permissions = await rbacService.getUserPermissions(
    populatedRoles.map((r) => r._id.toString()),
    req.tenancy.societyId
  );

  return sendSuccess(res, {
    userId,
    roles: populatedRoles.map((r) => r.name),
    permissions,
  });
};

export const initializeRolesAndPermissions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.tenancy) {
    throw new ValidationError('Tenancy context required');
  }

  // Only super admin can initialize
  if (!req.user?.roles.includes('Super Admin')) {
    throw new AuthorizationError('Super Admin access required');
  }

  await rbacService.initializeDefaultPermissions(req.tenancy.societyId);
  await rbacService.initializeDefaultRoles(req.tenancy.societyId);

  return sendSuccess(res, {
    message: 'Roles and permissions initialized successfully',
  });
};
