# Node.js Module Patterns

Module patterns in Node.js help organize code, manage dependencies, and control what functionality is exposed.

## Table of Contents
1. [CommonJS Modules](#commonjs-modules)
2. [ES Modules](#es-modules)
3. [Revealing Module Pattern](#revealing-module-pattern)
4. [Dependency Injection](#dependency-injection)
5. [Plugin Architecture](#plugin-architecture)

---

## CommonJS Modules

### Basic Patterns

```javascript
/**
 * 1. Exporting a Single Function
 */
// math.js
module.exports = function add(a, b) {
  return a + b;
};

// usage.js
const add = require('./math');
console.log(add(2, 3)); // 5

/**
 * 2. Exporting Multiple Functions
 */
// utils.js
module.exports.add = (a, b) => a + b;
module.exports.subtract = (a, b) => a - b;
module.exports.multiply = (a, b) => a * b;

// or using exports shorthand
exports.divide = (a, b) => a / b;

// usage.js
const { add, subtract } = require('./utils');

/**
 * 3. Exporting a Class
 */
// user.js
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  greet() {
    return `Hello, ${this.name}!`;
  }
}

module.exports = User;

// usage.js
const User = require('./user');
const user = new User('John', 'john@example.com');

/**
 * 4. Exporting a Singleton Instance
 */
// database.js
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.connection = null;
    Database.instance = this;
  }
  
  async connect(config) {
    if (!this.connection) {
      console.log('Creating new database connection...');
      this.connection = { config, connected: true };
    }
    return this.connection;
  }
  
  query(sql) {
    if (!this.connection) {
      throw new Error('Not connected');
    }
    return { sql, results: [] };
  }
}

module.exports = new Database();

// usage.js
const db = require('./database');
await db.connect({ host: 'localhost' });

/**
 * 5. Factory Function Export
 */
// logger.js
function createLogger(options = {}) {
  const { prefix = '', level = 'info' } = options;
  
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[level] ?? 2;
  
  return {
    error: (msg) => currentLevel >= 0 && console.error(`${prefix}[ERROR]`, msg),
    warn: (msg) => currentLevel >= 1 && console.warn(`${prefix}[WARN]`, msg),
    info: (msg) => currentLevel >= 2 && console.log(`${prefix}[INFO]`, msg),
    debug: (msg) => currentLevel >= 3 && console.log(`${prefix}[DEBUG]`, msg)
  };
}

module.exports = createLogger;

// usage.js
const createLogger = require('./logger');
const logger = createLogger({ prefix: '[App] ', level: 'debug' });
logger.info('Application started');
```

### Module Caching

```javascript
/**
 * Understanding Module Caching
 * Node.js caches modules after first require
 */

// counter.js
let count = 0;

module.exports = {
  increment: () => ++count,
  getCount: () => count
};

// app.js
const counter1 = require('./counter');
const counter2 = require('./counter');

counter1.increment(); // 1
counter2.increment(); // 2 (same instance!)

console.log(counter1.getCount()); // 2
console.log(counter2.getCount()); // 2

// Both variables reference the same cached module

/**
 * Bypassing Module Cache (for testing)
 */
function requireFresh(modulePath) {
  const resolvedPath = require.resolve(modulePath);
  delete require.cache[resolvedPath];
  return require(modulePath);
}

const freshCounter = requireFresh('./counter');
console.log(freshCounter.getCount()); // 0 (new instance)
```

---

## ES Modules

### Basic Patterns

```javascript
/**
 * ES Modules (ESM) in Node.js
 * Requires "type": "module" in package.json
 * Or use .mjs extension
 */

// Named Exports
// utils.mjs
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

export function multiply(a, b) {
  return a * b;
}

export class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(n) {
    this.result += n;
    return this;
  }
  
  getValue() {
    return this.result;
  }
}

// Default Export
// user.mjs
export default class User {
  constructor(name) {
    this.name = name;
  }
}

// Mixed Exports
// api.mjs
export const BASE_URL = 'https://api.example.com';

export function fetchData(endpoint) {
  return fetch(`${BASE_URL}${endpoint}`);
}

export default {
  get: (endpoint) => fetchData(endpoint),
  post: (endpoint, data) => fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

/**
 * Importing
 */
// app.mjs
import User from './user.mjs';
import { add, subtract } from './utils.mjs';
import * as utils from './utils.mjs';
import api, { BASE_URL } from './api.mjs';

// Dynamic imports
const module = await import('./heavy-module.mjs');

// Conditional imports
if (process.env.NODE_ENV === 'development') {
  const devTools = await import('./dev-tools.mjs');
  devTools.setup();
}
```

### Hybrid Module Support

```javascript
/**
 * Supporting Both CommonJS and ES Modules
 */

// package.json
{
  "name": "my-library",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./utils": {
      "import": "./dist/esm/utils.js",
      "require": "./dist/cjs/utils.js"
    }
  },
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts"
}

// src/index.js (source)
export function greet(name) {
  return `Hello, ${name}!`;
}

export default { greet };

// Build script creates both versions
// dist/cjs/index.js (CommonJS)
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greet = greet;
function greet(name) {
  return `Hello, ${name}!`;
}
exports.default = { greet };

// dist/esm/index.js (ES Module)
export function greet(name) {
  return `Hello, ${name}!`;
}
export default { greet };
```

---

## Revealing Module Pattern

### Implementation

```javascript
/**
 * Revealing Module Pattern
 * Exposes only specific members while keeping others private
 */

// database-pool.js
const createDatabasePool = (config) => {
  // Private state
  let connections = [];
  let isConnected = false;
  const maxConnections = config.maxConnections || 10;
  
  // Private methods
  const createConnection = async () => {
    console.log('Creating new connection...');
    return {
      id: Date.now(),
      query: async (sql) => ({ sql, rows: [] }),
      release: function() {
        this.inUse = false;
      },
      inUse: false
    };
  };
  
  const getAvailableConnection = () => {
    return connections.find(conn => !conn.inUse);
  };
  
  const validateConfig = () => {
    if (!config.host) throw new Error('Host is required');
    if (!config.database) throw new Error('Database is required');
  };
  
  // Public methods
  const connect = async () => {
    validateConfig();
    
    if (isConnected) {
      console.log('Already connected');
      return;
    }
    
    // Create initial connections
    for (let i = 0; i < Math.min(3, maxConnections); i++) {
      connections.push(await createConnection());
    }
    
    isConnected = true;
    console.log(`Connected with ${connections.length} initial connections`);
  };
  
  const getConnection = async () => {
    if (!isConnected) {
      throw new Error('Not connected. Call connect() first.');
    }
    
    let connection = getAvailableConnection();
    
    if (!connection && connections.length < maxConnections) {
      connection = await createConnection();
      connections.push(connection);
    }
    
    if (!connection) {
      throw new Error('No connections available');
    }
    
    connection.inUse = true;
    return connection;
  };
  
  const query = async (sql, params) => {
    const connection = await getConnection();
    try {
      return await connection.query(sql, params);
    } finally {
      connection.release();
    }
  };
  
  const disconnect = async () => {
    console.log('Closing all connections...');
    connections = [];
    isConnected = false;
  };
  
  const getStats = () => ({
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.inUse).length,
    availableConnections: connections.filter(c => !c.inUse).length,
    maxConnections
  });
  
  // Reveal only public interface
  return {
    connect,
    getConnection,
    query,
    disconnect,
    getStats
  };
};

module.exports = createDatabasePool;

// Usage
const createPool = require('./database-pool');

const pool = createPool({
  host: 'localhost',
  database: 'myapp',
  maxConnections: 20
});

await pool.connect();
const result = await pool.query('SELECT * FROM users');
console.log(pool.getStats());
await pool.disconnect();

/**
 * Service Module Example
 */
// user-service.js
const createUserService = (dependencies) => {
  const { db, cache, emailService } = dependencies;
  
  // Private
  const hashPassword = async (password) => {
    // Hash implementation
    return `hashed_${password}`;
  };
  
  const generateToken = () => {
    return Math.random().toString(36).substring(2);
  };
  
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Public
  const createUser = async (userData) => {
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email');
    }
    
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await db.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [userData.email, hashedPassword]
    );
    
    await emailService.sendWelcome(user.email);
    
    return { id: user.id, email: user.email };
  };
  
  const findById = async (id) => {
    const cached = await cache.get(`user:${id}`);
    if (cached) return JSON.parse(cached);
    
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (user) {
      await cache.set(`user:${id}`, JSON.stringify(user), 3600);
    }
    
    return user;
  };
  
  const updateUser = async (id, updates) => {
    const user = await db.query(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING *',
      [updates.email, id]
    );
    
    await cache.delete(`user:${id}`);
    
    return user;
  };
  
  const deleteUser = async (id) => {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    await cache.delete(`user:${id}`);
  };
  
  const login = async (email, password) => {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const hashedInput = await hashPassword(password);
    if (hashedInput !== user.password) {
      throw new Error('Invalid password');
    }
    
    const token = generateToken();
    await cache.set(`session:${token}`, user.id, 86400);
    
    return { token, user: { id: user.id, email: user.email } };
  };
  
  // Reveal public API
  return {
    createUser,
    findById,
    updateUser,
    deleteUser,
    login
  };
};

module.exports = createUserService;
```

---

## Dependency Injection

### Implementation Patterns

```javascript
/**
 * Manual Dependency Injection
 */

// interfaces (for documentation)
/**
 * @typedef {Object} ILogger
 * @property {function(string): void} info
 * @property {function(string): void} error
 */

/**
 * @typedef {Object} IDatabase
 * @property {function(string, any[]): Promise<any>} query
 */

// Implementations
class ConsoleLogger {
  info(message) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }
  
  error(message) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  }
}

class PostgresDatabase {
  constructor(connectionString) {
    this.connectionString = connectionString;
  }
  
  async query(sql, params = []) {
    console.log('Executing:', sql, params);
    return { rows: [] };
  }
}

// Service with injected dependencies
class UserService {
  constructor(logger, database) {
    this.logger = logger;
    this.database = database;
  }
  
  async createUser(userData) {
    this.logger.info(`Creating user: ${userData.email}`);
    
    try {
      const result = await this.database.query(
        'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
        [userData.email, userData.name]
      );
      
      this.logger.info(`User created: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }
}

// Composition Root
function createApp() {
  // Create dependencies
  const logger = new ConsoleLogger();
  const database = new PostgresDatabase(process.env.DATABASE_URL);
  
  // Inject dependencies
  const userService = new UserService(logger, database);
  
  return {
    userService
  };
}

const app = createApp();

/**
 * DI Container Implementation
 */
class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }
  
  register(name, factory, options = {}) {
    this.services.set(name, {
      factory,
      singleton: options.singleton || false
    });
    return this;
  }
  
  resolve(name) {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    
    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }
    
    return service.factory(this);
  }
  
  // Decorator for auto-injection
  inject(...dependencies) {
    return (target) => {
      return class extends target {
        constructor(...args) {
          const injected = dependencies.map(dep => this.container.resolve(dep));
          super(...injected, ...args);
        }
      };
    };
  }
}

