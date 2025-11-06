import mongoose, { Schema, Document } from 'mongoose';
import { Activity as IActivity } from '@makemyday/shared';

export interface ActivityDocument extends Omit<IActivity, 'id'>, Document {}

const activitySchema = new Schema<ActivityDocument>(
  {
    type: {
      type: String,
      enum: ['POI', 'CHALLENGE'],
      required: true,
    },
    source: {
      type: String,
      enum: ['OSM', 'CUSTOM'],
      required: true,
    },
    osmId: String,
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
      radius: Number,
    },
    category: [String],
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    estimatedDuration: {
      min: Number,
      max: Number,
    },
    cost: {
      type: Number,
      min: 1,
      max: 3,
    },
    requirements: {
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
      groupSize: {
        min: Number,
        max: Number,
      },
    },
    openingHours: String,
    metadata: {
      osmTags: Schema.Types.Mixed,
      images: [String],
      website: String,
      phone: String,
    },
    statistics: {
      timesCompleted: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      ratings: {
        type: Map,
        of: Number,
        default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    },
    premium: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created', updatedAt: 'lastUpdated' },
  }
);

// Geospatial index for location queries
activitySchema.index({ location: '2dsphere' });
activitySchema.index({ type: 1, active: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ difficulty: 1 });
activitySchema.index({ premium: 1 });

export const ActivityModel = mongoose.model<ActivityDocument>('Activity', activitySchema);
