# Functional Design Patterns in JavaScript

Functional patterns leverage JavaScript's first-class functions to create reusable, composable, and testable code.

## Table of Contents
1. [Function Composition](#function-composition)
2. [Currying & Partial Application](#currying--partial-application)
3. [Memoization](#memoization)
4. [Higher-Order Functions](#higher-order-functions)
5. [Monads & Functors](#monads--functors)
6. [Immutability Patterns](#immutability-patterns)

---

## Function Composition

### What is it?
Combining simple functions to build more complex ones, where the output of one function becomes the input of the next.

### Practical Example: Data Processing Pipeline

```javascript
/**
 * Function Composition Utilities
 */

// Compose (right-to-left)
const compose = (...fns) => (x) => 
  fns.reduceRight((acc, fn) => fn(acc), x);

// Pipe (left-to-right)
const pipe = (...fns) => (x) => 
  fns.reduce((acc, fn) => fn(acc), x);

// Async pipe
const pipeAsync = (...fns) => (x) =>
  fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(x));

/**
 * Practical Example: User Data Processing
 */

// Simple, focused functions
const trim = (str) => str.trim();
const toLowerCase = (str) => str.toLowerCase();
const split = (delimiter) => (str) => str.split(delimiter);
const join = (delimiter) => (arr) => arr.join(delimiter);
const map = (fn) => (arr) => arr.map(fn);
const filter = (predicate) => (arr) => arr.filter(predicate);
const take = (n) => (arr) => arr.slice(0, n);

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const isNotEmpty = (str) => str.length > 0;

// Compose complex operations from simple ones
const normalizeUsername = pipe(
  trim,
  toLowerCase,
  split(' '),
  filter(isNotEmpty),
  join('_')
);

const formatName = pipe(
  trim,
  toLowerCase,
  split(' '),
  filter(isNotEmpty),
  map(capitalize),
  join(' ')
);

console.log(normalizeUsername('  John   Doe  ')); // 'john_doe'
console.log(formatName('  jOHN   dOE  ')); // 'John Doe'

/**
 * Data Transformation Pipeline
 */
const processUsers = pipe(
  filter(user => user.active),
  map(user => ({
    ...user,
    fullName: formatName(`${user.firstName} ${user.lastName}`),
    email: user.email.toLowerCase()
  })),
  filter(user => user.age >= 18),
  take(10)
);

const users = [
  { firstName: 'JOHN', lastName: 'DOE', email: 'JOHN@EXAMPLE.COM', age: 25, active: true },
  { firstName: 'jane', lastName: 'smith', email: 'Jane@Example.com', age: 17, active: true },
  { firstName: 'Bob', lastName: 'Wilson', email: 'bob@test.com', age: 30, active: false },
  { firstName: 'ALICE', lastName: 'brown', email: 'ALICE@TEST.COM', age: 22, active: true }
];

console.log(processUsers(users));
// [{ fullName: 'John Doe', email: 'john@example.com', ... }, { fullName: 'Alice Brown', ... }]

/**
 * Async Data Pipeline
 */
const fetchUser = async (id) => {
  // Simulated API call
  return { id, name: 'John Doe', email: 'john@example.com' };
};

const enrichWithOrders = async (user) => {
  // Simulated API call
  const orders = [{ id: 1, total: 99.99 }, { id: 2, total: 149.99 }];
  return { ...user, orders };
};

const calculateTotalSpent = (user) => ({
  ...user,
  totalSpent: user.orders.reduce((sum, o) => sum + o.total, 0)
});

const formatUserReport = (user) => ({
  name: user.name,
  email: user.email,
  orderCount: user.orders.length,
  totalSpent: `$${user.totalSpent.toFixed(2)}`
});

const getUserReport = pipeAsync(
  fetchUser,
  enrichWithOrders,
  calculateTotalSpent,
  formatUserReport
);

const report = await getUserReport(123);
console.log(report);
// { name: 'John Doe', email: 'john@example.com', orderCount: 2, totalSpent: '$249.98' }
```

---

## Currying & Partial Application

### What is it?
- **Currying**: Transforming a function with multiple arguments into a sequence of functions each taking a single argument.
- **Partial Application**: Pre-filling some arguments of a function.

### Practical Examples

```javascript
/**
 * Curry Implementation
 */
const curry = (fn) => {
  const arity = fn.length;
  
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried.apply(this, [...args, ...moreArgs]);
  };
};

// Auto-curry with placeholder support
const _ = Symbol('placeholder');

const curryWithPlaceholder = (fn) => {
  const arity = fn.length;
  
  return function curried(...args) {
    const actualArgs = args.filter(arg => arg !== _);
    
    if (actualArgs.length >= arity) {
      return fn.apply(this, actualArgs);
    }
    
    return (...moreArgs) => {
      const mergedArgs = args.map(arg => 
        arg === _ && moreArgs.length ? moreArgs.shift() : arg
      ).concat(moreArgs);
      
      return curried.apply(this, mergedArgs);
    };
  };
};

/**
 * Practical Example: API Request Builder
 */
const makeRequest = curry((method, baseUrl, endpoint, data) => {
  console.log(`${method} ${baseUrl}${endpoint}`, data || '');
  return { method, url: `${baseUrl}${endpoint}`, data };
});

// Create specialized functions
const apiGet = makeRequest('GET');
const apiPost = makeRequest('POST');
const apiPut = makeRequest('PUT');
const apiDelete = makeRequest('DELETE');

// Create API client for specific service
const userApi = apiGet('https://api.example.com')('/users');
const createUser = apiPost('https://api.example.com')('/users');

userApi(); // GET https://api.example.com/users
createUser({ name: 'John' }); // POST https://api.example.com/users { name: 'John' }

/**
 * Practical Example: Event Handler Factory
 */
const handleEvent = curry((eventType, handler, element, event) => {
  console.log(`[${eventType}] on ${element}:`, event);
  handler(event, element);
});

const handleClick = handleEvent('click');
const handleSubmit = handleEvent('submit');

const logAndPrevent = handleClick((event, element) => {
  event.preventDefault();
  console.log('Clicked:', element);
});

// Use with actual DOM
// document.querySelector('button').addEventListener('click', logAndPrevent('submitBtn'));

/**
 * Practical Example: Validation Rules
 */
const validate = curry((rule, errorMessage, value) => {
  const isValid = rule(value);
  return {
    isValid,
    value,
    error: isValid ? null : errorMessage
  };
});

// Create reusable validators
const isRequired = validate(
  (val) => val !== null && val !== undefined && val !== '',
  'This field is required'
);

const minLength = curry((min, value) => value.length >= min);
const maxLength = curry((max, value) => value.length <= max);
const matches = curry((regex, value) => regex.test(value));

const hasMinLength = (min) => validate(
  minLength(min),
  `Must be at least ${min} characters`
);

const hasMaxLength = (max) => validate(
  maxLength(max),
  `Must be no more than ${max} characters`
);

const isEmail = validate(
  matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  'Invalid email format'
);

// Compose validators
const validateField = (...validators) => (value) => {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) return result;
  }
  return { isValid: true, value, error: null };
};

const validateUsername = validateField(
  isRequired,
  hasMinLength(3),
  hasMaxLength(20)
);

const validateEmailField = validateField(
  isRequired,
  isEmail
);

console.log(validateUsername('')); // { isValid: false, error: 'This field is required' }
console.log(validateUsername('ab')); // { isValid: false, error: 'Must be at least 3 characters' }
console.log(validateUsername('john_doe')); // { isValid: true, value: 'john_doe' }

/**
 * Practical Example: Logger with Context
 */
const createLogger = curry((level, context, message, data) => {
  const timestamp = new Date().toISOString();
  const log = {
    timestamp,
    level,
    context,
    message,
    ...(data && { data })
  };
  console.log(JSON.stringify(log));
  return log;
});

const logInfo = createLogger('INFO');
const logError = createLogger('ERROR');
const logDebug = createLogger('DEBUG');

const userServiceLog = logInfo('UserService');
const authServiceLog = logInfo('AuthService');

userServiceLog('User created', { userId: 123 });
authServiceLog('Login successful', { userId: 123 });
```

---

## Memoization

### What is it?
Caching the results of expensive function calls and returning the cached result when the same inputs occur again.

### Practical Examples

```javascript
/**
 * Basic Memoization
 */
const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log(`Cache hit for: ${key}`);
      return cache.get(key);
    }
    
    console.log(`Computing for: ${key}`);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Memoization with TTL and Size Limit
 */
const memoizeAdvanced = (fn, options = {}) => {
  const { maxSize = 100, ttl = null } = options;
  const cache = new Map();
  
  const isExpired = (entry) => {
    if (!ttl) return false;
    return Date.now() - entry.timestamp > ttl;
  };
  
  const cleanup = () => {
    if (cache.size <= maxSize) return;
    
    // Remove oldest entries
    const entries = Array.from(cache.entries());
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, cache.size - maxSize)
      .forEach(([key]) => cache.delete(key));
  };
  
  return (...args) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && !isExpired(cached)) {
      return cached.value;
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    cleanup();
    
    return result;
  };
};

/**
 * Practical Example: Expensive Calculations
 */
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40)); // Fast due to memoization
console.log(fibonacci(40)); // Instant - from cache

/**
 * Practical Example: API Response Caching
 */
const memoizeAsync = (fn, options = {}) => {
  const { ttl = 60000 } = options;
  const cache = new Map();
  const pending = new Map();
  
  return async (...args) => {
    const key = JSON.stringify(args);
    
    // Check cache
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }
    
    // Check if request is already pending
    if (pending.has(key)) {
      return pending.get(key);
    }
    
    // Make request
    const promise = fn(...args).then(result => {
      cache.set(key, { value: result, timestamp: Date.now() });
      pending.delete(key);
      return result;
    }).catch(error => {
      pending.delete(key);
      throw error;
    });
    
    pending.set(key, promise);
    return promise;
  };
};

const fetchUserData = memoizeAsync(async (userId) => {
  console.log(`Fetching user ${userId}...`);
  await new Promise(r => setTimeout(r, 1000));
  return { id: userId, name: `User ${userId}` };
}, { ttl: 30000 });

// First call - makes request
await fetchUserData(1);

// Second call - returns cached
await fetchUserData(1);

// Parallel calls - only one request made
await Promise.all([
  fetchUserData(2),
  fetchUserData(2),
  fetchUserData(2)
]);

/**
 * Practical Example: Selector Memoization (like Reselect)
 */
const createSelector = (...inputSelectors) => {
  const resultFunc = inputSelectors.pop();
  let lastArgs = null;
  let lastResult = null;
  
  return (state) => {
    const args = inputSelectors.map(selector => selector(state));
    
    // Check if inputs changed
    if (lastArgs && args.every((arg, i) => arg === lastArgs[i])) {
      return lastResult;
    }
    
    lastArgs = args;
    lastResult = resultFunc(...args);
    return lastResult;
  };
};

// State
const state = {
  users: [
    { id: 1, name: 'John', department: 'Engineering' },
    { id: 2, name: 'Jane', department: 'Marketing' },
    { id: 3, name: 'Bob', department: 'Engineering' }
  ],
  selectedDepartment: 'Engineering'
};

// Selectors
const getUsers = (state) => state.users;
const getSelectedDepartment = (state) => state.selectedDepartment;

const getFilteredUsers = createSelector(
  getUsers,
  getSelectedDepartment,
  (users, department) => {
    console.log('Computing filtered users...');
    return users.filter(u => u.department === department);
  }
);

console.log(getFilteredUsers(state)); // Computes
console.log(getFilteredUsers(state)); // Returns cached
```

---

## Higher-Order Functions

### What is it?
Functions that take functions as arguments or return functions as results.

### Practical Examples

```javascript
/**
 * Common Higher-Order Functions
 */

// Debounce - Delay execution until pause in calls
const debounce = (fn, delay) => {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

// Throttle - Limit execution frequency
const throttle = (fn, limit) => {
  let inThrottle = false;
  
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Once - Execute only once
const once = (fn) => {
  let called = false;
  let result;
  
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
};

// After - Execute after N calls
const after = (n, fn) => {
  let count = 0;
  
  return function(...args) {
    if (++count >= n) {
      return fn.apply(this, args);
    }
  };
};

// Before - Execute until N calls
const before = (n, fn) => {
  let count = 0;
  let result;
  
  return function(...args) {
    if (++count < n) {
      result = fn.apply(this, args);
    }
    return result;
  };
};

/**
 * Practical Example: Search Input with Debounce
 */
class SearchComponent {
  constructor() {
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
  }
  
  onInput(query) {
    console.log('Input:', query);
    this.debouncedSearch(query);
  }
  
  performSearch(query) {
    console.log('Searching for:', query);
    // API call here
  }
}

const search = new SearchComponent();
search.onInput('h');
search.onInput('he');
search.onInput('hel');
search.onInput('hello'); // Only this triggers search after 300ms

/**
 * Practical Example: Rate-Limited API Calls
 */
const createRateLimitedFunction = (fn, callsPerSecond) => {
  const minInterval = 1000 / callsPerSecond;
  let lastCallTime = 0;
  const queue = [];
  
  const processQueue = () => {
    if (queue.length === 0) return;
    
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall >= minInterval) {
      const { args, resolve, reject } = queue.shift();
      lastCallTime = now;
      
      Promise.resolve(fn(...args))
        .then(resolve)
        .catch(reject);
      
      if (queue.length > 0) {
        setTimeout(processQueue, minInterval);
      }
    } else {
      setTimeout(processQueue, minInterval - timeSinceLastCall);
    }
  };
  
  return (...args) => new Promise((resolve, reject) => {
    queue.push({ args, resolve, reject });
    processQueue();
  });
};

const apiCall = async (endpoint) => {
  console.log(`Calling ${endpoint} at ${Date.now()}`);
  return { endpoint, data: 'result' };
};

const rateLimitedApi = createRateLimitedFunction(apiCall, 2); // 2 calls per second

// These will be rate-limited
Promise.all([
  rateLimitedApi('/users/1'),
  rateLimitedApi('/users/2'),
  rateLimitedApi('/users/3'),
  rateLimitedApi('/users/4'),
  rateLimitedApi('/users/5')
]);

/**
 * Practical Example: Retry with Backoff
 */
const withRetry = (fn, options = {}) => {
  const { maxRetries = 3, backoff = 1000, shouldRetry = () => true } = options;
  
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries && shouldRetry(error)) {
          const delay = backoff * Math.pow(2, attempt);
          console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    
    throw lastError;
  };
};

const unreliableApi = withRetry(async (url) => {
  const random = Math.random();
  if (random < 0.7) {
    throw new Error('Random failure');
  }
  return { success: true, url };
}, {
  maxRetries: 3,
  backoff: 500,
  shouldRetry: (error) => error.message !== 'Fatal error'
});

/**
 * Practical Example: Middleware Pattern
 */
const createMiddlewareRunner = () => {
  const middlewares = [];
  
  const use = (middleware) => {
    middlewares.push(middleware);
  };
  
  const run = async (context, finalHandler) => {
    let index = 0;
    
    const next = async () => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        await middleware(context, next);
      } else if (finalHandler) {
        await finalHandler(context);
      }
    };
    
    await next();
    return context;
  };
  
  return { use, run };
};

// Usage
const pipeline = createMiddlewareRunner();

pipeline.use(async (ctx, next) => {
  console.log('Start logging');
  ctx.startTime = Date.now();
  await next();
  console.log(`Request took ${Date.now() - ctx.startTime}ms`);
});

pipeline.use(async (ctx, next) => {
  console.log('Authenticating...');
  ctx.user = { id: 1, name: 'John' };
  await next();
});

pipeline.use(async (ctx, next) => {
  console.log('Validating...');
  if (!ctx.data) {
    ctx.data = { validated: true };
  }
  await next();
});

pipeline.run({ request: '/api/users' }, (ctx) => {
  console.log('Final handler:', ctx);
});
```

---

## Monads & Functors

### What is it?
- **Functor**: A container that can be mapped over (has a `map` method)
- **Monad**: A functor that also has `flatMap`/`chain` for handling nested structures

### Practical Examples

```javascript
/**
 * Maybe Monad - Handle null/undefined safely
 */
class Maybe {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Maybe(value);
  }
  
  static nothing() {
    return new Maybe(null);
  }
  
  isNothing() {
    return this.value === null || this.value === undefined;
  }
  
  map(fn) {
    return this.isNothing() ? Maybe.nothing() : Maybe.of(fn(this.value));
  }
  
  flatMap(fn) {
    return this.isNothing() ? Maybe.nothing() : fn(this.value);
  }
  
  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this.value;
  }
  
  filter(predicate) {
    if (this.isNothing()) return Maybe.nothing();
    return predicate(this.value) ? this : Maybe.nothing();
  }
}

// Usage
const user = {
  name: 'John',
  address: {
    street: '123 Main St',
    city: 'NYC'
  }
};

const userWithoutAddress = {
  name: 'Jane'
};

const getCity = (user) =>
  Maybe.of(user)
    .map(u => u.address)
    .map(a => a.city)
    .getOrElse('Unknown');

console.log(getCity(user)); // 'NYC'
console.log(getCity(userWithoutAddress)); // 'Unknown'
console.log(getCity(null)); // 'Unknown'

/**
 * Either Monad - Handle success/failure
 */
class Either {
  constructor(value, isRight = true) {
    this.value = value;
    this.isRight = isRight;
  }
  
  static right(value) {
    return new Either(value, true);
  }
  
  static left(value) {
    return new Either(value, false);
  }
  
  map(fn) {
    return this.isRight ? Either.right(fn(this.value)) : this;
  }
  
  flatMap(fn) {
    return this.isRight ? fn(this.value) : this;
  }
  
  fold(leftFn, rightFn) {
    return this.isRight ? rightFn(this.value) : leftFn(this.value);
  }
  
  getOrElse(defaultValue) {
    return this.isRight ? this.value : defaultValue;
  }
}

// Validation with Either
const validateEmail = (email) => {
  if (!email) return Either.left('Email is required');
  if (!email.includes('@')) return Either.left('Invalid email format');
  return Either.right(email);
};

const validatePassword = (password) => {
  if (!password) return Either.left('Password is required');
  if (password.length < 8) return Either.left('Password too short');
  return Either.right(password);
};

const validateUser = (email, password) => {
  return validateEmail(email)
    .flatMap(validEmail => 
      validatePassword(password)
        .map(validPassword => ({ email: validEmail, password: validPassword }))
    );
};

console.log(validateUser('john@example.com', 'password123')
  .fold(
    error => ({ success: false, error }),
    user => ({ success: true, user })
  ));

console.log(validateUser('invalid', 'short')
  .fold(
    error => ({ success: false, error }),
    user => ({ success: true, user })
  ));

/**
 * Result Type - Like Either but more explicit
 */
class Result {
  constructor(value, error) {
    this.value = value;
    this.error = error;
  }
  
  static ok(value) {
    return new Result(value, null);
  }
  
  static err(error) {
    return new Result(null, error);
  }
  
  isOk() {
    return this.error === null;
  }
  
  isErr() {
    return this.error !== null;
  }
  
  map(fn) {
    return this.isOk() ? Result.ok(fn(this.value)) : this;
  }
  
  mapErr(fn) {
    return this.isErr() ? Result.err(fn(this.error)) : this;
  }
  
  flatMap(fn) {
    return this.isOk() ? fn(this.value) : this;
  }
  
  unwrap() {
    if (this.isErr()) throw new Error(this.error);
    return this.value;
  }
  
  unwrapOr(defaultValue) {
    return this.isOk() ? this.value : defaultValue;
  }
  
  match({ ok, err }) {
    return this.isOk() ? ok(this.value) : err(this.error);
  }
}

// Practical usage
const parseJSON = (str) => {
  try {
    return Result.ok(JSON.parse(str));
  } catch (e) {
    return Result.err(`Invalid JSON: ${e.message}`);
  }
};

const extractField = (field) => (obj) => {
  if (obj[field] === undefined) {
    return Result.err(`Field '${field}' not found`);
  }
  return Result.ok(obj[field]);
};

const processConfig = (jsonStr) => 
  parseJSON(jsonStr)
    .flatMap(extractField('database'))
    .flatMap(extractField('host'))
    .match({
      ok: host => console.log(`Connecting to: ${host}`),
      err: error => console.error(`Config error: ${error}`)
    });

processConfig('{"database": {"host": "localhost"}}');
processConfig('{"database": {}}');
processConfig('invalid json');
```

---

## Immutability Patterns

### Practical Examples

```javascript
/**
 * Immutable Object Updates
 */

// Shallow updates
const updateUser = (user, updates) => ({
  ...user,
  ...updates,
  updatedAt: new Date()
});

// Deep updates with path
const setIn = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  const newObj = { ...obj };
  let current = newObj;
  
  for (const key of keys) {
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  current[lastKey] = value;
  return newObj;
};

const getIn = (obj, path, defaultValue) => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
};

const updateIn = (obj, path, updater) => {
  const currentValue = getIn(obj, path);
  return setIn(obj, path, updater(currentValue));
};

// Usage
const state = {
  user: {
    profile: {
      name: 'John',
      settings: {
        theme: 'light',
        notifications: true
      }
    }
  }
};

const newState = setIn(state, 'user.profile.settings.theme', 'dark');
console.log(state.user.profile.settings.theme); // 'light' (unchanged)
console.log(newState.user.profile.settings.theme); // 'dark'

/**
 * Immutable Array Operations
 */
const ImmutableArray = {
  push: (arr, item) => [...arr, item],
  pop: (arr) => arr.slice(0, -1),
  shift: (arr) => arr.slice(1),
  unshift: (arr, item) => [item, ...arr],
  remove: (arr, index) => [...arr.slice(0, index), ...arr.slice(index + 1)],
  insert: (arr, index, item) => [...arr.slice(0, index), item, ...arr.slice(index)],
  update: (arr, index, updater) => arr.map((item, i) => i === index ? updater(item) : item),
  move: (arr, from, to) => {
    const item = arr[from];
    const without = [...arr.slice(0, from), ...arr.slice(from + 1)];
    return [...without.slice(0, to), item, ...without.slice(to)];
  }
};

const todos = [
  { id: 1, text: 'Learn JS', done: false },
  { id: 2, text: 'Learn React', done: false }
];

const withNewTodo = ImmutableArray.push(todos, { id: 3, text: 'Build app', done: false });
const withToggled = ImmutableArray.update(withNewTodo, 0, todo => ({ ...todo, done: true }));

console.log(todos[0].done); // false (unchanged)
console.log(withToggled[0].done); // true

/**
 * Immutable State Manager
 */
class ImmutableStore {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Set();
    this.history = [initialState];
    this.historyIndex = 0;
  }
  
  getState() {
    return this.state;
  }
  
  setState(updater) {
    const newState = typeof updater === 'function' 
      ? updater(this.state) 
      : updater;
    
    if (newState === this.state) return;
    
    // Trim future history if we've gone back
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(newState);
    this.historyIndex++;
    
    this.state = newState;
    this.notify();
  }
  
  setIn(path, value) {
    this.setState(setIn(this.state, path, value));
  }
  
  updateIn(path, updater) {
    this.setState(updateIn(this.state, path, updater));
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = this.history[this.historyIndex];
      this.notify();
    }
  }
  
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = this.history[this.historyIndex];
      this.notify();
    }
  }
  
  canUndo() {
    return this.historyIndex > 0;
  }
  
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }
}

// Usage
const store = new ImmutableStore({
  count: 0,
  user: { name: 'John' }
});

store.subscribe(state => console.log('State changed:', state));

store.setState(state => ({ ...state, count: state.count + 1 }));
store.setIn('user.name', 'Jane');
store.updateIn('count', c => c + 10);

console.log(store.getState()); // { count: 11, user: { name: 'Jane' } }

store.undo();
console.log(store.getState()); // { count: 1, user: { name: 'Jane' } }

store.undo();
console.log(store.getState()); // { count: 1, user: { name: 'John' } }

store.redo();
console.log(store.getState()); // { count: 1, user: { name: 'Jane' } }
```

---

## Summary

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| **Composition** | Combine functions | Data pipelines, transformations |
| **Currying** | Partial application | Reusable configured functions |
| **Memoization** | Cache results | Expensive computations, API calls |
| **Higher-Order Functions** | Functions that manipulate functions | Middleware, decorators, utilities |
| **Monads** | Handle side effects | Null safety, error handling |
| **Immutability** | Never mutate data | State management, undo/redo |

मालिक, master these functional patterns for cleaner, more predictable code! 🚀
