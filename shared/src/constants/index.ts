import { TransportMode } from '../types';

export const TRANSPORT_SPEEDS = {
  [TransportMode.WALKING]: 5, // km/h
  [TransportMode.CYCLING]: 20, // km/h
  [TransportMode.DRIVING]: 60, // km/h (urban)
};

export const MAX_TRAVEL_TIME = 120; // minutes (2 hours)

export const FREE_USER_RADIUS = 25000; // meters (25 km)

export const FREE_USER_MAX_FILTERS = 3;

export const FREE_USER_SKIPS = 1;
export const PREMIUM_USER_SKIPS = 5;

export const OSM_TAGS = {
  tourism: [
    'attraction',
    'artwork',
    'gallery',
    'museum',
    'theme_park',
    'viewpoint',
    'zoo',
  ],
  historic: [
    'castle',
    'monument',
    'memorial',
    'ruins',
    'archaeological_site',
    'fort',
    'manor',
  ],
  leisure: [
    'park',
    'garden',
    'playground',
    'sports_centre',
    'swimming_pool',
    'beach_resort',
    'nature_reserve',
  ],
  amenity: ['cafe', 'restaurant', 'bar', 'library', 'theatre', 'cinema', 'arts_centre'],
  natural: ['peak', 'beach', 'waterfall', 'cave', 'spring', 'wood'],
  building: ['cathedral', 'church', 'mosque', 'temple', 'synagogue', 'chapel'],
};

export const FILTER_CATEGORIES = [
  'cultural-historical',
  'nature-outdoor',
  'modern-urban',
  'culinary',
  'active-sports',
  'creative-arts',
  'educational',
  'relaxing',
  'family-friendly',
  'adventurous',
];

export const CACHE_TTL = {
  USER_PROFILE: 3600, // 1 hour
  USER_PREFERENCES: 1800, // 30 min
  ACTIVITY: 86400, // 24 hours
  OSM_DATA: 604800, // 1 week
  COMMUNITY_FEED: 300, // 5 min
  TRANSLATIONS: 86400, // 24 hours
  DAILY_MENU: 86400, // 24 hours
};

export const RATE_LIMITS = {
  FREE: {
    ACTIVITY_GENERATION: { requests: 10, window: 3600 },
    PHOTO_UPLOAD: { requests: 20, window: 3600 },
    COMMUNITY_POST: { requests: 5, window: 3600 },
  },
  PREMIUM: {
    ACTIVITY_GENERATION: { requests: 50, window: 3600 },
    PHOTO_UPLOAD: { requests: 100, window: 3600 },
    COMMUNITY_POST: { requests: 20, window: 3600 },
  },
};

export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: {
    id: 'com.makemyday.premium.monthly',
    price: 1.5,
    currency: 'EUR',
    period: 'P1M',
  },
  YEARLY: {
    id: 'com.makemyday.premium.yearly',
    price: 12.0,
    currency: 'EUR',
    period: 'P1Y',
  },
};
