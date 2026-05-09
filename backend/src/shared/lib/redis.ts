import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// For Upstash Redis, don't use username - only password
const redisUrl = env.REDIS_URL || `redis://:${env.UPSTASH_REDIS_REST_TOKEN}@factual-gelding-112202.upstash.io:6379`;

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error('Redis retry limit reached');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 1000, 3000);
    return delay;
  },
  tls: {
    rejectUnauthorized: false,
  },
});

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

redis.on('connect', () => logger.info('Connected to Upstash Redis'));
redis.on('error', (error) => {
  logger.error('Redis connection error:', error.message);
  if (error.message.includes('WRONGPASS')) {
    logger.error('Please check your Upstash Redis token in .env file');
  }
});
redis.on('ready', () => logger.info('Redis is ready'));