// Usage
const container = new Container();

// Register services
container
  .register('logger', () => new ConsoleLogger(), { singleton: true })
  .register('database', () => new PostgresDatabase(process.env.DATABASE_URL), { singleton: true })
  .register('userService', (c) => new UserService(
    c.resolve('logger'),
    c.resolve('database')
  ));

// Resolve
const userService = container.resolve('userService');
await userService.createUser({ email: 'test@example.com', name: 'Test' });

/**
 * Testing with Mock Dependencies
 */
class MockLogger {
  constructor() {
    this.logs = [];
  }
  
  info(message) {
    this.logs.push({ level: 'info', message });
  }
  
  error(message) {
    this.logs.push({ level: 'error', message });
  }
}

class MockDatabase {
  constructor() {
    this.queries = [];
    this.mockResults = [];
  }
  
  setMockResult(result) {
    this.mockResults.push(result);
  }
  
  async query(sql, params) {
    this.queries.push({ sql, params });
    return this.mockResults.shift() || { rows: [] };
  }
}

// Test
describe('UserService', () => {
  let userService;
  let mockLogger;
  let mockDatabase;
  
  beforeEach(() => {
    mockLogger = new MockLogger();
    mockDatabase = new MockDatabase();
    userService = new UserService(mockLogger, mockDatabase);
  });
  
  it('should create a user', async () => {
    mockDatabase.setMockResult({ rows: [{ id: 1, email: 'test@example.com' }] });
    
    const result = await userService.createUser({ email: 'test@example.com', name: 'Test' });
    
    expect(result.email).toBe('test@example.com');
    expect(mockDatabase.queries).toHaveLength(1);
    expect(mockLogger.logs).toContainEqual({ level: 'info', message: expect.stringContaining('Creating user') });
  });
});
```

---

## Plugin Architecture

### Implementation

```javascript
/**
 * Plugin System
 * Extensible application architecture
 */

