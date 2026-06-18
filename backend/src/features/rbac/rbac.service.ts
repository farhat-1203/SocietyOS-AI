import Role, { IRole } from './role.model';
import Permission, { IPermission } from './permission.model';

export const rbacService = {
  /**
   * Create a new role
   */
  createRole: async (data: {
    societyId: string;
    name: string;
    description?: string;
    permissionIds?: string[];
  }): Promise<IRole> => {
    const role = new Role({
      societyId: data.societyId,
      name: data.name,
      description: data.description || '',
      permissions: data.permissionIds || [],
    });

    return role.save();
  },

  /**
   * Get role by ID
   */
  getRoleById: async (roleId: string, societyId: string): Promise<IRole | null> => {
    return Role.findOne({
      _id: roleId,
      societyId,
    }).populate('permissions');
  },

  /**
   * Get role by name
   */
  getRoleByName: async (name: string, societyId: string): Promise<IRole | null> => {
    return Role.findOne({
      name,
      societyId,
    }).populate('permissions');
  },

  /**
   * List all roles in a society
   */
  listRoles: async (societyId: string): Promise<IRole[]> => {
    return Role.find({ societyId }).populate('permissions').sort({ createdAt: -1 });
  },

  /**
   * Update role
   */
  updateRole: async (
    roleId: string,
    societyId: string,
    data: {
      description?: string;
      permissionIds?: string[];
    }
  ): Promise<IRole | null> => {
    const role = await Role.findOne({ _id: roleId, societyId });

    if (role?.isSystem) {
      throw new Error('Cannot modify system roles');
    }

    return Role.findOneAndUpdate(
      { _id: roleId, societyId },
      { $set: { ...data, updatedAt: new Date() } },
      { new: true }
    ).populate('permissions');
  },

  /**
   * Assign permissions to role
   */
  assignPermissionsToRole: async (
    roleId: string,
    societyId: string,
    permissionIds: string[]
  ): Promise<IRole | null> => {
    const role = await Role.findOne({ _id: roleId, societyId });

    if (role?.isSystem) {
      throw new Error('Cannot modify system roles');
    }

    return Role.findOneAndUpdate(
      { _id: roleId, societyId },
      { $set: { permissions: permissionIds, updatedAt: new Date() } },
      { new: true }
    ).populate('permissions');
  },

  /**
   * Create a new permission
   */
  createPermission: async (data: {
    societyId: string;
    resource: string;
    action: string;
    description?: string;
  }): Promise<IPermission> => {
    const permission = new Permission({
      societyId: data.societyId,
      resource: data.resource,
      action: data.action,
      description: data.description || '',
    });

    return permission.save();
  },

  /**
   * Get permission by ID
   */
  getPermissionById: async (
    permissionId: string,
    societyId: string
  ): Promise<IPermission | null> => {
    return Permission.findOne({
      _id: permissionId,
      societyId,
    });
  },

  /**
   * Get permission by resource and action
   */
  getPermissionByResourceAction: async (
    societyId: string,
    resource: string,
    action: string
  ): Promise<IPermission | null> => {
    return Permission.findOne({
      societyId,
      resource,
      action,
    });
  },

  /**
   * List all permissions in a society
   */
  listPermissions: async (societyId: string): Promise<IPermission[]> => {
    return Permission.find({ societyId }).sort({ resource: 1, action: 1 });
  },

  /**
   * Get permissions by resource
   */
  getPermissionsByResource: async (societyId: string, resource: string): Promise<IPermission[]> => {
    return Permission.find({ societyId, resource }).sort({ action: 1 });
  },

  /**
   * Check if role has permission
   */
  roleHasPermission: async (
    roleId: string,
    societyId: string,
    resource: string,
    action: string
  ): Promise<boolean> => {
    const permission = await Permission.findOne({
      societyId,
      resource,
      action,
    });

    if (!permission) return false;

    const role = await Role.findOne({
      _id: roleId,
      societyId,
    });

    if (!role) return false;

    return role.permissions.includes(permission._id);
  },

  /**
   * Get user permissions from roles
   */
  getUserPermissions: async (roleIds: string[], societyId: string): Promise<string[]> => {
    if (!roleIds.length) return [];

    const roles = await Role.find({
      _id: { $in: roleIds },
      societyId,
    }).populate('permissions');

    const permissions: string[] = [];

    roles.forEach((role) => {
      const populatedPerms = role.permissions as unknown as IPermission[];
      populatedPerms.forEach((perm) => {
        const permString = `${perm.resource}:${perm.action}`;
        if (!permissions.includes(permString)) {
          permissions.push(permString);
        }
      });
    });

    return permissions;
  },

  /**
   * Initialize default permissions for a society
   */
  initializeDefaultPermissions: async (societyId: string): Promise<void> => {
    const permissions = [
      // Complaints
      { resource: 'complaints', action: 'create' },
      { resource: 'complaints', action: 'read' },
      { resource: 'complaints', action: 'update' },
      { resource: 'complaints', action: 'delete' },
      { resource: 'complaints', action: 'assign' },
      { resource: 'complaints', action: 'resolve' },
      { resource: 'complaints', action: 'close' },
      { resource: 'complaints', action: 'manage' },

      // Facilities
      { resource: 'facilities', action: 'read' },
      { resource: 'facilities', action: 'book' },
      { resource: 'facilities', action: 'manage' },

      // Notices
      { resource: 'notices', action: 'create' },
      { resource: 'notices', action: 'read' },
      { resource: 'notices', action: 'update' },
      { resource: 'notices', action: 'delete' },
      { resource: 'notices', action: 'publish' },

      // Vendors
      { resource: 'vendors', action: 'read' },
      { resource: 'vendors', action: 'manage' },

      // Knowledge Base
      { resource: 'knowledge', action: 'read' },
      { resource: 'knowledge', action: 'edit' },
      { resource: 'knowledge', action: 'manage' },

      // Users
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' },

      // RBAC
      { resource: 'rbac', action: 'manage' },
    ];

    for (const perm of permissions) {
      await Permission.findOneAndUpdate(
        { societyId, resource: perm.resource, action: perm.action },
        {
          societyId,
          resource: perm.resource,
          action: perm.action,
          description: `${perm.resource}:${perm.action}`,
        },
        { upsert: true }
      );
    }
  },

  /**
   * Initialize default roles for a society
   */
  initializeDefaultRoles: async (societyId: string): Promise<void> => {
    // Get all permissions
    const allPermissions = await Permission.find({ societyId });

    // Create roles with their permissions
    const roleDefinitions = [
      {
        name: 'Super Admin',
        description: 'Full system access',
        permissions: allPermissions.map((p) => p._id),
        isSystem: true,
      },
      {
        name: 'Society Admin',
        description: 'Manage society and users',
        permissions: allPermissions.map((p) => p._id),
        isSystem: true,
      },
      {
        name: 'Resident',
        description: 'Resident access',
        permissions: allPermissions
          .filter((p) =>
            [
              'complaints:create',
              'complaints:read',
              'facilities:read',
              'facilities:book',
              'notices:read',
              'knowledge:read',
              'vendors:read',
            ].includes(`${p.resource}:${p.action}`)
          )
          .map((p) => p._id),
        isSystem: true,
      },
      {
        name: 'Vendor',
        description: 'Vendor access',
        permissions: allPermissions
          .filter((p) =>
            [
              'complaints:read',
              'complaints:update',
              'facilities:read',
              'notices:read',
              'knowledge:read',
              'vendors:read',
            ].includes(`${p.resource}:${p.action}`)
          )
          .map((p) => p._id),
        isSystem: true,
      },
    ];

    for (const roleDef of roleDefinitions) {
      await Role.findOneAndUpdate(
        { societyId, name: roleDef.name },
        {
          societyId,
          name: roleDef.name,
          description: roleDef.description,
          permissions: roleDef.permissions,
          isSystem: roleDef.isSystem,
        },
        { upsert: true }
      );
    }
  },
};
