import mongoose, { Document, Schema } from 'mongoose';

export type ArticleStatus = 'Draft' | 'Published' | 'Archived';

export interface IKnowledgeBaseArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  societyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeBaseSchema = new Schema<IKnowledgeBaseArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
      index: true,
    },
    societyId: {
      type: Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeBaseSchema.index({ societyId: 1, status: 1 });
knowledgeBaseSchema.index({ category: 1 });
knowledgeBaseSchema.index({ tags: 1 });

const KnowledgeBaseArticle = mongoose.model<IKnowledgeBaseArticle>('KnowledgeBaseArticle', knowledgeBaseSchema);

export default KnowledgeBaseArticle;