// plugin-manager.js
class PluginManager {
  constructor(app) {
    this.app = app;
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  // Register a hook point
  registerHook(name) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
  }
  
  // Add a hook handler
  addHook(name, handler, priority = 10) {
    if (!this.hooks.has(name)) {
      this.registerHook(name);
    }
    
    const hooks = this.hooks.get(name);
    hooks.push({ handler, priority });
    hooks.sort((a, b) => a.priority - b.priority);
  }
  
  // Execute hooks
  async executeHook(name, context = {}) {
    const hooks = this.hooks.get(name) || [];
    
    for (const { handler } of hooks) {
      await handler(context, this.app);
    }
    
    return context;
  }
  
  // Execute hooks with result transformation
  async executeHookWaterfall(name, initialValue) {
    const hooks = this.hooks.get(name) || [];
    let value = initialValue;
    
    for (const { handler } of hooks) {
      value = await handler(value, this.app);
    }
    
    return value;
  }
  
  // Register a plugin
  async register(plugin, options = {}) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} already registered`);
      return;
    }
    
    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Missing dependency: ${dep} for plugin ${plugin.name}`);
        }
      }
    }
    
    // Initialize plugin
    await plugin.register(this, options);
    
    this.plugins.set(plugin.name, { plugin, options });
    console.log(`Plugin registered: ${plugin.name}`);
  }
  
  // Get plugin instance
  getPlugin(name) {
    return this.plugins.get(name)?.plugin;
  }
  
  // Deregister a plugin
  async deregister(name) {
    const entry = this.plugins.get(name);
    if (entry && entry.plugin.deregister) {
      await entry.plugin.deregister(this);
    }
    this.plugins.delete(name);
  }
}

