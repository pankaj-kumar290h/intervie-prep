# Creational Design Patterns in JavaScript

Creational patterns deal with object creation mechanisms, trying to create objects in a manner suitable to the situation.

## Table of Contents
1. [Factory Pattern](#factory-pattern)
2. [Abstract Factory Pattern](#abstract-factory-pattern)
3. [Singleton Pattern](#singleton-pattern)
4. [Builder Pattern](#builder-pattern)
5. [Prototype Pattern](#prototype-pattern)

---

## Factory Pattern

### What is it?
A Factory is a function or method that creates and returns objects without using the `new` keyword directly.

### When to Use
- When object creation logic is complex
- When you need to create different types of objects based on conditions
- When you want to encapsulate object creation

### Practical Example 1: User Factory

```javascript
/**
 * User Factory
 * Creates different types of users based on role
 */
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class Admin extends User {
  constructor(name, email) {
    super(name, email);
    this.role = 'admin';
    this.permissions = ['read', 'write', 'delete', 'manage_users'];
  }
  
  deleteUser(userId) {
    console.log(`Admin ${this.name} deleting user ${userId}`);
  }
}

class Editor extends User {
  constructor(name, email) {
    super(name, email);
    this.role = 'editor';
    this.permissions = ['read', 'write'];
  }
  
  editContent(contentId) {
    console.log(`Editor ${this.name} editing content ${contentId}`);
  }
}

class Viewer extends User {
  constructor(name, email) {
    super(name, email);
    this.role = 'viewer';
    this.permissions = ['read'];
  }
}

// Factory Function
function createUser(type, name, email) {
  const userTypes = {
    admin: Admin,
    editor: Editor,
    viewer: Viewer
  };
  
  const UserClass = userTypes[type];
  
  if (!UserClass) {
    throw new Error(`Unknown user type: ${type}`);
  }
  
  return new UserClass(name, email);
}

// Usage
const admin = createUser('admin', 'John', 'john@example.com');
const editor = createUser('editor', 'Jane', 'jane@example.com');
const viewer = createUser('viewer', 'Bob', 'bob@example.com');

console.log(admin.permissions); // ['read', 'write', 'delete', 'manage_users']
admin.deleteUser(123);
```

### Practical Example 2: Payment Gateway Factory

```javascript
/**
 * Payment Gateway Factory
 * Creates appropriate payment processor based on method
 */
class PaymentProcessor {
  process(amount) {
    throw new Error('process() must be implemented');
  }
  
  refund(transactionId) {
    throw new Error('refund() must be implemented');
  }
}

class StripeProcessor extends PaymentProcessor {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.name = 'Stripe';
  }
  
  async process(amount, currency = 'USD') {
    console.log(`Processing $${amount} ${currency} via Stripe`);
    // Actual Stripe API call would go here
    return {
      transactionId: `stripe_${Date.now()}`,
      status: 'success',
      provider: this.name
    };
  }
  
  async refund(transactionId) {
    console.log(`Refunding transaction ${transactionId} via Stripe`);
    return { status: 'refunded' };
  }
}

class PayPalProcessor extends PaymentProcessor {
  constructor(clientId, clientSecret) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.name = 'PayPal';
  }
  
  async process(amount, currency = 'USD') {
    console.log(`Processing $${amount} ${currency} via PayPal`);
    return {
      transactionId: `paypal_${Date.now()}`,
      status: 'success',
      provider: this.name
    };
  }
  
  async refund(transactionId) {
    console.log(`Refunding transaction ${transactionId} via PayPal`);
    return { status: 'refunded' };
  }
}

class RazorpayProcessor extends PaymentProcessor {
  constructor(keyId, keySecret) {
    super();
    this.keyId = keyId;
    this.keySecret = keySecret;
    this.name = 'Razorpay';
  }
  
  async process(amount, currency = 'INR') {
    console.log(`Processing ₹${amount} ${currency} via Razorpay`);
    return {
      transactionId: `razorpay_${Date.now()}`,
      status: 'success',
      provider: this.name
    };
  }
  
  async refund(transactionId) {
    console.log(`Refunding transaction ${transactionId} via Razorpay`);
    return { status: 'refunded' };
  }
}

// Payment Factory
class PaymentFactory {
  static processors = new Map();
  
  static register(name, processor) {
    this.processors.set(name, processor);
  }
  
  static create(method, config) {
    switch (method) {
      case 'stripe':
        return new StripeProcessor(config.apiKey);
      case 'paypal':
        return new PayPalProcessor(config.clientId, config.clientSecret);
      case 'razorpay':
        return new RazorpayProcessor(config.keyId, config.keySecret);
      default:
        throw new Error(`Unknown payment method: ${method}`);
    }
  }
}

// Usage in an application
class PaymentService {
  constructor() {
    this.processors = {
      stripe: PaymentFactory.create('stripe', { apiKey: 'sk_test_xxx' }),
      paypal: PaymentFactory.create('paypal', { clientId: 'xxx', clientSecret: 'yyy' }),
      razorpay: PaymentFactory.create('razorpay', { keyId: 'xxx', keySecret: 'yyy' })
    };
  }
  
  async processPayment(method, amount, currency) {
    const processor = this.processors[method];
    if (!processor) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return await processor.process(amount, currency);
  }
}

// Usage
const paymentService = new PaymentService();
await paymentService.processPayment('stripe', 99.99, 'USD');
await paymentService.processPayment('razorpay', 7999, 'INR');
```

### Practical Example 3: UI Component Factory

```javascript
/**
 * UI Component Factory
 * Creates React-like components dynamically
 */
class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  render() {
    throw new Error('render() must be implemented');
  }
}

class Button extends Component {
  constructor(props) {
    super(props);
    this.type = 'button';
  }
  
  render() {
    const { text, variant = 'primary', onClick } = this.props;
    return `<button class="btn btn-${variant}" onclick="${onClick}">${text}</button>`;
  }
}

class Input extends Component {
  constructor(props) {
    super(props);
    this.type = 'input';
  }
  
  render() {
    const { placeholder, type = 'text', name, value = '' } = this.props;
    return `<input type="${type}" name="${name}" placeholder="${placeholder}" value="${value}" />`;
  }
}

class Select extends Component {
  constructor(props) {
    super(props);
    this.type = 'select';
  }
  
  render() {
    const { options = [], name, selected } = this.props;
    const optionsHtml = options.map(opt => 
      `<option value="${opt.value}" ${opt.value === selected ? 'selected' : ''}>${opt.label}</option>`
    ).join('');
    return `<select name="${name}">${optionsHtml}</select>`;
  }
}

class Modal extends Component {
  constructor(props) {
    super(props);
    this.type = 'modal';
  }
  
  render() {
    const { title, content, isOpen } = this.props;
    if (!isOpen) return '';
    return `
      <div class="modal">
        <div class="modal-header">${title}</div>
        <div class="modal-body">${content}</div>
      </div>
    `;
  }
}

// Component Factory
function createComponent(type, props) {
  const components = {
    button: Button,
    input: Input,
    select: Select,
    modal: Modal
  };
  
  const ComponentClass = components[type];
  if (!ComponentClass) {
    throw new Error(`Unknown component type: ${type}`);
  }
  
  return new ComponentClass(props);
}

// Usage
const submitBtn = createComponent('button', { 
  text: 'Submit', 
  variant: 'primary' 
});

const emailInput = createComponent('input', { 
  placeholder: 'Enter email', 
  type: 'email', 
  name: 'email' 
});

const countrySelect = createComponent('select', {
  name: 'country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'in', label: 'India' },
    { value: 'uk', label: 'United Kingdom' }
  ]
});

console.log(submitBtn.render());
console.log(emailInput.render());
console.log(countrySelect.render());
```

---

## Abstract Factory Pattern

### What is it?
Creates families of related objects without specifying their concrete classes.

### When to Use
- When you need to create families of related objects
- When system should be independent of how objects are created
- When you want to provide a library of products

### Practical Example: Cross-Platform UI Factory

```javascript
/**
 * Abstract Factory for Cross-Platform UI
 * Creates consistent UI components for different platforms
 */

// Abstract Products
class Button {
  render() { throw new Error('Must implement render()'); }
  onClick(handler) { throw new Error('Must implement onClick()'); }
}

class Checkbox {
  render() { throw new Error('Must implement render()'); }
  onChange(handler) { throw new Error('Must implement onChange()'); }
}

class TextInput {
  render() { throw new Error('Must implement render()'); }
  getValue() { throw new Error('Must implement getValue()'); }
}

// Web Components
class WebButton extends Button {
  constructor(text) {
    super();
    this.text = text;
  }
  
  render() {
    return `<button class="web-btn">${this.text}</button>`;
  }
  
  onClick(handler) {
    return `onclick="${handler}"`;
  }
}

class WebCheckbox extends Checkbox {
  constructor(label) {
    super();
    this.label = label;
  }
  
  render() {
    return `<label><input type="checkbox" /> ${this.label}</label>`;
  }
  
  onChange(handler) {
    return `onchange="${handler}"`;
  }
}

class WebTextInput extends TextInput {
  constructor(placeholder) {
    super();
    this.placeholder = placeholder;
  }
  
  render() {
    return `<input type="text" class="web-input" placeholder="${this.placeholder}" />`;
  }
  
  getValue() {
    return 'document.querySelector(".web-input").value';
  }
}

// Mobile (React Native style) Components
class MobileButton extends Button {
  constructor(text) {
    super();
    this.text = text;
  }
  
  render() {
    return `<TouchableOpacity><Text>${this.text}</Text></TouchableOpacity>`;
  }
  
  onClick(handler) {
    return `onPress={${handler}}`;
  }
}

class MobileCheckbox extends Checkbox {
  constructor(label) {
    super();
    this.label = label;
  }
  
  render() {
    return `<View><Switch /><Text>${this.label}</Text></View>`;
  }
  
  onChange(handler) {
    return `onValueChange={${handler}}`;
  }
}

class MobileTextInput extends TextInput {
  constructor(placeholder) {
    super();
    this.placeholder = placeholder;
  }
  
  render() {
    return `<TextInput placeholder="${this.placeholder}" />`;
  }
  
  getValue() {
    return 'this.state.inputValue';
  }
}

// Desktop (Electron style) Components
class DesktopButton extends Button {
  constructor(text) {
    super();
    this.text = text;
  }
  
  render() {
    return `<button class="desktop-btn native">${this.text}</button>`;
  }
  
  onClick(handler) {
    return `@click="${handler}"`;
  }
}

// Abstract Factory
class UIFactory {
  createButton(text) { throw new Error('Must implement createButton()'); }
  createCheckbox(label) { throw new Error('Must implement createCheckbox()'); }
  createTextInput(placeholder) { throw new Error('Must implement createTextInput()'); }
}

// Concrete Factories
class WebUIFactory extends UIFactory {
  createButton(text) {
    return new WebButton(text);
  }
  
  createCheckbox(label) {
    return new WebCheckbox(label);
  }
  
  createTextInput(placeholder) {
    return new WebTextInput(placeholder);
  }
}

class MobileUIFactory extends UIFactory {
  createButton(text) {
    return new MobileButton(text);
  }
  
  createCheckbox(label) {
    return new MobileCheckbox(label);
  }
  
  createTextInput(placeholder) {
    return new MobileTextInput(placeholder);
  }
}

// Factory Provider
function getUIFactory(platform) {
  const factories = {
    web: new WebUIFactory(),
    mobile: new MobileUIFactory()
  };
  
  return factories[platform] || factories.web;
}

// Usage - Application code remains the same regardless of platform
function createLoginForm(factory) {
  const emailInput = factory.createTextInput('Enter email');
  const passwordInput = factory.createTextInput('Enter password');
  const rememberMe = factory.createCheckbox('Remember me');
  const submitBtn = factory.createButton('Login');
  
  return {
    render() {
      return `
        ${emailInput.render()}
        ${passwordInput.render()}
        ${rememberMe.render()}
        ${submitBtn.render()}
      `;
    }
  };
}

// Web version
const webFactory = getUIFactory('web');
const webLoginForm = createLoginForm(webFactory);
console.log('Web Form:', webLoginForm.render());

// Mobile version
const mobileFactory = getUIFactory('mobile');
const mobileLoginForm = createLoginForm(mobileFactory);
console.log('Mobile Form:', mobileLoginForm.render());
```

---

## Singleton Pattern

### What is it?
Ensures a class has only one instance and provides a global point of access to it.

### When to Use
- Database connections
- Configuration managers
- Logging services
- Caching mechanisms
- State management stores

### Practical Example 1: Database Connection Pool

```javascript
/**
 * Database Connection Singleton
 * Ensures only one connection pool exists
 */
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    
    this.pool = null;
    this.config = null;
    DatabaseConnection.instance = this;
  }
  
  async connect(config) {
    if (this.pool) {
      console.log('Returning existing connection pool');
      return this.pool;
    }
    
    this.config = config;
    
    // Simulating connection pool creation
    this.pool = {
      connections: [],
      maxConnections: config.maxConnections || 10,
      
      async query(sql, params) {
        console.log(`Executing: ${sql}`);
        // Actual query execution would go here
        return { rows: [], rowCount: 0 };
      },
      
      async getConnection() {
        // Return a connection from pool
        return { release: () => {} };
      },
      
      async end() {
        console.log('Closing all connections');
        this.connections = [];
      }
    };
    
    console.log('New connection pool created');
    return this.pool;
  }
  
  getPool() {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }
  
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}

// Usage
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();

console.log(db1 === db2); // true - same instance

await db1.connect({ host: 'localhost', database: 'myapp' });

// Anywhere in your app
const db = DatabaseConnection.getInstance();
await db.getPool().query('SELECT * FROM users');
```

### Practical Example 2: Configuration Manager

```javascript
/**
 * Configuration Singleton
 * Manages application configuration
 */
class ConfigManager {
  static #instance = null;
  #config = {};
  #isLoaded = false;
  
  constructor() {
    if (ConfigManager.#instance) {
      throw new Error('Use ConfigManager.getInstance() instead of new');
    }
  }
  
  static getInstance() {
    if (!ConfigManager.#instance) {
      ConfigManager.#instance = new ConfigManager();
    }
    return ConfigManager.#instance;
  }
  
  load(configObject) {
    if (this.#isLoaded) {
      console.warn('Config already loaded. Use set() to update values.');
      return this;
    }
    
    this.#config = this.#deepFreeze({ ...configObject });
    this.#isLoaded = true;
    return this;
  }
  
  #deepFreeze(obj) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.#deepFreeze(obj[key]);
      }
    });
    return Object.freeze(obj);
  }
  
  get(path, defaultValue = undefined) {
    const keys = path.split('.');
    let value = this.#config;
    
    for (const key of keys) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      value = value[key];
    }
    
    return value !== undefined ? value : defaultValue;
  }
  
  getAll() {
    return { ...this.#config };
  }
  
  has(path) {
    return this.get(path) !== undefined;
  }
}

// Usage
const config = ConfigManager.getInstance();

config.load({
  app: {
    name: 'MyApp',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp_db'
  },
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000
  },
  features: {
    darkMode: true,
    analytics: true
  }
});

// Anywhere in your app
const appConfig = ConfigManager.getInstance();
console.log(appConfig.get('app.name'));           // 'MyApp'
console.log(appConfig.get('database.host'));      // 'localhost'
console.log(appConfig.get('unknown.path', 'N/A')); // 'N/A'
```

### Practical Example 3: Logger Service

```javascript
/**
 * Logger Singleton
 * Centralized logging with multiple transports
 */
class Logger {
  static instance = null;
  
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }
    
    this.transports = [];
    this.level = 'info';
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    
    Logger.instance = this;
  }
  
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  setLevel(level) {
    if (this.levels[level] === undefined) {
      throw new Error(`Invalid log level: ${level}`);
    }
    this.level = level;
    return this;
  }
  
  addTransport(transport) {
    this.transports.push(transport);
    return this;
  }
  
  #shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }
  
  #formatMessage(level, message, meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta
    };
  }
  
  #log(level, message, meta) {
    if (!this.#shouldLog(level)) return;
    
    const logEntry = this.#formatMessage(level, message, meta);
    
    this.transports.forEach(transport => {
      transport.log(logEntry);
    });
  }
  
  error(message, meta) { this.#log('error', message, meta); }
  warn(message, meta) { this.#log('warn', message, meta); }
  info(message, meta) { this.#log('info', message, meta); }
  debug(message, meta) { this.#log('debug', message, meta); }
}

// Transports
class ConsoleTransport {
  log(entry) {
    const color = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      DEBUG: '\x1b[90m'
    };
    const reset = '\x1b[0m';
    
    console.log(
      `${color[entry.level]}[${entry.timestamp}] ${entry.level}${reset}: ${entry.message}`,
      entry.meta ? entry.meta : ''
    );
  }
}

class FileTransport {
  constructor(filename) {
    this.filename = filename;
  }
  
  log(entry) {
    // In real implementation, would write to file
    // fs.appendFileSync(this.filename, JSON.stringify(entry) + '\n');
    console.log(`[FILE:${this.filename}]`, JSON.stringify(entry));
  }
}

// Usage
const logger = Logger.getInstance()
  .setLevel('debug')
  .addTransport(new ConsoleTransport())
  .addTransport(new FileTransport('app.log'));

// Anywhere in your app
const log = Logger.getInstance();
log.info('Application started', { port: 3000 });
log.debug('Processing request', { path: '/api/users' });
log.error('Database connection failed', { error: 'Connection timeout' });
```

---

## Builder Pattern

### What is it?
Separates the construction of a complex object from its representation, allowing the same construction process to create different representations.

### When to Use
- When creating complex objects with many optional parameters
- When object creation requires multiple steps
- When you want to create different representations of an object

### Practical Example 1: Query Builder

```javascript
/**
 * SQL Query Builder
 * Builds complex SQL queries step by step
 */
class QueryBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.query = {
      type: 'SELECT',
      columns: ['*'],
      table: '',
      joins: [],
      where: [],
      orderBy: [],
      groupBy: [],
      having: [],
      limit: null,
      offset: null
    };
    return this;
  }
  
  select(...columns) {
    this.query.columns = columns.length ? columns : ['*'];
    return this;
  }
  
  from(table) {
    this.query.table = table;
    return this;
  }
  
  where(condition, ...values) {
    this.query.where.push({ condition, values, operator: 'AND' });
    return this;
  }
  
  orWhere(condition, ...values) {
    this.query.where.push({ condition, values, operator: 'OR' });
    return this;
  }
  
  whereIn(column, values) {
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    this.query.where.push({ 
      condition: `${column} IN (${placeholders})`, 
      values,
      operator: 'AND'
    });
    return this;
  }
  
  join(table, condition, type = 'INNER') {
    this.query.joins.push({ table, condition, type });
    return this;
  }
  
  leftJoin(table, condition) {
    return this.join(table, condition, 'LEFT');
  }
  
  rightJoin(table, condition) {
    return this.join(table, condition, 'RIGHT');
  }
  
  orderBy(column, direction = 'ASC') {
    this.query.orderBy.push({ column, direction });
    return this;
  }
  
  groupBy(...columns) {
    this.query.groupBy.push(...columns);
    return this;
  }
  
  having(condition) {
    this.query.having.push(condition);
    return this;
  }
  
  limit(count) {
    this.query.limit = count;
    return this;
  }
  
  offset(count) {
    this.query.offset = count;
    return this;
  }
  
  build() {
    let sql = `SELECT ${this.query.columns.join(', ')} FROM ${this.query.table}`;
    
    // Joins
    if (this.query.joins.length) {
      sql += ' ' + this.query.joins
        .map(j => `${j.type} JOIN ${j.table} ON ${j.condition}`)
        .join(' ');
    }
    
    // Where
    if (this.query.where.length) {
      const conditions = this.query.where
        .map((w, i) => i === 0 ? w.condition : `${w.operator} ${w.condition}`)
        .join(' ');
      sql += ` WHERE ${conditions}`;
    }
    
    // Group By
    if (this.query.groupBy.length) {
      sql += ` GROUP BY ${this.query.groupBy.join(', ')}`;
    }
    
    // Having
    if (this.query.having.length) {
      sql += ` HAVING ${this.query.having.join(' AND ')}`;
    }
    
    // Order By
    if (this.query.orderBy.length) {
      sql += ' ORDER BY ' + this.query.orderBy
        .map(o => `${o.column} ${o.direction}`)
        .join(', ');
    }
    
    // Limit & Offset
    if (this.query.limit) {
      sql += ` LIMIT ${this.query.limit}`;
    }
    if (this.query.offset) {
      sql += ` OFFSET ${this.query.offset}`;
    }
    
    return sql;
  }
  
  // Get all bound values for parameterized queries
  getValues() {
    return this.query.where.flatMap(w => w.values);
  }
}

// Usage
const query = new QueryBuilder()
  .select('u.id', 'u.name', 'u.email', 'COUNT(o.id) as order_count')
  .from('users u')
  .leftJoin('orders o', 'u.id = o.user_id')
  .where('u.status = $1', 'active')
  .where('u.created_at > $2', '2024-01-01')
  .groupBy('u.id', 'u.name', 'u.email')
  .having('COUNT(o.id) > 5')
  .orderBy('order_count', 'DESC')
  .limit(10)
  .build();

console.log(query);
// SELECT u.id, u.name, u.email, COUNT(o.id) as order_count 
// FROM users u 
// LEFT JOIN orders o ON u.id = o.user_id 
// WHERE u.status = $1 AND u.created_at > $2 
// GROUP BY u.id, u.name, u.email 
// HAVING COUNT(o.id) > 5 
// ORDER BY order_count DESC 
// LIMIT 10
```

### Practical Example 2: HTTP Request Builder

```javascript
/**
 * HTTP Request Builder
 * Builds fetch requests with all options
 */
class RequestBuilder {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.reset();
  }
  
  reset() {
    this.config = {
      method: 'GET',
      url: '',
      headers: {},
      body: null,
      queryParams: {},
      timeout: 30000,
      retries: 0,
      cache: 'default'
    };
    return this;
  }
  
  // HTTP Methods
  get(url) {
    this.config.method = 'GET';
    this.config.url = url;
    return this;
  }
  
  post(url) {
    this.config.method = 'POST';
    this.config.url = url;
    return this;
  }
  
  put(url) {
    this.config.method = 'PUT';
    this.config.url = url;
    return this;
  }
  
  patch(url) {
    this.config.method = 'PATCH';
    this.config.url = url;
    return this;
  }
  
  delete(url) {
    this.config.method = 'DELETE';
    this.config.url = url;
    return this;
  }
  
  // Headers
  header(key, value) {
    this.config.headers[key] = value;
    return this;
  }
  
  headers(headers) {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }
  
  auth(token, type = 'Bearer') {
    this.config.headers['Authorization'] = `${type} ${token}`;
    return this;
  }
  
  contentType(type) {
    this.config.headers['Content-Type'] = type;
    return this;
  }
  
  // Body
  json(data) {
    this.config.body = JSON.stringify(data);
    this.contentType('application/json');
    return this;
  }
  
  formData(data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    this.config.body = formData;
    return this;
  }
  
  // Query Parameters
  query(params) {
    this.config.queryParams = { ...this.config.queryParams, ...params };
    return this;
  }
  
  // Options
  timeout(ms) {
    this.config.timeout = ms;
    return this;
  }
  
  retry(count) {
    this.config.retries = count;
    return this;
  }
  
  noCache() {
    this.config.cache = 'no-store';
    return this;
  }
  
  // Build the request
  build() {
    let url = this.baseUrl + this.config.url;
    
    // Add query params
    const params = new URLSearchParams(this.config.queryParams).toString();
    if (params) {
      url += '?' + params;
    }
    
    const options = {
      method: this.config.method,
      headers: this.config.headers,
      cache: this.config.cache
    };
    
    if (this.config.body && !['GET', 'HEAD'].includes(this.config.method)) {
      options.body = this.config.body;
    }
    
    return { url, options, timeout: this.config.timeout, retries: this.config.retries };
  }
  
  // Execute the request
  async execute() {
    const { url, options, timeout, retries } = this.build();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }
        return await response.text();
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError;
  }
}

// Usage
const api = new RequestBuilder('https://api.example.com');

// GET request with query params and auth
const users = await api
  .get('/users')
  .auth('my-token')
  .query({ page: 1, limit: 20, status: 'active' })
  .timeout(5000)
  .execute();

// POST request with JSON body
const newUser = await api
  .post('/users')
  .auth('my-token')
  .json({ name: 'John', email: 'john@example.com' })
  .retry(3)
  .execute();

// Form data upload
const upload = await api
  .post('/upload')
  .auth('my-token')
  .formData({ file: fileBlob, description: 'My file' })
  .execute();
```

### Practical Example 3: Email Builder

```javascript
/**
 * Email Builder
 * Builds complex email messages
 */
class EmailBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.email = {
      from: null,
      to: [],
      cc: [],
      bcc: [],
      replyTo: null,
      subject: '',
      text: '',
      html: '',
      attachments: [],
      headers: {},
      priority: 'normal'
    };
    return this;
  }
  
  from(address, name) {
    this.email.from = name ? `${name} <${address}>` : address;
    return this;
  }
  
  to(address, name) {
    this.email.to.push(name ? `${name} <${address}>` : address);
    return this;
  }
  
  cc(address) {
    this.email.cc.push(address);
    return this;
  }
  
  bcc(address) {
    this.email.bcc.push(address);
    return this;
  }
  
  replyTo(address) {
    this.email.replyTo = address;
    return this;
  }
  
  subject(subject) {
    this.email.subject = subject;
    return this;
  }
  
  text(content) {
    this.email.text = content;
    return this;
  }
  
  html(content) {
    this.email.html = content;
    return this;
  }
  
  // Template support
  template(name, variables = {}) {
    // In real app, load template from file/db
    const templates = {
      welcome: {
        subject: 'Welcome to {{appName}}!',
        html: '<h1>Hello {{name}}</h1><p>Welcome to {{appName}}!</p>'
      },
      passwordReset: {
        subject: 'Reset Your Password',
        html: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>'
      }
    };
    
    const template = templates[name];
    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }
    
    // Replace variables
    let subject = template.subject;
    let html = template.html;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    });
    
    this.email.subject = subject;
    this.email.html = html;
    
    return this;
  }
  
  attach(attachment) {
    this.email.attachments.push(attachment);
    return this;
  }
  
  priority(level) {
    this.email.priority = level; // 'high', 'normal', 'low'
    return this;
  }
  
  header(key, value) {
    this.email.headers[key] = value;
    return this;
  }
  
  build() {
    if (!this.email.from) {
      throw new Error('From address is required');
    }
    if (!this.email.to.length) {
      throw new Error('At least one recipient is required');
    }
    if (!this.email.subject) {
      throw new Error('Subject is required');
    }
    if (!this.email.text && !this.email.html) {
      throw new Error('Email content is required');
    }
    
    return { ...this.email };
  }
  
  async send(transporter) {
    const email = this.build();
    return await transporter.send(email);
  }
}

// Usage
const welcomeEmail = new EmailBuilder()
  .from('noreply@myapp.com', 'MyApp')
  .to('user@example.com', 'John Doe')
  .template('welcome', { name: 'John', appName: 'MyApp' })
  .priority('high')
  .build();

const reportEmail = new EmailBuilder()
  .from('reports@company.com', 'Report System')
  .to('manager@company.com')
  .cc('team-lead@company.com')
  .subject('Weekly Sales Report')
  .html('<h1>Sales Report</h1><p>Please find attached the weekly report.</p>')
  .attach({ filename: 'report.pdf', content: pdfBuffer })
  .build();

console.log(welcomeEmail);
console.log(reportEmail);
```

---

## Prototype Pattern

### What is it?
Creates new objects by cloning an existing object (prototype) rather than creating new instances from scratch.

### When to Use
- When object creation is expensive
- When you need many similar objects with slight variations
- When you want to hide complexity of creating new instances

### Practical Example 1: Document Templates

```javascript
/**
 * Document Prototype
 * Clone documents as templates
 */
class Document {
  constructor(title, content, metadata = {}) {
    this.title = title;
    this.content = content;
    this.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Unknown',
      version: '1.0',
      ...metadata
    };
    this.sections = [];
  }
  
  addSection(section) {
    this.sections.push(section);
  }
  
  clone() {
    const cloned = new Document(
      this.title,
      this.content,
      { ...this.metadata, createdAt: new Date(), updatedAt: new Date() }
    );
    
    // Deep clone sections
    cloned.sections = this.sections.map(section => ({ ...section }));
    
    return cloned;
  }
  
  setTitle(title) {
    this.title = title;
    this.metadata.updatedAt = new Date();
    return this;
  }
  
  setContent(content) {
    this.content = content;
    this.metadata.updatedAt = new Date();
    return this;
  }
  
  setAuthor(author) {
    this.metadata.author = author;
    return this;
  }
}

// Create document templates
const contractTemplate = new Document(
  'Service Agreement',
  'This agreement is entered into between [PARTY A] and [PARTY B]...',
  { type: 'contract', status: 'template' }
);
contractTemplate.addSection({ name: 'Terms', content: '1. Duration...' });
contractTemplate.addSection({ name: 'Payment', content: '2. Payment terms...' });
contractTemplate.addSection({ name: 'Termination', content: '3. Either party may...' });

const reportTemplate = new Document(
  'Monthly Report',
  'Executive Summary: ...',
  { type: 'report', status: 'template' }
);
reportTemplate.addSection({ name: 'Metrics', content: '' });
reportTemplate.addSection({ name: 'Analysis', content: '' });
reportTemplate.addSection({ name: 'Recommendations', content: '' });

// Document Registry (Prototype Registry)
class DocumentRegistry {
  constructor() {
    this.templates = new Map();
  }
  
  register(name, template) {
    this.templates.set(name, template);
  }
  
  create(name) {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }
    return template.clone();
  }
  
  list() {
    return Array.from(this.templates.keys());
  }
}

// Usage
const registry = new DocumentRegistry();
registry.register('contract', contractTemplate);
registry.register('report', reportTemplate);

// Create new documents from templates
const clientContract = registry.create('contract')
  .setTitle('Service Agreement - Acme Corp')
  .setAuthor('Legal Team');

const janReport = registry.create('report')
  .setTitle('January 2024 Report')
  .setAuthor('Analytics Team');

const febReport = registry.create('report')
  .setTitle('February 2024 Report')
  .setAuthor('Analytics Team');

console.log(clientContract);
console.log(janReport);
```

### Practical Example 2: Game Entity Spawning

```javascript
/**
 * Game Entity Prototype
 * Efficiently spawn game entities by cloning
 */
class GameEntity {
  constructor(config) {
    this.id = crypto.randomUUID();
    this.type = config.type;
    this.name = config.name;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.health = config.health || 100;
    this.maxHealth = config.maxHealth || 100;
    this.speed = config.speed || 1;
    this.damage = config.damage || 10;
    this.armor = config.armor || 0;
    this.abilities = config.abilities || [];
    this.animations = config.animations || {};
    this.sounds = config.sounds || {};
    this.ai = config.ai || null;
  }
  
  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    
    cloned.id = crypto.randomUUID();
    cloned.type = this.type;
    cloned.name = this.name;
    cloned.position = { ...this.position };
    cloned.rotation = { ...this.rotation };
    cloned.scale = { ...this.scale };
    cloned.health = this.maxHealth;
    cloned.maxHealth = this.maxHealth;
    cloned.speed = this.speed;
    cloned.damage = this.damage;
    cloned.armor = this.armor;
    cloned.abilities = [...this.abilities];
    cloned.animations = { ...this.animations };
    cloned.sounds = { ...this.sounds };
    cloned.ai = this.ai ? { ...this.ai } : null;
    
    return cloned;
  }
  
  setPosition(x, y, z) {
    this.position = { x, y, z };
    return this;
  }
  
  takeDamage(amount) {
    const actualDamage = Math.max(0, amount - this.armor);
    this.health = Math.max(0, this.health - actualDamage);
    return this;
  }
}

// Create prototype entities (expensive configuration done once)
const zombiePrototype = new GameEntity({
  type: 'enemy',
  name: 'Zombie',
  health: 50,
  maxHealth: 50,
  speed: 0.5,
  damage: 15,
  armor: 0,
  abilities: ['bite', 'grab'],
  animations: {
    idle: 'zombie_idle.anim',
    walk: 'zombie_walk.anim',
    attack: 'zombie_attack.anim',
    death: 'zombie_death.anim'
  },
  sounds: {
    spawn: 'zombie_groan.wav',
    attack: 'zombie_bite.wav',
    death: 'zombie_death.wav'
  },
  ai: {
    type: 'aggressive',
    detectionRange: 20,
    attackRange: 2
  }
});

const skeletonPrototype = new GameEntity({
  type: 'enemy',
  name: 'Skeleton',
  health: 30,
  maxHealth: 30,
  speed: 1.2,
  damage: 20,
  armor: 5,
  abilities: ['sword_slash', 'shield_block'],
  animations: {
    idle: 'skeleton_idle.anim',
    walk: 'skeleton_walk.anim',
    attack: 'skeleton_attack.anim',
    block: 'skeleton_block.anim',
    death: 'skeleton_death.anim'
  },
  ai: {
    type: 'tactical',
    detectionRange: 30,
    attackRange: 3
  }
});

// Entity Spawner
class EntitySpawner {
  constructor() {
    this.prototypes = new Map();
  }
  
  register(name, prototype) {
    this.prototypes.set(name, prototype);
  }
  
  spawn(name, position) {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      throw new Error(`Unknown entity: ${name}`);
    }
    
    return prototype.clone().setPosition(position.x, position.y, position.z);
  }
  
  spawnWave(name, count, positions) {
    return positions.slice(0, count).map(pos => this.spawn(name, pos));
  }
}

// Usage
const spawner = new EntitySpawner();
spawner.register('zombie', zombiePrototype);
spawner.register('skeleton', skeletonPrototype);

// Spawn enemies efficiently
const zombie1 = spawner.spawn('zombie', { x: 10, y: 0, z: 5 });
const zombie2 = spawner.spawn('zombie', { x: 15, y: 0, z: 8 });
const skeleton = spawner.spawn('skeleton', { x: 20, y: 0, z: 10 });

// Spawn a wave
const zombieWave = spawner.spawnWave('zombie', 10, [
  { x: 0, y: 0, z: 0 },
  { x: 5, y: 0, z: 0 },
  { x: 10, y: 0, z: 0 },
  // ... more positions
]);

console.log(zombie1.id !== zombie2.id); // true - different instances
console.log(zombie1.abilities); // ['bite', 'grab']
```

---

## Summary

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| **Factory** | Create objects without specifying exact class | Complex object creation, multiple similar types |
| **Abstract Factory** | Create families of related objects | Cross-platform UI, themed components |
| **Singleton** | Single instance with global access | Config, Logger, DB connection, Cache |
| **Builder** | Construct complex objects step by step | Many optional parameters, fluent APIs |
| **Prototype** | Clone existing objects | Expensive creation, similar objects with variations |

मालिक, master these creational patterns to write cleaner, more maintainable code! 🚀
