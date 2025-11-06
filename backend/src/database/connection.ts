import { Pool } from 'pg';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

// PostgreSQL connection
export const pgPool = new Pool({
  connectionString: config.database.postgres,
});

// MongoDB connection
export async function connectMongoDB() {
  try {
    await mongoose.connect(config.database.mongodb);
    logger.info('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Redis connection
export const redis = new Redis(config.database.redis, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('✅ Connected to Redis');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

// Test PostgreSQL connection
export async function connectPostgreSQL() {
  try {
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ Connected to PostgreSQL');
  } catch (error) {
    logger.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
}

// Connect all databases
export async function connectDatabases() {
  await Promise.all([connectPostgreSQL(), connectMongoDB()]);
}

// Graceful shutdown
export async function closeDatabases() {
  await pgPool.end();
  await mongoose.connection.close();
  await redis.quit();
  logger.info('✅ Database connections closed');
}
