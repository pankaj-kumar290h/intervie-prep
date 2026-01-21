# Node.js Async Patterns

Asynchronous patterns are essential in Node.js for handling I/O operations efficiently without blocking the event loop.

## Table of Contents
1. [Callback Patterns](#callback-patterns)
2. [Promise Patterns](#promise-patterns)
3. [Async/Await Patterns](#asyncawait-patterns)
4. [Concurrency Control](#concurrency-control)
5. [Error Handling Patterns](#error-handling-patterns)

---

## Callback Patterns

### Node.js Error-First Callback Convention

```javascript
/**
 * Error-First Callback Pattern
 * Standard Node.js callback convention
 */

// Basic error-first callback
function readFileAsync(path, callback) {
  // Simulating async operation
  setTimeout(() => {
    if (!path) {
      callback(new Error('Path is required'), null);
      return;
    }
    callback(null, `Contents of ${path}`);
  }, 100);
}

// Usage
readFileAsync('/path/to/file', (err, data) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('Data:', data);
});

/**
 * Callback Wrapper Pattern
 * Convert callback-based functions to promises
 */
const util = require('util');

// Using util.promisify
const readFilePromise = util.promisify(readFileAsync);

// Manual promisification
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

/**
 * Callback Hell Prevention
 */

// BAD: Callback Hell
function processUserBad(userId, callback) {
  getUser(userId, (err, user) => {
    if (err) return callback(err);
    getOrders(user.id, (err, orders) => {
      if (err) return callback(err);
      processOrders(orders, (err, result) => {
        if (err) return callback(err);
        sendNotification(user.email, result, (err) => {
          if (err) return callback(err);
          callback(null, result);
        });
      });
    });
  });
}

// GOOD: Named Functions
function processUserGood(userId, callback) {
  getUser(userId, handleUser);
  
  function handleUser(err, user) {
    if (err) return callback(err);
    getOrders(user.id, (err, orders) => handleOrders(err, orders, user));
  }
  
  function handleOrders(err, orders, user) {
    if (err) return callback(err);
    processOrders(orders, (err, result) => handleResult(err, result, user));
  }
  
  function handleResult(err, result, user) {
    if (err) return callback(err);
    sendNotification(user.email, result, (err) => {
      if (err) return callback(err);
      callback(null, result);
    });
  }
}

// BETTER: Async library (or convert to promises)
const async = require('async');

function processUserAsync(userId, callback) {
  async.waterfall([
    (next) => getUser(userId, next),
    (user, next) => getOrders(user.id, (err, orders) => next(err, user, orders)),
    (user, orders, next) => processOrders(orders, (err, result) => next(err, user, result)),
    (user, result, next) => sendNotification(user.email, result, (err) => next(err, result))
  ], callback);
}
```

---

## Promise Patterns

### Basic Promise Patterns

```javascript
/**
 * Promise Creation Patterns
 */

// Basic Promise
function fetchData(url) {
  return new Promise((resolve, reject) => {
    // Simulated async operation
    setTimeout(() => {
      if (!url) {
        reject(new Error('URL is required'));
        return;
      }
      resolve({ url, data: 'Response data' });
    }, 100);
  });
}

// Promise.resolve / Promise.reject shortcuts
const resolvedPromise = Promise.resolve({ cached: true, data: 'cached data' });
const rejectedPromise = Promise.reject(new Error('Failed'));

/**
 * Promise Chaining
 */
fetchData('/api/users')
  .then(response => {
    console.log('Got users:', response);
    return fetchData('/api/orders');
  })
  .then(response => {
    console.log('Got orders:', response);
    return processData(response);
  })
  .then(result => {
    console.log('Processed:', result);
  })
  .catch(error => {
    console.error('Error:', error.message);
  })
  .finally(() => {
    console.log('Cleanup');
  });

/**
 * Promise Combinators
 */

// Promise.all - All must succeed
async function fetchAllData() {
  const [users, orders, products] = await Promise.all([
    fetchData('/api/users'),
    fetchData('/api/orders'),
    fetchData('/api/products')
  ]);
  
  return { users, orders, products };
}

// Promise.allSettled - Get all results regardless of success/failure
async function fetchAllWithStatus() {
  const results = await Promise.allSettled([
    fetchData('/api/users'),
    fetchData('/api/orders'),
    fetchData('/api/invalid') // This will fail
  ]);
  
  return results.map((result, index) => ({
    endpoint: ['/api/users', '/api/orders', '/api/invalid'][index],
    status: result.status,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
}

// Promise.race - First to complete wins
async function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetchData(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Promise.any - First to succeed wins (ignores failures)
async function fetchFromMultipleSources(urls) {
  return Promise.any(urls.map(url => fetchData(url)));
}

/**
 * Deferred Pattern
 */
function createDeferred() {
  let resolve, reject;
  
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return { promise, resolve, reject };
}

// Usage
const deferred = createDeferred();

// Later...
setTimeout(() => {
  deferred.resolve('Resolved later!');
}, 1000);

await deferred.promise; // Waits for resolution
```

---

## Async/Await Patterns

### Common Patterns

```javascript
/**
 * Sequential Execution
 */
async function processSequentially(items) {
  const results = [];
  
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  
  return results;
}

/**
 * Parallel Execution
 */
async function processInParallel(items) {
  return await Promise.all(items.map(item => processItem(item)));
}

/**
 * Parallel with Error Handling
 */
async function processInParallelSafe(items) {
  const results = await Promise.allSettled(
    items.map(item => processItem(item))
  );
  
  const successes = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  const failures = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
  
  return { successes, failures };
}

/**
 * Retry Pattern
 */
async function withRetry(fn, options = {}) {
  const { maxRetries = 3, delay = 1000, backoff = 2 } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
        await sleep(waitTime);
      }
    }
  }
  
  throw lastError;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Usage
const result = await withRetry(
  () => fetchData('/unreliable-endpoint'),
  { maxRetries: 5, delay: 500 }
);

/**
 * Timeout Pattern
 */
async function withTimeout(asyncFn, timeout, errorMessage = 'Operation timed out') {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeout);
  });
  
  return Promise.race([asyncFn(), timeoutPromise]);
}

// Usage
try {
  const result = await withTimeout(
    () => fetchData('/slow-endpoint'),
    5000,
    'Request took too long'
  );
} catch (error) {
  if (error.message === 'Request took too long') {
    console.log('Timeout occurred');
  }
}

/**
 * Circuit Breaker Pattern
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF-OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('Circuit breaker OPENED');
    }
  }
  
  getState() {
    return this.state;
  }
}

// Usage
const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 10000 });

async function callExternalService() {
  return await breaker.execute(() => fetchData('/external-api'));
}

/**
 * Async Iterator Pattern
 */
async function* asyncGenerator(items) {
  for (const item of items) {
    yield await processItem(item);
  }
}

// Usage
const generator = asyncGenerator([1, 2, 3, 4, 5]);

for await (const result of generator) {
  console.log('Processed:', result);
}

/**
 * Batch Processing with Async Generators
 */
async function* batchProcess(items, batchSize = 10) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(processItem));
    yield results;
  }
}

// Process large dataset in batches
const items = Array.from({ length: 1000 }, (_, i) => i);

for await (const batchResults of batchProcess(items, 100)) {
  console.log(`Processed batch of ${batchResults.length} items`);
}
```

---

## Concurrency Control

### Limiting Parallel Operations

```javascript
/**
 * Semaphore Pattern - Limit concurrent operations
 */
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.current = 0;
    this.queue = [];
  }
  
  async acquire() {
    if (this.current < this.maxConcurrency) {
      this.current++;
      return;
    }
    
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }
  
  release() {
    this.current--;
    
    if (this.queue.length > 0) {
      this.current++;
      const next = this.queue.shift();
      next();
    }
  }
  
  async run(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Usage
const semaphore = new Semaphore(5);

async function processWithLimit(items) {
  return Promise.all(
    items.map(item => 
      semaphore.run(() => processItem(item))
    )
  );
}

/**
 * Promise Pool - More sophisticated concurrency control
 */
class PromisePool {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.current = 0;
    this.queue = [];
  }
  
  async add(promiseFactory) {
    if (this.current >= this.maxConcurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.current++;
    
    try {
      return await promiseFactory();
    } finally {
      this.current--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }
  
  async map(items, promiseFactory) {
    return Promise.all(
      items.map(item => this.add(() => promiseFactory(item)))
    );
  }
}

// Usage
const pool = new PromisePool(3);

const urls = [
  'https://api.example.com/1',
  'https://api.example.com/2',
  'https://api.example.com/3',
  'https://api.example.com/4',
  'https://api.example.com/5'
];

const results = await pool.map(urls, async (url) => {
  console.log(`Fetching ${url}...`);
  const response = await fetch(url);
  return response.json();
});

/**
 * Async Queue with Priority
 */
class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  add(task, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        priority,
        resolve,
        reject
      });
      
      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority);
      
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
  
  get size() {
    return this.queue.length;
  }
  
  get pending() {
    return this.running;
  }
}

// Usage
const queue = new AsyncQueue(2);

// High priority task
queue.add(() => fetchData('/urgent'), 10);

// Normal priority tasks
queue.add(() => fetchData('/normal1'), 0);
queue.add(() => fetchData('/normal2'), 0);

// Low priority task
queue.add(() => fetchData('/background'), -5);

/**
 * Rate Limiter
 */
class RateLimiter {
  constructor(tokensPerInterval, interval) {
    this.tokensPerInterval = tokensPerInterval;
    this.interval = interval;
    this.tokens = tokensPerInterval;
    this.lastRefill = Date.now();
  }
  
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / this.interval) * this.tokensPerInterval;
    
    this.tokens = Math.min(this.tokensPerInterval, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
  
  async acquire(tokens = 1) {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    // Wait for tokens to be available
    const waitTime = ((tokens - this.tokens) / this.tokensPerInterval) * this.interval;
    await sleep(waitTime);
    
    this.refill();
    this.tokens -= tokens;
    return true;
  }
  
  async execute(fn) {
    await this.acquire();
    return fn();
  }
}

// 10 requests per second
const limiter = new RateLimiter(10, 1000);

async function rateLimitedFetch(url) {
  return limiter.execute(() => fetch(url));
}
```

---

## Error Handling Patterns

### Comprehensive Error Handling

```javascript
/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Error Handler Wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage with Express
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  res.json(user);
}));

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });
  
  // Determine if operational or programming error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      errors: err.errors
    });
  }
  
  // Programming error - don't leak details
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
};

app.use(errorHandler);

/**
 * Async Try-Catch Wrapper
 */
async function tryCatch(asyncFn) {
  try {
    const result = await asyncFn();
    return [null, result];
  } catch (error) {
    return [error, null];
  }
}

// Usage
const [error, users] = await tryCatch(() => userService.findAll());

if (error) {
  console.error('Failed to fetch users:', error);
  return [];
}

console.log('Users:', users);

/**
 * Result Type Pattern
 */
class Result {
  constructor(value, error) {
    this.value = value;
    this.error = error;
  }
  
  static ok(value) {
    return new Result(value, null);
  }
  
  static fail(error) {
    return new Result(null, error);
  }
  
  isOk() {
    return this.error === null;
  }
  
  isError() {
    return this.error !== null;
  }
  
  map(fn) {
    if (this.isError()) return this;
    try {
      return Result.ok(fn(this.value));
    } catch (e) {
      return Result.fail(e);
    }
  }
  
  async mapAsync(fn) {
    if (this.isError()) return this;
    try {
      return Result.ok(await fn(this.value));
    } catch (e) {
      return Result.fail(e);
    }
  }
  
  unwrap() {
    if (this.isError()) throw this.error;
    return this.value;
  }
  
  unwrapOr(defaultValue) {
    return this.isOk() ? this.value : defaultValue;
  }
}

// Service using Result type
class UserService {
  async create(userData) {
    try {
      const validated = await this.validate(userData);
      if (!validated.isOk()) {
        return validated;
      }
      
      const user = await this.db.create(validated.value);
      return Result.ok(user);
    } catch (error) {
      return Result.fail(error);
    }
  }
  
  async validate(userData) {
    const errors = [];
    
    if (!userData.email) {
      errors.push('Email is required');
    }
    
    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (errors.length > 0) {
      return Result.fail(new ValidationError('Validation failed', errors));
    }
    
    return Result.ok(userData);
  }
}

// Usage
const result = await userService.create({ email: 'test@example.com', password: 'short' });

if (result.isError()) {
  console.error('Failed:', result.error.message);
  console.error('Errors:', result.error.errors);
} else {
  console.log('User created:', result.value);
}
```

---

## Summary

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| **Callbacks** | Legacy code, simple operations | Low |
| **Promises** | Chainable async operations | Medium |
| **Async/Await** | Sequential async code | Low-Medium |
| **Semaphore** | Limit concurrent operations | Medium |
| **Promise Pool** | Batch processing with limits | Medium |
| **Rate Limiter** | API call limits | Medium |
| **Circuit Breaker** | Fault tolerance | High |
| **Result Type** | Explicit error handling | Medium |

मालिक, master these async patterns to build efficient, reliable Node.js applications! 🚀
