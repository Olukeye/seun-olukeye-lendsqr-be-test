import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = '7hdy-supe7-het*56-jwt-key-change-this';

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase test timeout for database operations
jest.setTimeout(10000);