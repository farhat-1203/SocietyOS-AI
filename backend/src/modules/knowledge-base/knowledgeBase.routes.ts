import { Router } from 'express';
import {
  archiveKnowledgeBaseArticle,
  createKnowledgeBaseArticle,
  deleteKnowledgeBaseArticle,
  getKnowledgeBaseArticle,
  listKnowledgeBaseArticles,
  publishKnowledgeBaseArticle,
  updateKnowledgeBaseArticle,
} from './knowledgeBase.controller';
import { authMiddleware } from '../../middleware/auth';
import { checkPermission } from '../../middleware/permission';

const router = Router();

router.use(authMiddleware);

router.get('/', checkPermission('knowledge.view'), listKnowledgeBaseArticles);
router.post('/', checkPermission('knowledge.create'), createKnowledgeBaseArticle);
router.get('/:id', checkPermission('knowledge.view'), getKnowledgeBaseArticle);
router.patch('/:id', checkPermission('knowledge.update'), updateKnowledgeBaseArticle);
router.patch('/:id/publish', checkPermission('knowledge.publish'), publishKnowledgeBaseArticle);
router.patch('/:id/archive', checkPermission('knowledge.archive'), archiveKnowledgeBaseArticle);
router.delete('/:id', checkPermission('knowledge.delete'), deleteKnowledgeBaseArticle);

export default router;
