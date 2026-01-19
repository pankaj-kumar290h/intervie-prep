# Node.js Streaming Patterns

Streaming patterns enable efficient processing of large data sets without loading everything into memory.

## Table of Contents
1. [Stream Basics](#stream-basics)
2. [Transform Streams](#transform-streams)
3. [Pipeline Patterns](#pipeline-patterns)
4. [Backpressure Handling](#backpressure-handling)
5. [Object Mode Streams](#object-mode-streams)

---

## Stream Basics

### Understanding Stream Types

```javascript
const { Readable, Writable, Transform, Duplex, pipeline } = require('stream');
const { promisify } = require('util');
const fs = require('fs');

/**
 * 1. Readable Stream - Source of data
 */
class NumberStream extends Readable {
  constructor(max = 10) {
    super({ objectMode: true });
    this.current = 0;
    this.max = max;
  }
  
  _read() {
    if (this.current < this.max) {
      // Push data when consumer is ready
      this.push(++this.current);
    } else {
      // Signal end of stream
      this.push(null);
    }
  }
}

// Usage
const numberStream = new NumberStream(5);
numberStream.on('data', (num) => console.log('Number:', num));
numberStream.on('end', () => console.log('Stream ended'));

/**
 * 2. Writable Stream - Destination for data
 */
class ConsoleWriter extends Writable {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this.count = 0;
  }
  
  _write(chunk, encoding, callback) {
    this.count++;
    console.log(`[${this.count}] Received:`, chunk);
    
    // Simulate async processing
    setTimeout(() => callback(), 10);
  }
  
  _final(callback) {
    console.log(`Total items processed: ${this.count}`);
    callback();
  }
}

// Usage
const writer = new ConsoleWriter();
writer.write({ name: 'John' });
writer.write({ name: 'Jane' });
writer.end();

/**
 * 3. Duplex Stream - Both readable and writable
 */
class EchoStream extends Duplex {
  constructor() {
    super({ objectMode: true });
    this.buffer = [];
  }
  
  _write(chunk, encoding, callback) {
    // Transform and buffer for reading
    this.buffer.push({ ...chunk, echoed: true, timestamp: Date.now() });
    callback();
  }
  
  _read() {
    if (this.buffer.length > 0) {
      this.push(this.buffer.shift());
    }
  }
}

/**
 * 4. Creating streams from iterables
 */
const { Readable: ReadableStream } = require('stream');

// From array
const arrayStream = ReadableStream.from([1, 2, 3, 4, 5]);

// From async generator
async function* asyncGenerator() {
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 100));
    yield { id: i, data: `Item ${i}` };
  }
}

const asyncStream = ReadableStream.from(asyncGenerator(), { objectMode: true });

/**
 * 5. File Streams
 */
async function copyFile(source, destination) {
  const readStream = fs.createReadStream(source);
  const writeStream = fs.createWriteStream(destination);
  
  return new Promise((resolve, reject) => {
    readStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    readStream.on('error', reject);
  });
}

// With progress tracking
function copyFileWithProgress(source, destination) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(destination);
    
    let bytesRead = 0;
    const stats = fs.statSync(source);
    
    readStream.on('data', (chunk) => {
      bytesRead += chunk.length;
      const progress = ((bytesRead / stats.size) * 100).toFixed(2);
      process.stdout.write(`\rProgress: ${progress}%`);
    });
    
    readStream.pipe(writeStream);
    writeStream.on('finish', () => {
      console.log('\nCopy complete!');
      resolve();
    });
    writeStream.on('error', reject);
    readStream.on('error', reject);
  });
}
```

---

## Transform Streams

### Creating Transform Streams

```javascript
const { Transform } = require('stream');

/**
 * 1. Basic Transform Stream
 */
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

// Usage
process.stdin
  .pipe(new UpperCaseTransform())
  .pipe(process.stdout);

/**
 * 2. JSON Parser Transform
 */
class JSONParseTransform extends Transform {
  constructor() {
    super({ objectMode: true });
    this.buffer = '';
  }
  
  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    
    // Try to parse complete JSON objects
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop(); // Keep incomplete line
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          this.push(obj);
        } catch (error) {
          this.emit('error', new Error(`Invalid JSON: ${line}`));
        }
      }
    }
    
    callback();
  }
  
  _flush(callback) {
    // Process remaining buffer
    if (this.buffer.trim()) {
      try {
        const obj = JSON.parse(this.buffer);
        this.push(obj);
      } catch (error) {
        this.emit('error', new Error(`Invalid JSON: ${this.buffer}`));
      }
    }
    callback();
  }
}

/**
 * 3. Filter Transform
 */
class FilterTransform extends Transform {
  constructor(predicate) {
    super({ objectMode: true });
    this.predicate = predicate;
  }
  
  _transform(chunk, encoding, callback) {
    if (this.predicate(chunk)) {
      this.push(chunk);
    }
    callback();
  }
}

/**
 * 4. Map Transform
 */
class MapTransform extends Transform {
  constructor(mapper) {
    super({ objectMode: true });
    this.mapper = mapper;
  }
  
  async _transform(chunk, encoding, callback) {
    try {
      const result = await this.mapper(chunk);
      this.push(result);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

/**
 * 5. Batch Transform - Collect items into batches
 */
class BatchTransform extends Transform {
  constructor(batchSize = 10) {
    super({ objectMode: true });
    this.batchSize = batchSize;
    this.batch = [];
  }
  
  _transform(chunk, encoding, callback) {
    this.batch.push(chunk);
    
    if (this.batch.length >= this.batchSize) {
      this.push([...this.batch]);
      this.batch = [];
    }
    
    callback();
  }
  
  _flush(callback) {
    if (this.batch.length > 0) {
      this.push(this.batch);
    }
    callback();
  }
}

/**
 * 6. Throttle Transform - Rate limiting
 */
class ThrottleTransform extends Transform {
  constructor(itemsPerSecond) {
    super({ objectMode: true });
    this.interval = 1000 / itemsPerSecond;
    this.lastTime = 0;
  }
  
  _transform(chunk, encoding, callback) {
    const now = Date.now();
    const elapsed = now - this.lastTime;
    
    if (elapsed >= this.interval) {
      this.lastTime = now;
      this.push(chunk);
      callback();
    } else {
      setTimeout(() => {
        this.lastTime = Date.now();
        this.push(chunk);
        callback();
      }, this.interval - elapsed);
    }
  }
}

/**
 * 7. CSV Parser Transform
 */
class CSVParseTransform extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
    this.delimiter = options.delimiter || ',';
    this.headers = options.headers || null;
    this.firstLine = true;
    this.buffer = '';
  }
  
  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const values = this.parseLine(line);
      
      if (this.firstLine && !this.headers) {
        this.headers = values;
        this.firstLine = false;
        continue;
      }
      
      this.firstLine = false;
      
      const obj = {};
      this.headers.forEach((header, i) => {
        obj[header.trim()] = values[i]?.trim();
      });
      
      this.push(obj);
    }
    
    callback();
  }
  
  parseLine(line) {
    // Simple CSV parsing (doesn't handle quoted fields with delimiters)
    return line.split(this.delimiter);
  }
  
  _flush(callback) {
    if (this.buffer.trim()) {
      const values = this.parseLine(this.buffer);
      const obj = {};
      this.headers.forEach((header, i) => {
        obj[header.trim()] = values[i]?.trim();
      });
      this.push(obj);
    }
    callback();
  }
}

// Usage
fs.createReadStream('data.csv')
  .pipe(new CSVParseTransform())
  .pipe(new FilterTransform(row => row.active === 'true'))
  .pipe(new MapTransform(row => ({ ...row, processed: true })))
  .pipe(new ConsoleWriter());
```

---

## Pipeline Patterns

### Modern Pipeline Usage

```javascript
const { pipeline } = require('stream');
const { promisify } = require('util');
const zlib = require('zlib');
const crypto = require('crypto');

const pipelineAsync = promisify(pipeline);

/**
 * 1. Basic Pipeline
 */
async function processFile(inputPath, outputPath) {
  await pipelineAsync(
    fs.createReadStream(inputPath),
    new UpperCaseTransform(),
    fs.createWriteStream(outputPath)
  );
  console.log('Pipeline completed');
}

/**
 * 2. Compression Pipeline
 */
async function compressFile(inputPath, outputPath) {
  await pipelineAsync(
    fs.createReadStream(inputPath),
    zlib.createGzip(),
    fs.createWriteStream(outputPath)
  );
}

async function decompressFile(inputPath, outputPath) {
  await pipelineAsync(
    fs.createReadStream(inputPath),
    zlib.createGunzip(),
    fs.createWriteStream(outputPath)
  );
}

/**
 * 3. Encryption Pipeline
 */
async function encryptFile(inputPath, outputPath, key, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  await pipelineAsync(
    fs.createReadStream(inputPath),
    cipher,
    fs.createWriteStream(outputPath)
  );
}

async function decryptFile(inputPath, outputPath, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  await pipelineAsync(
    fs.createReadStream(inputPath),
    decipher,
    fs.createWriteStream(outputPath)
  );
}

/**
 * 4. Data Processing Pipeline
 */
async function processLargeDataset(inputPath, outputPath) {
  let processed = 0;
  
  await pipelineAsync(
    fs.createReadStream(inputPath),
    new JSONParseTransform(),
    new FilterTransform(item => item.active),
    new MapTransform(async (item) => {
      processed++;
      // Simulate async enrichment
      await new Promise(r => setTimeout(r, 1));
      return {
        ...item,
        enriched: true,
        processedAt: new Date().toISOString()
      };
    }),
    new BatchTransform(100),
    new Transform({
      objectMode: true,
      transform(batch, encoding, callback) {
        // Convert batch to newline-delimited JSON
        const output = batch.map(item => JSON.stringify(item)).join('\n') + '\n';
        callback(null, output);
      }
    }),
    fs.createWriteStream(outputPath)
  );
  
  console.log(`Processed ${processed} items`);
}

/**
 * 5. HTTP Streaming Pipeline
 */
const http = require('http');

const server = http.createServer(async (req, res) => {
  if (req.url === '/stream') {
    res.setHeader('Content-Type', 'application/json');
    
    // Stream large dataset
    await pipelineAsync(
      fs.createReadStream('large-data.json'),
      zlib.createGzip(),
      res
    ).catch(err => {
      console.error('Pipeline failed:', err);
      res.statusCode = 500;
      res.end('Error');
    });
  }
});

/**
 * 6. Pipeline with Error Handling
 */
async function robustPipeline(inputPath, outputPath) {
  const onProgress = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      process.stdout.write('.');
      callback(null, chunk);
    }
  });
  
  try {
    await pipelineAsync(
      fs.createReadStream(inputPath),
      new JSONParseTransform(),
      onProgress,
      new MapTransform(item => JSON.stringify(item) + '\n'),
      fs.createWriteStream(outputPath)
    );
    console.log('\nPipeline completed successfully');
  } catch (error) {
    console.error('\nPipeline failed:', error.message);
    throw error;
  }
}

/**
 * 7. Pipeline Factory
 */
function createDataPipeline(options = {}) {
  const {
    filter = () => true,
    transform = (x) => x,
    batchSize = 100,
    throttle = null
  } = options;
  
  const stages = [
    new FilterTransform(filter),
    new MapTransform(transform)
  ];
  
  if (batchSize > 1) {
    stages.push(new BatchTransform(batchSize));
  }
  
  if (throttle) {
    stages.push(new ThrottleTransform(throttle));
  }
  
  return (readable, writable) => pipelineAsync(
    readable,
    ...stages,
    writable
  );
}

// Usage
const processUsers = createDataPipeline({
  filter: user => user.active,
  transform: user => ({ ...user, verified: true }),
  batchSize: 50,
  throttle: 100 // 100 items per second
});

await processUsers(
  fs.createReadStream('users.json').pipe(new JSONParseTransform()),
  new ConsoleWriter()
);
```

---

## Backpressure Handling

### Managing Flow Control

```javascript
/**
 * 1. Manual Backpressure Handling
 */
class SlowWriter extends Writable {
  constructor() {
    super({ objectMode: true, highWaterMark: 16 });
    this.count = 0;
  }
  
  _write(chunk, encoding, callback) {
    this.count++;
    
    // Simulate slow processing
    setTimeout(() => {
      console.log(`Processed item ${this.count}`);
      callback();
    }, 100);
  }
}

class FastReader extends Readable {
  constructor(total) {
    super({ objectMode: true, highWaterMark: 16 });
    this.total = total;
    this.current = 0;
  }
  
  _read() {
    if (this.current < this.total) {
      const canPush = this.push({ id: ++this.current });
      
      if (!canPush) {
        console.log('Backpressure! Pausing at', this.current);
      }
    } else {
      this.push(null);
    }
  }
}

// Pipe handles backpressure automatically
const reader = new FastReader(100);
const writer = new SlowWriter();

reader.pipe(writer);

/**
 * 2. Custom Backpressure with Write
 */
async function writeWithBackpressure(writable, items) {
  for (const item of items) {
    const canContinue = writable.write(item);
    
    if (!canContinue) {
      // Wait for drain event
      await new Promise(resolve => writable.once('drain', resolve));
    }
  }
  
  // Signal end
  writable.end();
}

/**
 * 3. Controlled Producer
 */
class ControlledProducer extends Readable {
  constructor(producer, options = {}) {
    super({ ...options, objectMode: true });
    this.producer = producer;
    this.isPaused = false;
  }
  
  async _read(size) {
    if (this.isPaused) return;
    
    try {
      for (let i = 0; i < size; i++) {
        const item = await this.producer();
        
        if (item === null) {
          this.push(null);
          return;
        }
        
        if (!this.push(item)) {
          // Consumer is full, stop producing
          this.isPaused = true;
          return;
        }
      }
    } catch (error) {
      this.destroy(error);
    }
  }
}

// Database cursor example
async function* databaseCursor(query) {
  let offset = 0;
  const limit = 100;
  
  while (true) {
    const rows = await db.query(`${query} LIMIT ${limit} OFFSET ${offset}`);
    
    if (rows.length === 0) break;
    
    for (const row of rows) {
      yield row;
    }
    
    offset += limit;
  }
}

const dbStream = Readable.from(databaseCursor('SELECT * FROM users'));

/**
 * 4. Buffering Stream with Backpressure
 */
class BufferedTransform extends Transform {
  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
      highWaterMark: options.bufferSize || 100
    });
    
    this.processingCount = 0;
    this.maxConcurrent = options.maxConcurrent || 10;
    this.processor = options.processor;
  }
  
  async _transform(chunk, encoding, callback) {
    if (this.processingCount >= this.maxConcurrent) {
      // Wait for slot
      await new Promise(resolve => {
        this.once('slot-available', resolve);
      });
    }
    
    this.processingCount++;
    
    try {
      const result = await this.processor(chunk);
      this.push(result);
    } catch (error) {
      this.emit('error', error);
    } finally {
      this.processingCount--;
      this.emit('slot-available');
    }
    
    callback();
  }
}

// Usage
const bufferedStream = new BufferedTransform({
  bufferSize: 50,
  maxConcurrent: 5,
  processor: async (item) => {
    // Simulate async processing
    await new Promise(r => setTimeout(r, Math.random() * 100));
    return { ...item, processed: true };
  }
});

/**
 * 5. Monitoring Stream Health
 */
class MonitoredStream extends Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    
    this.stats = {
      itemsProcessed: 0,
      bytesProcessed: 0,
      errors: 0,
      startTime: Date.now(),
      lastItemTime: null
    };
    
    this.reportInterval = options.reportInterval || 5000;
    this.timer = setInterval(() => this.report(), this.reportInterval);
  }
  
  _transform(chunk, encoding, callback) {
    this.stats.itemsProcessed++;
    this.stats.lastItemTime = Date.now();
    
    if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
      this.stats.bytesProcessed += chunk.length;
    }
    
    this.push(chunk);
    callback();
  }
  
  _flush(callback) {
    clearInterval(this.timer);
    this.report(true);
    callback();
  }
  
  report(final = false) {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    const throughput = this.stats.itemsProcessed / elapsed;
    
    console.log({
      status: final ? 'COMPLETED' : 'IN_PROGRESS',
      itemsProcessed: this.stats.itemsProcessed,
      bytesProcessed: this.stats.bytesProcessed,
      elapsedSeconds: elapsed.toFixed(2),
      throughputPerSecond: throughput.toFixed(2),
      errors: this.stats.errors
    });
  }
}
```

---

## Object Mode Streams

### Working with Objects

```javascript
/**
 * 1. Database Record Stream
 */
class DatabaseRecordStream extends Readable {
  constructor(query, options = {}) {
    super({ objectMode: true, highWaterMark: 16 });
    
    this.query = query;
    this.batchSize = options.batchSize || 100;
    this.offset = 0;
    this.finished = false;
  }
  
  async _read() {
    if (this.finished) {
      this.push(null);
      return;
    }
    
    try {
      const rows = await this.fetchBatch();
      
      if (rows.length === 0) {
        this.finished = true;
        this.push(null);
        return;
      }
      
      for (const row of rows) {
        if (!this.push(row)) {
          // Backpressure - stop reading
          break;
        }
      }
      
      this.offset += rows.length;
    } catch (error) {
      this.destroy(error);
    }
  }
  
  async fetchBatch() {
    // Simulated database query
    console.log(`Fetching batch at offset ${this.offset}`);
    
    // Simulate end of data
    if (this.offset >= 1000) return [];
    
    return Array.from({ length: this.batchSize }, (_, i) => ({
      id: this.offset + i,
      name: `Record ${this.offset + i}`,
      timestamp: new Date()
    }));
  }
}

/**
 * 2. API Pagination Stream
 */
class APIPaginationStream extends Readable {
  constructor(endpoint, options = {}) {
    super({ objectMode: true });
    
    this.endpoint = endpoint;
    this.pageSize = options.pageSize || 100;
    this.currentPage = 1;
    this.hasMore = true;
  }
  
  async _read() {
    if (!this.hasMore) {
      this.push(null);
      return;
    }
    
    try {
      const response = await this.fetchPage();
      
      for (const item of response.data) {
        this.push(item);
      }
      
      this.hasMore = response.hasNextPage;
      this.currentPage++;
      
      if (!this.hasMore) {
        this.push(null);
      }
    } catch (error) {
      this.destroy(error);
    }
  }
  
  async fetchPage() {
    // Simulated API call
    const response = await fetch(
      `${this.endpoint}?page=${this.currentPage}&limit=${this.pageSize}`
    );
    return response.json();
  }
}

/**
 * 3. Aggregation Stream
 */
class AggregationStream extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
    
    this.groupBy = options.groupBy;
    this.aggregations = options.aggregations || {};
    this.groups = new Map();
  }
  
  _transform(chunk, encoding, callback) {
    const groupKey = this.groupBy(chunk);
    
    if (!this.groups.has(groupKey)) {
      this.groups.set(groupKey, this.initGroup());
    }
    
    const group = this.groups.get(groupKey);
    this.updateGroup(group, chunk);
    
    callback();
  }
  
  _flush(callback) {
    // Emit aggregated results
    for (const [key, group] of this.groups) {
      this.push({
        group: key,
        ...this.finalizeGroup(group)
      });
    }
    callback();
  }
  
  initGroup() {
    return {
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity,
      items: []
    };
  }
  
  updateGroup(group, item) {
    group.count++;
    
    if (this.aggregations.sum) {
      group.sum += item[this.aggregations.sum];
    }
    
    if (this.aggregations.min) {
      group.min = Math.min(group.min, item[this.aggregations.min]);
    }
    
    if (this.aggregations.max) {
      group.max = Math.max(group.max, item[this.aggregations.max]);
    }
  }
  
  finalizeGroup(group) {
    return {
      count: group.count,
      sum: group.sum,
      min: group.min === Infinity ? null : group.min,
      max: group.max === -Infinity ? null : group.max,
      avg: group.count > 0 ? group.sum / group.count : null
    };
  }
}

// Usage
const ordersStream = new DatabaseRecordStream('SELECT * FROM orders');

await pipelineAsync(
  ordersStream,
  new AggregationStream({
    groupBy: (order) => order.customerId,
    aggregations: {
      sum: 'amount',
      min: 'amount',
      max: 'amount'
    }
  }),
  new ConsoleWriter()
);

/**
 * 4. Join Stream - Merge two streams
 */
class JoinStream extends Transform {
  constructor(rightStream, options = {}) {
    super({ objectMode: true });
    
    this.rightStream = rightStream;
    this.leftKey = options.leftKey;
    this.rightKey = options.rightKey;
    this.rightIndex = new Map();
    this.ready = false;
    
    this.loadRightStream();
  }
  
  async loadRightStream() {
    for await (const item of this.rightStream) {
      const key = item[this.rightKey];
      this.rightIndex.set(key, item);
    }
    this.ready = true;
    this.emit('ready');
  }
  
  async _transform(chunk, encoding, callback) {
    if (!this.ready) {
      await new Promise(resolve => this.once('ready', resolve));
    }
    
    const key = chunk[this.leftKey];
    const rightItem = this.rightIndex.get(key);
    
    if (rightItem) {
      this.push({
        ...chunk,
        joined: rightItem
      });
    }
    
    callback();
  }
}
```

---

## Summary

| Pattern | Use Case | Memory Impact |
|---------|----------|---------------|
| **Readable** | Data source | Low |
| **Writable** | Data destination | Low |
| **Transform** | Data transformation | Low |
| **Pipeline** | Chaining streams | Low |
| **Backpressure** | Flow control | Controlled |
| **Object Mode** | JSON/Objects | Medium |
| **Batch** | Bulk operations | Medium |

मालिक, master these streaming patterns for efficient data processing in Node.js! 🚀
