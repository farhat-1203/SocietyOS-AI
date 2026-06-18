import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { sendCreated, sendSuccess, sendSuccessWithPagination } from '@utils/response';
import { ValidationError } from '@utils/errors';
import { getPaginationFromQuery, formatPaginationMeta } from '@utils/helpers';
import vendorService from './vendor.service';
import type { VendorListQuery } from './vendor.service';

export const createVendor = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const vendor = await vendorService.createVendor(req.body, req.tenancy.societyId, req.user.userId);

  return sendCreated(res, vendor, 'Vendor created successfully');
};

export const listVendors = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { page, limit, skip } = getPaginationFromQuery(req.query as Record<string, unknown>);

  const query: VendorListQuery = {
    search: req.query.search as string | undefined,
    vendorType: req.query.vendorType as VendorListQuery['vendorType'],
    services: req.query.services as string | undefined,
    isActive: req.query.isActive as unknown as boolean | undefined,
    societyId: req.query.societyId as string | undefined,
    page,
    limit,
  };

  const result = await vendorService.listVendors(query, req.user);

  return sendSuccessWithPagination(res, result.data, formatPaginationMeta(page, limit, result.total));
};

export const getVendorById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const vendor = await vendorService.getVendorById(req.params.id, req.user);
  return sendSuccess(res, vendor);
};

export const updateVendor = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user);
  return sendSuccess(res, vendor, { message: 'Vendor updated successfully' });
};

export const deleteVendor = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  await vendorService.deleteVendor(req.params.id, req.user);
  return sendSuccess(res, undefined, { message: 'Vendor deleted successfully' });
};

export const createVendorReview = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user || !req.tenancy) {
    throw new ValidationError('Authentication context required');
  }

  const review = await vendorService.addReview(
    req.params.id,
    req.body,
    req.user.userId,
    req.tenancy.societyId,
    req.user
  );

  return sendCreated(res, review, 'Review submitted successfully');
};

export const listVendorReviews = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const reviews = await vendorService.listReviews(req.params.id, req.user);
  return sendSuccess(res, reviews);
};
