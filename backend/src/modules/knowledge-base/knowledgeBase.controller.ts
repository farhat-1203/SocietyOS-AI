import { Request, Response } from 'express';
import { Types } from 'mongoose';
import knowledgeBaseService from './knowledgeBase.service';
import { createKnowledgeBaseArticleSchema, listKnowledgeBaseArticlesSchema, updateKnowledgeBaseArticleSchema } from './knowledgeBase.validation';
import { asyncHandler } from '../../utils/asyncHandler';
import { IAuthenticatedRequest } from '../../types/express';

export const createKnowledgeBaseArticle = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const parsed = createKnowledgeBaseArticleSchema.parse(req.body);
  const societyId = new Types.ObjectId(req.user.societyId);
  const userId = new Types.ObjectId(req.user._id);

  const article = await knowledgeBaseService.createArticle(parsed, societyId, userId);
  res.status(201).json({ data: article });
});

export const getKnowledgeBaseArticle = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const article = await knowledgeBaseService.getArticleById(req.params.id, new Types.ObjectId(req.user.societyId));
  res.json({ data: article });
});

export const updateKnowledgeBaseArticle = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const parsed = updateKnowledgeBaseArticleSchema.parse(req.body);
  const article = await knowledgeBaseService.updateArticle(
    req.params.id,
    parsed,
    new Types.ObjectId(req.user.societyId),
    new Types.ObjectId(req.user._id)
  );
  res.json({ data: article });
});

export const publishKnowledgeBaseArticle = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const article = await knowledgeBaseService.publishArticle(
    req.params.id,
    new Types.ObjectId(req.user.societyId),
    new Types.ObjectId(req.user._id)
  );
  res.json({ data: article });
});

export const archiveKnowledgeBaseArticle = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const article = await knowledgeBaseService.archiveArticle(
    req.params.id,
    new Types.ObjectId(req.user.societyId),
    new Types.ObjectId(req.user._id)
  );
  res.json({ data: article });
});

export const deleteKnowledgeBaseArticle = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const article = await knowledgeBaseService.deleteArticle(req.params.id, new Types.ObjectId(req.user.societyId));
  res.json({ data: article });
});

export const listKnowledgeBaseArticles = asyncHandler(async (req: IAuthenticatedRequest, res: Response) => {
  const parsed = listKnowledgeBaseArticlesSchema.parse(req.query);
  const societyId = new Types.ObjectId(req.user.societyId);
  const role = req.user.role;

  const result = await knowledgeBaseService.listArticles(parsed, societyId, role);
  res.json(result);
});
