# Advanced Backend JavaScript (Node.js) Interview Questions

## Table of Contents
1. [Event Loop & Async Architecture](#event-loop--async-architecture)
2. [Streams & Buffers](#streams--buffers)
3. [Cluster & Worker Threads](#cluster--worker-threads)
4. [Memory Management & Performance](#memory-management--performance)
5. [Database Connection Pooling](#database-connection-pooling)
6. [Microservices Patterns](#microservices-patterns)
7. [Authentication & Security](#authentication--security)
8. [Rate Limiting & Throttling](#rate-limiting--throttling)
9. [Error Handling & Logging](#error-handling--logging)
10. [Testing & Mocking](#testing--mocking)

---

## Event Loop & Async Architecture

### Question 1: Explain Node.js Event Loop Phases

```javascript
/**
 * Node.js Event Loop Phases Demonstration
 */

console.log('1. Script start');

// Timers Phase
setTimeout(() => {
  console.log('2. setTimeout');
}, 0);

setImmediate(() => {
  console.log('3. setImmediate');
});

// I/O Callbacks Phase
const fs = require('fs');
fs.readFile(__filename, () => {
  console.log('4. fs.readFile callback');
  
  setTimeout(() => {
    console.log('5. setTimeout inside readFile');
  }, 0);
  
  setImmediate(() => {
    console.log('6. setImmediate inside readFile');
  });
  
  process.nextTick(() => {
    console.log('7. nextTick inside readFile');
  });
});

// Microtask Queue
Promise.resolve().then(() => {
  console.log('8. Promise');
});

// Next Tick Queue (highest priority)
process.nextTick(() => {
  console.log('9. nextTick');
});

console.log('10. Script end');

/**
 * Expected Output Order:
 * 1. Script start
 * 10. Script end
 * 9. nextTick (nextTick queue runs first)
 * 8. Promise (microtask queue)
 * 2. setTimeout (can be 2 or 3 first, depends on timing)
 * 3. setImmediate
 * 4. fs.readFile callback
 * 7. nextTick inside readFile (nextTick always first in phase)
 * 6. setImmediate inside readFile (runs before setTimeout)
 * 5. setTimeout inside readFile
 */
```

### Question 2: Implement Custom EventEmitter

```javascript
/**
 * Custom EventEmitter with advanced features
 */
class CustomEventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }
  
  /**
   * Add event listener
   */
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event);
    
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `Warning: Possible EventEmitter memory leak detected. ` +
        `${listeners.length + 1} ${event} listeners added.`
      );
    }
    
    listeners.push({ listener, once: false });
    
    return this;
  }
  
  /**
   * Add one-time listener
   */
  once(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event).push({ listener, once: true });
    
    return this;
  }
  
  /**
   * Remove listener
   */
  off(event, listenerToRemove) {
    if (!this.events.has(event)) return this;
    
    const listeners = this.events.get(event);
    const filtered = listeners.filter(
      ({ listener }) => listener !== listenerToRemove
    );
    
    if (filtered.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, filtered);
    }
    
    return this;
  }
  
  /**
   * Emit event
   */
  emit(event, ...args) {
    if (!this.events.has(event)) return false;
    
    const listeners = this.events.get(event);
    const toRemove = [];
    
    listeners.forEach(({ listener, once }, index) => {
      try {
        listener.apply(this, args);
        
        if (once) {
          toRemove.push(index);
        }
      } catch (error) {
        this.emit('error', error);
      }
    });
    
    // Remove once listeners
    toRemove.reverse().forEach(index => {
      listeners.splice(index, 1);
    });
    
    return true;
  }
  
  /**
   * Remove all listeners
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    
    return this;
  }
  
  /**
   * Get listener count
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
  
  /**
   * Get all event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
  
  /**
   * Set max listeners
   */
  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }
}

// Usage
const emitter = new CustomEventEmitter();

emitter.on('data', (data) => {
  console.log('Received:', data);
});

emitter.once('connect', () => {
  console.log('Connected! (only once)');
});

emitter.emit('data', { id: 1 });
emitter.emit('connect');
emitter.emit('connect'); // Won't fire again

console.log('Event names:', emitter.eventNames());
console.log('Data listeners:', emitter.listenerCount('data'));
```

---

## Streams & Buffers

### Question 3: Implement Custom Stream

```javascript
const { Readable, Writable, Transform, pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

/**
 * Custom Readable Stream - Generate data
 */
class NumberGenerator extends Readable {
  constructor(max, options) {
    super(options);
    this.max = max;
    this.current = 0;
  }
  
  _read() {
    if (this.current >= this.max) {
      this.push(null); // End stream
      return;
    }
    
    const data = Buffer.from(`${this.current}\n`);
    this.push(data);
    this.current++;
  }
}

/**
 * Custom Transform Stream - Process data
 */
class DoubleTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const num = parseInt(chunk.toString().trim());
    const doubled = num * 2;
    
    this.push(`${doubled}\n`);
    callback();
  }
}

/**
 * Custom Writable Stream - Consume data
 */
class Logger extends Writable {
  constructor(options) {
    super(options);
    this.logs = [];
  }
  
  _write(chunk, encoding, callback) {
    const line = chunk.toString().trim();
    this.logs.push(line);
    console.log('Logged:', line);
    callback();
  }
  
  _final(callback) {
    console.log('Total logs:', this.logs.length);
    callback();
  }
}

// Usage
const generator = new NumberGenerator(10);
const doubler = new DoubleTransform();
const logger = new Logger();

pipeline(
  generator,
  doubler,
  logger,
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);

/**
 * Advanced: File Processing with Backpressure Handling
 */
const fs = require('fs');
const crypto = require('crypto');

async function processLargeFile(inputPath, outputPath) {
  const readStream = fs.createReadStream(inputPath, {
    highWaterMark: 64 * 1024 // 64KB chunks
  });
  
  const writeStream = fs.createWriteStream(outputPath);
  
  // Transform: Encrypt data
  const cipher = crypto.createCipher('aes-256-cbc', 'secret-key');
  
  try {
    await pipelineAsync(
      readStream,
      cipher,
      writeStream
    );
    
    console.log('File processed successfully');
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  }
}

/**
 * Stream Utilities
 */
class StreamUtils {
  /**
   * Convert stream to buffer
   */
  static async streamToBuffer(stream) {
    const chunks = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
  
  /**
   * Convert stream to string
   */
  static async streamToString(stream) {
    const buffer = await this.streamToBuffer(stream);
    return buffer.toString('utf-8');
  }
  
  /**
   * Split stream by delimiter
   */
  static createSplitStream(delimiter = '\n') {
    let buffer = '';
    
    return new Transform({
      transform(chunk, encoding, callback) {
        buffer += chunk.toString();
        const lines = buffer.split(delimiter);
        buffer = lines.pop(); // Keep incomplete line
        
        lines.forEach(line => {
          if (line) {
            this.push(line + delimiter);
          }
        });
        
        callback();
      },
      
      flush(callback) {
        if (buffer) {
          this.push(buffer);
        }
        callback();
      }
    });
  }
  
  /**
   * Batch stream - Group items
   */
  static createBatchStream(batchSize) {
    let batch = [];
    
    return new Transform({
      objectMode: true,
      
      transform(item, encoding, callback) {
        batch.push(item);
        
        if (batch.length >= batchSize) {
          this.push(batch);
          batch = [];
        }
        
        callback();
      },
      
      flush(callback) {
        if (batch.length > 0) {
          this.push(batch);
        }
        callback();
      }
    });
  }
}

// Usage: Process CSV file line by line
const csvReadStream = fs.createReadStream('large-file.csv');
const splitStream = StreamUtils.createSplitStream('\n');
const batchStream = StreamUtils.createBatchStream(100);

pipeline(
  csvReadStream,
  splitStream,
  batchStream,
  new Writable({
    objectMode: true,
    write(batch, encoding, callback) {
      console.log('Processing batch of', batch.length, 'lines');
      // Process batch in database
      callback();
    }
  }),
  (err) => {
    if (err) console.error('Error:', err);
  }
);
```

---

## Cluster & Worker Threads

### Question 4: Implement Multi-Process Architecture

```javascript
/**
 * Master Process - Cluster Management
 */
const cluster = require('cluster');
const os = require('os');
const http = require('http');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  const numCPUs = os.cpus().length;
  const workers = new Map();
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.set(worker.id, {
      worker,
      requests: 0,
      memory: 0
    });
  }
  
  // Handle worker messages
  cluster.on('message', (worker, message) => {
    if (message.type === 'request') {
      const workerInfo = workers.get(worker.id);
      workerInfo.requests++;
    }
  });
  
  // Monitor workers
  setInterval(() => {
    console.log('\n=== Worker Stats ===');
    workers.forEach((info, id) => {
      console.log(`Worker ${id}: ${info.requests} requests`);
    });
  }, 5000);
  
  // Restart failed workers
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} died. Restarting...`);
    workers.delete(worker.id);
    
    const newWorker = cluster.fork();
    workers.set(newWorker.id, {
      worker: newWorker,
      requests: 0,
      memory: 0
    });
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Master received SIGTERM, shutting down...');
    
    workers.forEach((info) => {
      info.worker.send({ type: 'shutdown' });
    });
    
    setTimeout(() => {
      process.exit(0);
    }, 10000); // Wait 10s for graceful shutdown
  });
  
} else {
  // Worker Process
  console.log(`Worker ${process.pid} started`);
  
  const server = http.createServer((req, res) => {
    // Notify master of request
    process.send({ type: 'request' });
    
    // Simulate work
    const start = Date.now();
    while (Date.now() - start < 100) {} // 100ms CPU work
    
    res.writeHead(200);
    res.end(`Handled by worker ${process.pid}\n`);
  });
  
  server.listen(3000);
  
  // Handle shutdown message
  process.on('message', (message) => {
    if (message.type === 'shutdown') {
      console.log(`Worker ${process.pid} shutting down...`);
      
      server.close(() => {
        process.exit(0);
      });
      
      // Force shutdown after 5s
      setTimeout(() => {
        process.exit(1);
      }, 5000);
    }
  });
}

/**
 * Worker Threads - CPU Intensive Tasks
 */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main Thread
  
  class WorkerPool {
    constructor(workerPath, poolSize = 4) {
      this.workerPath = workerPath;
      this.poolSize = poolSize;
      this.workers = [];
      this.queue = [];
      
      this.init();
    }
    
    init() {
      for (let i = 0; i < this.poolSize; i++) {
        this.addWorker();
      }
    }
    
    addWorker() {
      const worker = {
        instance: null,
        busy: false
      };
      
      this.workers.push(worker);
    }
    
    async execute(data) {
      return new Promise((resolve, reject) => {
        const task = { data, resolve, reject };
        
        const availableWorker = this.workers.find(w => !w.busy);
        
        if (availableWorker) {
          this.runTask(availableWorker, task);
        } else {
          this.queue.push(task);
        }
      });
    }
    
    runTask(worker, task) {
      worker.busy = true;
      
      worker.instance = new Worker(this.workerPath, {
        workerData: task.data
      });
      
      worker.instance.on('message', (result) => {
        task.resolve(result);
        worker.busy = false;
        worker.instance = null;
        
        // Process next task in queue
        if (this.queue.length > 0) {
          const nextTask = this.queue.shift();
          this.runTask(worker, nextTask);
        }
      });
      
      worker.instance.on('error', (error) => {
        task.reject(error);
        worker.busy = false;
        worker.instance = null;
      });
    }
    
    async terminate() {
      await Promise.all(
        this.workers
          .filter(w => w.instance)
          .map(w => w.instance.terminate())
      );
    }
  }
  
  // Usage
  const pool = new WorkerPool('./cpu-intensive-worker.js', 4);
  
  async function processData() {
    const results = await Promise.all([
      pool.execute({ numbers: [1, 2, 3, 4, 5] }),
      pool.execute({ numbers: [6, 7, 8, 9, 10] }),
      pool.execute({ numbers: [11, 12, 13, 14, 15] })
    ]);
    
    console.log('Results:', results);
  }
  
  processData().then(() => pool.terminate());
  
} else {
  // Worker Thread
  
  // CPU intensive task
  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  
  const result = workerData.numbers.map(n => fibonacci(n));
  
  parentPort.postMessage(result);
}
```

---

## Memory Management & Performance

### Question 5: Detect and Fix Memory Leaks

```javascript
/**
 * Memory Leak Detector
 */
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
    this.monitoring = false;
  }
  
  start(interval = 5000) {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.interval = setInterval(() => {
      this.takeSnapshot();
    }, interval);
    
    console.log('Memory monitoring started');
  }
  
  stop() {
    if (!this.monitoring) return;
    
    clearInterval(this.interval);
    this.monitoring = false;
    
    console.log('Memory monitoring stopped');
    this.analyze();
  }
  
  takeSnapshot() {
    const usage = process.memoryUsage();
    
    this.snapshots.push({
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss
    });
    
    if (this.snapshots.length > 100) {
      this.snapshots.shift(); // Keep last 100
    }
  }
  
  analyze() {
    if (this.snapshots.length < 2) {
      console.log('Not enough data');
      return;
    }
    
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    
    const heapGrowth = last.heapUsed - first.heapUsed;
    const heapGrowthPercent = (heapGrowth / first.heapUsed) * 100;
    
    console.log('\n=== Memory Analysis ===');
    console.log(`Duration: ${(last.timestamp - first.timestamp) / 1000}s`);
    console.log(`Heap Growth: ${(heapGrowth / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Growth Rate: ${heapGrowthPercent.toFixed(2)}%`);
    
    if (heapGrowthPercent > 20) {
      console.warn('⚠️ Potential memory leak detected!');
      this.findLeaks();
    }
  }
  
  findLeaks() {
    if (global.gc) {
      console.log('Running garbage collection...');
      global.gc();
      
      setTimeout(() => {
        this.takeSnapshot();
        const beforeGC = this.snapshots[this.snapshots.length - 2];
        const afterGC = this.snapshots[this.snapshots.length - 1];
        
        const freed = beforeGC.heapUsed - afterGC.heapUsed;
        console.log(`Memory freed: ${(freed / 1024 / 1024).toFixed(2)} MB`);
        
        if (freed < beforeGC.heapUsed * 0.1) {
          console.error('❌ Memory not freed - likely a leak!');
        }
      }, 1000);
    }
  }
}

/**
 * Common Memory Leak Patterns
 */

// ❌ BAD: Global variable accumulation
let cache = {}; // Never cleared!

function addToCache(key, value) {
  cache[key] = value;
}

// ✅ GOOD: LRU Cache with size limit
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, value);
    
    // Remove oldest if over limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  clear() {
    this.cache.clear();
  }
}

