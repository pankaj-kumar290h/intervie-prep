# Node.js Microservices Patterns

Microservices patterns help build distributed, scalable, and resilient applications.

## Table of Contents
1. [Circuit Breaker](#circuit-breaker)
2. [Saga Pattern](#saga-pattern)
3. [CQRS Pattern](#cqrs-pattern)
4. [Event Sourcing](#event-sourcing)
5. [Service Discovery](#service-discovery)
6. [API Gateway](#api-gateway)

---

## Circuit Breaker

### Preventing Cascade Failures

```javascript
/**
 * Circuit Breaker Pattern
 * Prevents repeated calls to failing services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    
    // Configuration
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 3;
    this.timeout = options.timeout || 30000;
    this.resetTimeout = options.resetTimeout || 60000;
    
    // Metrics
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      timeouts: 0
    };
  }
  
  async execute(fn, fallback = null) {
    this.metrics.totalCalls++;
    
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF-OPEN';
        console.log('Circuit breaker: HALF-OPEN');
      } else {
        this.metrics.rejectedCalls++;
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }
  
  async executeWithTimeout(fn) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.metrics.timeouts++;
        reject(new Error('Operation timed out'));
      }, this.timeout);
      
      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
  
  onSuccess() {
    this.metrics.successfulCalls++;
    this.failureCount = 0;
    
    if (this.state === 'HALF-OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        console.log('Circuit breaker: CLOSED');
      }
    }
  }
  
  onFailure(error) {
    this.metrics.failedCalls++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;
    
    if (this.state === 'HALF-OPEN') {
      this.state = 'OPEN';
      console.log('Circuit breaker: OPEN (from HALF-OPEN)');
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('Circuit breaker: OPEN');
    }
  }
  
  getState() {
    return this.state;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Usage with HTTP Client
 */
class ResilientHttpClient {
  constructor() {
    this.circuitBreakers = new Map();
  }
  
  getCircuitBreaker(serviceName) {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker({
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 10000,
        resetTimeout: 30000
      }));
    }
    return this.circuitBreakers.get(serviceName);
  }
  
  async request(serviceName, url, options = {}) {
    const breaker = this.getCircuitBreaker(serviceName);
    
    return breaker.execute(
      async () => {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      },
      () => options.fallback?.() || { error: 'Service unavailable', cached: true }
    );
  }
}

// Usage
const client = new ResilientHttpClient();

const users = await client.request('user-service', 'http://users-api/users', {
  fallback: () => getCachedUsers()
});
```

---

## Saga Pattern

### Distributed Transactions

```javascript
/**
 * Saga Pattern
 * Manages distributed transactions with compensation
 */
class Saga {
  constructor(name) {
    this.name = name;
    this.steps = [];
    this.compensations = [];
  }
  
  addStep(name, execute, compensate) {
    this.steps.push({ name, execute, compensate });
    return this;
  }
  
  async run(context = {}) {
    const results = [];
    const executedSteps = [];
    
    console.log(`Starting saga: ${this.name}`);
    
    for (const step of this.steps) {
      try {
        console.log(`Executing step: ${step.name}`);
        const result = await step.execute(context);
        
        results.push({ step: step.name, success: true, result });
        executedSteps.push(step);
        
        // Update context with result
        context[step.name] = result;
      } catch (error) {
        console.error(`Step failed: ${step.name}`, error.message);
        results.push({ step: step.name, success: false, error: error.message });
        
        // Compensate executed steps in reverse order
        await this.compensate(executedSteps, context);
        
        throw new SagaError(this.name, step.name, error, results);
      }
    }
    
    console.log(`Saga completed: ${this.name}`);
    return { success: true, results, context };
  }
  
  async compensate(executedSteps, context) {
    console.log('Starting compensation...');
    
    for (let i = executedSteps.length - 1; i >= 0; i--) {
      const step = executedSteps[i];
      
      if (step.compensate) {
        try {
          console.log(`Compensating step: ${step.name}`);
          await step.compensate(context);
        } catch (error) {
          console.error(`Compensation failed for ${step.name}:`, error.message);
          // Log but continue compensating other steps
        }
      }
    }
    
    console.log('Compensation completed');
  }
}

class SagaError extends Error {
  constructor(sagaName, failedStep, originalError, results) {
    super(`Saga "${sagaName}" failed at step "${failedStep}": ${originalError.message}`);
    this.sagaName = sagaName;
    this.failedStep = failedStep;
    this.originalError = originalError;
    this.results = results;
  }
}

/**
 * Example: Order Processing Saga
 */
class OrderService {
  static async createOrder(ctx) {
    console.log('Creating order...');
    const order = { id: Date.now(), items: ctx.items, status: 'pending' };
    return order;
  }
  
  static async cancelOrder(ctx) {
    console.log('Cancelling order:', ctx.createOrder.id);
  }
}

class PaymentService {
  static async processPayment(ctx) {
    console.log('Processing payment...');
    
    // Simulate occasional failure
    if (Math.random() < 0.3) {
      throw new Error('Payment declined');
    }
    
    return { transactionId: `TXN-${Date.now()}`, amount: ctx.amount };
  }
  
  static async refundPayment(ctx) {
    console.log('Refunding payment:', ctx.processPayment.transactionId);
  }
}

class InventoryService {
  static async reserveInventory(ctx) {
    console.log('Reserving inventory...');
    return { reservationId: `RES-${Date.now()}` };
  }
  
  static async releaseInventory(ctx) {
    console.log('Releasing inventory:', ctx.reserveInventory.reservationId);
  }
}

class ShippingService {
  static async createShipment(ctx) {
    console.log('Creating shipment...');
    return { trackingNumber: `SHIP-${Date.now()}` };
  }
  
  static async cancelShipment(ctx) {
    console.log('Cancelling shipment:', ctx.createShipment.trackingNumber);
  }
}

// Build the saga
const orderSaga = new Saga('OrderProcessing')
  .addStep(
    'createOrder',
    OrderService.createOrder,
    OrderService.cancelOrder
  )
  .addStep(
    'reserveInventory',
    InventoryService.reserveInventory,
    InventoryService.releaseInventory
  )
  .addStep(
    'processPayment',
    PaymentService.processPayment,
    PaymentService.refundPayment
  )
  .addStep(
    'createShipment',
    ShippingService.createShipment,
    ShippingService.cancelShipment
  );

// Execute saga
try {
  const result = await orderSaga.run({
    items: [{ productId: 1, quantity: 2 }],
    amount: 99.99
  });
  console.log('Order completed:', result);
} catch (error) {
  if (error instanceof SagaError) {
    console.error('Order failed:', error.message);
    console.error('Results:', error.results);
  }
}

/**
 * Orchestrator-based Saga
 */
class SagaOrchestrator {
  constructor() {
    this.sagas = new Map();
    this.running = new Map();
  }
  
  register(name, saga) {
    this.sagas.set(name, saga);
  }
  
  async start(name, context) {
    const saga = this.sagas.get(name);
    if (!saga) {
      throw new Error(`Unknown saga: ${name}`);
    }
    
    const sagaId = `${name}-${Date.now()}`;
    
    this.running.set(sagaId, {
      status: 'running',
      startTime: Date.now(),
      context
    });
    
    try {
      const result = await saga.run(context);
      this.running.set(sagaId, {
        status: 'completed',
        result,
        endTime: Date.now()
      });
      return { sagaId, ...result };
    } catch (error) {
      this.running.set(sagaId, {
        status: 'failed',
        error: error.message,
        endTime: Date.now()
      });
      throw error;
    }
  }
  
  getStatus(sagaId) {
    return this.running.get(sagaId);
  }
}
```

---

## CQRS Pattern

### Command Query Responsibility Segregation

```javascript
/**
 * CQRS Pattern
 * Separate read and write models
 */

// Commands
class Command {
  constructor(type, payload, metadata = {}) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.payload = payload;
    this.metadata = {
      timestamp: Date.now(),
      userId: metadata.userId,
      correlationId: metadata.correlationId || crypto.randomUUID()
    };
  }
}

// Command Handlers
class CommandBus {
  constructor() {
    this.handlers = new Map();
    this.middleware = [];
  }
  
  register(commandType, handler) {
    this.handlers.set(commandType, handler);
  }
  
  use(middleware) {
    this.middleware.push(middleware);
  }
  
  async dispatch(command) {
    const handler = this.handlers.get(command.type);
    
    if (!handler) {
      throw new Error(`No handler for command: ${command.type}`);
    }
    
    // Execute middleware
    let context = { command, result: null };
    
    for (const mw of this.middleware) {
      context = await mw(context);
    }
    
    // Execute handler
    context.result = await handler(command.payload, command.metadata);
    
    return context.result;
  }
}

// Queries
class Query {
  constructor(type, params) {
    this.type = type;
    this.params = params;
  }
}

// Query Handlers
class QueryBus {
  constructor() {
    this.handlers = new Map();
  }
  
  register(queryType, handler) {
    this.handlers.set(queryType, handler);
  }
  
  async execute(query) {
    const handler = this.handlers.get(query.type);
    
    if (!handler) {
      throw new Error(`No handler for query: ${query.type}`);
    }
    
    return await handler(query.params);
  }
}

/**
 * Domain Events
 */
class EventBus {
  constructor() {
    this.handlers = new Map();
  }
  
  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }
  
  async publish(event) {
    const handlers = this.handlers.get(event.type) || [];
    
    await Promise.all(
      handlers.map(handler => handler(event))
    );
  }
}

/**
 * Write Model (Commands)
 */
class UserWriteRepository {
  constructor(db, eventBus) {
    this.db = db;
    this.eventBus = eventBus;
  }
  
  async create(userData) {
    const user = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date()
    };
    
    await this.db.users.insert(user);
    
    await this.eventBus.publish({
      type: 'UserCreated',
      payload: user,
      timestamp: Date.now()
    });
    
    return user;
  }
  
  async update(userId, updates) {
    const user = await this.db.users.update(userId, {
      ...updates,
      updatedAt: new Date()
    });
    
    await this.eventBus.publish({
      type: 'UserUpdated',
      payload: { userId, updates },
      timestamp: Date.now()
    });
    
    return user;
  }
}

/**
 * Read Model (Queries)
 */
class UserReadRepository {
  constructor(readDb) {
    this.db = readDb;
  }
  
  async findById(userId) {
    return this.db.users.findOne({ id: userId });
  }
  
  async findByEmail(email) {
    return this.db.users.findOne({ email });
  }
  
  async list(filters = {}) {
    return this.db.users.find(filters);
  }
  
  async search(query) {
    return this.db.users.search(query);
  }
}

/**
 * Read Model Projector
 * Updates read model when events occur
 */
class UserProjector {
  constructor(readDb, eventBus) {
    this.db = readDb;
    
    // Subscribe to events
    eventBus.subscribe('UserCreated', this.onUserCreated.bind(this));
    eventBus.subscribe('UserUpdated', this.onUserUpdated.bind(this));
  }
  
  async onUserCreated(event) {
    // Create denormalized read model
    await this.db.users.insert({
      ...event.payload,
      searchIndex: this.buildSearchIndex(event.payload),
      lastEventId: event.id
    });
  }
  
  async onUserUpdated(event) {
    const { userId, updates } = event.payload;
    
    await this.db.users.update(userId, {
      ...updates,
      lastEventId: event.id
    });
  }
  
  buildSearchIndex(user) {
    return `${user.name} ${user.email}`.toLowerCase();
  }
}

/**
 * Complete CQRS Setup
 */
class UserService {
  constructor() {
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
    this.eventBus = new EventBus();
    
    // Set up write repository
    this.writeRepo = new UserWriteRepository(writeDb, this.eventBus);
    
    // Set up read repository
    this.readRepo = new UserReadRepository(readDb);
    
    // Set up projector
    this.projector = new UserProjector(readDb, this.eventBus);
    
    // Register command handlers
    this.commandBus.register('CreateUser', async (payload) => {
      return this.writeRepo.create(payload);
    });
    
    this.commandBus.register('UpdateUser', async (payload) => {
      return this.writeRepo.update(payload.userId, payload.updates);
    });
    
    // Register query handlers
    this.queryBus.register('GetUser', async (params) => {
      return this.readRepo.findById(params.userId);
    });
    
    this.queryBus.register('ListUsers', async (params) => {
      return this.readRepo.list(params.filters);
    });
    
    this.queryBus.register('SearchUsers', async (params) => {
      return this.readRepo.search(params.query);
    });
  }
  
  // Public API
  async createUser(userData, userId) {
    const command = new Command('CreateUser', userData, { userId });
    return this.commandBus.dispatch(command);
  }
  
  async getUser(userId) {
    const query = new Query('GetUser', { userId });
    return this.queryBus.execute(query);
  }
  
  async searchUsers(searchQuery) {
    const query = new Query('SearchUsers', { query: searchQuery });
    return this.queryBus.execute(query);
  }
}
```

---

## Event Sourcing

### Storing Events Instead of State

```javascript
/**
 * Event Sourcing Pattern
 * Store events, derive state
 */

// Event Store
class EventStore {
  constructor() {
    this.events = [];
    this.subscribers = [];
  }
  
  async append(streamId, events, expectedVersion = null) {
    const currentVersion = this.getCurrentVersion(streamId);
    
    if (expectedVersion !== null && currentVersion !== expectedVersion) {
      throw new Error('Concurrency conflict');
    }
    
    const timestamp = Date.now();
    
    for (let i = 0; i < events.length; i++) {
      const event = {
        ...events[i],
        streamId,
        version: currentVersion + i + 1,
        timestamp
      };
      
      this.events.push(event);
      
      // Notify subscribers
      for (const subscriber of this.subscribers) {
        await subscriber(event);
      }
    }
    
    return currentVersion + events.length;
  }
  
  async getStream(streamId, fromVersion = 0) {
    return this.events
      .filter(e => e.streamId === streamId && e.version > fromVersion)
      .sort((a, b) => a.version - b.version);
  }
  
  getCurrentVersion(streamId) {
    const streamEvents = this.events.filter(e => e.streamId === streamId);
    return streamEvents.length > 0 
      ? Math.max(...streamEvents.map(e => e.version))
      : 0;
  }
  
  subscribe(handler) {
    this.subscribers.push(handler);
    return () => {
      const index = this.subscribers.indexOf(handler);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }
}

// Aggregate Base Class
class Aggregate {
  constructor() {
    this.uncommittedEvents = [];
    this.version = 0;
  }
  
  loadFromHistory(events) {
    for (const event of events) {
      this.apply(event, false);
      this.version = event.version;
    }
  }
  
  apply(event, isNew = true) {
    const handler = this[`on${event.type}`];
    
    if (handler) {
      handler.call(this, event.data);
    }
    
    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }
  
  getUncommittedEvents() {
    return [...this.uncommittedEvents];
  }
  
  clearUncommittedEvents() {
    this.uncommittedEvents = [];
  }
}

/**
 * Order Aggregate
 */
class OrderAggregate extends Aggregate {
  constructor() {
    super();
    this.id = null;
    this.status = null;
    this.items = [];
    this.totalAmount = 0;
    this.shippingAddress = null;
    this.paymentId = null;
  }
  
  // Commands
  create(orderId, customerId, items) {
    if (this.id) {
      throw new Error('Order already exists');
    }
    
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    
    this.apply({
      type: 'OrderCreated',
      data: { orderId, customerId, items, totalAmount }
    });
  }
  
  addItem(item) {
    if (this.status !== 'pending') {
      throw new Error('Cannot modify non-pending order');
    }
    
    this.apply({
      type: 'ItemAdded',
      data: { item }
    });
  }
  
  setShippingAddress(address) {
    this.apply({
      type: 'ShippingAddressSet',
      data: { address }
    });
  }
  
  confirmPayment(paymentId) {
    if (this.status !== 'pending') {
      throw new Error('Order is not pending');
    }
    
    this.apply({
      type: 'PaymentConfirmed',
      data: { paymentId }
    });
  }
  
  ship(trackingNumber) {
    if (this.status !== 'paid') {
      throw new Error('Order is not paid');
    }
    
    this.apply({
      type: 'OrderShipped',
      data: { trackingNumber }
    });
  }
  
  cancel(reason) {
    if (['shipped', 'delivered'].includes(this.status)) {
      throw new Error('Cannot cancel shipped order');
    }
    
    this.apply({
      type: 'OrderCancelled',
      data: { reason }
    });
  }
  
  // Event Handlers (state mutation)
  onOrderCreated(data) {
    this.id = data.orderId;
    this.customerId = data.customerId;
    this.items = data.items;
    this.totalAmount = data.totalAmount;
    this.status = 'pending';
  }
  
  onItemAdded(data) {
    this.items.push(data.item);
    this.totalAmount += data.item.price * data.item.quantity;
  }
  
  onShippingAddressSet(data) {
    this.shippingAddress = data.address;
  }
  
  onPaymentConfirmed(data) {
    this.paymentId = data.paymentId;
    this.status = 'paid';
  }
  
  onOrderShipped(data) {
    this.trackingNumber = data.trackingNumber;
    this.status = 'shipped';
  }
  
  onOrderCancelled(data) {
    this.status = 'cancelled';
    this.cancellationReason = data.reason;
  }
}

/**
 * Repository
 */
class OrderRepository {
  constructor(eventStore) {
    this.eventStore = eventStore;
  }
  
  async getById(orderId) {
    const events = await this.eventStore.getStream(`order-${orderId}`);
    
    if (events.length === 0) {
      return null;
    }
    
    const order = new OrderAggregate();
    order.loadFromHistory(events);
    
    return order;
  }
  
  async save(order) {
    const uncommittedEvents = order.getUncommittedEvents();
    
    if (uncommittedEvents.length === 0) {
      return;
    }
    
    await this.eventStore.append(
      `order-${order.id}`,
      uncommittedEvents,
      order.version
    );
    
    order.clearUncommittedEvents();
  }
}

/**
 * Usage
 */
const eventStore = new EventStore();
const orderRepo = new OrderRepository(eventStore);

// Subscribe to events for projections
eventStore.subscribe(async (event) => {
  console.log('Event:', event.type, event.data);
  
  // Update read models, send notifications, etc.
  if (event.type === 'OrderShipped') {
    // await notificationService.sendShippingNotification(event.data);
  }
});

// Create order
const order = new OrderAggregate();
order.create('order-123', 'customer-456', [
  { productId: 'p1', name: 'Widget', price: 10, quantity: 2 }
]);
order.setShippingAddress({ street: '123 Main St', city: 'NYC' });
order.confirmPayment('pay-789');

await orderRepo.save(order);

// Load order later
const loadedOrder = await orderRepo.getById('order-123');
console.log('Order status:', loadedOrder.status); // 'paid'

// Ship order
loadedOrder.ship('TRACK-123');
await orderRepo.save(loadedOrder);
```

---

## Service Discovery

### Dynamic Service Location

```javascript
/**
 * Service Registry
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
  }
  
  register(serviceName, instance) {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, []);
    }
    
    const instances = this.services.get(serviceName);
    const instanceId = `${serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    instances.push({
      id: instanceId,
      ...instance,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      status: 'healthy'
    });
    
    console.log(`Registered: ${serviceName} at ${instance.host}:${instance.port}`);
    
    return instanceId;
  }
  
  deregister(serviceName, instanceId) {
    if (!this.services.has(serviceName)) return;
    
    const instances = this.services.get(serviceName);
    const index = instances.findIndex(i => i.id === instanceId);
    
    if (index > -1) {
      instances.splice(index, 1);
      console.log(`Deregistered: ${instanceId}`);
    }
  }
  
  heartbeat(serviceName, instanceId) {
    if (!this.services.has(serviceName)) return;
    
    const instances = this.services.get(serviceName);
    const instance = instances.find(i => i.id === instanceId);
    
    if (instance) {
      instance.lastHeartbeat = Date.now();
      instance.status = 'healthy';
    }
  }
  
  getInstances(serviceName) {
    const instances = this.services.get(serviceName) || [];
    return instances.filter(i => i.status === 'healthy');
  }
  
  getInstance(serviceName, strategy = 'round-robin') {
    const instances = this.getInstances(serviceName);
    
    if (instances.length === 0) {
      throw new Error(`No healthy instances for: ${serviceName}`);
    }
    
    switch (strategy) {
      case 'round-robin':
        return this.roundRobin(serviceName, instances);
      case 'random':
        return instances[Math.floor(Math.random() * instances.length)];
      case 'least-connections':
        return this.leastConnections(instances);
      default:
        return instances[0];
    }
  }
  
  roundRobin(serviceName, instances) {
    const key = `rr-${serviceName}`;
    const current = (this.healthChecks.get(key) || 0) % instances.length;
    this.healthChecks.set(key, current + 1);
    return instances[current];
  }
  
  leastConnections(instances) {
    return instances.reduce((min, instance) => 
      (instance.connections || 0) < (min.connections || 0) ? instance : min
    );
  }
  
  // Health check loop
  startHealthChecks(interval = 10000, timeout = 30000) {
    setInterval(() => {
      const now = Date.now();
      
      for (const [serviceName, instances] of this.services) {
        for (const instance of instances) {
          if (now - instance.lastHeartbeat > timeout) {
            instance.status = 'unhealthy';
            console.log(`Unhealthy: ${instance.id}`);
          }
        }
      }
    }, interval);
  }
}

/**
 * Service Client with Discovery
 */
class ServiceClient {
  constructor(registry) {
    this.registry = registry;
  }
  
  async call(serviceName, endpoint, options = {}) {
    const instance = this.registry.getInstance(serviceName, 'round-robin');
    const url = `http://${instance.host}:${instance.port}${endpoint}`;
    
    try {
      instance.connections = (instance.connections || 0) + 1;
      
      const response = await fetch(url, options);
      return response.json();
    } finally {
      instance.connections--;
    }
  }
}

// Usage
const registry = new ServiceRegistry();
registry.startHealthChecks();

// Register services
const userServiceId = registry.register('user-service', {
  host: 'localhost',
  port: 3001,
  metadata: { version: '1.0.0' }
});

registry.register('user-service', {
  host: 'localhost',
  port: 3002,
  metadata: { version: '1.0.0' }
});

// Client usage
const client = new ServiceClient(registry);

const users = await client.call('user-service', '/users');
```

---

## Summary

| Pattern | Purpose | Complexity |
|---------|---------|------------|
| **Circuit Breaker** | Fault tolerance | Medium |
| **Saga** | Distributed transactions | High |
| **CQRS** | Read/write separation | High |
| **Event Sourcing** | Event-based state | High |
| **Service Discovery** | Dynamic service location | Medium |
| **API Gateway** | Entry point, routing | Medium |

मालिक, master these microservices patterns to build scalable distributed systems! 🚀