/**
 * Example Application with Plugin Support
 */
class Application {
  constructor() {
    this.plugins = new PluginManager(this);
    this.services = new Map();
    this.config = {};
    
    // Register core hooks
    this.plugins.registerHook('app:init');
    this.plugins.registerHook('app:ready');
    this.plugins.registerHook('request:before');
    this.plugins.registerHook('request:after');
    this.plugins.registerHook('response:transform');
  }
  
  async initialize() {
    await this.plugins.executeHook('app:init');
    await this.plugins.executeHook('app:ready');
  }
  
  registerService(name, service) {
    this.services.set(name, service);
  }
  
  getService(name) {
    return this.services.get(name);
  }
}

/**
 * Example Plugins
 */

// Logger Plugin
const LoggerPlugin = {
  name: 'logger',
  
  async register(manager, options) {
    const logger = {
      level: options.level || 'info',
      log: (level, message, meta) => {
        console.log(`[${level.toUpperCase()}] ${message}`, meta || '');
      },
      info: (msg, meta) => logger.log('info', msg, meta),
      error: (msg, meta) => logger.log('error', msg, meta),
      debug: (msg, meta) => logger.log('debug', msg, meta)
    };
    
    manager.app.registerService('logger', logger);
    
    // Add request logging hook
    manager.addHook('request:before', (ctx) => {
      ctx.startTime = Date.now();
      logger.info(`→ ${ctx.method} ${ctx.path}`);
    }, 1);
    
    manager.addHook('request:after', (ctx) => {
      const duration = Date.now() - ctx.startTime;
      logger.info(`← ${ctx.status} (${duration}ms)`);
    }, 100);
  }
};

