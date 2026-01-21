# Backend System Design Interview Questions

## Table of Contents
1. [Design URL Shortener (bit.ly)](#design-url-shortener-bitly)
2. [Design Rate Limiter](#design-rate-limiter)
3. [Design Distributed Cache (Redis)](#design-distributed-cache-redis)
4. [Design Message Queue (Kafka/RabbitMQ)](#design-message-queue-kafkarabbitmq)
5. [Design API Gateway](#design-api-gateway)
6. [Design Authentication System](#design-authentication-system)
7. [Design E-Commerce Order System](#design-e-commerce-order-system)
8. [Design Real-Time Leaderboard](#design-real-time-leaderboard)
9. [Design Search Engine (Elasticsearch)](#design-search-engine-elasticsearch)
10. [Design Payment System](#design-payment-system)

---

## Design URL Shortener (bit.ly)

### Requirements
**Functional**:
- Generate short URLs from long URLs
- Redirect short URLs to original URLs
- Custom aliases (optional)
- Analytics (click tracking)
- Expiration time
- URL validation

**Non-Functional**:
- 100M URLs per day
- Low latency (< 50ms)
- 99.99% availability
- Handle 10K QPS
- Durability (no data loss)

### Capacity Estimation
```
Write: 100M URLs/day = 1,157 writes/sec
Read: Assume 100:1 read-to-write ratio = 115,700 reads/sec

Storage for 5 years:
100M URLs/day × 365 days × 5 years = 182.5B URLs
Average URL size: 500 bytes
Total: 182.5B × 500 bytes = 91.25 TB

Bandwidth:
Write: 1,157 URLs/sec × 500 bytes = 0.58 MB/s
Read: 115,700 URLs/sec × 500 bytes = 57.85 MB/s
```

### High-Level Architecture

```javascript
/**
 * URL Shortener System
 */

// 1. Core Service
class URLShortenerService {
  constructor() {
    this.db = new DatabaseClient();
    this.cache = new CacheClient();
    this.idGenerator = new DistributedIDGenerator();
  }
  
  /**
   * Generate Short URL
   */
  async createShortURL(longURL, customAlias = null, userId = null, expiresAt = null) {
    // Validate URL
    if (!this.isValidURL(longURL)) {
      throw new Error('Invalid URL');
    }
    
    // Check if URL already exists (optional)
    const existing = await this.findByLongURL(longURL);
    if (existing) {
      return existing;
    }
    
    // Generate short code
    let shortCode;
    if (customAlias) {
      // Check availability
      const available = await this.isAliasAvailable(customAlias);
      if (!available) {
        throw new Error('Alias already taken');
      }
      shortCode = customAlias;
    } else {
      shortCode = await this.generateShortCode();
    }
    
    // Store in database
    const urlData = {
      shortCode,
      longURL,
      userId,
      createdAt: Date.now(),
      expiresAt,
      clicks: 0
    };
    
    await this.db.insert('urls', urlData);
    
    // Cache for quick access
    await this.cache.set(`url:${shortCode}`, longURL, 3600);
    
    return {
      shortURL: `https://short.url/${shortCode}`,
      longURL
    };
  }
  
  /**
   * Generate unique short code (Base62 encoding)
   */
  async generateShortCode() {
    const id = await this.idGenerator.getNextId();
    return this.base62Encode(id);
  }
  
  base62Encode(num) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let encoded = '';
    
    while (num > 0) {
      encoded = chars[num % 62] + encoded;
      num = Math.floor(num / 62);
    }
    
    return encoded || '0';
  }
  
  base62Decode(str) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let num = 0;
    
    for (let i = 0; i < str.length; i++) {
      num = num * 62 + chars.indexOf(str[i]);
    }
    
    return num;
  }
  
  /**
   * Resolve Short URL
   */
  async resolveShortURL(shortCode) {
    // Check cache first
    let longURL = await this.cache.get(`url:${shortCode}`);
    
    if (!longURL) {
      // Cache miss - query database
      const urlData = await this.db.findOne('urls', { shortCode });
      
      if (!urlData) {
        throw new Error('URL not found');
      }
      
      // Check expiration
      if (urlData.expiresAt && urlData.expiresAt < Date.now()) {
        throw new Error('URL expired');
      }
      
      longURL = urlData.longURL;
      
      // Cache for future requests
      await this.cache.set(`url:${shortCode}`, longURL, 3600);
    }
    
    // Track click asynchronously
    this.trackClick(shortCode).catch(err => {
      console.error('Failed to track click:', err);
    });
    
    return longURL;
  }
  
  /**
   * Track Click Analytics
   */
  async trackClick(shortCode) {
    const clickData = {
      shortCode,
      timestamp: Date.now(),
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      referer: request.headers['referer']
    };
    
    // Write to message queue for async processing
    await messageQueue.publish('clicks', clickData);
    
    // Increment counter in cache
    await this.cache.increment(`clicks:${shortCode}`);
  }
  
  /**
   * Get Analytics
   */
  async getAnalytics(shortCode, timeRange = '7d') {
    const clicks = await this.db.aggregate('clicks', {
      match: { shortCode },
      timeRange,
      groupBy: 'day'
    });
    
    const geo = await this.db.aggregate('clicks', {
      match: { shortCode },
      groupBy: 'country'
    });
    
    const devices = await this.db.aggregate('clicks', {
      match: { shortCode },
      groupBy: 'device'
    });
    
    return {
      totalClicks: await this.cache.get(`clicks:${shortCode}`) || 0,
      clicksByDay: clicks,
      clicksByCountry: geo,
      clicksByDevice: devices
    };
  }
  
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// 2. Distributed ID Generator (Snowflake Algorithm)
class DistributedIDGenerator {
  constructor(workerId, datacenterId) {
    this.workerId = workerId; // 5 bits (0-31)
    this.datacenterId = datacenterId; // 5 bits (0-31)
    this.sequence = 0; // 12 bits (0-4095)
    this.lastTimestamp = -1;
    
    this.workerIdBits = 5;
    this.datacenterIdBits = 5;
    this.sequenceBits = 12;
    
    this.maxWorkerId = -1 ^ (-1 << this.workerIdBits);
    this.maxDatacenterId = -1 ^ (-1 << this.datacenterIdBits);
    
    this.workerIdShift = this.sequenceBits;
    this.datacenterIdShift = this.sequenceBits + this.workerIdBits;
    this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;
    
    this.sequenceMask = -1 ^ (-1 << this.sequenceBits);
    this.epoch = 1609459200000; // Custom epoch (2021-01-01)
  }
  
  getNextId() {
    let timestamp = Date.now();
    
    // Clock moved backwards
    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards');
    }
    
    // Same millisecond
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & this.sequenceMask;
      
      // Sequence overflow - wait for next millisecond
      if (this.sequence === 0) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }
    
    this.lastTimestamp = timestamp;
    
    // Generate ID
    const id = 
      ((timestamp - this.epoch) << this.timestampLeftShift) |
      (this.datacenterId << this.datacenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence;
    
    return id;
  }
  
  waitNextMillis(lastTimestamp) {
    let timestamp = Date.now();
    while (timestamp <= lastTimestamp) {
      timestamp = Date.now();
    }
    return timestamp;
  }
}

// 3. Database Schema
const URLSchema = {
  tableName: 'urls',
  columns: {
    id: 'BIGINT PRIMARY KEY',
    shortCode: 'VARCHAR(10) UNIQUE NOT NULL INDEX',
    longURL: 'TEXT NOT NULL',
    userId: 'BIGINT INDEX',
    createdAt: 'TIMESTAMP DEFAULT NOW()',
    expiresAt: 'TIMESTAMP',
    clicks: 'INTEGER DEFAULT 0'
  },
  indexes: [
    'CREATE INDEX idx_short_code ON urls(shortCode)',
    'CREATE INDEX idx_user_id ON urls(userId)',
    'CREATE INDEX idx_created_at ON urls(createdAt)'
  ],
  partitioning: 'PARTITION BY RANGE (createdAt)'
};

const ClickSchema = {
  tableName: 'clicks',
  columns: {
    id: 'BIGINT PRIMARY KEY',
    shortCode: 'VARCHAR(10) NOT NULL INDEX',
    timestamp: 'TIMESTAMP DEFAULT NOW()',
    ip: 'VARCHAR(45)',
    userAgent: 'TEXT',
    referer: 'TEXT',
    country: 'VARCHAR(2)',
    device: 'VARCHAR(20)'
  },
  indexes: [
    'CREATE INDEX idx_short_code_timestamp ON clicks(shortCode, timestamp)'
  ],
  partitioning: 'PARTITION BY RANGE (timestamp)'
};

// 4. Caching Strategy
class CacheStrategy {
  constructor() {
    this.redis = new Redis();
    this.localCache = new LRUCache({ max: 10000 });
  }
  
  async get(key) {
    // L1: Local cache (in-memory)
    const local = this.localCache.get(key);
    if (local) return local;
    
    // L2: Redis cache (distributed)
    const cached = await this.redis.get(key);
    if (cached) {
      this.localCache.set(key, cached);
      return cached;
    }
    
    return null;
  }
  
  async set(key, value, ttl = 3600) {
    // Write to both layers
    this.localCache.set(key, value);
    await this.redis.setex(key, ttl, value);
  }
  
  async invalidate(key) {
    this.localCache.del(key);
    await this.redis.del(key);
  }
}

// 5. API Endpoints
const express = require('express');
const app = express();

const urlService = new URLShortenerService();
const rateLimiter = new RateLimiter();

// Create short URL
app.post('/api/shorten', rateLimiter.limit(100, '15m'), async (req, res) => {
  try {
    const { longURL, customAlias, expiresIn } = req.body;
    
    const result = await urlService.createShortURL(
      longURL,
      customAlias,
      req.userId,
      expiresIn ? Date.now() + expiresIn : null
    );
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Redirect short URL
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const longURL = await urlService.resolveShortURL(shortCode);
    
    res.redirect(301, longURL);
  } catch (error) {
    res.status(404).send('URL not found');
  }
});

// Get analytics
app.get('/api/analytics/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const analytics = await urlService.getAnalytics(shortCode);
    
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Cleanup Expired URLs (Background Job)
class URLCleanupJob {
  constructor() {
    this.interval = null;
  }
  
  start() {
    // Run every hour
    this.interval = setInterval(() => {
      this.cleanup();
    }, 3600000);
  }
  
  async cleanup() {
    const batchSize = 1000;
    let deletedCount = 0;
    
    while (true) {
      const expired = await db.query(`
        SELECT shortCode 
        FROM urls 
        WHERE expiresAt < NOW()
        LIMIT ${batchSize}
      `);
      
      if (expired.length === 0) break;
      
      const shortCodes = expired.map(row => row.shortCode);
      
      // Delete from database
      await db.query(`
        DELETE FROM urls 
        WHERE shortCode IN (?)
      `, [shortCodes]);
      
      // Invalidate cache
      await Promise.all(
        shortCodes.map(code => cache.invalidate(`url:${code}`))
      );
      
      deletedCount += expired.length;
    }
    
    console.log(`Cleaned up ${deletedCount} expired URLs`);
  }
}
```

### Architecture Diagram
```
                                   ┌─────────────┐
                                   │   Client    │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ Load Balance│
                                   └──────┬──────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
             ┌─────────────┐       ┌─────────────┐      ┌─────────────┐
             │  App Server │       │  App Server │      │  App Server │
             │   Node 1    │       │   Node 2    │      │   Node 3    │
             └──────┬──────┘       └──────┬──────┘      └──────┬──────┘
                    │                     │                     │
                    └─────────────────────┼─────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
             ┌─────────────┐       ┌─────────────┐      ┌─────────────┐
             │Redis Cache  │       │  PostgreSQL │      │   Kafka     │
             │   Cluster   │       │   Primary   │      │   Cluster   │
             └─────────────┘       └──────┬──────┘      └─────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ PostgreSQL  │
                                   │  Replicas   │
                                   └─────────────┘
```

### Key Design Decisions

**1. URL Generation Strategy**:
- **Base62 encoding**: 62^7 = 3.5 trillion unique URLs
- **Distributed ID generation**: Snowflake algorithm for uniqueness
- **Custom aliases**: Check availability, prevent conflicts

**2. Database Choice**:
- **Primary**: PostgreSQL (ACID compliance)
- **Partitioning**: By creation time for better performance
- **Indexing**: On shortCode (main lookup), userId, createdAt

**3. Caching Strategy**:
```
Read Path:
1. Check local cache (LRU, 10K entries)
2. Check Redis cache (distributed, 1M entries)
3. Query database
4. Update caches (write-through)

Write Path:
1. Write to database
2. Write to Redis cache
3. Invalidate local cache
```

**4. Scalability**:
- **Horizontal scaling**: Stateless app servers
- **Database sharding**: By hash(shortCode) % shards
- **Read replicas**: For analytics queries
- **CDN**: Cache redirect responses

**5. Analytics Processing**:
- **Async**: Use message queue (Kafka)
- **Batch processing**: Aggregate every 5 minutes
- **Time-series database**: For click data (InfluxDB/TimescaleDB)

---

## Design Rate Limiter

### Requirements
**Functional**:
- Limit requests per user/IP
- Multiple strategies (fixed window, sliding window, token bucket)
- Per-endpoint limits
- Distributed across servers
- Return rate limit info in headers

**Non-Functional**:
- Low latency (< 5ms)
- Handle 10K+ requests per second
- Fault tolerant
- Accurate counting

### Algorithms

```javascript
/**
 * Rate Limiting Algorithms
 */

// 1. Token Bucket Algorithm
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity; // Max tokens
    this.tokens = capacity; // Current tokens
    this.refillRate = refillRate; // Tokens per second
    this.lastRefill = Date.now();
  }
  
  allowRequest(cost = 1) {
    this.refill();
    
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    
    return false;
  }
  
  refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
  
  getWaitTime() {
    if (this.tokens >= 1) return 0;
    
    const tokensNeeded = 1 - this.tokens;
    return (tokensNeeded / this.refillRate) * 1000; // milliseconds
  }
}

// 2. Sliding Window Log
class SlidingWindowLog {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = []; // Array of timestamps
  }
  
  allowRequest() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Remove old requests outside window
    this.requests = this.requests.filter(time => time > windowStart);
    
    if (this.requests.length < this.limit) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
  
  getRemainingRequests() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const recentRequests = this.requests.filter(time => time > windowStart);
    
    return Math.max(0, this.limit - recentRequests.length);
  }
}

// 3. Sliding Window Counter (Hybrid)
class SlidingWindowCounter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.currentWindow = {
      startTime: Date.now(),
      count: 0
    };
    this.previousWindow = {
      startTime: Date.now() - windowMs,
      count: 0
    };
  }
  
  allowRequest() {
    const now = Date.now();
    
    // Check if we need to slide the window
    if (now - this.currentWindow.startTime >= this.windowMs) {
      this.previousWindow = this.currentWindow;
      this.currentWindow = {
        startTime: now,
        count: 0
      };
    }
    
    // Calculate weighted count
    const elapsedInPrevious = now - this.previousWindow.startTime;
    const percentageInCurrent = elapsedInPrevious / this.windowMs;
    
    const weightedCount = 
      this.previousWindow.count * (1 - percentageInCurrent) +
      this.currentWindow.count;
    
    if (weightedCount < this.limit) {
      this.currentWindow.count++;
      return true;
    }
    
    return false;
  }
}

