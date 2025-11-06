import { GeoPoint, TransportMode } from './common';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum ActivityType {
  LOCATION = 'LOCATION',
  CHALLENGE = 'CHALLENGE',
}

export interface SessionConfig {
  transport: TransportMode;
  totalTime: number; // minutes
  groupSize: number;
  startLocation: GeoPoint;
  filters: string[];
}

export interface SessionActivity {
  activityId: string;
  type: ActivityType;
  startedAt?: Date;
  completedAt?: Date;
  skipped: boolean;
  rating?: number;
  photo?: string;
  feedback?: string;
}

export interface SessionSkips {
  available: number;
  used: number;
  skippedTypes: string[];
}

export interface Session {
  id: string;
  userId: string;
  config: SessionConfig;
  activities: SessionActivity[];
  skips: SessionSkips;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date;
  totalDistance?: number; // meters
  totalDuration?: number; // minutes
}

export interface CreateSessionDto {
  transport: TransportMode;
  totalTime: number;
  groupSize: number;
  startLocation: {
    lat: number;
    lng: number;
  };
  filters?: string[];
}

export interface CompleteActivityDto {
  rating: number;
  photo?: string;
  feedback?: string;
}
