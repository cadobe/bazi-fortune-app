const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.redis = global.redisClient;
    this.defaultTTL = 3600; // 1 hour
  }

  /**
   * Set cache with TTL
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.redis) {
        logger.warn('Redis client not available, skipping cache set');
        return false;
      }

      const serializedValue = JSON.stringify(value);
      await this.redis.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get from cache
   */
  async get(key) {
    try {
      if (!this.redis) {
        logger.warn('Redis client not available, skipping cache get');
        return null;
      }

      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete from cache
   */
  async del(key) {
    try {
      if (!this.redis) {
        return false;
      }

      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern) {
    try {
      if (!this.redis) {
        return false;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!this.redis) {
        return false;
      }

      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet(key, computeFn, ttl = this.defaultTTL) {
    try {
      // Try to get from cache first
      let cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Compute value
      const computed = await computeFn();

      // Cache the result
      await this.set(key, computed, ttl);

      return computed;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      // Fallback to computing without caching
      return await computeFn();
    }
  }

  /**
   * Increment counter
   */
  async incr(key, ttl = this.defaultTTL) {
    try {
      if (!this.redis) {
        return 1;
      }

      const current = await this.redis.incr(key);
      if (current === 1) {
        // Set TTL on first increment
        await this.redis.expire(key, ttl);
      }
      return current;
    } catch (error) {
      logger.error('Cache incr error:', error);
      return 1;
    }
  }

  /**
   * Rate limiting helper
   */
  async checkRateLimit(identifier, limit, windowSeconds) {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await this.incr(key, windowSeconds);

      return {
        allowed: current <= limit,
        count: current,
        limit,
        resetTime: Date.now() + (windowSeconds * 1000)
      };
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return { allowed: true, count: 0, limit, resetTime: 0 };
    }
  }

  // Cache key generators
  static keys = {
    chartAnalysis: (chartId) => `chart_analysis:${chartId}`,
    userCharts: (userId, page, limit) => `user_charts:${userId}:${page}:${limit}`,
    publicCharts: (page, limit) => `public_charts:${page}:${limit}`,
    aiSession: (sessionId) => `ai_session:${sessionId}`,
    dailyFortune: (date) => `daily_fortune:${date}`,
    userProfile: (userId) => `user_profile:${userId}`,
    chartComparison: (chart1Id, chart2Id) => `chart_comparison:${chart1Id}:${chart2Id}`
  };
}

module.exports = new CacheService();