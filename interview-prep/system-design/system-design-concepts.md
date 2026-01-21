# System Design Concepts & Fundamentals

## Table of Contents
1. [Scalability](#scalability)
2. [Load Balancing](#load-balancing)
3. [Caching Strategies](#caching-strategies)
4. [Database Design](#database-design)
5. [Message Queues](#message-queues)
6. [Microservices](#microservices)
7. [API Design](#api-design)
8. [Security](#security)
9. [Monitoring & Observability](#monitoring--observability)
10. [CAP Theorem & Trade-offs](#cap-theorem--trade-offs)

---

## Scalability

### Vertical vs Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────┐
│                    VERTICAL SCALING                          │
│                    (Scale Up)                                │
│                                                              │
│   ┌─────────┐      ┌─────────────┐      ┌──────────────┐   │
│   │ 4 CPU   │  →   │ 8 CPU       │  →   │ 16 CPU       │   │
│   │ 8GB RAM │      │ 16GB RAM    │      │ 32GB RAM     │   │
│   │ 100GB   │      │ 500GB SSD   │      │ 1TB SSD      │   │
│   └─────────┘      └─────────────┘      └──────────────┘   │
│                                                              │
│   Pros: Simple, No code changes                             │
│   Cons: Hardware limits, Single point of failure            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   HORIZONTAL SCALING                         │
│                   (Scale Out)                                │
│                                                              │
│                    ┌──────────────┐                         │
│                    │ Load Balancer│                         │
│                    └──────┬───────┘                         │
│              ┌───────────┼───────────┐                      │
│              ▼           ▼           ▼                      │
│         ┌────────┐  ┌────────┐  ┌────────┐                 │
│         │Server 1│  │Server 2│  │Server 3│                 │
│         └────────┘  └────────┘  └────────┘                 │
│                                                              │
│   Pros: Infinite scaling, Redundancy, Cost-effective        │
│   Cons: Complex, Requires stateless design                  │
└─────────────────────────────────────────────────────────────┘
```

### Stateless Architecture

```javascript
/**
 * Stateless Service Design
 * Each request contains all information needed to process it
 */

// BAD: Stateful - stores session in memory
class StatefulService {
  constructor() {
    this.sessions = new Map(); // Lost on restart/scaling
  }
  
  handleRequest(userId, data) {
    this.sessions.set(userId, data);
  }
}

// GOOD: Stateless - stores session externally
class StatelessService {
  constructor(redisClient, dbClient) {
    this.redis = redisClient;
    this.db = dbClient;
  }
  
  async handleRequest(sessionToken, data) {
    // Session stored in Redis (shared across instances)
    const session = await this.redis.get(`session:${sessionToken}`);
    
    // Process request
    const result = await this.processData(session, data);
    
    // Store state in database
    await this.db.save(result);
    
    return result;
  }
}
```

---

## Load Balancing

### Load Balancing Algorithms

```javascript
/**
 * 1. Round Robin
 */
class RoundRobinBalancer {
  constructor(servers) {
    this.servers = servers;
    this.current = 0;
  }
  
  getServer() {
    const server = this.servers[this.current];
    this.current = (this.current + 1) % this.servers.length;
    return server;
  }
}

/**
 * 2. Weighted Round Robin
 */
class WeightedRoundRobinBalancer {
  constructor(servers) {
    // servers = [{ host: 'server1', weight: 3 }, { host: 'server2', weight: 1 }]
    this.servers = servers;
    this.currentWeight = 0;
    this.maxWeight = Math.max(...servers.map(s => s.weight));
    this.gcd = this.findGCD(servers.map(s => s.weight));
    this.current = -1;
  }
  
  findGCD(numbers) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    return numbers.reduce((a, b) => gcd(a, b));
  }
  
  getServer() {
    while (true) {
      this.current = (this.current + 1) % this.servers.length;
      
      if (this.current === 0) {
        this.currentWeight -= this.gcd;
        if (this.currentWeight <= 0) {
          this.currentWeight = this.maxWeight;
        }
      }
      
      if (this.servers[this.current].weight >= this.currentWeight) {
        return this.servers[this.current].host;
      }
    }
  }
}

/**
 * 3. Least Connections
 */
class LeastConnectionsBalancer {
  constructor(servers) {
    this.servers = servers.map(host => ({ host, connections: 0 }));
  }
  
  getServer() {
    const server = this.servers.reduce((min, s) => 
      s.connections < min.connections ? s : min
    );
    server.connections++;
    return {
      host: server.host,
      release: () => server.connections--
    };
  }
}

/**
 * 4. Consistent Hashing (for distributed caching)
 */
class ConsistentHash {
  constructor(nodes, virtualNodes = 100) {
    this.ring = new Map();
    this.sortedKeys = [];
    this.virtualNodes = virtualNodes;
    
    nodes.forEach(node => this.addNode(node));
  }
  
  hash(key) {
    // Simple hash function (use crypto in production)
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  addNode(node) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const key = this.hash(`${node}:${i}`);
      this.ring.set(key, node);
      this.sortedKeys.push(key);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }
  
  removeNode(node) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const key = this.hash(`${node}:${i}`);
      this.ring.delete(key);
      const index = this.sortedKeys.indexOf(key);
      if (index > -1) this.sortedKeys.splice(index, 1);
    }
  }
  
  getNode(key) {
    if (this.sortedKeys.length === 0) return null;
    
    const hash = this.hash(key);
    
    // Binary search for the first key >= hash
    let left = 0, right = this.sortedKeys.length - 1;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.sortedKeys[mid] < hash) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    // Wrap around if necessary
    const index = this.sortedKeys[left] >= hash ? left : 0;
    return this.ring.get(this.sortedKeys[index]);
  }
}
```

---

## Caching Strategies

### Cache Patterns

```javascript
/**
 * 1. Cache-Aside (Lazy Loading)
 */
class CacheAside {
  constructor(cache, database) {
    this.cache = cache;
    this.db = database;
  }
  
  async get(key) {
    // Try cache first
    let data = await this.cache.get(key);
    
    if (data === null) {
      // Cache miss - load from database
      data = await this.db.get(key);
      
      if (data !== null) {
        // Populate cache
        await this.cache.set(key, data, { ttl: 3600 });
      }
    }
    
    return data;
  }
  
  async set(key, value) {
    // Update database
    await this.db.set(key, value);
    // Invalidate cache
    await this.cache.delete(key);
  }
}

/**
 * 2. Write-Through
 */
class WriteThrough {
  constructor(cache, database) {
    this.cache = cache;
    this.db = database;
  }
  
  async get(key) {
    return await this.cache.get(key);
  }
  
  async set(key, value) {
    // Write to both simultaneously
    await Promise.all([
      this.cache.set(key, value),
      this.db.set(key, value)
    ]);
  }
}

/**
 * 3. Write-Behind (Write-Back)
 */
class WriteBehind {
  constructor(cache, database) {
    this.cache = cache;
    this.db = database;
    this.writeQueue = [];
    this.flushInterval = 5000;
    
    this.startFlushTimer();
  }
  
  startFlushTimer() {
    setInterval(() => this.flush(), this.flushInterval);
  }
  
  async get(key) {
    return await this.cache.get(key);
  }
  
  async set(key, value) {
    // Write to cache immediately
    await this.cache.set(key, value);
    
    // Queue for async database write
    this.writeQueue.push({ key, value, timestamp: Date.now() });
  }
  
  async flush() {
    if (this.writeQueue.length === 0) return;
    
    const batch = [...this.writeQueue];
    this.writeQueue = [];
    
    try {
      // Batch write to database
      await this.db.batchSet(batch);
    } catch (error) {
      // Re-queue on failure
      this.writeQueue.unshift(...batch);
      throw error;
    }
  }
}

/**
 * 4. Read-Through
 */
class ReadThrough {
  constructor(cache, database, loader) {
    this.cache = cache;
    this.db = database;
    this.loader = loader;
  }
  
  async get(key) {
    let data = await this.cache.get(key);
    
    if (data === null) {
      // Cache automatically loads from database
      data = await this.loader(key);
      
      if (data !== null) {
        await this.cache.set(key, data);
      }
    }
    
    return data;
  }
}

/**
 * Cache Invalidation Strategies
 */
class CacheInvalidation {
  constructor(cache, pubsub) {
    this.cache = cache;
    this.pubsub = pubsub;
    
    // Subscribe to invalidation events
    this.pubsub.subscribe('cache:invalidate', (key) => {
      this.cache.delete(key);
    });
  }
  
  // 1. Time-based (TTL)
  async setWithTTL(key, value, ttlSeconds) {
    await this.cache.set(key, value, { EX: ttlSeconds });
  }
  
  // 2. Event-based
  async invalidateOnEvent(key) {
    await this.cache.delete(key);
    await this.pubsub.publish('cache:invalidate', key);
  }
  
  // 3. Tag-based
  async setWithTags(key, value, tags) {
    await this.cache.set(key, value);
    
    for (const tag of tags) {
      await this.cache.sadd(`tag:${tag}`, key);
    }
  }
  
  async invalidateByTag(tag) {
    const keys = await this.cache.smembers(`tag:${tag}`);
    
    if (keys.length > 0) {
      await this.cache.del(...keys);
    }
    
    await this.cache.del(`tag:${tag}`);
  }
}
```

---

## Database Design

### Database Selection Guide

```
┌──────────────────────────────────────────────────────────────────────┐
│                     DATABASE SELECTION GUIDE                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  RELATIONAL (PostgreSQL, MySQL)                                      │
│  Use When: ACID compliance, Complex queries, Joins, Transactions     │
│  Examples: Financial systems, E-commerce, ERP                        │
│                                                                       │
│  DOCUMENT (MongoDB, CouchDB)                                         │
│  Use When: Flexible schema, Nested data, Rapid development           │
│  Examples: CMS, Catalogs, User profiles                              │
│                                                                       │
│  KEY-VALUE (Redis, DynamoDB)                                         │
│  Use When: Simple lookups, Caching, Session storage                  │
│  Examples: Shopping cart, Session data, Real-time data               │
│                                                                       │
│  WIDE-COLUMN (Cassandra, HBase)                                      │
│  Use When: Time-series, Write-heavy, Massive scale                   │
│  Examples: IoT data, Logs, Analytics                                 │
│                                                                       │
│  GRAPH (Neo4j, Amazon Neptune)                                       │
│  Use When: Complex relationships, Recommendations                     │
│  Examples: Social networks, Fraud detection, Knowledge graphs        │
│                                                                       │
│  SEARCH (Elasticsearch, Solr)                                        │
│  Use When: Full-text search, Log analysis, Analytics                 │
│  Examples: Search engines, Log management                            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Database Sharding

```javascript
/**
 * Sharding Strategies
 */

// 1. Range-based Sharding
class RangeSharder {
  constructor(ranges) {
    // ranges = [{ min: 0, max: 1000000, shard: 'shard1' }, ...]
    this.ranges = ranges;
  }
  
  getShard(key) {
    for (const range of this.ranges) {
      if (key >= range.min && key < range.max) {
        return range.shard;
      }
    }
    throw new Error(`No shard found for key: ${key}`);
  }
}

// 2. Hash-based Sharding
class HashSharder {
  constructor(shards) {
    this.shards = shards;
  }
  
  hash(key) {
    let hash = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  getShard(key) {
    const index = this.hash(key) % this.shards.length;
    return this.shards[index];
  }
}

// 3. Directory-based Sharding
class DirectorySharder {
  constructor(directory) {
    // directory = Map of key -> shard mappings
    this.directory = directory;
  }
  
  getShard(key) {
    if (!this.directory.has(key)) {
      throw new Error(`Key not in directory: ${key}`);
    }
    return this.directory.get(key);
  }
  
  addKey(key, shard) {
    this.directory.set(key, shard);
  }
}

/**
 * Replication Strategies
 */
class ReplicationManager {
  constructor(primary, replicas) {
    this.primary = primary;
    this.replicas = replicas;
  }
  
  // Synchronous replication
  async writeSync(data) {
    // Write to primary
    await this.primary.write(data);
    
    // Wait for all replicas
    await Promise.all(
      this.replicas.map(replica => replica.write(data))
    );
  }
  
  // Asynchronous replication
  async writeAsync(data) {
    // Write to primary
    await this.primary.write(data);
    
    // Replicate asynchronously (fire and forget)
    this.replicas.forEach(replica => {
      replica.write(data).catch(err => {
        console.error('Replication failed:', err);
        // Queue for retry
        this.retryQueue.push({ replica, data });
      });
    });
  }
  
  // Read from replica
  async read(key) {
    // Random replica selection for load balancing
    const replica = this.replicas[Math.floor(Math.random() * this.replicas.length)];
    return await replica.read(key);
  }
  
  // Read from primary (for consistency)
  async readFromPrimary(key) {
    return await this.primary.read(key);
  }
}
```

---

## Message Queues

### Message Queue Patterns

```javascript
/**
 * 1. Producer-Consumer Pattern
 */
class MessageQueue {
  constructor() {
    this.queue = [];
    this.consumers = [];
    this.processing = false;
  }
  
  publish(message) {
    this.queue.push({
      id: crypto.randomUUID(),
      data: message,
      timestamp: Date.now(),
      attempts: 0
    });
    this.process();
  }
  
  subscribe(consumer) {
    this.consumers.push(consumer);
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      
      for (const consumer of this.consumers) {
        try {
          await consumer.handle(message);
        } catch (error) {
          message.attempts++;
          
          if (message.attempts < 3) {
            // Retry with exponential backoff
            setTimeout(() => this.queue.push(message), 
              Math.pow(2, message.attempts) * 1000);
          } else {
            // Move to dead letter queue
            this.deadLetterQueue.push(message);
          }
        }
      }
    }
    
    this.processing = false;
  }
}

/**
 * 2. Pub/Sub Pattern
 */
class PubSub {
  constructor() {
    this.topics = new Map();
  }
  
  subscribe(topic, handler) {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, new Set());
    }
    this.topics.get(topic).add(handler);
    
    return () => this.topics.get(topic).delete(handler);
  }
  
  publish(topic, message) {
    if (!this.topics.has(topic)) return;
    
    for (const handler of this.topics.get(topic)) {
      handler(message);
    }
  }
}

/**
 * 3. Event Sourcing
 */
class EventStore {
  constructor(storage) {
    this.storage = storage;
  }
  
  async append(streamId, event) {
    const entry = {
      streamId,
      eventId: crypto.randomUUID(),
      type: event.type,
      data: event.data,
      timestamp: Date.now(),
      version: await this.getVersion(streamId) + 1
    };
    
    await this.storage.append(streamId, entry);
    return entry;
  }
  
  async getEvents(streamId, fromVersion = 0) {
    return await this.storage.getEvents(streamId, fromVersion);
  }
  
  async getVersion(streamId) {
    const events = await this.storage.getEvents(streamId);
    return events.length;
  }
  
  async replay(streamId, reducer, initialState = {}) {
    const events = await this.getEvents(streamId);
    return events.reduce(reducer, initialState);
  }
}

/**
 * 4. CQRS (Command Query Responsibility Segregation)
 */
class CQRSSystem {
  constructor(commandHandler, queryHandler, eventBus) {
    this.commandHandler = commandHandler;
    this.queryHandler = queryHandler;
    this.eventBus = eventBus;
  }
  
  // Commands modify state
  async executeCommand(command) {
    const events = await this.commandHandler.handle(command);
    
    // Publish events for read model updates
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    
    return events;
  }
  
  // Queries read state
  async executeQuery(query) {
    return await this.queryHandler.handle(query);
  }
}

// Command Handler (Write Model)
class OrderCommandHandler {
  async handle(command) {
    switch (command.type) {
      case 'CreateOrder':
        // Validate and create order
        return [{ type: 'OrderCreated', data: command.data }];
      
      case 'CancelOrder':
        // Validate and cancel order
        return [{ type: 'OrderCancelled', data: command.data }];
      
      default:
        throw new Error(`Unknown command: ${command.type}`);
    }
  }
}

// Query Handler (Read Model)
class OrderQueryHandler {
  constructor(readDb) {
    this.readDb = readDb;
  }
  
  async handle(query) {
    switch (query.type) {
      case 'GetOrder':
        return await this.readDb.findById('orders', query.orderId);
      
      case 'GetUserOrders':
        return await this.readDb.find('orders', { userId: query.userId });
      
      default:
        throw new Error(`Unknown query: ${query.type}`);
    }
  }
}
```

---

## Microservices

### Service Communication

```javascript
/**
 * 1. Synchronous Communication (REST/gRPC)
 */
class ServiceClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
  }
  
  async call(method, path, data) {
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === this.retries) throw error;
        
        // Exponential backoff
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
      }
    }
  }
}

/**
 * 2. Service Discovery
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
  }
  
  register(serviceName, instance) {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, []);
    }
    
    const instances = this.services.get(serviceName);
    instances.push({
      ...instance,
      lastHeartbeat: Date.now()
    });
  }
  
  deregister(serviceName, instanceId) {
    if (this.services.has(serviceName)) {
      const instances = this.services.get(serviceName);
      const index = instances.findIndex(i => i.id === instanceId);
      if (index > -1) instances.splice(index, 1);
    }
  }
  
  discover(serviceName) {
    const instances = this.services.get(serviceName) || [];
    
    // Filter healthy instances
    const healthy = instances.filter(i => 
      Date.now() - i.lastHeartbeat < 30000
    );
    
    if (healthy.length === 0) {
      throw new Error(`No healthy instances for: ${serviceName}`);
    }
    
    // Random selection (load balancing)
    return healthy[Math.floor(Math.random() * healthy.length)];
  }
  
  heartbeat(serviceName, instanceId) {
    const instances = this.services.get(serviceName) || [];
    const instance = instances.find(i => i.id === instanceId);
    if (instance) {
      instance.lastHeartbeat = Date.now();
    }
  }
}

/**
 * 3. API Gateway Pattern
 */
class APIGateway {
  constructor(serviceRegistry) {
    this.registry = serviceRegistry;
    this.routes = new Map();
  }
  
  route(path, serviceName) {
    this.routes.set(path, serviceName);
  }
  
  async handleRequest(req) {
    // Authentication
    const user = await this.authenticate(req);
    if (!user) return { status: 401, body: { error: 'Unauthorized' } };
    
    // Rate limiting
    const allowed = await this.checkRateLimit(user.id);
    if (!allowed) return { status: 429, body: { error: 'Too many requests' } };
    
    // Find service
    const serviceName = this.findService(req.path);
    if (!serviceName) return { status: 404, body: { error: 'Not found' } };
    
    // Service discovery
    const instance = this.registry.discover(serviceName);
    
    // Forward request
    const response = await this.forward(instance, req);
    
    // Response transformation
    return this.transformResponse(response);
  }
  
  findService(path) {
    for (const [route, service] of this.routes) {
      if (path.startsWith(route)) return service;
    }
    return null;
  }
  
  async forward(instance, req) {
    return await fetch(`${instance.url}${req.path}`, {
      method: req.method,
      headers: req.headers,
      body: req.body
    });
  }
}

/**
 * 4. Saga Pattern (Distributed Transactions)
 */
class SagaOrchestrator {
  constructor() {
    this.steps = [];
  }
  
  addStep(execute, compensate) {
    this.steps.push({ execute, compensate });
  }
  
  async execute(data) {
    const completedSteps = [];
    
    try {
      for (const step of this.steps) {
        const result = await step.execute(data);
        completedSteps.push({ step, result });
        data = { ...data, ...result };
      }
      
      return { success: true, data };
    } catch (error) {
      // Compensate in reverse order
      for (let i = completedSteps.length - 1; i >= 0; i--) {
        const { step, result } = completedSteps[i];
        try {
          await step.compensate(result);
        } catch (compError) {
          console.error('Compensation failed:', compError);
        }
      }
      
      return { success: false, error };
    }
  }
}

// Usage
const orderSaga = new SagaOrchestrator();

orderSaga.addStep(
  async (data) => {
    // Create order
    const order = await orderService.create(data);
    return { orderId: order.id };
  },
  async (result) => {
    // Cancel order
    await orderService.cancel(result.orderId);
  }
);

orderSaga.addStep(
  async (data) => {
    // Reserve inventory
    await inventoryService.reserve(data.items);
    return { reserved: true };
  },
  async (result) => {
    // Release inventory
    await inventoryService.release(data.items);
  }
);

orderSaga.addStep(
  async (data) => {
    // Charge payment
    const payment = await paymentService.charge(data.amount);
    return { paymentId: payment.id };
  },
  async (result) => {
    // Refund payment
    await paymentService.refund(result.paymentId);
  }
);
```

---

## API Design

### RESTful API Best Practices

```javascript
/**
 * RESTful API Structure
 */
const express = require('express');
const router = express.Router();

// Resource naming (nouns, plural)
// GET    /api/v1/users          - List users
// GET    /api/v1/users/:id      - Get user
// POST   /api/v1/users          - Create user
// PUT    /api/v1/users/:id      - Update user (full)
// PATCH  /api/v1/users/:id      - Update user (partial)
// DELETE /api/v1/users/:id      - Delete user

// Nested resources
// GET    /api/v1/users/:userId/orders
// POST   /api/v1/users/:userId/orders

// Filtering, sorting, pagination
// GET    /api/v1/users?status=active&sort=-createdAt&page=1&limit=20

/**
 * Response Format
 */
class APIResponse {
  static success(data, meta = {}) {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }
  
  static error(message, code, details = null) {
    return {
      success: false,
      error: {
        message,
        code,
        details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
  
  static paginated(data, { page, limit, total }) {
    return {
      success: true,
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * HATEOAS Links
 */
function addHATEOASLinks(resource, baseUrl) {
  return {
    ...resource,
    _links: {
      self: { href: `${baseUrl}/users/${resource.id}` },
      orders: { href: `${baseUrl}/users/${resource.id}/orders` },
      profile: { href: `${baseUrl}/users/${resource.id}/profile` }
    }
  };
}

/**
 * API Versioning
 */
// 1. URL versioning
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// 2. Header versioning
app.use((req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  next();
});

// 3. Query parameter versioning
// GET /api/users?version=2

/**
 * Rate Limiting Headers
 */
function rateLimitMiddleware(req, res, next) {
  const limit = 100;
  const remaining = 95;
  const reset = Date.now() + 3600000;
  
  res.set({
    'X-RateLimit-Limit': limit,
    'X-RateLimit-Remaining': remaining,
    'X-RateLimit-Reset': reset
  });
  
  next();
}
```

### GraphQL API Design

```javascript
/**
 * GraphQL Schema
 */
const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    posts: [Post!]!
    createdAt: DateTime!
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
  }
  
  type Comment {
    id: ID!
    text: String!
    author: User!
  }
  
  input CreateUserInput {
    email: String!
    name: String!
    password: String!
  }
  
  type Query {
    user(id: ID!): User
    users(page: Int, limit: Int): UserConnection!
    post(id: ID!): Post
    posts(authorId: ID, page: Int, limit: Int): PostConnection!
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    createPost(input: CreatePostInput!): Post!
  }
  
  type Subscription {
    postCreated: Post!
    commentAdded(postId: ID!): Comment!
  }
`;

/**
 * DataLoader for N+1 Problem
 */
const DataLoader = require('dataloader');

const createLoaders = () => ({
  userLoader: new DataLoader(async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map(u => [u.id.toString(), u]));
    return userIds.map(id => userMap.get(id.toString()));
  }),
  
  postsByUserLoader: new DataLoader(async (userIds) => {
    const posts = await Post.find({ authorId: { $in: userIds } });
    const postsByUser = new Map();
    
    for (const post of posts) {
      const userId = post.authorId.toString();
      if (!postsByUser.has(userId)) {
        postsByUser.set(userId, []);
      }
      postsByUser.get(userId).push(post);
    }
    
    return userIds.map(id => postsByUser.get(id.toString()) || []);
  })
});

const resolvers = {
  Query: {
    user: (_, { id }, { loaders }) => loaders.userLoader.load(id),
    users: (_, { page = 1, limit = 20 }) => User.paginate({}, { page, limit })
  },
  
  User: {
    posts: (user, _, { loaders }) => loaders.postsByUserLoader.load(user.id)
  },
  
  Post: {
    author: (post, _, { loaders }) => loaders.userLoader.load(post.authorId)
  }
};
```

---

## Security

### Security Best Practices

```javascript
/**
 * 1. Authentication & Authorization
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
  constructor(secret, tokenExpiry = '1h') {
    this.secret = secret;
    this.tokenExpiry = tokenExpiry;
  }
  
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }
  
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
  
  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.tokenExpiry });
  }
  
  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
  
  generateRefreshToken(userId) {
    return jwt.sign({ userId, type: 'refresh' }, this.secret, { expiresIn: '7d' });
  }
}

// RBAC (Role-Based Access Control)
class RBAC {
  constructor() {
    this.roles = new Map();
  }
  
  defineRole(roleName, permissions) {
    this.roles.set(roleName, new Set(permissions));
  }
  
  hasPermission(role, permission) {
    const rolePermissions = this.roles.get(role);
    if (!rolePermissions) return false;
    
    // Check for wildcard permission
    if (rolePermissions.has('*')) return true;
    
    return rolePermissions.has(permission);
  }
  
  middleware(permission) {
    return (req, res, next) => {
      const userRole = req.user?.role;
      
      if (!userRole || !this.hasPermission(userRole, permission)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      next();
    };
  }
}

// Usage
const rbac = new RBAC();
rbac.defineRole('admin', ['*']);
rbac.defineRole('editor', ['posts:read', 'posts:write', 'posts:delete']);
rbac.defineRole('viewer', ['posts:read']);

app.delete('/posts/:id', rbac.middleware('posts:delete'), deletePost);

/**
 * 2. Input Validation & Sanitization
 */
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  name: Joi.string().max(100).required()
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    
    req.body = value;
    next();
  };
}

function sanitize(req, res, next) {
  if (req.body) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    }
  }
  next();
}

