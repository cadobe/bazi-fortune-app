const app = require('./src/app');
const mongoose = require('mongoose');
const redis = require('redis');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazi-fortune';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// MongoDB connection
if (MONGODB_URI && MONGODB_URI !== 'mongodb://localhost:27017/bazi-fortune') {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      logger.info('Connected to MongoDB');
    })
    .catch((error) => {
      logger.error('MongoDB connection error:', error);
      logger.warn('Continuing without MongoDB - some features may not work');
    });
} else {
  logger.warn('MONGODB_URI not configured - running without database');
  logger.warn('Please add MongoDB in Railway: New → Database → Add MongoDB');
}

// Redis connection
const redisClient = redis.createClient({
  url: REDIS_URL
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error:', error);
  // Don't exit, allow app to continue without Redis
});

// Connect to Redis with error handling
redisClient.connect().catch((error) => {
  logger.error('Failed to connect to Redis:', error);
  logger.warn('Continuing without Redis cache');
});

// Make Redis client available globally
global.redisClient = redisClient;

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');

  await mongoose.connection.close();
  await redisClient.quit();

  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };