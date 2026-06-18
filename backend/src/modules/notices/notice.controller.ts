import { Response } from 'express';
import { sendSuccess, sendCreated, sendNoContent } from '@utils/response';
import { ValidationError, NotFoundError } from '@utils/errors';
import type { AuthenticatedRequest } from '@/types/express';
import { noticeService } from './notice.service';
import type {
  CreateNoticeInput,
  UpdateNoticeInput,
  PublishNoticeInput,
  ArchiveNoticeInput,
  ListNoticesQueryInput,
  IdParamInput,
} from './notice.validation';

export const listNotices = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const query = req.query as ListNoticesQueryInput;
  const result = await noticeService.listNotices(req.user, query);

  return sendSuccess(res, result, { message: 'Notices retrieved successfully' });
};

export const getNoticeById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const notice = await noticeService.getNoticeById(req.user, id);

  return sendSuccess(res, notice, { message: 'Notice retrieved successfully' });
};

export const createNotice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const payload = req.body as CreateNoticeInput;
  const notice = await noticeService.createNotice(req.user, payload);

  return sendCreated(res, notice, 'Notice created successfully');
};

export const updateNotice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const payload = req.body as UpdateNoticeInput;
  const notice = await noticeService.updateNotice(req.user, id, payload);

  return sendSuccess(res, notice, { message: 'Notice updated successfully' });
};

export const publishNotice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const payload = req.body as PublishNoticeInput;
  const notice = await noticeService.publishNotice(req.user, id, payload);

  return sendSuccess(res, notice, { message: 'Notice published successfully' });
};

export const archiveNotice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const notice = await noticeService.archiveNotice(req.user, id);

  return sendSuccess(res, notice, { message: 'Notice archived successfully' });
};

export const deleteNotice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user) {
    throw new ValidationError('Authentication context required');
  }

  const { id } = req.params as IdParamInput;
  const deleted = await noticeService.deleteNotice(req.user, id);

  if (!deleted) {
    throw new NotFoundError('Notice', id);
  }

  return sendNoContent(res);
};
