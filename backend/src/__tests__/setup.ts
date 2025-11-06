// Test setup and global mocks
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/makemyday_test';
process.env.MONGODB_URL = 'mongodb://test:test@localhost:27017/makemyday_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(), // Suppress error logs in tests
  warn: jest.fn(),
};
