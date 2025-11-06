import { GeoPoint, Language } from './common';

export enum PremiumType {
  TRIAL = 'TRIAL',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface UserProfile {
  displayName: string;
  avatar?: string;
  language: Language;
  country: string;
}

export interface UserPreferences {
  filters: string[];
  difficulty: number; // 1-5
  notifications: {
    daily: boolean;
    community: boolean;
    achievements: boolean;
  };
}

export interface PremiumStatus {
  status: boolean;
  type?: PremiumType;
  startDate?: Date;
  expiryDate?: Date;
  autoRenew: boolean;
}

export interface UserHomebase {
  coordinates: GeoPoint;
  setAt: Date;
}

export interface UserStatistics {
  totalSessions: number;
  totalActivities: number;
  totalDistance: number; // meters
  totalTime: number; // minutes
  averageRating: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  profile: UserProfile;
  preferences: UserPreferences;
  premium: PremiumStatus;
  homebase?: UserHomebase;
  statistics: UserStatistics;
  created: Date;
  lastActive: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  displayName: string;
  language: Language;
  country: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}