/**
 * 3. Security Headers
 */
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}));

/**
 * 4. SQL Injection Prevention
 */
// BAD - SQL Injection vulnerable
const badQuery = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD - Parameterized query
const goodQuery = 'SELECT * FROM users WHERE email = $1';
await db.query(goodQuery, [email]);

// Using ORM (Sequelize example)
const user = await User.findOne({ where: { email } });

/**
 * 5. CSRF Protection
 */
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

---

## Monitoring & Observability

### The Three Pillars

```javascript
/**
 * 1. Logging (Structured)
 */
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Request logging middleware
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      requestId: req.id,
      userId: req.user?.id
    });
  });
  
  next();
}

/**
 * 2. Metrics (Prometheus)
 */
const prometheus = require('prom-client');

// Default metrics
prometheus.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });
  
  next();
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.send(await prometheus.register.metrics());
});

/**
 * 3. Distributed Tracing (OpenTelemetry)
 */
const { trace, context, SpanStatusCode } = require('@opentelemetry/api');

const tracer = trace.getTracer('user-service');

async function handleRequest(req, res) {
  const span = tracer.startSpan('handleRequest', {
    attributes: {
      'http.method': req.method,
      'http.url': req.url
    }
  });
  
  try {
    // Create child span for database operation
    const dbSpan = tracer.startSpan('database.query', {
      parent: span
    });
    
    const result = await db.query('SELECT * FROM users');
    
    dbSpan.setStatus({ code: SpanStatusCode.OK });
    dbSpan.end();
    
    span.setStatus({ code: SpanStatusCode.OK });
    res.json(result);
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Health Checks
 */
class HealthCheck {
  constructor() {
    this.checks = [];
  }
  
  addCheck(name, check) {
    this.checks.push({ name, check });
  }
  
  async run() {
    const results = await Promise.all(
      this.checks.map(async ({ name, check }) => {
        try {
          const start = Date.now();
          await check();
          return {
            name,
            status: 'healthy',
            duration: Date.now() - start
          };
        } catch (error) {
          return {
            name,
            status: 'unhealthy',
            error: error.message
          };
        }
      })
    );
    
    const healthy = results.every(r => r.status === 'healthy');
    
    return {
      status: healthy ? 'healthy' : 'unhealthy',
      checks: results,
      timestamp: new Date().toISOString()
    };
  }
}

const healthCheck = new HealthCheck();

healthCheck.addCheck('database', async () => {
  await db.query('SELECT 1');
});

healthCheck.addCheck('redis', async () => {
  await redis.ping();
});

healthCheck.addCheck('external-api', async () => {
  const response = await fetch('https://api.external.com/health');
  if (!response.ok) throw new Error('API unhealthy');
});

app.get('/health', async (req, res) => {
  const result = await healthCheck.run();
  res.status(result.status === 'healthy' ? 200 : 503).json(result);
});
```

