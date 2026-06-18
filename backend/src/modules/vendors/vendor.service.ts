import { FilterQuery, Types } from 'mongoose';
import Vendor, { IVendor, IVendorReview, VendorType, VendorReview } from './vendor.model';
import { AuthorizationError, NotFoundError, ValidationError } from '@utils/errors';
import type { AuthenticatedRequest } from '@/types/express';

export interface VendorListQuery {
  page?: number;
  limit?: number;
  search?: string;
  vendorType?: VendorType;
  services?: string;
  isActive?: boolean;
  societyId?: string;
}

const buildVendorFilter = (
  user: AuthenticatedRequest['user'],
  query: VendorListQuery = {}
): FilterQuery<IVendor> => {
  const filter: FilterQuery<IVendor> = {};

  if (user?.roles.includes('Super Admin')) {
    if (query.societyId) {
      filter.societyId = new Types.ObjectId(query.societyId);
    }
  } else {
    filter.societyId = new Types.ObjectId(user?.societyId);
  }

  if (!user?.roles.includes('Super Admin') && !user?.roles.includes('Society Admin')) {
    filter.isActive = true;
  } else if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  if (query.vendorType) {
    filter.vendorType = query.vendorType;
  }

  if (query.services) {
    filter.services = {
      $in: query.services
        .split(',')
        .map((service) => service.trim())
        .filter(Boolean),
    };
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { businessName: searchRegex },
      { description: searchRegex },
      { services: query.search },
    ];
  }

  return filter;
};

export class VendorService {
  async createVendor(data: Partial<IVendor>, societyId: string, userId: string) {
    return Vendor.create({
      ...data,
      societyId: new Types.ObjectId(societyId),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
      rating: 0,
      totalReviews: 0,
      isActive: data.isActive ?? true,
    });
  }

  async getVendorById(vendorId: string, user: AuthenticatedRequest['user']) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor', vendorId);
    }

    if (!user?.roles.includes('Super Admin')) {
      if (vendor.societyId.toString() !== user?.societyId) {
        throw new AuthorizationError('Vendor does not belong to your society');
      }
    }

    if (!user?.roles.includes('Super Admin') && !user?.roles.includes('Society Admin') && !vendor.isActive) {
      throw new AuthorizationError('Vendor is not active');
    }

    return vendor;
  }

  async updateVendor(vendorId: string, data: Partial<IVendor>, user: AuthenticatedRequest['user']) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor', vendorId);
    }

    if (!user?.roles.includes('Super Admin')) {
      if (vendor.societyId.toString() !== user?.societyId) {
        throw new AuthorizationError('Vendor does not belong to your society');
      }
    }

    Object.assign(vendor, {
      ...data,
      updatedBy: new Types.ObjectId(user?.userId),
    });

    return vendor.save();
  }

  async deleteVendor(vendorId: string, user: AuthenticatedRequest['user']) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor', vendorId);
    }

    if (!user?.roles.includes('Super Admin')) {
      if (vendor.societyId.toString() !== user?.societyId) {
        throw new AuthorizationError('Vendor does not belong to your society');
      }
    }

    const result = await Vendor.deleteOne({ _id: vendorId });
    return result.deletedCount === 1;
  }

  async listVendors(query: VendorListQuery, user: AuthenticatedRequest['user']) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter = buildVendorFilter(user, query);

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Vendor.countDocuments(filter),
    ]);

    return {
      data: vendors,
      total,
    };
  }

  async addReview(
    vendorId: string,
    payload: { rating: number; comment: string },
    residentId: string,
    societyId: string,
    user: AuthenticatedRequest['user']
  ) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor', vendorId);
    }

    if (!user?.roles.includes('Super Admin')) {
      if (vendor.societyId.toString() !== user?.societyId) {
        throw new AuthorizationError('Vendor does not belong to your society');
      }
    }

    if (!vendor.isActive) {
      throw new ValidationError('Cannot review an inactive vendor');
    }

    const review = await VendorReview.create({
      vendorId: new Types.ObjectId(vendorId),
      residentId: new Types.ObjectId(residentId),
      rating: payload.rating,
      comment: payload.comment,
      societyId: new Types.ObjectId(societyId),
    });

    const totalReviews = vendor.totalReviews + 1;
    vendor.totalReviews = totalReviews;
    vendor.rating = Number(
      ((vendor.rating * vendor.totalReviews + payload.rating) / totalReviews).toFixed(2)
    );
    await vendor.save();

    return review;
  }

  async listReviews(vendorId: string, user: AuthenticatedRequest['user']) {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor', vendorId);
    }

    if (!user?.roles.includes('Super Admin')) {
      if (vendor.societyId.toString() !== user?.societyId) {
        throw new AuthorizationError('Vendor does not belong to your society');
      }
    }

    if (!user?.roles.includes('Super Admin') && !user?.roles.includes('Society Admin') && !vendor.isActive) {
      throw new AuthorizationError('Vendor is not active');
    }

    return VendorReview.find({
      vendorId: new Types.ObjectId(vendorId),
      societyId: vendor.societyId,
    }).sort({ createdAt: -1 });
  }

  async getTotalVendors(user: AuthenticatedRequest['user']) {
    const filter: FilterQuery<IVendor> = {};

    if (!user?.roles.includes('Super Admin')) {
      filter.societyId = new Types.ObjectId(user?.societyId);
    }

    return Vendor.countDocuments(filter);
  }

  async getActiveVendors(user: AuthenticatedRequest['user']) {
    const filter: FilterQuery<IVendor> = { isActive: true };

    if (!user?.roles.includes('Super Admin')) {
      filter.societyId = new Types.ObjectId(user?.societyId);
    }

    return Vendor.countDocuments(filter);
  }

  async getTopRatedVendors(user: AuthenticatedRequest['user'], limit: number = 5) {
    const filter: FilterQuery<IVendor> = { isActive: true };
    if (!user?.roles.includes('Super Admin')) {
      filter.societyId = new Types.ObjectId(user?.societyId);
    }

    return Vendor.find(filter).sort({ rating: -1, totalReviews: -1 }).limit(limit);
  }

  async getRecentVendors(user: AuthenticatedRequest['user'], limit: number = 5) {
    const filter: FilterQuery<IVendor> = { isActive: true };
    if (!user?.roles.includes('Super Admin')) {
      filter.societyId = new Types.ObjectId(user?.societyId);
    }

    return Vendor.find(filter).sort({ createdAt: -1 }).limit(limit);
  }
}

export default new VendorService();