// Authentication Plugin
const AuthPlugin = {
  name: 'auth',
  dependencies: ['logger'],
  
  async register(manager, options) {
    const logger = manager.app.getService('logger');
    
    const auth = {
      secret: options.secret,
      
      generateToken: (payload) => {
        return `token_${JSON.stringify(payload)}_${Date.now()}`;
      },
      
      verifyToken: (token) => {
        // Simplified verification
        if (!token) return null;
        try {
          const match = token.match(/token_(.+)_\d+/);
          return match ? JSON.parse(match[1]) : null;
        } catch {
          return null;
        }
      },
      
      middleware: (ctx, next) => {
        const token = ctx.headers?.authorization?.replace('Bearer ', '');
        const user = auth.verifyToken(token);
        
        if (!user) {
          logger.error('Authentication failed');
          ctx.status = 401;
          ctx.body = { error: 'Unauthorized' };
          return;
        }
        
        ctx.user = user;
        return next();
      }
    };
    
    manager.app.registerService('auth', auth);
    
    // Add auth check hook (optional, can be applied selectively)
    manager.addHook('request:before', async (ctx) => {
      if (ctx.requiresAuth) {
        const token = ctx.headers?.authorization?.replace('Bearer ', '');
        ctx.user = auth.verifyToken(token);
      }
    }, 10);
  }
};

// Caching Plugin
const CachePlugin = {
  name: 'cache',
  
  async register(manager, options) {
    const cache = new Map();
    const ttl = options.ttl || 60000;
    
    const cacheService = {
      get: (key) => {
        const entry = cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expires) {
          cache.delete(key);
          return null;
        }
        return entry.value;
      },
      
      set: (key, value, customTtl) => {
        cache.set(key, {
          value,
          expires: Date.now() + (customTtl || ttl)
        });
      },
      
      delete: (key) => cache.delete(key),
      clear: () => cache.clear()
    };
    
    manager.app.registerService('cache', cacheService);
    
    // Add response caching hook
    manager.addHook('response:transform', async (response) => {
      if (response.cacheable) {
        cacheService.set(response.cacheKey, response.body);
      }
      return response;
    });
  }
};

// Usage
const app = new Application();

await app.plugins.register(LoggerPlugin, { level: 'debug' });
await app.plugins.register(AuthPlugin, { secret: 'my-secret-key' });
await app.plugins.register(CachePlugin, { ttl: 30000 });

await app.initialize();

// Simulate request
const ctx = { method: 'GET', path: '/api/users', headers: {} };
await app.plugins.executeHook('request:before', ctx);
ctx.status = 200;
await app.plugins.executeHook('request:after', ctx);
```

---

## Summary

| Pattern | Purpose | Use Case |
|---------|---------|----------|
| **CommonJS** | Synchronous module loading | Node.js default, npm packages |
| **ES Modules** | Async module loading, tree-shaking | Modern Node.js, bundlers |
| **Revealing Module** | Encapsulate private state | Services, utilities |
| **Dependency Injection** | Decouple dependencies | Testable, maintainable code |
| **Plugin Architecture** | Extensible applications | Frameworks, CMS, tools |

मालिक, use these module patterns to build well-organized Node.js applications! 🚀
