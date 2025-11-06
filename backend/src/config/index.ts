export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  database: {
    postgres: process.env.POSTGRES_URL || '',
    mongodb: process.env.MONGODB_URL || '',
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  externalApis: {
    mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || '',
    osrmUrl: process.env.OSRM_API_URL || 'https://router.project-osrm.org',
    overpassUrl: process.env.OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter',
    azureTranslatorKey: process.env.AZURE_TRANSLATOR_KEY || '',
    azureTranslatorRegion: process.env.AZURE_TRANSLATOR_REGION || '',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'eu-west-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'makemyday-photos',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
