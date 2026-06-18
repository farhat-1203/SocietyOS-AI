import mongoose from 'mongoose';
import Notice, { INotice, NoticeStatus } from './notice.model';
import type { AuthenticatedRequest } from '@/types/express';
import { AuthorizationError, NotFoundError, ValidationError } from '@utils/errors';

export interface NoticeListQuery {
  status?: NoticeStatus;
  page?: number;
  limit?: number;
}

const buildNoticeFilter = (user: AuthenticatedRequest['user'], query: NoticeListQuery = {}) => {
  const filter: Record<string, any> = {};

  if (!user?.roles.includes('Super Admin')) {
    filter.societyId = new mongoose.Types.ObjectId(user?.societyId);
  }

  if (!user?.roles.includes('Super Admin') && !user?.roles.includes('Society Admin')) {
    filter.status = 'Published';
  }

  if (query.status) {
    filter.status = query.status;
  }

  return filter;
};

const ensureNoticeAccess = async (user: AuthenticatedRequest['user'], noticeId: string) => {
  const notice = await Notice.findById(noticeId).lean();

  if (!notice) {
    throw new NotFoundError('Notice', noticeId);
  }

  if (user?.roles.includes('Super Admin')) {
    return notice;
  }

  if (user?.roles.includes('Society Admin')) {
    if (notice.societyId.toString() !== user.societyId) {
      throw new AuthorizationError('Access denied to notice');
    }
    return notice;
  }

  if (notice.societyId.toString() !== user?.societyId || notice.status !== 'Published') {
    throw new AuthorizationError('Access denied to notice');
  }

  return notice;
};

export const noticeService = {
  createNotice: async (user: AuthenticatedRequest['user'], payload: Omit<INotice, '_id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'publishedBy' | 'status'>) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    return Notice.create({
      ...payload,
      societyId: new mongoose.Types.ObjectId(user.societyId),
      createdBy: new mongoose.Types.ObjectId(user.userId),
      status: 'Draft',
      publishedBy: null,
      publishedAt: null,
    });
  },

  updateNotice: async (user: AuthenticatedRequest['user'], noticeId: string, payload: Partial<INotice>) => {
    const notice = await ensureNoticeAccess(user, noticeId);

    if (notice.status !== 'Draft') {
      throw new ValidationError('Only draft notices can be updated');
    }

    const result = await Notice.findOneAndUpdate(
      { _id: notice._id },
      { $set: payload },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Notice', noticeId);
    }

    return result;
  },

  publishNotice: async (user: AuthenticatedRequest['user'], noticeId: string, payload: Partial<INotice>) => {
    const notice = await ensureNoticeAccess(user, noticeId);

    if (notice.status !== 'Draft') {
      throw new ValidationError('Only draft notices can be published');
    }

    const result = await Notice.findOneAndUpdate(
      { _id: notice._id },
      {
        $set: {
          ...payload,
          status: 'Published',
          publishedBy: new mongoose.Types.ObjectId(user?.userId),
          publishedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Notice', noticeId);
    }

    return result;
  },

  archiveNotice: async (user: AuthenticatedRequest['user'], noticeId: string) => {
    const notice = await ensureNoticeAccess(user, noticeId);

    if (notice.status === 'Archived') {
      throw new ValidationError('Notice is already archived');
    }

    const result = await Notice.findOneAndUpdate(
      { _id: notice._id },
      { $set: { status: 'Archived' } },
      { new: true }
    ).lean();

    if (!result) {
      throw new NotFoundError('Notice', noticeId);
    }

    return result;
  },

  deleteNotice: async (user: AuthenticatedRequest['user'], noticeId: string) => {
    const notice = await ensureNoticeAccess(user, noticeId);

    if (notice.status !== 'Draft') {
      throw new ValidationError('Only draft notices can be deleted');
    }

    const result = await Notice.deleteOne({ _id: notice._id });
    return result.deletedCount === 1;
  },

  getNoticeById: async (user: AuthenticatedRequest['user'], noticeId: string) => {
    return ensureNoticeAccess(user, noticeId);
  },

  listNotices: async (user: AuthenticatedRequest['user'], query: NoticeListQuery = {}) => {
    const filter = buildNoticeFilter(user, query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      Notice.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notice.countDocuments(filter),
    ]);

    return {
      notices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  getTotalNotices: async (user: AuthenticatedRequest['user']) => {
    const filter = buildNoticeFilter(user);
    return Notice.countDocuments(filter);
  },

  getPublishedNotices: async (user: AuthenticatedRequest['user']) => {
    const filter = buildNoticeFilter(user, { status: 'Published' });
    return Notice.countDocuments(filter);
  },

  getDraftNotices: async (user: AuthenticatedRequest['user']) => {
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!user.roles.includes('Super Admin') && !user.roles.includes('Society Admin')) {
      throw new AuthorizationError('Only admins can retrieve draft notices');
    }

    const filter = buildNoticeFilter(user, { status: 'Draft' });
    return Notice.countDocuments(filter);
  },

  getRecentNotices: async (user: AuthenticatedRequest['user']) => {
    const filter = buildNoticeFilter(user, { status: 'Published' });

    return Notice.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .lean();
  },
};
