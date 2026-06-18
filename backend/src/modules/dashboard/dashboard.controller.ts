import { Response } from 'express';
import { AuthenticatedRequest } from '@/types/express';
import { sendSuccess } from '@utils/response';
import { ValidationError } from '@utils/errors';
import { dashboardService } from './dashboard.service';

/**
 * Controller to retrieve role-specific dashboard overview metrics.
 */
export const getOverview = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { societyId } = req.query as { societyId?: string };

  const data = await dashboardService.getOverview(
    {
      userId: req.user.userId,
      societyId: req.user.societyId,
      roles: req.user.roles,
    },
    societyId
  );

  return sendSuccess(res, data, { message: 'Dashboard overview retrieved successfully' });
};

/**
 * Controller to retrieve complaint count grouped by Status.
 */
export const getChartsStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { societyId } = req.query as { societyId?: string };

  const data = await dashboardService.getComplaintsByStatusChart(
    {
      userId: req.user.userId,
      societyId: req.user.societyId,
      roles: req.user.roles,
    },
    societyId
  );

  return sendSuccess(res, data, { message: 'Complaints status chart data retrieved' });
};

/**
 * Controller to retrieve complaint count grouped by Category.
 */
export const getChartsCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { societyId } = req.query as { societyId?: string };

  const data = await dashboardService.getComplaintsByCategoryChart(
    {
      userId: req.user.userId,
      societyId: req.user.societyId,
      roles: req.user.roles,
    },
    societyId
  );

  return sendSuccess(res, data, { message: 'Complaints category chart data retrieved' });
};

/**
 * Controller to retrieve 12-month monthly complaint trends.
 */
export const getChartsMonthly = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { societyId } = req.query as { societyId?: string };

  const data = await dashboardService.getMonthlyComplaintTrendChart(
    {
      userId: req.user.userId,
      societyId: req.user.societyId,
      roles: req.user.roles,
    },
    societyId
  );

  return sendSuccess(res, data, { message: 'Monthly complaints trend retrieved' });
};
