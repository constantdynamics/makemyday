import mongoose, { Schema, Document } from 'mongoose';
import { CommunityPost as ICommunityPost } from '@makemyday/shared';

export interface CommunityPostDocument extends Omit<ICommunityPost, 'id'>, Document {}

const communityPostSchema = new Schema<CommunityPostDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    activityId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ['COMPLETION', 'TIP', 'QUESTION'],
      required: true,
    },
    content: {
      text: {
        type: String,
        required: true,
      },
      originalLanguage: {
        type: String,
        required: true,
      },
      translations: {
        type: Map,
        of: String,
      },
    },
    media: [
      {
        type: {
          type: String,
          enum: ['PHOTO', 'VIDEO'],
        },
        url: String,
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    tags: [String],
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'],
      default: 'PUBLIC',
    },
  },
  {
    timestamps: { createdAt: 'created', updatedAt: false },
  }
);

// Indexes
communityPostSchema.index({ userId: 1, created: -1 });
communityPostSchema.index({ activityId: 1 });
communityPostSchema.index({ type: 1 });
communityPostSchema.index({ visibility: 1 });
communityPostSchema.index({ location: '2dsphere' });
communityPostSchema.index({ created: -1 });

export const CommunityPostModel = mongoose.model<CommunityPostDocument>(
  'CommunityPost',
  communityPostSchema
);
