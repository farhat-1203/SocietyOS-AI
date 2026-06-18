import { Router } from 'express';
import * as noticeController from './notice.controller';
import { authMiddleware, checkPermission } from '@middleware/auth';
import { tenancyMiddleware } from '@middleware/tenancy';
import { validateBody, validateParams, validateQuery } from '@middleware/validation';
import { createNoticeSchema, updateNoticeSchema, publishNoticeSchema, archiveNoticeSchema, listNoticesQuerySchema, idParamSchema } from './notice.validation';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenancyMiddleware);

router.post(
  '/',
  checkPermission('notice', 'create'),
  validateBody(createNoticeSchema),
  asyncHandler(noticeController.createNotice)
);

router.get(
  '/',
  checkPermission('notice', 'view'),
  validateQuery(listNoticesQuerySchema),
  asyncHandler(noticeController.listNotices)
);

router.get(
  '/:id',
  checkPermission('notice', 'view'),
  validateParams(idParamSchema),
  asyncHandler(noticeController.getNoticeById)
);

router.patch(
  '/:id',
  checkPermission('notice', 'update'),
  validateParams(idParamSchema),
  validateBody(updateNoticeSchema),
  asyncHandler(noticeController.updateNotice)
);

router.patch(
  '/:id/publish',
  checkPermission('notice', 'publish'),
  validateParams(idParamSchema),
  validateBody(publishNoticeSchema),
  asyncHandler(noticeController.publishNotice)
);

router.patch(
  '/:id/archive',
  checkPermission('notice', 'archive'),
  validateParams(idParamSchema),
  validateBody(archiveNoticeSchema),
  asyncHandler(noticeController.archiveNotice)
);

router.delete(
  '/:id',
  checkPermission('notice', 'delete'),
  validateParams(idParamSchema),
  asyncHandler(noticeController.deleteNotice)
);

export default router;
