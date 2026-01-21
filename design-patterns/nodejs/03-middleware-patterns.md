# Node.js Middleware Patterns

Middleware patterns enable request/response processing pipelines, commonly used in web frameworks like Express and Koa.

## Table of Contents
1. [Basic Middleware Pattern](#basic-middleware-pattern)
2. [Express Middleware](#express-middleware)
3. [Koa-style Middleware (Onion Model)](#koa-style-middleware)
4. [Pipeline Pattern](#pipeline-pattern)
5. [Chain of Responsibility](#chain-of-responsibility)

---

## Basic Middleware Pattern

### Core Implementation

```javascript
/**
 * Basic Middleware Runner
 * Foundation of all middleware patterns
 */
class MiddlewareRunner {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  async run(context) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(context, next);
      }
    };
    
    await next();
    return context;
  }
}

// Usage
const runner = new MiddlewareRunner();

runner.use(async (ctx, next) => {
  console.log('Middleware 1: Before');
  ctx.step1 = true;
  await next();
  console.log('Middleware 1: After');
});

runner.use(async (ctx, next) => {
  console.log('Middleware 2: Before');
  ctx.step2 = true;
  await next();
  console.log('Middleware 2: After');
});

runner.use(async (ctx, next) => {
  console.log('Middleware 3: Handler');
  ctx.handled = true;
});

await runner.run({ request: '/api/users' });
// Output:
// Middleware 1: Before
// Middleware 2: Before
// Middleware 3: Handler
// Middleware 2: After
// Middleware 1: After
```

---

## Express Middleware

### Common Express Middleware Patterns

```javascript
const express = require('express');
const app = express();

/**
 * 1. Request Logging Middleware
 */
const requestLogger = (options = {}) => {
  const { format = 'combined' } = options;
  
  return (req, res, next) => {
    const start = Date.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    res.end = function(...args) {
      const duration = Date.now() - start;
      const log = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
        ip: req.ip
      };
      
      console.log(format === 'json' ? JSON.stringify(log) : 
        `${log.method} ${log.url} ${log.status} ${log.duration}`);
      
      originalEnd.apply(res, args);
    };
    
    next();
  };
};

app.use(requestLogger({ format: 'json' }));

/**
 * 2. Authentication Middleware
 */
const authenticate = (options = {}) => {
  const { headerName = 'Authorization', scheme = 'Bearer' } = options;
  
  return async (req, res, next) => {
    try {
      const authHeader = req.get(headerName);
      
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
      }
      
      const [tokenScheme, token] = authHeader.split(' ');
      
      if (tokenScheme !== scheme) {
        return res.status(401).json({ error: 'Invalid authorization scheme' });
      }
      
      // Verify token (simplified)
      const decoded = verifyToken(token);
      req.user = decoded;
      
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

/**
 * 3. Authorization Middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage
app.get('/admin', authenticate(), authorize('admin'), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

/**
 * 4. Rate Limiting Middleware
 */
const rateLimit = (options = {}) => {
  const {
    windowMs = 60000,
    max = 100,
    message = 'Too many requests',
    keyGenerator = (req) => req.ip
  } = options;
  
  const requests = new Map();
  
  // Cleanup old entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requests) {
      if (now - data.startTime > windowMs) {
        requests.delete(key);
      }
    }
  }, windowMs);
  
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    let data = requests.get(key);
    
    if (!data || now - data.startTime > windowMs) {
      data = { count: 0, startTime: now };
      requests.set(key, data);
    }
    
    data.count++;
    
    // Set headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - data.count),
      'X-RateLimit-Reset': new Date(data.startTime + windowMs).toISOString()
    });
    
    if (data.count > max) {
      return res.status(429).json({ error: message });
    }
    
    next();
  };
};

app.use('/api/', rateLimit({ max: 100, windowMs: 60000 }));

/**
 * 5. Request Validation Middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    // Validate body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body);
      errors.push(...bodyErrors.map(e => ({ ...e, location: 'body' })));
    }
    
    // Validate query
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query);
      errors.push(...queryErrors.map(e => ({ ...e, location: 'query' })));
    }
    
    // Validate params
    if (schema.params) {
      const paramErrors = validateObject(req.params, schema.params);
      errors.push(...paramErrors.map(e => ({ ...e, location: 'params' })));
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  };
};

function validateObject(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === '')) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }
    
    if (value !== undefined) {
      if (rules.type && typeof value !== rules.type) {
        errors.push({ field, message: `${field} must be a ${rules.type}` });
      }
      
      if (rules.min && value.length < rules.min) {
        errors.push({ field, message: `${field} must be at least ${rules.min} characters` });
      }
      
      if (rules.max && value.length > rules.max) {
        errors.push({ field, message: `${field} must be at most ${rules.max} characters` });
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({ field, message: `${field} format is invalid` });
      }
    }
  }
  
  return errors;
}

// Usage
app.post('/users', validate({
  body: {
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, min: 8 },
    name: { required: true, min: 2, max: 50 }
  }
}), (req, res) => {
  // Handle valid request
});

/**
 * 6. Error Handling Middleware
 */
const errorHandler = (options = {}) => {
  const { includeStack = process.env.NODE_ENV === 'development' } = options;
  
  return (err, req, res, next) => {
    console.error('Error:', err);
    
    const statusCode = err.statusCode || err.status || 500;
    const response = {
      error: {
        message: err.message || 'Internal Server Error',
        code: err.code || 'INTERNAL_ERROR'
      }
    };
    
    if (includeStack) {
      response.error.stack = err.stack;
    }
    
    if (err.errors) {
      response.error.details = err.errors;
    }
    
    res.status(statusCode).json(response);
  };
};

// Must be last middleware
app.use(errorHandler());

/**
 * 7. CORS Middleware
 */
const cors = (options = {}) => {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = false,
    maxAge = 86400
  } = options;
  
  return (req, res, next) => {
    const requestOrigin = req.get('Origin');
    
    // Determine allowed origin
    let allowedOrigin = '*';
    if (typeof origin === 'function') {
      allowedOrigin = origin(requestOrigin) ? requestOrigin : '';
    } else if (Array.isArray(origin)) {
      allowedOrigin = origin.includes(requestOrigin) ? requestOrigin : '';
    } else if (origin !== '*') {
      allowedOrigin = origin === requestOrigin ? requestOrigin : '';
    }
    
    res.set({
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Max-Age': maxAge
    });
    
    if (credentials) {
      res.set('Access-Control-Allow-Credentials', 'true');
    }
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  };
};

app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  credentials: true
}));

/**
 * 8. Request Timeout Middleware
 */
const timeout = (ms = 30000) => {
  return (req, res, next) => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: 'Request timeout' });
      }
    }, ms);
    
    res.on('finish', () => clearTimeout(timeoutId));
    res.on('close', () => clearTimeout(timeoutId));
    
    next();
  };
};

app.use(timeout(30000));
```

---

## Koa-style Middleware

### Onion Model Implementation

```javascript
/**
 * Koa-style Middleware (Onion Model)
 * Each middleware wraps the next, allowing both
 * pre-processing and post-processing
 */
class KoaStyleApp {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  compose() {
    return (context) => {
      let index = -1;
      
      const dispatch = async (i) => {
        if (i <= index) {
          throw new Error('next() called multiple times');
        }
        
        index = i;
        const middleware = this.middlewares[i];
        
        if (!middleware) return;
        
        await middleware(context, () => dispatch(i + 1));
      };
      
      return dispatch(0);
    };
  }
  
  async handle(context) {
    const fn = this.compose();
    await fn(context);
    return context;
  }
}

// Usage
const app = new KoaStyleApp();

// Logging middleware - wraps entire request
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`→ ${ctx.method} ${ctx.path}`);
  
  await next();
  
  const duration = Date.now() - start;
  console.log(`← ${ctx.status} (${duration}ms)`);
});

// Error handling middleware - catches downstream errors
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
    console.error('Error caught:', err);
  }
});

// Authentication middleware
app.use(async (ctx, next) => {
  const token = ctx.headers.authorization;
  
  if (token) {
    ctx.user = await verifyToken(token);
  }
  
  await next();
});

// Response handler
app.use(async (ctx, next) => {
  ctx.status = 200;
  ctx.body = { message: 'Hello, World!' };
});

// Handle request
await app.handle({
  method: 'GET',
  path: '/api/test',
  headers: {},
  status: null,
  body: null
});

/**
 * Real-world Koa Middleware Examples
 */

// Body parser middleware
const bodyParser = () => async (ctx, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(ctx.method)) {
    ctx.request.body = await parseBody(ctx.req);
  }
  await next();
};

// Response time middleware
const responseTime = () => async (ctx, next) => {
  const start = process.hrtime.bigint();
  await next();
  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1e6;
  ctx.set('X-Response-Time', `${ms.toFixed(2)}ms`);
};

// Conditional middleware
const conditional = (condition, middleware) => async (ctx, next) => {
  if (condition(ctx)) {
    await middleware(ctx, next);
  } else {
    await next();
  }
};

// Usage
app.use(conditional(
  ctx => ctx.path.startsWith('/api'),
  authenticate()
));
```

---

## Pipeline Pattern

### Data Processing Pipeline

```javascript
/**
 * Pipeline Pattern
 * Process data through a series of transformations
 */
class Pipeline {
  constructor() {
    this.stages = [];
  }
  
  addStage(name, handler) {
    this.stages.push({ name, handler });
    return this;
  }
  
  async process(input) {
    let data = input;
    const results = [];
    
    for (const stage of this.stages) {
      try {
        const startTime = Date.now();
        data = await stage.handler(data);
        const duration = Date.now() - startTime;
        
        results.push({
          stage: stage.name,
          success: true,
          duration
        });
      } catch (error) {
        results.push({
          stage: stage.name,
          success: false,
          error: error.message
        });
        throw error;
      }
    }
    
    return { data, results };
  }
}

// Usage: Data processing pipeline
const dataProcessingPipeline = new Pipeline()
  .addStage('validate', async (data) => {
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid data format');
    }
    return data;
  })
  .addStage('transform', async (data) => {
    return {
      ...data,
      items: data.items.map(item => ({
        ...item,
        processedAt: new Date()
      }))
    };
  })
  .addStage('enrich', async (data) => {
    // Add additional data from external source
    return {
      ...data,
      metadata: {
        totalItems: data.items.length,
        enrichedAt: new Date()
      }
    };
  })
  .addStage('persist', async (data) => {
    // Save to database
    console.log('Saving to database...');
    return data;
  });

const result = await dataProcessingPipeline.process({
  items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
});

/**
 * HTTP Request Pipeline
 */
class RequestPipeline {
  constructor() {
    this.preProcessors = [];
    this.postProcessors = [];
    this.handler = null;
  }
  
  before(processor) {
    this.preProcessors.push(processor);
    return this;
  }
  
  after(processor) {
    this.postProcessors.push(processor);
    return this;
  }
  
  handle(handler) {
    this.handler = handler;
    return this;
  }
  
  async execute(request) {
    // Pre-processing
    let req = request;
    for (const processor of this.preProcessors) {
      req = await processor(req);
    }
    
    // Main handler
    let response = await this.handler(req);
    
    // Post-processing
    for (const processor of this.postProcessors) {
      response = await processor(response, req);
    }
    
    return response;
  }
  
  toMiddleware() {
    return async (req, res, next) => {
      try {
        const response = await this.execute(req);
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }
}

// Usage
const userCreationPipeline = new RequestPipeline()
  .before(async (req) => {
    // Validate request
    if (!req.body.email) {
      throw new Error('Email is required');
    }
    return req;
  })
  .before(async (req) => {
    // Normalize data
    req.body.email = req.body.email.toLowerCase();
    return req;
  })
  .handle(async (req) => {
    // Create user
    const user = await userService.create(req.body);
    return { success: true, user };
  })
  .after(async (response, req) => {
    // Send welcome email
    if (response.success) {
      await emailService.sendWelcome(response.user.email);
    }
    return response;
  })
  .after(async (response) => {
    // Log creation
    console.log('User created:', response.user.id);
    return response;
  });

app.post('/users', userCreationPipeline.toMiddleware());

/**
 * Stream Processing Pipeline
 */
const { Transform, pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

// Transform stream stages
const parseJSON = () => new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    try {
      const data = JSON.parse(chunk.toString());
      callback(null, data);
    } catch (error) {
      callback(error);
    }
  }
});

const filterValid = (predicate) => new Transform({
  objectMode: true,
  transform(data, encoding, callback) {
    if (predicate(data)) {
      callback(null, data);
    } else {
      callback(); // Skip invalid items
    }
  }
});

const transformData = (transformer) => new Transform({
  objectMode: true,
  transform(data, encoding, callback) {
    try {
      const transformed = transformer(data);
      callback(null, transformed);
    } catch (error) {
      callback(error);
    }
  }
});

// Usage
await pipelineAsync(
  inputStream,
  parseJSON(),
  filterValid(item => item.active),
  transformData(item => ({ ...item, processed: true })),
  outputStream
);
```

---

## Chain of Responsibility

### Handler Chain Implementation

```javascript
/**
 * Chain of Responsibility Pattern
 * Pass request along chain of handlers
 */
class Handler {
  constructor() {
    this.next = null;
  }
  
  setNext(handler) {
    this.next = handler;
    return handler;
  }
  
  async handle(request) {
    if (this.next) {
      return this.next.handle(request);
    }
    return null;
  }
}

/**
 * Authentication Chain
 */
class ApiKeyHandler extends Handler {
  async handle(request) {
    const apiKey = request.headers['x-api-key'];
    
    if (apiKey) {
      const valid = await this.validateApiKey(apiKey);
      if (valid) {
        request.authMethod = 'api-key';
        request.user = valid.user;
        return request;
      }
    }
    
    return super.handle(request);
  }
  
  async validateApiKey(key) {
    // Validate API key
    if (key === 'valid-api-key') {
      return { user: { id: 1, name: 'API User' } };
    }
    return null;
  }
}

class JwtHandler extends Handler {
  async handle(request) {
    const authHeader = request.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = await this.verifyToken(token);
        request.authMethod = 'jwt';
        request.user = decoded;
        return request;
      } catch (error) {
        // Token invalid, try next handler
      }
    }
    
    return super.handle(request);
  }
  
  async verifyToken(token) {
    // Verify JWT
    return { id: 1, name: 'JWT User' };
  }
}

class SessionHandler extends Handler {
  async handle(request) {
    const sessionId = request.cookies?.sessionId;
    
    if (sessionId) {
      const session = await this.getSession(sessionId);
      if (session) {
        request.authMethod = 'session';
        request.user = session.user;
        return request;
      }
    }
    
    return super.handle(request);
  }
  
  async getSession(sessionId) {
    // Get session from store
    return { user: { id: 1, name: 'Session User' } };
  }
}

class GuestHandler extends Handler {
  async handle(request) {
    request.authMethod = 'guest';
    request.user = null;
    return request;
  }
}

// Build chain
const authChain = new ApiKeyHandler();
authChain
  .setNext(new JwtHandler())
  .setNext(new SessionHandler())
  .setNext(new GuestHandler());

// Middleware using chain
const authenticateChain = async (req, res, next) => {
  await authChain.handle(req);
  next();
};

/**
 * Validation Chain
 */
class ValidationHandler {
  constructor() {
    this.next = null;
  }
  
  setNext(handler) {
    this.next = handler;
    return handler;
  }
  
  validate(data) {
    throw new Error('validate() must be implemented');
  }
  
  handle(data, errors = []) {
    const result = this.validate(data);
    if (result) {
      errors.push(result);
    }
    
    if (this.next) {
      return this.next.handle(data, errors);
    }
    
    return errors;
  }
}

class RequiredValidator extends ValidationHandler {
  constructor(field) {
    super();
    this.field = field;
  }
  
  validate(data) {
    if (!data[this.field]) {
      return { field: this.field, message: `${this.field} is required` };
    }
    return null;
  }
}

class EmailValidator extends ValidationHandler {
  constructor(field) {
    super();
    this.field = field;
  }
  
  validate(data) {
    const value = data[this.field];
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { field: this.field, message: 'Invalid email format' };
    }
    return null;
  }
}

class MinLengthValidator extends ValidationHandler {
  constructor(field, minLength) {
    super();
    this.field = field;
    this.minLength = minLength;
  }
  
  validate(data) {
    const value = data[this.field];
    if (value && value.length < this.minLength) {
      return { 
        field: this.field, 
        message: `${this.field} must be at least ${this.minLength} characters` 
      };
    }
    return null;
  }
}

// Build validation chain
const userValidationChain = new RequiredValidator('email');
userValidationChain
  .setNext(new EmailValidator('email'))
  .setNext(new RequiredValidator('password'))
  .setNext(new MinLengthValidator('password', 8))
  .setNext(new RequiredValidator('name'));

// Usage
const errors = userValidationChain.handle({
  email: 'invalid-email',
  password: 'short',
  name: ''
});

console.log(errors);
// [
//   { field: 'email', message: 'Invalid email format' },
//   { field: 'password', message: 'password must be at least 8 characters' },
//   { field: 'name', message: 'name is required' }
// ]
```

---

## Summary

| Pattern | Use Case | Framework |
|---------|----------|-----------|
| **Basic Middleware** | Simple request processing | Custom |
| **Express Middleware** | Web applications | Express |
| **Koa Middleware** | Async-first processing | Koa |
| **Pipeline** | Data transformation | Custom |
| **Chain of Responsibility** | Handler fallback | Custom |

मालिक, master these middleware patterns to build robust Node.js web applications! 🚀
