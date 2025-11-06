import mongoose, { Schema, Document } from 'mongoose';
import { Challenge as IChallenge } from '@makemyday/shared';

export interface ChallengeDocument extends Omit<IChallenge, 'id'>, Document {}

const challengeSchema = new Schema<ChallengeDocument>(
  {
    title: {
      type: Map,
      of: String,
      required: true,
    },
    description: {
      type: Map,
      of: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['LOCATION_SPECIFIC', 'UNIVERSAL'],
      required: true,
    },
    category: {
      type: String,
      enum: ['PHOTO', 'INTERACTION', 'DISCOVERY', 'CREATIVE'],
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    estimatedDuration: {
      type: Number,
      required: true,
    },
    requirements: {
      locationTypes: [String],
      weather: {
        type: [String],
        enum: ['SUNNY', 'RAINY', 'CLOUDY', 'SNOWY', 'ANY'],
      },
      timeOfDay: {
        type: [String],
        enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'ANY'],
      },
      season: {
        type: [String],
        enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ANY'],
      },
      minGroupSize: {
        type: Number,
        required: true,
        min: 1,
      },
      maxGroupSize: {
        type: Number,
        required: true,
        max: 5,
      },
      equipment: [String],
    },
    verification: {
      requiresPhoto: {
        type: Boolean,
        required: true,
      },
      requiresLocation: {
        type: Boolean,
        required: true,
      },
      photoGuidelines: String,
    },
    rewards: {
      points: {
        type: Number,
        required: true,
      },
      badges: [String],
    },
    tags: [String],
    premium: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    timesCompleted: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created', updatedAt: false },
  }
);

// Indexes
challengeSchema.index({ type: 1, active: 1 });
challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ category: 1 });
challengeSchema.index({ premium: 1 });
challengeSchema.index({ tags: 1 });

export const ChallengeModel = mongoose.model<ChallengeDocument>('Challenge', challengeSchema);