---

## CAP Theorem & Trade-offs

### Understanding CAP

```
┌────────────────────────────────────────────────────────────────────┐
│                        CAP THEOREM                                  │
│                                                                     │
│  In a distributed system, you can only guarantee 2 of 3:           │
│                                                                     │
│                     Consistency (C)                                 │
│                          /\                                         │
│                         /  \                                        │
│                        /    \                                       │
│                       /  CA  \                                      │
│                      /________\                                     │
│                     /          \                                    │
│                    /     CP     \                                   │
│                   /              \                                  │
│   Availability  /________________\ Partition                        │
│      (A)                AP           Tolerance (P)                  │
│                                                                     │
│  CA: Single node databases (PostgreSQL standalone)                 │
│  CP: Distributed databases prioritizing consistency (MongoDB)       │
│  AP: Distributed databases prioritizing availability (Cassandra)   │
│                                                                     │
│  Note: In practice, P is mandatory for distributed systems         │
│  So the real choice is between C and A during partitions           │
└────────────────────────────────────────────────────────────────────┘
```

### Consistency Models

```javascript
/**
 * 1. Strong Consistency
 * All reads see the most recent write
 */
class StrongConsistency {
  async write(key, value) {
    // Write to all replicas synchronously
    await Promise.all(this.replicas.map(r => r.write(key, value)));
  }
  
  async read(key) {
    // Read from any replica (all have same data)
    return await this.replicas[0].read(key);
  }
}

/**
 * 2. Eventual Consistency
 * Reads may see stale data, but will eventually see latest
 */
class EventualConsistency {
  async write(key, value) {
    // Write to primary
    await this.primary.write(key, value);
    
    // Replicate asynchronously
    this.replicas.forEach(r => r.write(key, value));
  }
  
  async read(key) {
    // Read from any replica (may be stale)
    const replica = this.selectReplica();
    return await replica.read(key);
  }
}

/**
 * 3. Read-Your-Writes Consistency
 * User sees their own writes immediately
 */
class ReadYourWritesConsistency {
  async write(userId, key, value) {
    const version = await this.primary.write(key, value);
    
    // Store user's last write version
    await this.userVersions.set(userId, { key, version });
    
    // Replicate asynchronously
    this.replicas.forEach(r => r.write(key, value, version));
  }
  
  async read(userId, key) {
    const userVersion = await this.userVersions.get(userId);
    
    if (userVersion && userVersion.key === key) {
      // Read from primary if user recently wrote
      return await this.primary.read(key);
    }
    
    // Otherwise read from replica
    return await this.selectReplica().read(key);
  }
}

/**
 * Trade-off Examples
 */

// Latency vs Consistency
// Option 1: Wait for all replicas (consistent but slow)
async function writeConsistent(data) {
  await Promise.all(replicas.map(r => r.write(data)));
}

// Option 2: Write to quorum (balanced)
async function writeQuorum(data) {
  const majority = Math.floor(replicas.length / 2) + 1;
  await Promise.race(
    Array(majority).fill().map((_, i) => replicas[i].write(data))
  );
}

// Option 3: Fire and forget (fast but may lose data)
async function writeAsync(data) {
  replicas[0].write(data); // No await
}

// Availability vs Consistency during partition
class PartitionHandler {
  async handleWrite(data) {
    if (this.isPartitioned()) {
      // Option 1: Reject write (CP)
      throw new Error('System unavailable during partition');
      
      // Option 2: Accept write, resolve later (AP)
      await this.localWrite(data);
      this.conflictQueue.push(data);
    } else {
      await this.normalWrite(data);
    }
  }
}
```

---

## Summary

These system design concepts cover:

1. ✅ **Scalability** - Vertical vs Horizontal, Stateless design
2. ✅ **Load Balancing** - Algorithms, Consistent hashing
3. ✅ **Caching** - Patterns, Invalidation strategies
4. ✅ **Database Design** - Selection, Sharding, Replication
5. ✅ **Message Queues** - Patterns, Event Sourcing, CQRS
6. ✅ **Microservices** - Communication, Service Discovery, Sagas
7. ✅ **API Design** - REST, GraphQL, Versioning
8. ✅ **Security** - Auth, RBAC, Input validation
9. ✅ **Monitoring** - Logging, Metrics, Tracing
10. ✅ **CAP Theorem** - Trade-offs, Consistency models

**Interview Tips**:
- Always discuss trade-offs
- Estimate capacity and scale requirements
- Draw clear architecture diagrams
- Consider failure scenarios
- Think about security from the start
- Mention monitoring and observability

मालिक, master these concepts and you'll ace any system design interview! 🚀
