# Behavioral Design Patterns in JavaScript

Behavioral patterns deal with communication between objects, defining how objects interact and distribute responsibility.

## Table of Contents
1. [Observer Pattern](#observer-pattern)
2. [Strategy Pattern](#strategy-pattern)
3. [Command Pattern](#command-pattern)
4. [State Pattern](#state-pattern)
5. [Chain of Responsibility](#chain-of-responsibility)
6. [Iterator Pattern](#iterator-pattern)
7. [Mediator Pattern](#mediator-pattern)

---

## Observer Pattern

### What is it?
Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified.

### When to Use
- Event handling systems
- Real-time updates
- Reactive programming
- Pub/Sub systems

### Practical Example 1: Event Emitter

```javascript
/**
 * Custom Event Emitter
 * Node.js style event handling
 */
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
    return this;
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper);
    };
    onceWrapper.originalListener = listener;
    return this.on(event, onceWrapper);
  }
  
  off(event, listener) {
    if (!this.events.has(event)) return this;
    
    const listeners = this.events.get(event);
    const index = listeners.findIndex(
      l => l === listener || l.originalListener === listener
    );
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
    
    return this;
  }
  
  emit(event, ...args) {
    if (!this.events.has(event)) return false;
    
    const listeners = this.events.get(event).slice();
    listeners.forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
    
    return true;
  }
  
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
  
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}

// Usage
const emitter = new EventEmitter();

emitter.on('user:login', (user) => {
  console.log(`User logged in: ${user.name}`);
});

emitter.on('user:login', (user) => {
  console.log(`Sending welcome email to ${user.email}`);
});

emitter.once('user:login', (user) => {
  console.log(`First login bonus for ${user.name}!`);
});

emitter.emit('user:login', { name: 'John', email: 'john@example.com' });
// All three handlers fire

emitter.emit('user:login', { name: 'Jane', email: 'jane@example.com' });
// Only first two handlers fire (once handler removed)
```

### Practical Example 2: Reactive Store (Redux-like)

```javascript
/**
 * Reactive Store
 * State management with observers
 */
class Store {
  constructor(reducer, initialState = {}) {
    this.reducer = reducer;
    this.state = initialState;
    this.listeners = new Set();
    this.isDispatching = false;
  }
  
  getState() {
    return this.state;
  }
  
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  dispatch(action) {
    if (this.isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }
    
    try {
      this.isDispatching = true;
      this.state = this.reducer(this.state, action);
    } finally {
      this.isDispatching = false;
    }
    
    // Notify all subscribers
    this.listeners.forEach(listener => listener());
    
    return action;
  }
}

// Reducer
function todoReducer(state = { todos: [], filter: 'all' }, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      return state;
  }
}

// Usage
const store = new Store(todoReducer);

// Subscribe to changes
const unsubscribe = store.subscribe(() => {
  console.log('State changed:', store.getState());
});

// UI Component subscribing
class TodoList {
  constructor(store) {
    this.store = store;
    this.unsubscribe = store.subscribe(() => this.render());
    this.render();
  }
  
  render() {
    const state = this.store.getState();
    const filteredTodos = this.getFilteredTodos(state);
    console.log('Rendering todos:', filteredTodos);
  }
  
  getFilteredTodos(state) {
    switch (state.filter) {
      case 'completed':
        return state.todos.filter(t => t.completed);
      case 'active':
        return state.todos.filter(t => !t.completed);
      default:
        return state.todos;
    }
  }
  
  destroy() {
    this.unsubscribe();
  }
}

const todoList = new TodoList(store);

// Dispatch actions
store.dispatch({ type: 'ADD_TODO', payload: 'Learn Observer Pattern' });
store.dispatch({ type: 'ADD_TODO', payload: 'Build a project' });
store.dispatch({ type: 'TOGGLE_TODO', payload: store.getState().todos[0].id });
store.dispatch({ type: 'SET_FILTER', payload: 'completed' });
```

### Practical Example 3: DOM Event Delegation

```javascript
/**
 * Event Delegation Observer
 * Efficient event handling for dynamic content
 */
class EventDelegator {
  constructor(rootElement) {
    this.root = rootElement;
    this.handlers = new Map();
    this.setupDelegation();
  }
  
  setupDelegation() {
    // Single listener for all events
    ['click', 'input', 'change', 'submit', 'keydown', 'keyup'].forEach(eventType => {
      this.root.addEventListener(eventType, (e) => this.handleEvent(e));
    });
  }
  
  handleEvent(event) {
    const key = event.type;
    if (!this.handlers.has(key)) return;
    
    const handlers = this.handlers.get(key);
    
    // Walk up the DOM tree
    let element = event.target;
    while (element && element !== this.root) {
      handlers.forEach(({ selector, callback }) => {
        if (element.matches(selector)) {
          callback.call(element, event, element);
        }
      });
      element = element.parentElement;
    }
  }
  
  on(eventType, selector, callback) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType).push({ selector, callback });
    
    return () => this.off(eventType, selector, callback);
  }
  
  off(eventType, selector, callback) {
    if (!this.handlers.has(eventType)) return;
    
    const handlers = this.handlers.get(eventType);
    const index = handlers.findIndex(
      h => h.selector === selector && h.callback === callback
    );
    
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}

// Usage
const delegator = new EventDelegator(document.body);

// Handle all button clicks
delegator.on('click', 'button.delete-btn', (e, element) => {
  const itemId = element.dataset.id;
  console.log(`Delete item ${itemId}`);
});

// Handle all form submissions
delegator.on('submit', 'form.ajax-form', (e, form) => {
  e.preventDefault();
  const formData = new FormData(form);
  console.log('Submitting form:', Object.fromEntries(formData));
});

// Handle input changes
delegator.on('input', 'input[data-validate]', (e, input) => {
  const validationType = input.dataset.validate;
  console.log(`Validating ${validationType}:`, input.value);
});
```

---

## Strategy Pattern

### What is it?
Defines a family of algorithms, encapsulates each one, and makes them interchangeable.

### When to Use
- Multiple algorithms for the same task
- Avoiding conditional statements
- Runtime algorithm switching

### Practical Example 1: Payment Strategies

```javascript
/**
 * Payment Strategy
 * Different payment methods with same interface
 */

// Strategy Interface
class PaymentStrategy {
  pay(amount) {
    throw new Error('pay() must be implemented');
  }
  
  validate() {
    throw new Error('validate() must be implemented');
  }
}

// Concrete Strategies
class CreditCardStrategy extends PaymentStrategy {
  constructor(cardNumber, cvv, expiryDate) {
    super();
    this.cardNumber = cardNumber;
    this.cvv = cvv;
    this.expiryDate = expiryDate;
  }
  
  validate() {
    // Luhn algorithm check
    const digits = this.cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) {
      return { valid: false, error: 'Invalid card number length' };
    }
    
    if (!/^\d{3,4}$/.test(this.cvv)) {
      return { valid: false, error: 'Invalid CVV' };
    }
    
    const [month, year] = this.expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry < new Date()) {
      return { valid: false, error: 'Card expired' };
    }
    
    return { valid: true };
  }
  
  pay(amount) {
    const validation = this.validate();
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    console.log(`Charging $${amount} to card ending in ${this.cardNumber.slice(-4)}`);
    return {
      success: true,
      transactionId: `CC_${Date.now()}`,
      method: 'credit_card'
    };
  }
}

class PayPalStrategy extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
    this.isAuthenticated = false;
  }
  
  authenticate() {
    console.log(`Redirecting to PayPal for ${this.email}...`);
    this.isAuthenticated = true;
    return true;
  }
  
  validate() {
    if (!this.email || !this.email.includes('@')) {
      return { valid: false, error: 'Invalid email' };
    }
    return { valid: true };
  }
  
  pay(amount) {
    const validation = this.validate();
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    if (!this.isAuthenticated) {
      this.authenticate();
    }
    
    console.log(`Processing PayPal payment of $${amount} for ${this.email}`);
    return {
      success: true,
      transactionId: `PP_${Date.now()}`,
      method: 'paypal'
    };
  }
}

class CryptoStrategy extends PaymentStrategy {
  constructor(walletAddress, currency = 'BTC') {
    super();
    this.walletAddress = walletAddress;
    this.currency = currency;
    this.exchangeRates = {
      BTC: 45000,
      ETH: 3000,
      USDT: 1
    };
  }
  
  validate() {
    if (!this.walletAddress || this.walletAddress.length < 26) {
      return { valid: false, error: 'Invalid wallet address' };
    }
    if (!this.exchangeRates[this.currency]) {
      return { valid: false, error: 'Unsupported cryptocurrency' };
    }
    return { valid: true };
  }
  
  convertToUSD(cryptoAmount) {
    return cryptoAmount * this.exchangeRates[this.currency];
  }
  
  convertFromUSD(usdAmount) {
    return usdAmount / this.exchangeRates[this.currency];
  }
  
  pay(amount) {
    const validation = this.validate();
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const cryptoAmount = this.convertFromUSD(amount);
    console.log(`Processing ${cryptoAmount.toFixed(8)} ${this.currency} ($${amount}) to ${this.walletAddress}`);
    
    return {
      success: true,
      transactionId: `CRYPTO_${Date.now()}`,
      method: 'crypto',
      cryptoAmount,
      currency: this.currency
    };
  }
}

// Context
class PaymentProcessor {
  constructor() {
    this.strategy = null;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  checkout(amount) {
    if (!this.strategy) {
      throw new Error('Payment strategy not set');
    }
    return this.strategy.pay(amount);
  }
}

// Usage
const processor = new PaymentProcessor();

// Pay with credit card
processor.setStrategy(new CreditCardStrategy('4111111111111111', '123', '12/25'));
console.log(processor.checkout(99.99));

// Pay with PayPal
processor.setStrategy(new PayPalStrategy('user@example.com'));
console.log(processor.checkout(99.99));

// Pay with Crypto
processor.setStrategy(new CryptoStrategy('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'BTC'));
console.log(processor.checkout(99.99));
```

### Practical Example 2: Sorting Strategies

```javascript
/**
 * Sorting Strategies
 * Different sorting algorithms interchangeable
 */

class SortStrategy {
  sort(data, compareFn) {
    throw new Error('sort() must be implemented');
  }
}

class QuickSortStrategy extends SortStrategy {
  sort(data, compareFn = (a, b) => a - b) {
    if (data.length <= 1) return [...data];
    
    const arr = [...data];
    this.quickSort(arr, 0, arr.length - 1, compareFn);
    return arr;
  }
  
  quickSort(arr, low, high, compareFn) {
    if (low < high) {
      const pi = this.partition(arr, low, high, compareFn);
      this.quickSort(arr, low, pi - 1, compareFn);
      this.quickSort(arr, pi + 1, high, compareFn);
    }
  }
  
  partition(arr, low, high, compareFn) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (compareFn(arr[j], pivot) < 0) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }
}

class MergeSortStrategy extends SortStrategy {
  sort(data, compareFn = (a, b) => a - b) {
    if (data.length <= 1) return [...data];
    
    const mid = Math.floor(data.length / 2);
    const left = this.sort(data.slice(0, mid), compareFn);
    const right = this.sort(data.slice(mid), compareFn);
    
    return this.merge(left, right, compareFn);
  }
  
  merge(left, right, compareFn) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (compareFn(left[i], right[j]) <= 0) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
}

class BubbleSortStrategy extends SortStrategy {
  sort(data, compareFn = (a, b) => a - b) {
    const arr = [...data];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (compareFn(arr[j], arr[j + 1]) > 0) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    
    return arr;
  }
}

// Sorter Context with automatic strategy selection
class Sorter {
  constructor() {
    this.strategies = {
      quick: new QuickSortStrategy(),
      merge: new MergeSortStrategy(),
      bubble: new BubbleSortStrategy()
    };
  }
  
  sort(data, options = {}) {
    const { algorithm = 'auto', compareFn } = options;
    
    // Auto-select best algorithm based on data size
    let strategy;
    if (algorithm === 'auto') {
      if (data.length < 10) {
        strategy = this.strategies.bubble; // Simple for small arrays
      } else if (data.length < 1000) {
        strategy = this.strategies.quick;
      } else {
        strategy = this.strategies.merge; // Stable for large arrays
      }
    } else {
      strategy = this.strategies[algorithm];
    }
    
    if (!strategy) {
      throw new Error(`Unknown algorithm: ${algorithm}`);
    }
    
    const start = performance.now();
    const result = strategy.sort(data, compareFn);
    const duration = performance.now() - start;
    
    return { result, duration, algorithm: strategy.constructor.name };
  }
}

// Usage
const sorter = new Sorter();

const smallArray = [5, 2, 8, 1, 9];
const largeArray = Array.from({ length: 10000 }, () => Math.random() * 10000);

console.log(sorter.sort(smallArray)); // Uses bubble sort
console.log(sorter.sort(largeArray)); // Uses merge sort

// Sort objects
const users = [
  { name: 'John', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 35 }
];

const sortedByAge = sorter.sort(users, {
  algorithm: 'quick',
  compareFn: (a, b) => a.age - b.age
});
console.log(sortedByAge.result);
```

### Practical Example 3: Compression Strategies

```javascript
/**
 * Compression Strategies
 * Different compression algorithms
 */

class CompressionStrategy {
  compress(data) {
    throw new Error('compress() must be implemented');
  }
  
  decompress(data) {
    throw new Error('decompress() must be implemented');
  }
}

class RunLengthEncodingStrategy extends CompressionStrategy {
  compress(data) {
    let result = '';
    let count = 1;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] === data[i + 1]) {
        count++;
      } else {
        result += count > 1 ? `${count}${data[i]}` : data[i];
        count = 1;
      }
    }
    
    return result;
  }
  
  decompress(data) {
    let result = '';
    let count = '';
    
    for (const char of data) {
      if (/\d/.test(char)) {
        count += char;
      } else {
        const repeat = count ? parseInt(count) : 1;
        result += char.repeat(repeat);
        count = '';
      }
    }
    
    return result;
  }
}

class LZWStrategy extends CompressionStrategy {
  compress(data) {
    // Build initial dictionary
    const dictionary = new Map();
    for (let i = 0; i < 256; i++) {
      dictionary.set(String.fromCharCode(i), i);
    }
    
    let w = '';
    const result = [];
    let dictSize = 256;
    
    for (const c of data) {
      const wc = w + c;
      if (dictionary.has(wc)) {
        w = wc;
      } else {
        result.push(dictionary.get(w));
        dictionary.set(wc, dictSize++);
        w = c;
      }
    }
    
    if (w) {
      result.push(dictionary.get(w));
    }
    
    return result;
  }
  
  decompress(compressed) {
    // Build initial dictionary
    const dictionary = new Map();
    for (let i = 0; i < 256; i++) {
      dictionary.set(i, String.fromCharCode(i));
    }
    
    let w = String.fromCharCode(compressed[0]);
    let result = w;
    let dictSize = 256;
    
    for (let i = 1; i < compressed.length; i++) {
      const k = compressed[i];
      let entry;
      
      if (dictionary.has(k)) {
        entry = dictionary.get(k);
      } else if (k === dictSize) {
        entry = w + w[0];
      } else {
        throw new Error('Invalid compressed data');
      }
      
      result += entry;
      dictionary.set(dictSize++, w + entry[0]);
      w = entry;
    }
    
    return result;
  }
}

// Compressor Context
class Compressor {
  constructor() {
    this.strategies = {
      rle: new RunLengthEncodingStrategy(),
      lzw: new LZWStrategy()
    };
  }
  
  compress(data, algorithm = 'lzw') {
    const strategy = this.strategies[algorithm];
    if (!strategy) {
      throw new Error(`Unknown algorithm: ${algorithm}`);
    }
    
    const start = performance.now();
    const compressed = strategy.compress(data);
    const duration = performance.now() - start;
    
    const originalSize = data.length;
    const compressedSize = Array.isArray(compressed) 
      ? compressed.length * 2 // Assuming 16-bit numbers
      : compressed.length;
    
    return {
      compressed,
      originalSize,
      compressedSize,
      ratio: (compressedSize / originalSize * 100).toFixed(2) + '%',
      duration: duration.toFixed(2) + 'ms',
      algorithm
    };
  }
  
  decompress(data, algorithm = 'lzw') {
    const strategy = this.strategies[algorithm];
    if (!strategy) {
      throw new Error(`Unknown algorithm: ${algorithm}`);
    }
    
    return strategy.decompress(data);
  }
}

// Usage
const compressor = new Compressor();

// RLE is good for repetitive data
const repetitive = 'AAAAAABBBBCCCCCCCCDDDD';
const rleResult = compressor.compress(repetitive, 'rle');
console.log('RLE:', rleResult);
console.log('Decompressed:', compressor.decompress(rleResult.compressed, 'rle'));

// LZW is better for general text
const text = 'The quick brown fox jumps over the lazy dog. The quick brown fox jumps again.';
const lzwResult = compressor.compress(text, 'lzw');
console.log('LZW:', lzwResult);
console.log('Decompressed:', compressor.decompress(lzwResult.compressed, 'lzw'));
```

---

## Command Pattern

### What is it?
Encapsulates a request as an object, allowing parameterization, queuing, logging, and undoable operations.

### When to Use
- Undo/Redo functionality
- Macro recording
- Transaction systems
- Task queues

### Practical Example 1: Text Editor with Undo/Redo

```javascript
/**
 * Text Editor Commands
 * Full undo/redo support
 */

// Command Interface
class Command {
  execute() {
    throw new Error('execute() must be implemented');
  }
  
  undo() {
    throw new Error('undo() must be implemented');
  }
  
  getDescription() {
    return 'Command';
  }
}

// Text Editor (Receiver)
class TextEditor {
  constructor() {
    this.content = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.clipboard = '';
  }
  
  getContent() {
    return this.content;
  }
  
  setContent(content) {
    this.content = content;
  }
  
  setSelection(start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }
  
  getSelection() {
    return this.content.substring(this.selectionStart, this.selectionEnd);
  }
  
  insertAt(position, text) {
    this.content = 
      this.content.substring(0, position) + 
      text + 
      this.content.substring(position);
  }
  
  deleteRange(start, end) {
    const deleted = this.content.substring(start, end);
    this.content = this.content.substring(0, start) + this.content.substring(end);
    return deleted;
  }
}

// Concrete Commands
class InsertTextCommand extends Command {
  constructor(editor, text, position) {
    super();
    this.editor = editor;
    this.text = text;
    this.position = position;
  }
  
  execute() {
    this.editor.insertAt(this.position, this.text);
  }
  
  undo() {
    this.editor.deleteRange(this.position, this.position + this.text.length);
  }
  
  getDescription() {
    return `Insert "${this.text.substring(0, 20)}${this.text.length > 20 ? '...' : ''}"`;
  }
}

class DeleteTextCommand extends Command {
  constructor(editor, start, end) {
    super();
    this.editor = editor;
    this.start = start;
    this.end = end;
    this.deletedText = '';
  }
  
  execute() {
    this.deletedText = this.editor.deleteRange(this.start, this.end);
  }
  
  undo() {
    this.editor.insertAt(this.start, this.deletedText);
  }
  
  getDescription() {
    return `Delete "${this.deletedText.substring(0, 20)}${this.deletedText.length > 20 ? '...' : ''}"`;
  }
}

class ReplaceTextCommand extends Command {
  constructor(editor, start, end, newText) {
    super();
    this.editor = editor;
    this.start = start;
    this.end = end;
    this.newText = newText;
    this.oldText = '';
  }
  
  execute() {
    this.oldText = this.editor.deleteRange(this.start, this.end);
    this.editor.insertAt(this.start, this.newText);
  }
  
  undo() {
    this.editor.deleteRange(this.start, this.start + this.newText.length);
    this.editor.insertAt(this.start, this.oldText);
  }
  
  getDescription() {
    return `Replace "${this.oldText}" with "${this.newText}"`;
  }
}

// Macro Command (Composite)
class MacroCommand extends Command {
  constructor(commands = []) {
    super();
    this.commands = commands;
  }
  
  add(command) {
    this.commands.push(command);
  }
  
  execute() {
    this.commands.forEach(cmd => cmd.execute());
  }
  
  undo() {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
  
  getDescription() {
    return `Macro: ${this.commands.length} commands`;
  }
}

// Command Invoker with History
class CommandManager {
  constructor() {
    this.history = [];
    this.redoStack = [];
    this.maxHistory = 100;
  }
  
  execute(command) {
    command.execute();
    this.history.push(command);
    this.redoStack = []; // Clear redo stack on new command
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }
  
  undo() {
    if (this.history.length === 0) {
      console.log('Nothing to undo');
      return;
    }
    
    const command = this.history.pop();
    command.undo();
    this.redoStack.push(command);
    
    console.log(`Undid: ${command.getDescription()}`);
  }
  
  redo() {
    if (this.redoStack.length === 0) {
      console.log('Nothing to redo');
      return;
    }
    
    const command = this.redoStack.pop();
    command.execute();
    this.history.push(command);
    
    console.log(`Redid: ${command.getDescription()}`);
  }
  
  canUndo() {
    return this.history.length > 0;
  }
  
  canRedo() {
    return this.redoStack.length > 0;
  }
  
  getHistory() {
    return this.history.map(cmd => cmd.getDescription());
  }
}

// Usage
const editor = new TextEditor();
const commandManager = new CommandManager();

// Type some text
commandManager.execute(new InsertTextCommand(editor, 'Hello ', 0));
console.log(editor.getContent()); // "Hello "

commandManager.execute(new InsertTextCommand(editor, 'World!', 6));
console.log(editor.getContent()); // "Hello World!"

// Delete some text
commandManager.execute(new DeleteTextCommand(editor, 5, 11));
console.log(editor.getContent()); // "Hello!"

// Undo
commandManager.undo();
console.log(editor.getContent()); // "Hello World!"

commandManager.undo();
console.log(editor.getContent()); // "Hello "

// Redo
commandManager.redo();
console.log(editor.getContent()); // "Hello World!"

// Macro command
const formatMacro = new MacroCommand([
  new DeleteTextCommand(editor, 0, editor.getContent().length),
  new InsertTextCommand(editor, 'FORMATTED TEXT', 0)
]);

commandManager.execute(formatMacro);
console.log(editor.getContent()); // "FORMATTED TEXT"

commandManager.undo(); // Undoes entire macro
console.log(editor.getContent()); // "Hello World!"

console.log('History:', commandManager.getHistory());
```

---

## State Pattern

### What is it?
Allows an object to alter its behavior when its internal state changes.

### When to Use
- Objects with state-dependent behavior
- State machines
- Workflow systems

### Practical Example: Order State Machine

```javascript
/**
 * Order State Machine
 * State-dependent behavior for e-commerce orders
 */

// State Interface
class OrderState {
  constructor(order) {
    this.order = order;
  }
  
  getName() {
    throw new Error('getName() must be implemented');
  }
  
  pay() {
    throw new Error(`Cannot pay in ${this.getName()} state`);
  }
  
  ship() {
    throw new Error(`Cannot ship in ${this.getName()} state`);
  }
  
  deliver() {
    throw new Error(`Cannot deliver in ${this.getName()} state`);
  }
  
  cancel() {
    throw new Error(`Cannot cancel in ${this.getName()} state`);
  }
  
  refund() {
    throw new Error(`Cannot refund in ${this.getName()} state`);
  }
}

// Concrete States
class PendingState extends OrderState {
  getName() { return 'pending'; }
  
  pay() {
    console.log('Processing payment...');
    this.order.setState(new PaidState(this.order));
    return { success: true, message: 'Payment successful' };
  }
  
  cancel() {
    console.log('Cancelling order...');
    this.order.setState(new CancelledState(this.order));
    return { success: true, message: 'Order cancelled' };
  }
}

class PaidState extends OrderState {
  getName() { return 'paid'; }
  
  ship() {
    console.log('Shipping order...');
    this.order.setState(new ShippedState(this.order));
    return { success: true, message: 'Order shipped' };
  }
  
  refund() {
    console.log('Processing refund...');
    this.order.setState(new RefundedState(this.order));
    return { success: true, message: 'Order refunded' };
  }
}

class ShippedState extends OrderState {
  getName() { return 'shipped'; }
  
  deliver() {
    console.log('Order delivered!');
    this.order.setState(new DeliveredState(this.order));
    return { success: true, message: 'Order delivered' };
  }
}

class DeliveredState extends OrderState {
  getName() { return 'delivered'; }
  
  refund() {
    // Check if within refund window (e.g., 30 days)
    const daysSinceDelivery = Math.floor(
      (Date.now() - this.order.deliveredAt) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceDelivery > 30) {
      throw new Error('Refund window has expired');
    }
    
    console.log('Processing refund for delivered order...');
    this.order.setState(new RefundedState(this.order));
    return { success: true, message: 'Refund initiated' };
  }
}

class CancelledState extends OrderState {
  getName() { return 'cancelled'; }
  
  // No transitions allowed from cancelled
}

class RefundedState extends OrderState {
  getName() { return 'refunded'; }
  
  // No transitions allowed from refunded
}

// Order Context
class Order {
  constructor(id, items) {
    this.id = id;
    this.items = items;
    this.state = new PendingState(this);
    this.createdAt = new Date();
    this.paidAt = null;
    this.shippedAt = null;
    this.deliveredAt = null;
    this.history = [];
  }
  
  setState(state) {
    const oldState = this.state.getName();
    this.state = state;
    const newState = state.getName();
    
    // Update timestamps
    if (newState === 'paid') this.paidAt = new Date();
    if (newState === 'shipped') this.shippedAt = new Date();
    if (newState === 'delivered') this.deliveredAt = new Date();
    
    // Record history
    this.history.push({
      from: oldState,
      to: newState,
      timestamp: new Date()
    });
    
    console.log(`Order ${this.id}: ${oldState} → ${newState}`);
  }
  
  getStatus() {
    return this.state.getName();
  }
  
  pay() {
    return this.state.pay();
  }
  
  ship() {
    return this.state.ship();
  }
  
  deliver() {
    return this.state.deliver();
  }
  
  cancel() {
    return this.state.cancel();
  }
  
  refund() {
    return this.state.refund();
  }
  
  getInfo() {
    return {
      id: this.id,
      status: this.getStatus(),
      items: this.items,
      history: this.history
    };
  }
}

// Usage
const order = new Order('ORD-001', [
  { product: 'Laptop', quantity: 1, price: 999 },
  { product: 'Mouse', quantity: 2, price: 29 }
]);

console.log('Initial status:', order.getStatus()); // pending

order.pay();
console.log('After payment:', order.getStatus()); // paid

order.ship();
console.log('After shipping:', order.getStatus()); // shipped

order.deliver();
console.log('After delivery:', order.getStatus()); // delivered

// Try invalid transition
try {
  order.ship(); // Can't ship a delivered order
} catch (e) {
  console.log('Error:', e.message);
}

console.log('Order history:', order.getInfo().history);

// Test cancel flow
const order2 = new Order('ORD-002', [{ product: 'Book', quantity: 1, price: 19 }]);
order2.cancel();
console.log('Cancelled order status:', order2.getStatus()); // cancelled
```

---

## Summary

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| **Observer** | One-to-many notification | Events, reactive systems |
| **Strategy** | Interchangeable algorithms | Multiple algorithms, runtime switching |
| **Command** | Encapsulate requests | Undo/redo, queues, transactions |
| **State** | State-dependent behavior | State machines, workflows |
| **Chain of Responsibility** | Pass request along chain | Middleware, validation |
| **Iterator** | Sequential access | Collections, pagination |
| **Mediator** | Centralized communication | Complex object interactions |

मालिक, master these behavioral patterns to build robust, flexible applications! 🚀
