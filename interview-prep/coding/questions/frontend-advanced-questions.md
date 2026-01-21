# Advanced Frontend JavaScript Interview Questions

## Table of Contents
1. [Virtual DOM & Reconciliation](#virtual-dom--reconciliation)
2. [Event Loop & Microtasks](#event-loop--microtasks)
3. [Memory Management & Leaks](#memory-management--leaks)
4. [Service Workers & PWA](#service-workers--pwa)
5. [Advanced Promises & Async Patterns](#advanced-promises--async-patterns)
6. [Browser Rendering Pipeline](#browser-rendering-pipeline)
7. [Advanced DOM Manipulation](#advanced-dom-manipulation)
8. [State Management Patterns](#state-management-patterns)
9. [Performance Optimization](#performance-optimization)
10. [Security & XSS Prevention](#security--xss-prevention)

---

## Virtual DOM & Reconciliation

### Question 1: Implement a Simple Virtual DOM

**Problem**: Create a basic Virtual DOM implementation with diff and patch algorithms.

```javascript
/**
 * Virtual DOM Node Structure
 */
class VNode {
  constructor(tag, props = {}, children = []) {
    this.tag = tag;
    this.props = props;
    this.children = children;
  }
}

/**
 * Create Virtual Node (JSX alternative)
 */
function h(tag, props, ...children) {
  return new VNode(
    tag,
    props || {},
    children.flat()
  );
}

/**
 * Render VNode to Real DOM
 */
function render(vnode) {
  // Text node
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(vnode);
  }
  
  // Create element
  const element = document.createElement(vnode.tag);
  
  // Set properties
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key.startsWith('on')) {
      // Event listener
      const event = key.slice(2).toLowerCase();
      element.addEventListener(event, value);
    } else if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Render children
  vnode.children.forEach(child => {
    element.appendChild(render(child));
  });
  
  return element;
}

/**
 * Diff Algorithm - Compare two VNodes
 */
function diff(oldVNode, newVNode) {
  // Node removed
  if (!newVNode) {
    return { type: 'REMOVE' };
  }
  
  // Node added
  if (!oldVNode) {
    return { type: 'CREATE', newVNode };
  }
  
  // Different types - replace
  if (typeof oldVNode !== typeof newVNode || oldVNode.tag !== newVNode.tag) {
    return { type: 'REPLACE', newVNode };
  }
  
  // Text node changed
  if (typeof newVNode === 'string' || typeof newVNode === 'number') {
    if (oldVNode !== newVNode) {
      return { type: 'TEXT', newVNode };
    }
    return null;
  }
  
  // Props changed
  const propPatches = diffProps(oldVNode.props, newVNode.props);
  
  // Children changed
  const childPatches = [];
  const maxLen = Math.max(oldVNode.children.length, newVNode.children.length);
  
  for (let i = 0; i < maxLen; i++) {
    childPatches.push(diff(oldVNode.children[i], newVNode.children[i]));
  }
  
  if (propPatches.length > 0 || childPatches.some(p => p)) {
    return {
      type: 'UPDATE',
      propPatches,
      childPatches
    };
  }
  
  return null;
}

/**
 * Diff Props
 */
function diffProps(oldProps, newProps) {
  const patches = [];
  
  // Check modified/removed props
  Object.keys(oldProps).forEach(key => {
    if (!(key in newProps)) {
      patches.push({ type: 'REMOVE', key });
    } else if (oldProps[key] !== newProps[key]) {
      patches.push({ type: 'UPDATE', key, value: newProps[key] });
    }
  });
  
  // Check added props
  Object.keys(newProps).forEach(key => {
    if (!(key in oldProps)) {
      patches.push({ type: 'ADD', key, value: newProps[key] });
    }
  });
  
  return patches;
}

/**
 * Patch - Apply changes to real DOM
 */
function patch(parent, patch, node, index = 0) {
  if (!patch) return node;
  
  switch (patch.type) {
    case 'CREATE': {
      const newNode = render(patch.newVNode);
      parent.appendChild(newNode);
      return newNode;
    }
    
    case 'REMOVE': {
      parent.removeChild(node);
      return null;
    }
    
    case 'REPLACE': {
      const newNode = render(patch.newVNode);
      parent.replaceChild(newNode, node);
      return newNode;
    }
    
    case 'TEXT': {
      node.textContent = patch.newVNode;
      return node;
    }
    
    case 'UPDATE': {
      // Apply prop patches
      patch.propPatches.forEach(propPatch => {
        const { type, key, value } = propPatch;
        
        if (type === 'REMOVE') {
          node.removeAttribute(key);
        } else if (type === 'UPDATE' || type === 'ADD') {
          if (key.startsWith('on')) {
            // Event listener update needed
          } else if (key === 'className') {
            node.className = value;
          } else {
            node.setAttribute(key, value);
          }
        }
      });
      
      // Apply child patches
      const children = Array.from(node.childNodes);
      patch.childPatches.forEach((childPatch, i) => {
        patch(node, childPatch, children[i], i);
      });
      
      return node;
    }
  }
}

// Usage Example
const oldVTree = h('div', { id: 'app', className: 'container' },
  h('h1', {}, 'Hello'),
  h('p', {}, 'World')
);

const newVTree = h('div', { id: 'app', className: 'container' },
  h('h1', {}, 'Hello'),
  h('p', {}, 'React!'),
  h('button', { onClick: () => alert('clicked') }, 'Click me')
);

// Initial render
const root = document.getElementById('root');
let currentNode = render(oldVTree);
root.appendChild(currentNode);

// Update
setTimeout(() => {
  const patches = diff(oldVTree, newVTree);
  currentNode = patch(root, patches, currentNode);
}, 2000);
```

**Key Concepts Tested**:
- Understanding of Virtual DOM concept
- Diff algorithm implementation
- Reconciliation process
- DOM manipulation optimization

---

## Event Loop & Microtasks

### Question 2: Predict the Output

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve()
  .then(() => console.log('3'))
  .then(() => console.log('4'));

queueMicrotask(() => console.log('5'));

async function asyncFunc() {
  console.log('6');
  await Promise.resolve();
  console.log('7');
}

asyncFunc();

Promise.resolve().then(() => {
  console.log('8');
  setTimeout(() => console.log('9'), 0);
});

console.log('10');

// What's the output order?
```

**Answer**: `1, 6, 10, 3, 5, 8, 4, 7, 2, 9`

**Explanation**:
1. Synchronous code runs first: 1, 6, 10
2. Microtasks queue (before next task): 3, 5, 8, 4, 7
3. Task queue (macrotasks): 2, 9

### Question 3: Implement a Custom Event Loop Simulator

```javascript
/**
 * Simplified Event Loop Simulator
 */
class EventLoopSimulator {
  constructor() {
    this.macroTasks = [];
    this.microTasks = [];
    this.isRunning = false;
  }
  
  setTimeout(callback, delay = 0) {
    const task = {
      callback,
      executeAt: Date.now() + delay,
      type: 'macrotask'
    };
    
    this.macroTasks.push(task);
    this.macroTasks.sort((a, b) => a.executeAt - b.executeAt);
    
    if (!this.isRunning) {
      this.run();
    }
  }
  
  queueMicrotask(callback) {
    this.microTasks.push({
      callback,
      type: 'microtask'
    });
    
    if (!this.isRunning) {
      this.run();
    }
  }
  
  Promise(executor) {
    return new Promise((resolve, reject) => {
      executor(
        (value) => {
          this.queueMicrotask(() => resolve(value));
        },
        (error) => {
          this.queueMicrotask(() => reject(error));
        }
      );
    });
  }
  
  async run() {
    this.isRunning = true;
    
    while (this.macroTasks.length > 0 || this.microTasks.length > 0) {
      // Process all microtasks first
      while (this.microTasks.length > 0) {
        const task = this.microTasks.shift();
        console.log('Executing microtask:', task.type);
        task.callback();
      }
      
      // Process one macrotask
      if (this.macroTasks.length > 0) {
        const now = Date.now();
        const task = this.macroTasks[0];
        
        if (task.executeAt <= now) {
          this.macroTasks.shift();
          console.log('Executing macrotask:', task.type);
          task.callback();
        } else {
          // Wait for next task
          await new Promise(resolve => 
            setTimeout(resolve, task.executeAt - now)
          );
        }
      }
    }
    
    this.isRunning = false;
  }
}

// Usage
const eventLoop = new EventLoopSimulator();

console.log('Start');

eventLoop.setTimeout(() => {
  console.log('Timeout 1');
  eventLoop.queueMicrotask(() => console.log('Microtask 1'));
}, 100);

eventLoop.queueMicrotask(() => console.log('Microtask 2'));

eventLoop.setTimeout(() => console.log('Timeout 2'), 50);

console.log('End');
```

---

## Memory Management & Leaks

### Question 4: Find and Fix Memory Leaks

```javascript
// ❌ BAD: Memory Leak Examples

// 1. Forgotten Event Listeners
class BadComponent {
  constructor() {
    window.addEventListener('resize', this.handleResize.bind(this));
    // Never removed! Leaks on component destroy
  }
  
  handleResize() {
    console.log('Resized');
  }
}

// 2. Timers Not Cleared
class BadTimer {
  start() {
    this.interval = setInterval(() => {
      this.doWork();
    }, 1000);
    // Never cleared! Keeps running forever
  }
}

// 3. Detached DOM References
let elements = [];
function addElement() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  elements.push(div); // Still referenced after removal!
}

function removeAllElements() {
  document.body.innerHTML = ''; // DOM cleared but elements array still holds refs
}

// 4. Closure Capturing Too Much
function createHugeClosures() {
  const hugeArray = new Array(1000000);
  
  return () => {
    // Only needs index, but captures entire hugeArray!
    console.log(hugeArray.length);
  };
}

// ✅ GOOD: Fixed Versions

// 1. Clean Event Listeners
class GoodComponent {
  constructor() {
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  
  handleResize() {
    console.log('Resized');
  }
  
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.handleResize = null; // Clear reference
  }
}

// 2. Clear Timers
class GoodTimer {
  start() {
    this.interval = setInterval(() => {
      this.doWork();
    }, 1000);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// 3. Use WeakMap for DOM References
const elementMetadata = new WeakMap();

function addElementWithMetadata() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  
  // WeakMap allows GC when DOM element is removed
  elementMetadata.set(div, { id: Date.now() });
}

// 4. Minimize Closure Scope
function createSmallClosures() {
  const hugeArray = new Array(1000000);
  const length = hugeArray.length; // Extract only what's needed
  
  return () => {
    console.log(length); // Only captures length, not array
  };
}

/**
 * Memory Leak Detector
 */
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
  }
  
  takeSnapshot() {
    if (performance.memory) {
      this.snapshots.push({
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize
      });
    }
  }
  
  analyze() {
    if (this.snapshots.length < 2) {
      return 'Need at least 2 snapshots';
    }
    
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    
    const growth = last.usedJSHeapSize - first.usedJSHeapSize;
    const growthPercent = (growth / first.usedJSHeapSize) * 100;
    
    console.log('Memory Analysis:');
    console.log(`Initial: ${(first.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Final: ${(last.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Growth: ${(growth / 1024 / 1024).toFixed(2)} MB (${growthPercent.toFixed(2)}%)`);
    
    if (growthPercent > 10) {
      console.warn('⚠️ Potential memory leak detected!');
    }
  }
}

// Usage
const detector = new MemoryLeakDetector();

detector.takeSnapshot();
// Do some operations
setTimeout(() => {
  detector.takeSnapshot();
  detector.analyze();
}, 5000);
```

---

## Service Workers & PWA

### Question 5: Implement Advanced Service Worker

```javascript
// service-worker.js

const CACHE_VERSION = 'v1';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

// Cache strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Routes configuration
const ROUTES = [
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
    strategy: STRATEGIES.CACHE_FIRST
  },
  {
    pattern: /\.(?:js|css)$/,
    strategy: STRATEGIES.STALE_WHILE_REVALIDATE
  },
  {
    pattern: /\/api\//,
    strategy: STRATEGIES.NETWORK_FIRST
  }
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/manifest.json'
      ]);
    }).then(() => {
      return self.skipWaiting(); // Activate immediately
    })
  );
});

/**
 * Activate Event - Clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim(); // Take control immediately
    })
  );
});

/**
 * Fetch Event - Intercept requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Find matching route
  const route = ROUTES.find(r => r.pattern.test(url.pathname));
  const strategy = route ? route.strategy : STRATEGIES.NETWORK_FIRST;
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    const cache = caches.open(CACHE_NAME);
    cache.then(c => c.put(request, response.clone()));
    return response;
  });
  
  return cached || fetchPromise;
}

/**
 * Handle Request with Strategy
 */
function handleRequest(request, strategy) {
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    
    case STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    default:
      return networkFirst(request);
  }
}