// ❌ BAD: Event listener leak
const EventEmitter = require('events');
const emitter = new EventEmitter();

function createHandler() {
  const hugeArray = new Array(1000000);
  
  emitter.on('event', () => {
    console.log(hugeArray.length); // Captures hugeArray!
  });
}

// ✅ GOOD: Cleanup listeners
function createHandlerCorrectly() {
  const hugeArray = new Array(1000000);
  const length = hugeArray.length; // Extract only what's needed
  
  const handler = () => {
    console.log(length);
  };
  
  emitter.on('event', handler);
  
  return () => {
    emitter.off('event', handler); // Cleanup
  };
}

// ❌ BAD: Closure capturing too much
function createClosureLeak() {
  const hugeData = new Array(1000000).fill('data');
  
  return {
    getData: () => hugeData, // Entire array captured
    getLength: () => hugeData.length // Still captures entire array!
  };
}

// ✅ GOOD: Minimize closure scope
function createClosureCorrectly() {
  const hugeData = new Array(1000000).fill('data');
  const length = hugeData.length;
  
  return {
    getData: () => hugeData,
    getLength: () => length // Only captures length
  };
}

/**
 * Memory-Efficient Stream Processing
 */
async function processLargeDataset(filePath) {
  const fs = require('fs');
  const readline = require('readline');
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let count = 0;
  
  for await (const line of rl) {
    // Process line by line (constant memory usage)
    processLine(line);
    count++;
    
    if (count % 10000 === 0) {
      console.log(`Processed ${count} lines`);
      console.log(`Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
    }
  }
  
  console.log(`Total lines: ${count}`);
}

function processLine(line) {
  // Process without storing in memory
}

// Usage
const detector = new MemoryLeakDetector();
detector.start(5000);

// Run your app...

// Stop after some time
setTimeout(() => {
  detector.stop();
}, 60000);
```

---

## Database Connection Pooling

### Question 6: Implement Connection Pool

```javascript
/**
 * Generic Connection Pool
 */
class ConnectionPool {
  constructor(factory, options = {}) {
    this.factory = factory;
    this.minSize = options.minSize || 2;
    this.maxSize = options.maxSize || 10;
    this.idleTimeout = options.idleTimeout || 30000;
    this.acquireTimeout = options.acquireTimeout || 10000;
    
    this.available = [];
    this.inUse = new Set();
    this.queue = [];
    this.creating = 0;
    
    this.init();
  }
  
  async init() {
    const promises = [];
    
    for (let i = 0; i < this.minSize; i++) {
      promises.push(this.createConnection());
    }
    
    await Promise.all(promises);
    console.log(`Pool initialized with ${this.minSize} connections`);
  }
  
  async createConnection() {
    this.creating++;
    
    try {
      const connection = await this.factory.create();
      
      const pooledConnection = {
        connection,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        idleTimer: null
      };
      
      this.available.push(pooledConnection);
      return pooledConnection;
      
    } finally {
      this.creating--;
    }
  }
  
  async acquire() {
    // Try to get available connection
    if (this.available.length > 0) {
      const conn = this.available.pop();
      clearTimeout(conn.idleTimer);
      this.inUse.add(conn);
      return conn.connection;
    }
    
    // Create new connection if under max
    if (this.inUse.size + this.creating < this.maxSize) {
      const conn = await this.createConnection();
      this.available.pop(); // Remove from available
      this.inUse.add(conn);
      return conn.connection;
    }
    
    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.queue.findIndex(item => item.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        reject(new Error('Acquire timeout'));
      }, this.acquireTimeout);
      
      this.queue.push({ resolve, reject, timeout });
    });
  }
  
  release(connection) {
    // Find pooled connection
    const pooledConn = Array.from(this.inUse).find(
      pc => pc.connection === connection
    );
    
    if (!pooledConn) {
      console.error('Connection not in pool');
      return;
    }
    
    this.inUse.delete(pooledConn);
    pooledConn.lastUsed = Date.now();
    
    // Check queue first
    if (this.queue.length > 0) {
      const { resolve, timeout } = this.queue.shift();
      clearTimeout(timeout);
      this.inUse.add(pooledConn);
      resolve(connection);
      return;
    }
    
    // Add back to available
    this.available.push(pooledConn);
    
    // Set idle timeout
    pooledConn.idleTimer = setTimeout(() => {
      this.removeConnection(pooledConn);
    }, this.idleTimeout);
  }
  
  async removeConnection(pooledConn) {
    const index = this.available.indexOf(pooledConn);
    if (index !== -1) {
      this.available.splice(index, 1);
    }
    
    try {
      await this.factory.destroy(pooledConn.connection);
      console.log('Connection removed due to idle timeout');
    } catch (error) {
      console.error('Error destroying connection:', error);
    }
    
    // Maintain minimum size
    if (this.available.length + this.inUse.size < this.minSize) {
      await this.createConnection();
    }
  }
  
  async drain() {
    console.log('Draining pool...');
    
    // Wait for in-use connections
    while (this.inUse.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Destroy all available connections
    await Promise.all(
      this.available.map(conn => 
        this.factory.destroy(conn.connection)
      )
    );
    
    this.available = [];
    console.log('Pool drained');
  }
  
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      queued: this.queue.length,
      creating: this.creating,
      total: this.available.length + this.inUse.size + this.creating
    };
  }
}

/**
 * PostgreSQL Connection Pool Example
 */
const { Client } = require('pg');

const pgFactory = {
  create: async () => {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      user: 'user',
      password: 'password'
    });
    
    await client.connect();
    console.log('Created new PostgreSQL connection');
    return client;
  },
  
  destroy: async (client) => {
    await client.end();
    console.log('Destroyed PostgreSQL connection');
  },
  
  validate: async (client) => {
    try {
      await client.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
};

const pool = new ConnectionPool(pgFactory, {
  minSize: 5,
  maxSize: 20,
  idleTimeout: 30000,
  acquireTimeout: 10000
});

// Usage
async function queryDatabase() {
  const client = await pool.acquire();
  
  try {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } finally {
    pool.release(client);
  }
}

// Monitor pool stats
setInterval(() => {
  console.log('Pool stats:', pool.getStats());
}, 5000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.drain();
  process.exit(0);
});
```

---

## Microservices Patterns

### Question 7: Implement Circuit Breaker

```javascript
/**
 * Circuit Breaker Pattern
 */
class CircuitBreaker {
  constructor(request, options = {}) {
    this.request = request;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 3000;
    this.resetTimeout = options.resetTimeout || 60000;
    
    this.onOpen = options.onOpen || (() => {});
    this.onClose = options.onClose || (() => {});
    this.onHalfOpen = options.onHalfOpen || (() => {});
  }
  
  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      
      this.state = 'HALF_OPEN';
      this.onHalfOpen();
    }
    
    try {
      const result = await this.callWithTimeout(...args);
      return this.onSuccess(result);
    } catch (error) {
      return this.onFailure(error);
    }
  }
  
  async callWithTimeout(...args) {
    return Promise.race([
      this.request(...args),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), this.timeout)
      )
    ]);
  }
  
  onSuccess(result) {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        this.onClose();
        console.log('Circuit breaker CLOSED');
      }
    }
    
    return result;
  }
  
  onFailure(error) {
    this.failureCount++;
    
    if (
      this.state === 'HALF_OPEN' ||
      this.failureCount >= this.failureThreshold
    ) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.onOpen();
      console.log('Circuit breaker OPEN');
    }
    
    throw error;
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt
    };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}

// Usage
const axios = require('axios');

const breaker = new CircuitBreaker(
  (url) => axios.get(url),
  {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 3000,
    resetTimeout: 30000,
    onOpen: () => {
      console.log('Service degraded, circuit OPEN');
      // Send alert
    },
    onClose: () => {
      console.log('Service recovered, circuit CLOSED');
      // Clear alert
    }
  }
);

async function callExternalService() {
  try {
    const response = await breaker.execute('https://api.example.com/data');
    return response.data;
  } catch (error) {
    console.error('Service call failed:', error.message);
    // Return cached data or default value
    return getFromCache();
  }
}

/**
 * Retry Pattern with Exponential Backoff
 */
async function retryWithBackoff(
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const actualDelay = delay + jitter;
      
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${actualDelay.toFixed(0)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
  
  throw lastError;
}

/**
 * Bulkhead Pattern - Isolate resources
 */
class Bulkhead {
  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }
  
  async execute(fn) {
    if (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => {
        this.queue.push(resolve);
      });
    }
    
    this.running++;
    
    try {
      return await fn();
    } finally {
      this.running--;
      
      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }
}

// Usage: Isolate different resources
const dbBulkhead = new Bulkhead(5);
const apiBulkhead = new Bulkhead(10);

async function databaseQuery() {
  return dbBulkhead.execute(async () => {
    // Database operation
  });
}

async function apiCall() {
  return apiBulkhead.execute(async () => {
    // API call
  });
}
```

---

## Authentication & Security

### Question 8: Implement JWT Authentication

```javascript
const crypto = require('crypto');

/**
 * JWT Implementation
 */
class JWT {
  constructor(secret) {
    this.secret = secret;
  }
  
  /**
   * Base64 URL encoding
   */
  base64URLEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  /**
   * Base64 URL decoding
   */
  base64URLDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString();
  }
  
  /**
   * Create HMAC signature
   */
  sign(data) {
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  /**
   * Generate JWT token
   */
  generate(payload, expiresIn = 3600) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn
    };
    
    const encodedHeader = this.base64URLEncode(JSON.stringify(header));
    const encodedPayload = this.base64URLEncode(JSON.stringify(tokenPayload));
    
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  /**
   * Verify JWT token
   */
  verify(token) {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    // Parse payload
    const payload = JSON.parse(this.base64URLDecode(encodedPayload));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    return payload;
  }
  
  /**
   * Refresh token
   */
  refresh(token, expiresIn = 3600) {
    const payload = this.verify(token);
    
    // Remove old timestamps
    delete payload.iat;
    delete payload.exp;
    
    return this.generate(payload, expiresIn);
  }
}

/**
 * Authentication Middleware
 */
function createAuthMiddleware(jwt, options = {}) {
  const {
    getToken = (req) => {
      const header = req.headers.authorization;
      if (header && header.startsWith('Bearer ')) {
        return header.substring(7);
      }
      return null;
    },
    onError = (err, req, res) => {
      res.status(401).json({ error: err.message });
    }
  } = options;
  
  return async (req, res, next) => {
    try {
      const token = getToken(req);
      
      if (!token) {
        throw new Error('No token provided');
      }
      
      const payload = jwt.verify(token);
      req.user = payload;
      
      next();
    } catch (error) {
      onError(error, req, res);
    }
  };
}

/**
 * Rate Limiting by User
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true;
  }
  
  middleware() {
    return (req, res, next) => {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (!this.isAllowed(req.user.id)) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      
      next();
    };
  }
}

// Usage with Express
const express = require('express');
const app = express();

const jwt = new JWT('your-secret-key');
const authMiddleware = createAuthMiddleware(jwt);
const rateLimiter = new RateLimiter(100, 60000);

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Verify credentials
  const user = await verifyCredentials(username, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = jwt.generate({
    id: user.id,
    username: user.username,
    role: user.role
  }, 3600);
  
  res.json({ token });
});

// Protected endpoint
app.get('/api/profile',
  authMiddleware,
  rateLimiter.middleware(),
  (req, res) => {
    res.json({ user: req.user });
  }
);

// Refresh token
app.post('/refresh', authMiddleware, (req, res) => {
  const newToken = jwt.refresh(req.headers.authorization.substring(7));
  res.json({ token: newToken });
});
```

---

## Summary

These questions cover:

1. ✅ **Event Loop & Async Patterns**
2. ✅ **Stream Processing**
3. ✅ **Multi-Processing & Threading**
4. ✅ **Memory Management**
5. ✅ **Database Optimization**
6. ✅ **Microservices Patterns**
7. ✅ **Security & Authentication**
8. ✅ **Performance Tuning**

**Tips for Backend Interviews**:
- Discuss scalability considerations
- Mention database indexing strategies
- Explain caching layers (Redis, etc.)
- Show awareness of monitoring/logging
- Understand distributed systems concepts

मालिक, master these and you'll crush any backend Node.js interview! 🚀

