import { User, CreateUserDto } from '@makemyday/shared';

export const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789',
  profile: {
    displayName: 'Test User',
    language: 'en',
    country: 'NLD',
  },
  preferences: {
    filters: [],
    difficulty: 3,
    notifications: {
      daily: true,
      community: true,
      achievements: true,
    },
  },
  premium: {
    status: false,
    autoRenew: false,
  },
  statistics: {
    totalSessions: 0,
    totalActivities: 0,
    totalDistance: 0,
    totalTime: 0,
    averageRating: 0,
  },
  created: new Date(),
  lastActive: new Date(),
};

export const mockCreateUserDto: CreateUserDto = {
  email: 'newuser@example.com',
  password: 'SecurePass123',
  displayName: 'New User',
  language: 'en',
  country: 'NLD',
};

export const mockLocation = {
  lat: 52.3676,
  lng: 4.9041,
};

export const mockActivity = {
  id: 'activity-123',
  type: 'POI' as const,
  source: 'OSM' as const,
  osmId: 'node/12345',
  title: {
    en: 'Test Museum',
    nl: 'Test Museum',
  },
  description: {
    en: 'A test museum',
    nl: 'Een test museum',
  },
  location: {
    type: 'Point' as const,
    coordinates: [4.9041, 52.3676],
  },
  category: ['tourism'],
  difficulty: 2,
  estimatedDuration: {
    min: 60,
    max: 120,
  },
  requirements: {
    weather: ['ANY'],
    timeOfDay: ['ANY'],
    season: ['ANY'],
    groupSize: {
      min: 1,
      max: 5,
    },
  },
  metadata: {
    osmTags: {},
    images: [],
  },
  statistics: {
    timesCompleted: 0,
    averageRating: 0,
    ratings: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  },
  premium: false,
  active: true,
  created: new Date(),
  lastUpdated: new Date(),
};

export const mockChallenge = {
  id: 'challenge-123',
  title: {
    en: 'Test Challenge',
    nl: 'Test Uitdaging',
  },
  description: {
    en: 'A test challenge',
    nl: 'Een test uitdaging',
  },
  type: 'UNIVERSAL' as const,
  category: 'PHOTO' as const,
  difficulty: 2,
  estimatedDuration: 20,
  requirements: {
    weather: ['ANY'],
    timeOfDay: ['ANY'],
    season: ['ANY'],
    minGroupSize: 1,
    maxGroupSize: 5,
  },
  verification: {
    requiresPhoto: true,
    requiresLocation: true,
  },
  rewards: {
    points: 15,
  },
  tags: ['test'],
  premium: false,
  active: true,
  created: new Date(),
  timesCompleted: 0,
  averageRating: 0,
};
