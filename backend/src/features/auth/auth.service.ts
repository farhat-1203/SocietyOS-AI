import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '@config/env';
import User, { IUser } from '@features/users/user.model';
import Role from '@features/rbac/role.model';
import { AuthenticationError } from '@utils/errors';

export interface UserToken {
  userId: string;
  societyId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export const authService = {
  /**
   * Create a new user with hashed password
   */
  createUser: async (data: {
    email: string;
    password: string;
    name: string;
    societyId: string;
  }): Promise<IUser> => {
    const hashedPassword = await authService.hashPassword(data.password);

    // Get default resident role
    const residentRole = await Role.findOne({
      societyId: data.societyId,
      name: 'Resident',
    });

    const user = new User({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      societyId: data.societyId,
      roles: residentRole ? [residentRole._id] : [],
      status: 'active',
    });

    return user.save();
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email: string): Promise<IUser | null> => {
    return User.findOne({ email: email.toLowerCase() }).populate('roles');
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<IUser | null> => {
    return User.findById(userId).populate('roles');
  },

  /**
   * Hash password using bcrypt
   */
  hashPassword: async (password: string): Promise<string> => {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
  },

  /**
   * Verify password against hash
   */
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  /**
   * Generate access and refresh tokens
   */
  generateTokens: (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    user: any
  ): {
    accessToken: string;
    refreshToken: string;
  } => {
    const userRoles = user.roles?.map((r: any) => r.name) || [];
    const userPermissions =
      user.roles?.flatMap((r: any) => r.permissions?.map((p: any) => p.toString())) || [];

    const accessTokenPayload: UserToken = {
      userId: user._id.toString(),
      societyId: user.societyId.toString(),
      roles: userRoles,
      permissions: userPermissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    };

    const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET);

    const refreshTokenPayload = {
      userId: user._id.toString(),
    };

    const refreshToken = jwt.sign(refreshTokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  },

  /**
   * Verify and decode JWT token
   */
  verifyAccessToken: (token: string): UserToken => {
    try {
      return jwt.verify(token, env.JWT_SECRET) as UserToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Access token expired');
      }
      throw new AuthenticationError('Invalid access token');
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken: (refreshToken: string): { accessToken: string } => {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
      };

      // In production, check if refresh token is blacklisted
      // For now, just generate new access token

      const accessTokenPayload: UserToken = {
        userId: decoded.userId,
        societyId: '', // Will be fetched from user
        roles: [],
        permissions: [],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 15 * 60,
      };

      const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET);

      return {
        accessToken,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      throw new AuthenticationError('Invalid refresh token');
    }
  },
};
