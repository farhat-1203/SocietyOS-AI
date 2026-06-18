import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { sendSuccess, sendCreated } from '@utils/response';
import { ValidationError, AuthenticationError, ConflictError } from '@utils/errors';
import { authService } from './auth.service';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.validators';

export const register = async (
  req: Request<any, any, RegisterInput>,
  res: Response
): Promise<Response> => {
  const { email, password, name, societyId } = req.body;

  // Check if user already exists
  const existingUser = await authService.getUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }

  // Create user
  const user = await authService.createUser({
    email,
    password,
    name,
    societyId,
  });

  // Generate tokens
  const { accessToken, refreshToken } = authService.generateTokens(user);

  return sendCreated(res, {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      societyId: user.societyId,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
};

export const login = async (
  req: Request<any, any, LoginInput>,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  // Find user
  const user = await authService.getUserByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await authService.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = authService.generateTokens(user);

  return sendSuccess(res, {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      societyId: user.societyId,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
};

export const refreshToken = async (
  req: Request<any, any, RefreshTokenInput>,
  res: Response
): Promise<Response> => {
  const { refreshToken } = req.body;

  try {
    const newTokens = authService.refreshAccessToken(refreshToken);
    return sendSuccess(res, newTokens);
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  const user = await authService.getUserById(req.user.userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  return sendSuccess(res, {
    id: user._id,
    email: user.email,
    name: user.name,
    societyId: user.societyId,
    status: user.status,
    roles: user.roles,
  });
};

export const logout = async (_req: Request, res: Response): Promise<Response> => {
  // In JWT-based auth, logout is handled client-side (token deletion)
  // Server doesn't need to do anything, but we can add token blacklist in future
  return sendSuccess(res, {
    message: 'Logged out successfully',
  });
};
