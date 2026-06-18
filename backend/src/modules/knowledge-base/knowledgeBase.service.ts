import { FilterQuery, Types } from 'mongoose';
import KnowledgeBaseArticle, { IKnowledgeBaseArticle, ArticleStatus } from './knowledgeBase.model';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export interface KnowledgeBaseQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string;
  search?: string;
  status?: ArticleStatus;
}

export class KnowledgeBaseService {
  async createArticle(data: Partial<IKnowledgeBaseArticle>, societyId: Types.ObjectId, userId: Types.ObjectId) {
    const article = new KnowledgeBaseArticle({
      ...data,
      societyId,
      createdBy: userId,
      updatedBy: userId,
    });

    return article.save();
  }

  async getArticleById(articleId: string, societyId: Types.ObjectId) {
    const article = await KnowledgeBaseArticle.findOne({ _id: articleId, societyId });
    if (!article) {
      throw new NotFoundError('Knowledge base article not found');
    }
    return article;
  }

  async updateArticle(articleId: string, data: Partial<IKnowledgeBaseArticle>, societyId: Types.ObjectId, userId: Types.ObjectId) {
    const article = await KnowledgeBaseArticle.findOne({ _id: articleId, societyId });
    if (!article) {
      throw new NotFoundError('Knowledge base article not found');
    }

    if (article.status === 'Archived' && data.status !== 'Archived') {
      throw new BadRequestError('Cannot modify an archived article');
    }

    Object.assign(article, { ...data, updatedBy: userId });
    return article.save();
  }

  async publishArticle(articleId: string, societyId: Types.ObjectId, userId: Types.ObjectId) {
    const article = await this.getArticleById(articleId, societyId);
    if (article.status === 'Published') {
      throw new BadRequestError('Article is already published');
    }
    article.status = 'Published';
    article.updatedBy = userId;
    return article.save();
  }

  async archiveArticle(articleId: string, societyId: Types.ObjectId, userId: Types.ObjectId) {
    const article = await this.getArticleById(articleId, societyId);
    if (article.status === 'Archived') {
      throw new BadRequestError('Article is already archived');
    }
    article.status = 'Archived';
    article.updatedBy = userId;
    return article.save();
  }

  async deleteArticle(articleId: string, societyId: Types.ObjectId) {
    const article = await KnowledgeBaseArticle.findOneAndDelete({ _id: articleId, societyId });
    if (!article) {
      throw new NotFoundError('Knowledge base article not found');
    }
    return article;
  }

  async listArticles(params: KnowledgeBaseQueryParams, societyId: Types.ObjectId, role: string) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const filter: FilterQuery<IKnowledgeBaseArticle> = { societyId };

    if (params.category) {
      filter.category = params.category;
    }

    if (params.tags) {
      filter.tags = { $in: params.tags.split(',').map((tag) => tag.trim()).filter(Boolean) };
    }

    if (params.search) {
      filter.$or = [
        { title: new RegExp(params.search, 'i') },
        { summary: new RegExp(params.search, 'i') },
        { content: new RegExp(params.search, 'i') },
      ];
    }

    if (role !== 'SuperAdmin' && role !== 'SocietyAdmin') {
      filter.status = 'Published';
    } else if (params.status) {
      filter.status = params.status;
    }

    const [articles, total] = await Promise.all([
      KnowledgeBaseArticle.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      KnowledgeBaseArticle.countDocuments(filter),
    ]);

    return {
      data: articles,
      meta: {
        page,
        limit,
        total,
      },
    };
  }
}

export default new KnowledgeBaseService();