// 4. Distributed Rate Limiter using Redis
class DistributedRateLimiter {
  constructor(redis, options = {}) {
    this.redis = redis;
    this.limit = options.limit || 100;
    this.windowMs = options.windowMs || 60000;
    this.keyPrefix = options.keyPrefix || 'rate_limit:';
  }
  
  /**
   * Token Bucket with Redis
   */
  async allowRequest(identifier, cost = 1) {
    const key = `${this.keyPrefix}${identifier}`;
    
    // Lua script for atomic operation
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local cost = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      
      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now
      
      -- Refill tokens
      local time_passed = (now - last_refill) / 1000
      local tokens_to_add = time_passed * refill_rate
      tokens = math.min(capacity, tokens + tokens_to_add)
      
      -- Check if request allowed
      if tokens >= cost then
        tokens = tokens - cost
        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, 60)
        return 1
      else
        return 0
      end
    `;
    
    const result = await this.redis.eval(
      script,
      1,
      key,
      this.limit,
      this.limit / (this.windowMs / 1000),
      cost,
      Date.now()
    );
    
    return result === 1;
  }
  
  /**
   * Fixed Window Counter with Redis
   */
  async allowRequestFixedWindow(identifier) {
    const now = Date.now();
    const window = Math.floor(now / this.windowMs);
    const key = `${this.keyPrefix}${identifier}:${window}`;
    
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(this.windowMs / 1000));
    }
    
    return current <= this.limit;
  }
  
  /**
   * Sliding Window with Redis (Sorted Set)
   */
  async allowRequestSlidingWindow(identifier) {
    const now = Date.now();
    const key = `${this.keyPrefix}${identifier}`;
    const windowStart = now - this.windowMs;
    
    // Lua script for atomic operation
    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window_start = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local window_ms = tonumber(ARGV[4])
      
      -- Remove old entries
      redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
      
      -- Count current requests
      local current = redis.call('ZCARD', key)
      
      if current < limit then
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
        return 1
      else
        return 0
      end
    `;
    
