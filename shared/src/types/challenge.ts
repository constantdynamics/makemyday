import { TranslatedText, WeatherCondition, TimeOfDay, Season } from './common';

export enum ChallengeType {
  LOCATION_SPECIFIC = 'LOCATION_SPECIFIC',
  UNIVERSAL = 'UNIVERSAL',
}

export enum ChallengeCategory {
  PHOTO = 'PHOTO',
  INTERACTION = 'INTERACTION',
  DISCOVERY = 'DISCOVERY',
  CREATIVE = 'CREATIVE',
}

export interface ChallengeRequirements {
  locationTypes?: string[]; // OSM tags
  weather: WeatherCondition[];
  timeOfDay: TimeOfDay[];
  season: Season[];
  minGroupSize: number;
  maxGroupSize: number;
  equipment?: string[];
}

export interface ChallengeVerification {
  requiresPhoto: boolean;
  requiresLocation: boolean;
  photoGuidelines?: string;
}

export interface ChallengeRewards {
  points: number;
  badges?: string[];
}

export interface Challenge {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: number; // 1-5
  estimatedDuration: number; // minutes
  requirements: ChallengeRequirements;
  verification: ChallengeVerification;
  rewards: ChallengeRewards;
  tags: string[];
  premium: boolean;
  active: boolean;
  created: Date;
  timesCompleted: number;
  averageRating: number;
}

export interface CreateChallengeDto {
  title: TranslatedText;
  description: TranslatedText;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: number;
  estimatedDuration: number;
  requirements: ChallengeRequirements;
  verification: ChallengeVerification;
  rewards: ChallengeRewards;
  tags?: string[];
  premium?: boolean;
}