/**
 * Background Sync
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  const db = await openDB();
  const pendingRequests = await db.getAll('pending');
  
  for (const req of pendingRequests) {
    try {
      await fetch(req.url, req.options);
      await db.delete('pending', req.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: data.url
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
```

---

## Advanced Promises & Async Patterns

### Question 6: Implement Promise Utilities

```javascript
/**
 * Promise.allSettled implementation
 */
function allSettled(promises) {
  return Promise.all(
    promises.map(promise =>
      Promise.resolve(promise)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
}

/**
 * Promise.race with timeout
 */
function raceWithTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const backoffDelay = delay * Math.pow(2, i);
      console.log(`Retry ${i + 1} after ${backoffDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}

/**
 * Parallel execution with concurrency limit
 */
async function parallelLimit(tasks, limit) {
  const results = [];
  const executing = [];
  
  for (const [index, task] of tasks.entries()) {
    const promise = Promise.resolve().then(() => task()).then(
      result => {
        results[index] = result;
      }
    );
    
    results.push(promise);
    
    if (limit <= tasks.length) {
      const executing = promise.then(() => 
        executing.splice(executing.indexOf(promise), 1)
      );
      
      executing.push(executing);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  await Promise.all(results);
  return results;
}

/**
 * Promise pool
 */
class PromisePool {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async add(task) {
    while (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    
    try {
      return await task();
    } finally {
      this.running--;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

// Usage
const pool = new PromisePool(2);

const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3'),
  () => fetch('/api/4'),
  () => fetch('/api/5')
];

Promise.all(tasks.map(task => pool.add(task)))
  .then(results => console.log('All done!', results));
```

---

## Browser Rendering Pipeline

### Question 7: Optimize Rendering Performance

```javascript
/**
 * FastDOM - Read/Write batching
 */
class FastDOM {
  constructor() {
    this.reads = [];
    this.writes = [];
    this.scheduled = false;
  }
  
  measure(callback) {
    this.reads.push(callback);
    this.schedule();
    
    return new Promise(resolve => {
      callback.resolve = resolve;
    });
  }
  
  mutate(callback) {
    this.writes.push(callback);
    this.schedule();
    
    return new Promise(resolve => {
      callback.resolve = resolve;
    });
  }
  
  schedule() {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }
  
  flush() {
    // Execute all reads
    let read;
    while (read = this.reads.shift()) {
      const result = read();
      if (read.resolve) read.resolve(result);
    }
    
    // Execute all writes
    let write;
    while (write = this.writes.shift()) {
      const result = write();
      if (write.resolve) write.resolve(result);
    }
    
    this.scheduled = false;
  }
}

// Usage
const fastdom = new FastDOM();

// ❌ BAD: Layout thrashing
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = (height * 2) + 'px'; // Write
  // Causes layout recalculation for EACH element!
});

// ✅ GOOD: Batched reads and writes
elements.forEach(el => {
  fastdom.measure(() => {
    return el.offsetHeight;
  }).then(height => {
    fastdom.mutate(() => {
      el.style.height = (height * 2) + 'px';
    });
  });
});
// All reads first, then all writes - only ONE layout!
```

---

## State Management Patterns

### Question 8: Build a Redux-like Store

```javascript
/**
 * Mini Redux Implementation
 */
class Store {
  constructor(reducer, initialState = {}, middleware = []) {
    this.reducer = reducer;
    this.state = initialState;
    this.listeners = new Set();
    this.middleware = middleware;
    
    // Apply middleware
    this.dispatch = this.applyMiddleware();
  }
  
  getState() {
    return this.state;
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  dispatch(action) {
    this.state = this.reducer(this.state, action);
    
    // Notify listeners
    this.listeners.forEach(listener => {
      listener(this.state, action);
    });
    
    return action;
  }
  
  applyMiddleware() {
    let dispatch = this.dispatch.bind(this);
    
    const middlewareAPI = {
      getState: this.getState.bind(this),
      dispatch: (action) => dispatch(action)
    };
    
    const chain = this.middleware.map(middleware => 
      middleware(middlewareAPI)
    );
    
    dispatch = chain.reduceRight(
      (next, middleware) => middleware(next),
      dispatch
    );
    
    return dispatch;
  }
}

/**
 * Middleware: Logger
 */
const logger = (store) => (next) => (action) => {
  console.group(action.type);
  console.log('Previous State:', store.getState());
  console.log('Action:', action);
  
  const result = next(action);
  
  console.log('Next State:', store.getState());
  console.groupEnd();
  
  return result;
};

/**
 * Middleware: Thunk (for async actions)
 */
const thunk = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  
  return next(action);
};

/**
 * Middleware: DevTools
 */
const devTools = (store) => (next) => (action) => {
  const result = next(action);
  
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    window.__REDUX_DEVTOOLS_EXTENSION__.send(
      action,
      store.getState()
    );
  }
  
  return result;
};

// Usage
const initialState = {
  count: 0,
  user: null
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    default:
      return state;
  }
}

const store = new Store(
  reducer,
  initialState,
  [logger, thunk, devTools]
);

// Subscribe to changes
store.subscribe((state, action) => {
  console.log('State updated!', state);
});

// Dispatch actions
store.dispatch({ type: 'INCREMENT' });

// Async action with thunk
store.dispatch((dispatch, getState) => {
  fetch('/api/user')
    .then(res => res.json())
    .then(user => {
      dispatch({ type: 'SET_USER', payload: user });
    });
});
```

---

## Performance Optimization

### Question 9: Implement Debounce & Throttle

```javascript
/**
 * Debounce - Wait for quiet period
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  
  function debounced(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
  
  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  debounced.flush = function() {
    clearTimeout(timeoutId);
    fn.apply(this, arguments);
  };
  
  return debounced;
}

/**
 * Throttle - Limit execution rate
 */
function throttle(fn, limit = 300) {
  let inThrottle;
  let lastArgs;
  let lastContext;
  
  function throttled(...args) {
    lastArgs = args;
    lastContext = this;
    
    if (!inThrottle) {
      fn.apply(lastContext, lastArgs);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        
        if (lastArgs) {
          throttled.apply(lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;
        }
      }, limit);
    }
  }
  
  return throttled;
}

/**
 * Advanced: Throttle with leading and trailing
 */
function advancedThrottle(fn, limit, options = {}) {
  const { leading = true, trailing = true } = options;
  
  let timeout;
  let previous = 0;
  let lastArgs;
  let lastContext;
  
  function throttled(...args) {
    const now = Date.now();
    
    if (!previous && !leading) {
      previous = now;
    }
    
    const remaining = limit - (now - previous);
    lastArgs = args;
    lastContext = this;
    
    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      previous = now;
      fn.apply(lastContext, lastArgs);
      lastArgs = null;
      lastContext = null;
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        fn.apply(lastContext, lastArgs);
        lastArgs = null;
        lastContext = null;
      }, remaining);
    }
  }
  
  throttled.cancel = () => {
    clearTimeout(timeout);
    previous = 0;
    timeout = null;
    lastArgs = null;
    lastContext = null;
  };
  
  return throttled;
}

// Usage Examples
const searchInput = document.querySelector('#search');

// Debounce: Wait until user stops typing
const debouncedSearch = debounce((value) => {
  console.log('Searching for:', value);
  fetch(`/api/search?q=${value}`);
}, 500);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// Throttle: Limit scroll handler calls
const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

window.addEventListener('scroll', throttledScroll);
```

---

## Security & XSS Prevention

### Question 10: Implement XSS-Safe Template Engine

```javascript
/**
 * XSS-Safe Template Engine
 */
class SafeTemplate {
  constructor(template) {
    this.template = template;
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  static escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  /**
   * Sanitize URL to prevent javascript: protocol
   */
  static sanitizeURL(url) {
    const protocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    try {
      const parsed = new URL(url, window.location.origin);
      
      if (protocols.includes(parsed.protocol)) {
        return parsed.href;
      }
    } catch (e) {
      return '#';
    }
    
    return '#';
  }
  
  /**
   * Render template with data
   */
  render(data) {
    let output = this.template;
    
    // Replace {{variable}} with escaped data
    output = output.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return SafeTemplate.escapeHTML(data[key] || '');
    });
    
    // Replace {{{variable}}} with unescaped data (dangerous!)
    output = output.replace(/\{\{\{(\w+)\}\}\}/g, (match, key) => {
      console.warn('⚠️ Rendering unescaped HTML:', key);
      return data[key] || '';
    });
    
    // Replace {{@url variable}} with sanitized URL
    output = output.replace(/\{\{@url (\w+)\}\}/g, (match, key) => {
      return SafeTemplate.sanitizeURL(data[key] || '#');
    });
    
    return output;
  }
}

// Usage
const template = new SafeTemplate(`
  <div class="user-card">
    <h2>{{name}}</h2>
    <p>{{bio}}</p>
    <a href="{{@url website}}">Visit Website</a>
    <div class="content">{{{html}}}</div>
  </div>
`);

// ✅ Safe: XSS attempt will be escaped
const maliciousData = {
  name: '<script>alert("XSS")</script>John',
  bio: '<img src=x onerror="alert(\'XSS\')">Developer',
  website: 'javascript:alert("XSS")',
  html: '<p>This is safe HTML</p>'
};

const safeHTML = template.render(maliciousData);
console.log(safeHTML);
// Output: <script> will be escaped, javascript: URL will be blocked
```

**Content Security Policy (CSP) Implementation**:

```javascript
/**
 * CSP Violation Reporter
 */
class CSPReporter {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.setupListener();
  }
  
  setupListener() {
    document.addEventListener('securitypolicyviolation', (e) => {
      this.reportViolation({
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber,
        columnNumber: e.columnNumber
      });
    });
  }
  
  reportViolation(violation) {
    console.error('CSP Violation:', violation);
    
    // Send to server
    navigator.sendBeacon(
      this.endpoint,
      JSON.stringify(violation)
    );
  }
}

// Usage
const reporter = new CSPReporter('/api/csp-report');
```

---

## Summary

These questions test:

1. ✅ **Deep JavaScript Knowledge**
2. ✅ **Browser APIs Understanding**
3. ✅ **Performance Optimization**
4. ✅ **Security Best Practices**
5. ✅ **Design Patterns**
6. ✅ **Problem Solving**
7. ✅ **Code Quality**

**Tips for Interviews**:
- Explain trade-offs
- Mention edge cases
- Discuss browser compatibility
- Show performance awareness
- Demonstrate security mindset

मालिक, these questions will help you ace senior frontend developer interviews! 🚀