    const result = await this.redis.eval(
      script,
      1,
      key,
      now,
      windowStart,
      this.limit,
      this.windowMs
    );
    
    return result === 1;
  }
  
  /**
   * Get Rate Limit Info
   */
  async getRateLimitInfo(identifier) {
    const key = `${this.keyPrefix}${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    await this.redis.zremrangebyscore(key, 0, windowStart);
    const current = await this.redis.zcard(key);
    
    const remaining = Math.max(0, this.limit - current);
    const resetTime = windowStart + this.windowMs;
    
    return {
      limit: this.limit,
      remaining,
      reset: resetTime,
      retryAfter: remaining === 0 ? resetTime - now : 0
    };
  }
}

// 5. Express Middleware
class RateLimitMiddleware {
  constructor(limiter, options = {}) {
    this.limiter = limiter;
    this.keyGenerator = options.keyGenerator || ((req) => req.ip);
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.skipFailedRequests = options.skipFailedRequests || false;
  }
  
  middleware() {
    return async (req, res, next) => {
      const key = this.keyGenerator(req);
      
      try {
        const allowed = await this.limiter.allowRequest(key);
        const info = await this.limiter.getRateLimitInfo(key);
        
        // Add headers
        res.setHeader('X-RateLimit-Limit', info.limit);
        res.setHeader('X-RateLimit-Remaining', info.remaining);
        res.setHeader('X-RateLimit-Reset', info.reset);
        
        if (!allowed) {
          res.setHeader('Retry-After', Math.ceil(info.retryAfter / 1000));
          
          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: info.retryAfter
          });
        }
        
        // Track response status for skip options
        if (this.skipSuccessfulRequests || this.skipFailedRequests) {
          const originalSend = res.send;
          
          res.send = function(data) {
            const statusCode = res.statusCode;
            
            if (
              (this.skipSuccessfulRequests && statusCode < 400) ||
              (this.skipFailedRequests && statusCode >= 400)
            ) {
              // Decrement counter (compensate)
              limiter.removeRequest(key);
            }
            
            return originalSend.call(this, data);
          };
        }
        
        next();
        
      } catch (error) {
        console.error('Rate limiter error:', error);
        // Fail open - allow request
        next();
      }
    };
  }
}

// 6. Multi-tier Rate Limiting
class MultiTierRateLimiter {
  constructor(redis) {
    this.redis = redis;
    this.tiers = [
      { name: 'second', limit: 10, windowMs: 1000 },
      { name: 'minute', limit: 100, windowMs: 60000 },
      { name: 'hour', limit: 1000, windowMs: 3600000 },
      { name: 'day', limit: 10000, windowMs: 86400000 }
    ];
  }
  
  async allowRequest(identifier) {
    for (const tier of this.tiers) {
      const limiter = new DistributedRateLimiter(this.redis, {
        limit: tier.limit,
        windowMs: tier.windowMs,
        keyPrefix: `rate_limit:${tier.name}:`
      });
      
      const allowed = await limiter.allowRequest(identifier);
      
      if (!allowed) {
        return {
          allowed: false,
          tier: tier.name,
          limit: tier.limit,
          window: tier.windowMs
        };
      }
    }
    
    return { allowed: true };
  }
}

// 7. Per-Endpoint Rate Limiting
class EndpointRateLimiter {
  constructor(redis) {
    this.redis = redis;
    this.limits = new Map();
  }
  
  setLimit(endpoint, limit, windowMs) {
    this.limits.set(endpoint, { limit, windowMs });
  }
  
  async allowRequest(identifier, endpoint) {
    const config = this.limits.get(endpoint) || { limit: 100, windowMs: 60000 };
    
    const limiter = new DistributedRateLimiter(this.redis, {
      limit: config.limit,
      windowMs: config.windowMs,
      keyPrefix: `rate_limit:${endpoint}:`
    });
    
    return limiter.allowRequest(identifier);
  }
}

// Usage Example
const express = require('express');
const Redis = require('ioredis');
const app = express();

const redis = new Redis();
const rateLimiter = new DistributedRateLimiter(redis, {
  limit: 100,
  windowMs: 60000
});

const rateLimitMiddleware = new RateLimitMiddleware(rateLimiter, {
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user ? req.user.id : req.ip;
  }
});

app.use(rateLimitMiddleware.middleware());

// Per-endpoint limits
const endpointLimiter = new EndpointRateLimiter(redis);
endpointLimiter.setLimit('/api/search', 10, 1000); // 10 req/sec
endpointLimiter.setLimit('/api/upload', 5, 60000); // 5 req/min

app.get('/api/search', async (req, res) => {
  const allowed = await endpointLimiter.allowRequest(req.user.id, '/api/search');
  
  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // Handle search...
});
```

### Key Design Decisions

**1. Algorithm Selection**:
```
Token Bucket:
+ Smooth traffic
+ Handles bursts
- Complex implementation

Sliding Window Log:
+ Most accurate
- Memory intensive (stores all timestamps)

Sliding Window Counter:
+ Good balance (accuracy vs memory)
+ Works well distributed
- Slightly less accurate than log
```

**2. Storage**:
- **Redis**: Atomic operations, expiration, fast
- **In-memory**: Fallback for single server
- **Lua scripts**: Ensure atomicity in distributed environment

**3. Multi-level Limits**:
```
Per second: Prevent abuse
Per minute: API quotas
Per hour: Fair usage
Per day: Subscription limits
```

**4. Rate Limit Headers** (RFC 6585):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

---

## Design Distributed Cache (Redis)

### Requirements
**Functional**:
- Get/Set/Delete operations
- TTL support
- Atomic operations
- Pub/Sub
- Data structures (lists, sets, sorted sets, hashes)
- Persistence

**Non-Functional**:
- Low latency (< 1ms)
- High throughput (100K ops/sec)
- Scalability (horizontal)
- High availability (99.99%)
- Consistency vs Availability trade-off

### Architecture

```javascript
/**
 * Distributed Cache System
 */

// 1. Cache Client with Connection Pooling
class CacheClient {
  constructor(config) {
    this.config = config;
    this.cluster = this.createCluster();
    this.localCache = new LRUCache({ max: 1000 });
  }
  
  createCluster() {
    const Redis = require('ioredis');
    
    return new Redis.Cluster(
      this.config.nodes,
      {
        redisOptions: {
          password: this.config.password,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          connectTimeout: 10000
        },
        clusterRetryStrategy: (times) => {
          return Math.min(times * 100, 2000);
        },
        enableOfflineQueue: true,
        scaleReads: 'slave' // Read from replicas
      }
    );
  }
  
  /**
   * Get with multi-level caching
   */
  async get(key) {
    // L1: Local cache (process memory)
    const local = this.localCache.get(key);
    if (local !== undefined) {
      return local;
    }
    
    // L2: Redis cache (distributed)
    try {
      const value = await this.cluster.get(key);
      
      if (value !== null) {
        // Update local cache
        this.localCache.set(key, value);
        return value;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      // Return local cache even if stale
      return this.localCache.get(key);
    }
    
    return null;
  }
  
  /**
   * Set with write-through
   */
  async set(key, value, ttl = 3600) {
    // Write to local cache
    this.localCache.set(key, value);
    
    // Write to Redis
    try {
      if (ttl) {
        await this.cluster.setex(key, ttl, value);
      } else {
        await this.cluster.set(key, value);
      }
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }
  
  /**
   * Delete and invalidate
   */
  async del(key) {
    this.localCache.del(key);
    
    try {
      await this.cluster.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  }
  
  /**
   * Get Multiple Keys
   */
  async mget(keys) {
    const pipeline = this.cluster.pipeline();
    
    keys.forEach(key => {
      pipeline.get(key);
    });
    
    const results = await pipeline.exec();
    
    return results.map(([err, value]) => (err ? null : value));
  }
  
  /**
   * Set Multiple Keys
   */
  async mset(entries, ttl = 3600) {
    const pipeline = this.cluster.pipeline();
    
    for (const [key, value] of Object.entries(entries)) {
      if (ttl) {
        pipeline.setex(key, ttl, value);
      } else {
        pipeline.set(key, value);
      }
    }
    
    await pipeline.exec();
  }
  
  /**
   * Atomic increment
   */
  async incr(key, by = 1) {
    return this.cluster.incrby(key, by);
  }
  
  /**
   * Atomic decrement
   */
  async decr(key, by = 1) {
    return this.cluster.decrby(key, by);
  }
}

// 2. Cache-Aside Pattern
class CacheAsideRepository {
  constructor(cache, database) {
    this.cache = cache;
    this.db = database;
  }
  
  async get(key) {
    // Try cache first
    let value = await this.cache.get(key);
    
    if (value === null) {
      // Cache miss - fetch from database
      value = await this.db.findById(key);
      
      if (value !== null) {
        // Update cache
        await this.cache.set(key, JSON.stringify(value), 3600);
      }
    } else {
      value = JSON.parse(value);
    }
    
    return value;
  }
  
  async set(key, value) {
    // Write to database first
    await this.db.save(key, value);
    
    // Invalidate cache
    await this.cache.del(key);
  }
  
  async update(key, updates) {
    // Update database
    await this.db.update(key, updates);
    
    // Invalidate cache
    await this.cache.del(key);
  }
  
  async delete(key) {
    await this.db.delete(key);
    await this.cache.del(key);
  }
}

// 3. Write-Through Cache
class WriteThroughCache {
  constructor(cache, database) {
    this.cache = cache;
    this.db = database;
  }
  
  async get(key) {
    return this.cache.get(key) || this.db.findById(key);
  }
  
  async set(key, value) {
    // Write to both cache and database
    await Promise.all([
      this.cache.set(key, value),
      this.db.save(key, value)
    ]);
  }
}

// 4. Write-Behind (Write-Back) Cache
class WriteBehindCache {
  constructor(cache, database) {
    this.cache = cache;
    this.db = database;
    this.writeQueue = [];
    this.flushInterval = 5000; // 5 seconds
    
    this.startFlushing();
  }
  
  async set(key, value) {
    // Write to cache immediately
    await this.cache.set(key, value);
    
    // Queue database write
    this.writeQueue.push({ key, value, timestamp: Date.now() });
  }
  
  startFlushing() {
    setInterval(async () => {
      await this.flush();
    }, this.flushInterval);
  }
  
  async flush() {
    if (this.writeQueue.length === 0) return;
    
    const batch = this.writeQueue.splice(0, 100); // Process 100 at a time
    
    try {
      await this.db.batchInsert(batch);
    } catch (error) {
      console.error('Failed to flush cache writes:', error);
      // Re-queue failed writes
      this.writeQueue.unshift(...batch);
    }
  }
}

// 5. Cache Invalidation Strategies
class CacheInvalidation {
  constructor(cache, pubsub) {
    this.cache = cache;
    this.pubsub = pubsub;
    
    this.setupInvalidationListener();
  }
  
  /**
   * Time-based invalidation (TTL)
   */
  async setWithTTL(key, value, ttl = 3600) {
    await this.cache.set(key, value, ttl);
  }
  
  /**
   * Event-based invalidation
   */
  async invalidateOnEvent(key) {
    await this.cache.del(key);
    
    // Notify other servers
    await this.pubsub.publish('cache:invalidate', JSON.stringify({ key }));
  }
  
  /**
   * Tag-based invalidation
   */
  async setWithTags(key, value, tags, ttl = 3600) {
    await this.cache.set(key, value, ttl);
    
    // Store tags -> keys mapping
    for (const tag of tags) {
      await this.cache.sadd(`tag:${tag}`, key);
    }
  }
  
  async invalidateByTag(tag) {
    // Get all keys with this tag
    const keys = await this.cache.smembers(`tag:${tag}`);
    
    // Delete all keys
    if (keys.length > 0) {
      await this.cache.del(...keys);
    }
    
    // Delete tag set
    await this.cache.del(`tag:${tag}`);
  }
  
  /**
   * Version-based invalidation
   */
  async setWithVersion(key, value, version) {
    const versionedKey = `${key}:v${version}`;
    await this.cache.set(versionedKey, value);
    await this.cache.set(`${key}:version`, version);
  }
  
  async getWithVersion(key) {
    const version = await this.cache.get(`${key}:version`);
    if (!version) return null;
    
    const versionedKey = `${key}:v${version}`;
    return this.cache.get(versionedKey);
  }
  
  setupInvalidationListener() {
    this.pubsub.subscribe('cache:invalidate', (message) => {
      const { key } = JSON.parse(message);
      this.cache.del(key);
    });
  }
}

// 6. Cache Warming
class CacheWarmer {
  constructor(cache, database) {
    this.cache = cache;
    this.db = database;
  }
  
  /**
   * Pre-populate cache with hot data
   */
  async warm(queries) {
    console.log('Warming cache...');
    
    for (const query of queries) {
      try {
        const data = await this.db.query(query.sql);
        
        for (const row of data) {
          await this.cache.set(
            query.keyGenerator(row),
            JSON.stringify(row),
            query.ttl || 3600
          );
        }
        
        console.log(`Warmed ${data.length} entries for ${query.name}`);
      } catch (error) {
        console.error(`Failed to warm cache for ${query.name}:`, error);
      }
    }
    
    console.log('Cache warming complete');
  }
  
  /**
   * Continuous warming (background)
   */
  async startContinuousWarming(interval = 3600000) {
    setInterval(async () => {
      await this.warm(this.getWarmingQueries());
    }, interval);
  }
  
  getWarmingQueries() {
    return [
      {
        name: 'Popular Products',
        sql: 'SELECT * FROM products ORDER BY views DESC LIMIT 100',
        keyGenerator: (row) => `product:${row.id}`,
        ttl: 3600
      },
      {
        name: 'Active Users',
        sql: 'SELECT * FROM users WHERE last_active > NOW() - INTERVAL 1 DAY',
        keyGenerator: (row) => `user:${row.id}`,
        ttl: 1800
      }
    ];
  }
}

// 7. Circuit Breaker for Cache
class CacheCircuitBreaker {
  constructor(cache, options = {}) {
    this.cache = cache;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.fallbackValue = options.fallbackValue || null;
  }
  
  async get(key) {
    if (this.state === 'OPEN') {
      console.warn('Circuit breaker OPEN, using fallback');
      return this.fallbackValue;
    }
    
    try {
      const value = await this.cache.get(key);
      this.onSuccess();
      return value;
    } catch (error) {
      this.onFailure();
      return this.fallbackValue;
    }
  }
  
  async set(key, value, ttl) {
    if (this.state === 'OPEN') {
      console.warn('Circuit breaker OPEN, skipping cache write');
      return;
    }
    
    try {
      await this.cache.set(key, value, ttl);
      this.onSuccess();
    } catch (error) {
      this.onFailure();
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('Circuit breaker CLOSED');
    }
  }
  
  onFailure() {
    this.failureCount++;
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error('Circuit breaker OPEN');
      
      setTimeout(() => {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker HALF_OPEN');
      }, this.resetTimeout);
    }
  }
}

// 8. Distributed Lock with Redis
class DistributedLock {
  constructor(redis) {
    this.redis = redis;
  }
  
  async acquire(resource, ttl = 10000) {
    const lockKey = `lock:${resource}`;
    const lockValue = `${process.pid}:${Date.now()}`;
    
    // Try to acquire lock
    const acquired = await this.redis.set(
      lockKey,
      lockValue,
      'PX',
      ttl,
      'NX'
    );
    
    if (acquired) {
      return {
        key: lockKey,
        value: lockValue,
        release: async () => {
          // Lua script to ensure we only delete our own lock
          const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
              return redis.call("del", KEYS[1])
            else
              return 0
            end
          `;
          
          await this.redis.eval(script, 1, lockKey, lockValue);
        }
      };
    }
    
    return null;
  }
  
  async withLock(resource, callback, ttl = 10000, retries = 3) {
    for (let i = 0; i < retries; i++) {
      const lock = await this.acquire(resource, ttl);
      
      if (lock) {
        try {
          return await callback();
        } finally {
          await lock.release();
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Failed to acquire lock');
  }
}
```

### Key Design Decisions

**1. Caching Strategy Selection**:
```
Cache-Aside (Lazy Loading):
+ Simple
+ Only cache what's needed
- Cache miss penalty
- Stale data possible

Write-Through:
+ Always fresh data
- Every write hits cache + DB (slower)

Write-Behind:
+ Fast writes
- Risk of data loss
- Complex
```

**2. Eviction Policies**:
```
LRU (Least Recently Used): Most common
LFU (Least Frequently Used): For access patterns
TTL (Time To Live): Time-based expiration
FIFO: Simple but less efficient
```

**3. Data Structures**:
```
String: Simple key-value
Hash: Object storage
List: Queue, timeline
Set: Unique items, tags
Sorted Set: Leaderboards, rankings
```

**4. High Availability**:
```
Replication:
- Master-Slave replication
- Async replication for performance
- Manual failover or Sentinel for automatic failover

Clustering:
- Sharding across nodes
- Hash slot distribution (16384 slots)
- Automatic rebalancing
```

---

[Continue with remaining system design questions...]

Would you like me to continue with the remaining backend system design questions, मालिक?

