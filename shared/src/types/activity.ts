import { GeoPoint, TranslatedText, WeatherCondition, TimeOfDay, Season } from './common';

export enum ActivitySource {
  OSM = 'OSM',
  CUSTOM = 'CUSTOM',
}

export interface ActivityRequirements {
  weather: WeatherCondition[];
  timeOfDay: TimeOfDay[];
  season: Season[];
  groupSize: {
    min: number;
    max: number;
  };
}

export interface ActivityLocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  radius?: number; // meters, for challenges
}

export interface ActivityMetadata {
  osmTags?: Record<string, string>;
  images?: string[];
  website?: string;
  phone?: string;
}

export interface ActivityStatistics {
  timesCompleted: number;
  averageRating: number;
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface Activity {
  id: string;
  type: 'POI' | 'CHALLENGE';
  source: ActivitySource;
  osmId?: string;
  title: TranslatedText;
  description: TranslatedText;
  location: ActivityLocation;
  category: string[];
  difficulty: number; // 1-5
  estimatedDuration: {
    min: number;
    max: number;
  };
  cost?: number; // 1-3 (€, €€, €€€)
  requirements: ActivityRequirements;
  openingHours?: string;
  metadata: ActivityMetadata;
  statistics: ActivityStatistics;
  premium: boolean;
  active: boolean;
  created: Date;
  lastUpdated: Date;
}

export interface GenerateActivityDto {
  location: {
    lat: number;
    lng: number;
  };
  transport: string;
  time: number;
  groupSize: number;
  filters?: string[];
  excludeIds?: string[];
  isPremium: boolean;
}

export interface ActivitySuggestion {
  activity: Activity;
  route: {
    distance: number; // meters
    duration: number; // seconds
    geometry: any; // GeoJSON
  };
  estimatedArrival: Date;
}
