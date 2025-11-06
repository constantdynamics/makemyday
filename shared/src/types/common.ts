export enum TransportMode {
  WALKING = 'WALKING',
  CYCLING = 'CYCLING',
  DRIVING = 'DRIVING',
}

export enum Language {
  NL = 'nl',
  EN = 'en',
  DE = 'de',
  FR = 'fr',
  ES = 'es',
}

export enum WeatherCondition {
  SUNNY = 'SUNNY',
  RAINY = 'RAINY',
  CLOUDY = 'CLOUDY',
  SNOWY = 'SNOWY',
  ANY = 'ANY',
}

export enum TimeOfDay {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  ANY = 'ANY',
}

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL',
  WINTER = 'WINTER',
  ANY = 'ANY',
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface TranslatedText {
  [key: string]: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
