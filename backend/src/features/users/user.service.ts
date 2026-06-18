import User, { IUser } from './user.model';
import { authService } from '@features/auth/auth.service';
import { CreateUserInput, UpdateUserInput } from './user.validators';

export const userService = {
  /**
   * Create a new user
   */
  createUser: async (data: CreateUserInput): Promise<IUser> => {
    const hashedPassword = await authService.hashPassword(data.password);

    const user = new User({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      societyId: data.societyId,
      roles: data.roles || [],
      status: data.status || 'active',
    });

    return user.save();
  },

  /**
   * Get user by ID within a society
   */
  getUserById: async (userId: string, societyId: string): Promise<IUser | null> => {
    return User.findOne({
      _id: userId,
      societyId,
    }).populate('roles');
  },

  /**
   * Get user by email within a society
   */
  getUserByEmail: async (email: string, societyId: string): Promise<IUser | null> => {
    return User.findOne({
      email: email.toLowerCase(),
      societyId,
    }).populate('roles');
  },

  /**
   * List users in a society
   */
  listUsers: async (
    societyId: string,
    options: {
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<IUser[]> => {
    const { skip = 0, limit = 20 } = options;

    return User.find({ societyId })
      .populate('roles')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Count total users in a society
   */
  countUsers: async (societyId: string): Promise<number> => {
    return User.countDocuments({ societyId });
  },

  /**
   * Update user
   */
  updateUser: async (
    userId: string,
    societyId: string,
    data: UpdateUserInput
  ): Promise<IUser | null> => {
    return User.findOneAndUpdate(
      { _id: userId, societyId },
      { $set: { ...data, updatedAt: new Date() } },
      { new: true }
    ).populate('roles');
  },

  /**
   * Update user password
   */
  updatePassword: async (
    userId: string,
    societyId: string,
    newPassword: string
  ): Promise<IUser | null> => {
    const hashedPassword = await authService.hashPassword(newPassword);

    return User.findOneAndUpdate(
      { _id: userId, societyId },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
      { new: true }
    );
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string, societyId: string): Promise<boolean> => {
    const result = await User.deleteOne({
      _id: userId,
      societyId,
    });

    return result.deletedCount > 0;
  },

  /**
   * Assign roles to user
   */
  assignRoles: async (
    userId: string,
    societyId: string,
    roleIds: string[]
  ): Promise<IUser | null> => {
    return User.findOneAndUpdate(
      { _id: userId, societyId },
      { $set: { roles: roleIds, updatedAt: new Date() } },
      { new: true }
    ).populate('roles');
  },

  /**
   * Update user status
   */
  updateStatus: async (
    userId: string,
    societyId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<IUser | null> => {
    return User.findOneAndUpdate(
      { _id: userId, societyId },
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    ).populate('roles');
  },

  /**
   * Update last login timestamp
   */
  updateLastLogin: async (userId: string): Promise<void> => {
    await User.updateOne({ _id: userId }, { $set: { lastLogin: new Date() } });
  },
};
