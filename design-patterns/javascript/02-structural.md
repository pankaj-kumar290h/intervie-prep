# Structural Design Patterns in JavaScript

Structural patterns deal with object composition, creating relationships between objects to form larger structures.

## Table of Contents
1. [Adapter Pattern](#adapter-pattern)
2. [Decorator Pattern](#decorator-pattern)
3. [Facade Pattern](#facade-pattern)
4. [Proxy Pattern](#proxy-pattern)
5. [Composite Pattern](#composite-pattern)
6. [Bridge Pattern](#bridge-pattern)

---

## Adapter Pattern

### What is it?
Allows objects with incompatible interfaces to work together by wrapping an object in an adapter.

### When to Use
- Integrating with third-party APIs
- Working with legacy code
- Converting data formats

### Practical Example 1: Payment Gateway Adapter

```javascript
/**
 * Payment Gateway Adapter
 * Unify different payment providers under one interface
 */

// Our application's expected interface
class PaymentGateway {
  charge(amount, currency, cardDetails) {
    throw new Error('charge() must be implemented');
  }
  
  refund(transactionId, amount) {
    throw new Error('refund() must be implemented');
  }
  
  getTransaction(transactionId) {
    throw new Error('getTransaction() must be implemented');
  }
}

// Third-party Stripe SDK (different interface)
class StripeSDK {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  
  createPaymentIntent(params) {
    console.log('Stripe: Creating payment intent', params);
    return {
      id: `pi_${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
      status: 'succeeded'
    };
  }
  
  createRefund(params) {
    console.log('Stripe: Creating refund', params);
    return {
      id: `re_${Date.now()}`,
      payment_intent: params.payment_intent,
      amount: params.amount
    };
  }
  
  retrievePaymentIntent(id) {
    return { id, status: 'succeeded' };
  }
}

// Third-party PayPal SDK (different interface)
class PayPalSDK {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }
  
  createOrder(orderData) {
    console.log('PayPal: Creating order', orderData);
    return {
      id: `PP_${Date.now()}`,
      purchase_units: orderData.purchase_units,
      status: 'COMPLETED'
    };
  }
  
  capturePayment(orderId) {
    return { id: orderId, status: 'COMPLETED' };
  }
  
  refundOrder(captureId, amount) {
    console.log('PayPal: Refunding', captureId, amount);
    return { id: `RF_${Date.now()}`, status: 'COMPLETED' };
  }
  
  getOrder(orderId) {
    return { id: orderId, status: 'COMPLETED' };
  }
}

// Stripe Adapter
class StripeAdapter extends PaymentGateway {
  constructor(apiKey) {
    super();
    this.stripe = new StripeSDK(apiKey);
  }
  
  async charge(amount, currency, cardDetails) {
    const result = await this.stripe.createPaymentIntent({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      payment_method: cardDetails.token
    });
    
    return {
      success: result.status === 'succeeded',
      transactionId: result.id,
      amount: amount,
      currency: currency,
      provider: 'stripe'
    };
  }
  
  async refund(transactionId, amount) {
    const result = await this.stripe.createRefund({
      payment_intent: transactionId,
      amount: amount ? Math.round(amount * 100) : undefined
    });
    
    return {
      success: true,
      refundId: result.id,
      originalTransaction: transactionId
    };
  }
  
  async getTransaction(transactionId) {
    const result = await this.stripe.retrievePaymentIntent(transactionId);
    return {
      id: result.id,
      status: result.status === 'succeeded' ? 'completed' : result.status,
      provider: 'stripe'
    };
  }
}

// PayPal Adapter
class PayPalAdapter extends PaymentGateway {
  constructor(clientId, clientSecret) {
    super();
    this.paypal = new PayPalSDK(clientId, clientSecret);
  }
  
  async charge(amount, currency, cardDetails) {
    const order = await this.paypal.createOrder({
      purchase_units: [{
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2)
        }
      }]
    });
    
    const capture = await this.paypal.capturePayment(order.id);
    
    return {
      success: capture.status === 'COMPLETED',
      transactionId: order.id,
      amount: amount,
      currency: currency,
      provider: 'paypal'
    };
  }
  
  async refund(transactionId, amount) {
    const result = await this.paypal.refundOrder(transactionId, amount);
    
    return {
      success: result.status === 'COMPLETED',
      refundId: result.id,
      originalTransaction: transactionId
    };
  }
  
  async getTransaction(transactionId) {
    const result = await this.paypal.getOrder(transactionId);
    return {
      id: result.id,
      status: result.status === 'COMPLETED' ? 'completed' : result.status.toLowerCase(),
      provider: 'paypal'
    };
  }
}

// Payment Service using adapters
class PaymentService {
  constructor() {
    this.adapters = new Map();
  }
  
  registerAdapter(name, adapter) {
    this.adapters.set(name, adapter);
  }
  
  async processPayment(provider, amount, currency, cardDetails) {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Unknown payment provider: ${provider}`);
    }
    return await adapter.charge(amount, currency, cardDetails);
  }
}

// Usage
const paymentService = new PaymentService();
paymentService.registerAdapter('stripe', new StripeAdapter('sk_test_xxx'));
paymentService.registerAdapter('paypal', new PayPalAdapter('client_id', 'secret'));

// Same interface for both providers
const stripePayment = await paymentService.processPayment('stripe', 99.99, 'USD', { token: 'tok_xxx' });
const paypalPayment = await paymentService.processPayment('paypal', 99.99, 'USD', { token: 'tok_xxx' });

console.log(stripePayment);
console.log(paypalPayment);
```

### Practical Example 2: API Response Adapter

```javascript
/**
 * API Response Adapter
 * Normalize responses from different APIs
 */

// Expected format in our application
class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.fullName = data.fullName;
    this.avatar = data.avatar;
    this.createdAt = data.createdAt;
  }
}

// GitHub API response format
const githubUserResponse = {
  id: 12345,
  login: 'johndoe',
  email: 'john@github.com',
  name: 'John Doe',
  avatar_url: 'https://github.com/avatars/john.png',
  created_at: '2020-01-15T10:30:00Z'
};

// Twitter API response format
const twitterUserResponse = {
  data: {
    id: '98765',
    username: 'johndoe',
    name: 'John Doe',
    profile_image_url: 'https://twitter.com/profile/john.png',
    created_at: '2019-05-20T15:45:00.000Z'
  }
};

// Facebook API response format
const facebookUserResponse = {
  id: '555666777',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@facebook.com',
  picture: {
    data: {
      url: 'https://facebook.com/photo/john.png'
    }
  }
};

// Adapters
class GitHubUserAdapter {
  adapt(response) {
    const nameParts = (response.name || '').split(' ');
    return new User({
      id: String(response.id),
      email: response.email,
      firstName: nameParts[0] || response.login,
      lastName: nameParts.slice(1).join(' ') || '',
      fullName: response.name || response.login,
      avatar: response.avatar_url,
      createdAt: new Date(response.created_at)
    });
  }
}

class TwitterUserAdapter {
  adapt(response) {
    const data = response.data;
    const nameParts = (data.name || '').split(' ');
    return new User({
      id: data.id,
      email: null, // Twitter doesn't provide email by default
      firstName: nameParts[0] || data.username,
      lastName: nameParts.slice(1).join(' ') || '',
      fullName: data.name || data.username,
      avatar: data.profile_image_url,
      createdAt: new Date(data.created_at)
    });
  }
}

class FacebookUserAdapter {
  adapt(response) {
    return new User({
      id: response.id,
      email: response.email,
      firstName: response.first_name,
      lastName: response.last_name,
      fullName: `${response.first_name} ${response.last_name}`,
      avatar: response.picture?.data?.url,
      createdAt: null // Facebook doesn't provide this in basic response
    });
  }
}

// OAuth Service using adapters
class OAuthService {
  constructor() {
    this.adapters = {
      github: new GitHubUserAdapter(),
      twitter: new TwitterUserAdapter(),
      facebook: new FacebookUserAdapter()
    };
  }
  
  normalizeUser(provider, rawResponse) {
    const adapter = this.adapters[provider];
    if (!adapter) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    return adapter.adapt(rawResponse);
  }
}

// Usage
const oauth = new OAuthService();

const githubUser = oauth.normalizeUser('github', githubUserResponse);
const twitterUser = oauth.normalizeUser('twitter', twitterUserResponse);
const facebookUser = oauth.normalizeUser('facebook', facebookUserResponse);

console.log(githubUser);  // Normalized User object
console.log(twitterUser); // Normalized User object
console.log(facebookUser); // Normalized User object
```

---

## Decorator Pattern

### What is it?
Adds new functionality to objects dynamically without modifying their structure.

### When to Use
- Adding features without subclassing
- Wrapping objects with additional behavior
- When you need flexible combinations of features

### Practical Example 1: HTTP Client Decorators

```javascript
/**
 * HTTP Client with Decorators
 * Add logging, caching, retry, authentication dynamically
 */

// Base HTTP Client
class HttpClient {
  async request(config) {
    const { url, method = 'GET', headers = {}, body } = config;
    
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    return {
      status: response.status,
      data: await response.json(),
      headers: Object.fromEntries(response.headers)
    };
  }
}

// Base Decorator
class HttpClientDecorator {
  constructor(client) {
    this.client = client;
  }
  
  async request(config) {
    return await this.client.request(config);
  }
}

// Logging Decorator
class LoggingDecorator extends HttpClientDecorator {
  constructor(client, logger = console) {
    super(client);
    this.logger = logger;
  }
  
  async request(config) {
    const startTime = Date.now();
    this.logger.log(`→ ${config.method || 'GET'} ${config.url}`);
    
    try {
      const response = await super.request(config);
      const duration = Date.now() - startTime;
      this.logger.log(`← ${response.status} (${duration}ms)`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`✗ Error (${duration}ms):`, error.message);
      throw error;
    }
  }
}

// Caching Decorator
class CachingDecorator extends HttpClientDecorator {
  constructor(client, ttl = 60000) {
    super(client);
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  getCacheKey(config) {
    return `${config.method || 'GET'}:${config.url}`;
  }
  
  async request(config) {
    // Only cache GET requests
    if (config.method && config.method !== 'GET') {
      return await super.request(config);
    }
    
    const key = this.getCacheKey(config);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log(`[Cache HIT] ${key}`);
      return cached.response;
    }
    
    console.log(`[Cache MISS] ${key}`);
    const response = await super.request(config);
    
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
    
    return response;
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Retry Decorator
class RetryDecorator extends HttpClientDecorator {
  constructor(client, maxRetries = 3, retryDelay = 1000) {
    super(client);
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }
  
  async request(config) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await super.request(config);
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          console.log(`Retry attempt ${attempt + 1} in ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    
    throw lastError;
  }
}

// Authentication Decorator
class AuthDecorator extends HttpClientDecorator {
  constructor(client, getToken) {
    super(client);
    this.getToken = getToken;
  }
  
  async request(config) {
    const token = await this.getToken();
    
    return await super.request({
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

// Rate Limiting Decorator
class RateLimitDecorator extends HttpClientDecorator {
  constructor(client, requestsPerSecond = 10) {
    super(client);
    this.requestsPerSecond = requestsPerSecond;
    this.queue = [];
    this.processing = false;
  }
  
  async request(config) {
    return new Promise((resolve, reject) => {
      this.queue.push({ config, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { config, resolve, reject } = this.queue.shift();
      
      try {
        const response = await super.request(config);
        resolve(response);
      } catch (error) {
        reject(error);
      }
      
      // Wait between requests
      await new Promise(r => setTimeout(r, 1000 / this.requestsPerSecond));
    }
    
    this.processing = false;
  }
}

// Usage - Compose decorators as needed
let client = new HttpClient();

// Add logging
client = new LoggingDecorator(client);

// Add caching (5 minute TTL)
client = new CachingDecorator(client, 5 * 60 * 1000);

// Add retry (3 retries)
client = new RetryDecorator(client, 3);

// Add authentication
client = new AuthDecorator(client, async () => {
  // Get token from storage or refresh
  return 'my-jwt-token';
});

// Make requests with all features
const users = await client.request({
  url: 'https://api.example.com/users',
  method: 'GET'
});
```

### Practical Example 2: Input Validation Decorator

```javascript
/**
 * Form Input Decorators
 * Add validation rules dynamically
 */

// Base Input
class Input {
  constructor(value = '') {
    this.value = value;
    this.errors = [];
  }
  
  validate() {
    this.errors = [];
    return true;
  }
  
  isValid() {
    return this.validate();
  }
  
  getValue() {
    return this.value;
  }
  
  setValue(value) {
    this.value = value;
    return this;
  }
  
  getErrors() {
    return this.errors;
  }
}

// Base Decorator
class InputDecorator {
  constructor(input) {
    this.input = input;
  }
  
  validate() {
    return this.input.validate();
  }
  
  isValid() {
    return this.validate();
  }
  
  getValue() {
    return this.input.getValue();
  }
  
  setValue(value) {
    this.input.setValue(value);
    return this;
  }
  
  getErrors() {
    return this.input.getErrors();
  }
}

// Required Decorator
class RequiredDecorator extends InputDecorator {
  constructor(input, message = 'This field is required') {
    super(input);
    this.message = message;
  }
  
  validate() {
    const isValid = super.validate();
    const value = this.getValue();
    
    if (!value || value.trim() === '') {
      this.input.errors.push(this.message);
      return false;
    }
    
    return isValid;
  }
}

// Min Length Decorator
class MinLengthDecorator extends InputDecorator {
  constructor(input, minLength, message) {
    super(input);
    this.minLength = minLength;
    this.message = message || `Minimum ${minLength} characters required`;
  }
  
  validate() {
    const isValid = super.validate();
    const value = this.getValue();
    
    if (value && value.length < this.minLength) {
      this.input.errors.push(this.message);
      return false;
    }
    
    return isValid;
  }
}

// Max Length Decorator
class MaxLengthDecorator extends InputDecorator {
  constructor(input, maxLength, message) {
    super(input);
    this.maxLength = maxLength;
    this.message = message || `Maximum ${maxLength} characters allowed`;
  }
  
  validate() {
    const isValid = super.validate();
    const value = this.getValue();
    
    if (value && value.length > this.maxLength) {
      this.input.errors.push(this.message);
      return false;
    }
    
    return isValid;
  }
}

// Email Decorator
class EmailDecorator extends InputDecorator {
  constructor(input, message = 'Invalid email format') {
    super(input);
    this.message = message;
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  }
  
  validate() {
    const isValid = super.validate();
    const value = this.getValue();
    
    if (value && !this.emailRegex.test(value)) {
      this.input.errors.push(this.message);
      return false;
    }
    
    return isValid;
  }
}

// Pattern Decorator
class PatternDecorator extends InputDecorator {
  constructor(input, pattern, message = 'Invalid format') {
    super(input);
    this.pattern = pattern;
    this.message = message;
  }
  
  validate() {
    const isValid = super.validate();
    const value = this.getValue();
    
    if (value && !this.pattern.test(value)) {
      this.input.errors.push(this.message);
      return false;
    }
    
    return isValid;
  }
}

// Trim Decorator (transforms value)
class TrimDecorator extends InputDecorator {
  getValue() {
    const value = super.getValue();
    return value ? value.trim() : value;
  }
}

// Lowercase Decorator (transforms value)
class LowercaseDecorator extends InputDecorator {
  getValue() {
    const value = super.getValue();
    return value ? value.toLowerCase() : value;
  }
}

// Input Builder for easy composition
class InputBuilder {
  constructor(initialValue = '') {
    this.input = new Input(initialValue);
  }
  
  required(message) {
    this.input = new RequiredDecorator(this.input, message);
    return this;
  }
  
  minLength(length, message) {
    this.input = new MinLengthDecorator(this.input, length, message);
    return this;
  }
  
  maxLength(length, message) {
    this.input = new MaxLengthDecorator(this.input, length, message);
    return this;
  }
  
  email(message) {
    this.input = new EmailDecorator(this.input, message);
    return this;
  }
  
  pattern(regex, message) {
    this.input = new PatternDecorator(this.input, regex, message);
    return this;
  }
  
  trim() {
    this.input = new TrimDecorator(this.input);
    return this;
  }
  
  lowercase() {
    this.input = new LowercaseDecorator(this.input);
    return this;
  }
  
  build() {
    return this.input;
  }
}

// Usage
const emailInput = new InputBuilder()
  .trim()
  .lowercase()
  .required('Email is required')
  .email('Please enter a valid email')
  .build();

const passwordInput = new InputBuilder()
  .required('Password is required')
  .minLength(8, 'Password must be at least 8 characters')
  .maxLength(50, 'Password too long')
  .pattern(/[A-Z]/, 'Must contain uppercase letter')
  .pattern(/[0-9]/, 'Must contain a number')
  .build();

// Test
emailInput.setValue('  JOHN@EXAMPLE.COM  ');
console.log(emailInput.getValue()); // 'john@example.com'
console.log(emailInput.isValid()); // true

passwordInput.setValue('weak');
console.log(passwordInput.isValid()); // false
console.log(passwordInput.getErrors()); // ['Password must be at least 8 characters', ...]
```

---

## Facade Pattern

### What is it?
Provides a simplified interface to a complex subsystem.

### When to Use
- Simplifying complex libraries
- Creating high-level APIs
- Hiding system complexity

### Practical Example 1: Media Player Facade

```javascript
/**
 * Media Player Facade
 * Simplifies complex audio/video subsystems
 */

// Complex subsystems
class AudioDecoder {
  constructor() {
    this.supportedFormats = ['mp3', 'wav', 'aac', 'flac'];
  }
  
  canDecode(format) {
    return this.supportedFormats.includes(format.toLowerCase());
  }
  
  decode(audioData, format) {
    console.log(`AudioDecoder: Decoding ${format} audio...`);
    return { pcmData: audioData, sampleRate: 44100 };
  }
}

class VideoDecoder {
  constructor() {
    this.supportedFormats = ['mp4', 'webm', 'avi', 'mkv'];
  }
  
  canDecode(format) {
    return this.supportedFormats.includes(format.toLowerCase());
  }
  
  decode(videoData, format) {
    console.log(`VideoDecoder: Decoding ${format} video...`);
    return { frames: videoData, fps: 30 };
  }
}

class AudioOutput {
  constructor() {
    this.volume = 1.0;
    this.isPlaying = false;
  }
  
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    console.log(`AudioOutput: Volume set to ${this.volume * 100}%`);
  }
  
  play(pcmData) {
    this.isPlaying = true;
    console.log('AudioOutput: Playing audio...');
  }
  
  pause() {
    this.isPlaying = false;
    console.log('AudioOutput: Paused');
  }
  
  stop() {
    this.isPlaying = false;
    console.log('AudioOutput: Stopped');
  }
}

class VideoOutput {
  constructor() {
    this.canvas = null;
    this.isPlaying = false;
  }
  
  setCanvas(canvas) {
    this.canvas = canvas;
    console.log('VideoOutput: Canvas set');
  }
  
  render(frames) {
    this.isPlaying = true;
    console.log('VideoOutput: Rendering video...');
  }
  
  pause() {
    this.isPlaying = false;
    console.log('VideoOutput: Paused');
  }
  
  stop() {
    this.isPlaying = false;
    console.log('VideoOutput: Stopped');
  }
}

class SubtitleParser {
  parse(subtitleData, format) {
    console.log(`SubtitleParser: Parsing ${format} subtitles...`);
    return [{ start: 0, end: 5000, text: 'Hello World' }];
  }
}

class PlaybackController {
  constructor() {
    this.currentTime = 0;
    this.duration = 0;
    this.playbackRate = 1.0;
  }
  
  setDuration(duration) {
    this.duration = duration;
  }
  
  seek(time) {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    console.log(`PlaybackController: Seeking to ${this.currentTime}s`);
  }
  
  setPlaybackRate(rate) {
    this.playbackRate = rate;
    console.log(`PlaybackController: Speed set to ${rate}x`);
  }
}

// Media Player Facade
class MediaPlayer {
  constructor(canvasElement = null) {
    // Initialize all subsystems
    this.audioDecoder = new AudioDecoder();
    this.videoDecoder = new VideoDecoder();
    this.audioOutput = new AudioOutput();
    this.videoOutput = new VideoOutput();
    this.subtitleParser = new SubtitleParser();
    this.playbackController = new PlaybackController();
    
    if (canvasElement) {
      this.videoOutput.setCanvas(canvasElement);
    }
    
    this.currentMedia = null;
    this.subtitles = null;
  }
  
  // Simple public API
  async load(url) {
    console.log(`Loading media: ${url}`);
    
    const format = url.split('.').pop().toLowerCase();
    
    // Determine media type and load appropriately
    if (this.videoDecoder.canDecode(format)) {
      this.currentMedia = {
        type: 'video',
        format,
        data: await this.fetchMedia(url),
        decoded: null
      };
      this.currentMedia.decoded = this.videoDecoder.decode(this.currentMedia.data, format);
    } else if (this.audioDecoder.canDecode(format)) {
      this.currentMedia = {
        type: 'audio',
        format,
        data: await this.fetchMedia(url),
        decoded: null
      };
      this.currentMedia.decoded = this.audioDecoder.decode(this.currentMedia.data, format);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    this.playbackController.setDuration(100); // Would be actual duration
    console.log('Media loaded successfully');
  }
  
  async fetchMedia(url) {
    // Simulated fetch
    return `media_data_from_${url}`;
  }
  
  loadSubtitles(url) {
    const format = url.split('.').pop();
    this.subtitles = this.subtitleParser.parse(`subtitle_data`, format);
    console.log('Subtitles loaded');
  }
  
  play() {
    if (!this.currentMedia) {
      throw new Error('No media loaded');
    }
    
    if (this.currentMedia.type === 'video') {
      this.videoOutput.render(this.currentMedia.decoded.frames);
      this.audioOutput.play(this.currentMedia.decoded.audio);
    } else {
      this.audioOutput.play(this.currentMedia.decoded.pcmData);
    }
    
    console.log('Playback started');
  }
  
  pause() {
    this.audioOutput.pause();
    this.videoOutput.pause();
    console.log('Playback paused');
  }
  
  stop() {
    this.audioOutput.stop();
    this.videoOutput.stop();
    this.playbackController.seek(0);
    console.log('Playback stopped');
  }
  
  seek(seconds) {
    this.playbackController.seek(seconds);
  }
  
  setVolume(level) {
    this.audioOutput.setVolume(level);
  }
  
  setSpeed(rate) {
    this.playbackController.setPlaybackRate(rate);
  }
  
  getCurrentTime() {
    return this.playbackController.currentTime;
  }
  
  getDuration() {
    return this.playbackController.duration;
  }
}

// Usage - Simple API hides all complexity
const player = new MediaPlayer(document.getElementById('videoCanvas'));

await player.load('movie.mp4');
player.loadSubtitles('movie.srt');
player.setVolume(0.8);
player.play();
player.seek(30);
player.setSpeed(1.5);
player.pause();
player.stop();
```

### Practical Example 2: E-Commerce Checkout Facade

```javascript
/**
 * Checkout Facade
 * Simplifies complex checkout process
 */

// Complex subsystems
class InventoryService {
  async checkAvailability(items) {
    console.log('Checking inventory...');
    return items.map(item => ({
      productId: item.productId,
      available: true,
      quantity: item.quantity
    }));
  }
  
  async reserveItems(items, orderId) {
    console.log(`Reserving items for order ${orderId}...`);
    return { reserved: true };
  }
  
  async releaseReservation(orderId) {
    console.log(`Releasing reservation for order ${orderId}...`);
  }
}

class PricingService {
  async calculateTotal(items) {
    console.log('Calculating prices...');
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      subtotal,
      tax: subtotal * 0.1,
      shipping: 10,
      total: subtotal * 1.1 + 10
    };
  }
  
  async applyDiscount(code, total) {
    console.log(`Applying discount code: ${code}`);
    // Simulated discount
    return {
      discount: total * 0.1,
      newTotal: total * 0.9
    };
  }
}

class PaymentService {
  async createPaymentIntent(amount, currency) {
    console.log(`Creating payment intent for ${currency} ${amount}`);
    return { intentId: `pi_${Date.now()}` };
  }
  
  async processPayment(intentId, paymentMethod) {
    console.log(`Processing payment ${intentId}`);
    return { success: true, transactionId: `txn_${Date.now()}` };
  }
  
  async refund(transactionId) {
    console.log(`Refunding transaction ${transactionId}`);
    return { refunded: true };
  }
}

class ShippingService {
  async calculateRates(address, items) {
    console.log('Calculating shipping rates...');
    return [
      { method: 'standard', price: 10, days: 5 },
      { method: 'express', price: 25, days: 2 },
      { method: 'overnight', price: 50, days: 1 }
    ];
  }
  
  async createShipment(orderId, address, method) {
    console.log(`Creating shipment for order ${orderId}`);
    return { trackingNumber: `TRK${Date.now()}` };
  }
}

class NotificationService {
  async sendOrderConfirmation(email, orderId) {
    console.log(`Sending order confirmation to ${email}`);
  }
  
  async sendShippingNotification(email, trackingNumber) {
    console.log(`Sending shipping notification to ${email}`);
  }
}

class OrderService {
  async createOrder(userId, items, shippingAddress, billingAddress) {
    console.log('Creating order...');
    return {
      orderId: `ORD_${Date.now()}`,
      userId,
      items,
      shippingAddress,
      billingAddress,
      status: 'pending'
    };
  }
  
  async updateOrderStatus(orderId, status) {
    console.log(`Updating order ${orderId} to ${status}`);
  }
}

// Checkout Facade
class CheckoutFacade {
  constructor() {
    this.inventory = new InventoryService();
    this.pricing = new PricingService();
    this.payment = new PaymentService();
    this.shipping = new ShippingService();
    this.notification = new NotificationService();
    this.orders = new OrderService();
  }
  
  async checkout(checkoutData) {
    const {
      userId,
      email,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      discountCode
    } = checkoutData;
    
    try {
      // Step 1: Check inventory
      const availability = await this.inventory.checkAvailability(items);
      const unavailable = availability.filter(a => !a.available);
      if (unavailable.length > 0) {
        return { success: false, error: 'Some items are out of stock', unavailable };
      }
      
      // Step 2: Calculate pricing
      let pricing = await this.pricing.calculateTotal(items);
      
      // Step 3: Apply discount if provided
      if (discountCode) {
        const discount = await this.pricing.applyDiscount(discountCode, pricing.total);
        pricing.discount = discount.discount;
        pricing.total = discount.newTotal;
      }
      
      // Step 4: Create order
      const order = await this.orders.createOrder(
        userId, items, shippingAddress, billingAddress
      );
      
      // Step 5: Reserve inventory
      await this.inventory.reserveItems(items, order.orderId);
      
      // Step 6: Process payment
      const paymentIntent = await this.payment.createPaymentIntent(
        pricing.total, 'USD'
      );
      const paymentResult = await this.payment.processPayment(
        paymentIntent.intentId, paymentMethod
      );
      
      if (!paymentResult.success) {
        await this.inventory.releaseReservation(order.orderId);
        return { success: false, error: 'Payment failed' };
      }
      
      // Step 7: Create shipment
      const shipment = await this.shipping.createShipment(
        order.orderId, shippingAddress, shippingMethod
      );
      
      // Step 8: Update order status
      await this.orders.updateOrderStatus(order.orderId, 'confirmed');
      
      // Step 9: Send notifications
      await this.notification.sendOrderConfirmation(email, order.orderId);
      
      return {
        success: true,
        orderId: order.orderId,
        transactionId: paymentResult.transactionId,
        trackingNumber: shipment.trackingNumber,
        total: pricing.total
      };
      
    } catch (error) {
      console.error('Checkout failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getShippingOptions(address, items) {
    return await this.shipping.calculateRates(address, items);
  }
  
  async calculatePreview(items, discountCode = null) {
    let pricing = await this.pricing.calculateTotal(items);
    
    if (discountCode) {
      const discount = await this.pricing.applyDiscount(discountCode, pricing.total);
      pricing.discount = discount.discount;
      pricing.total = discount.newTotal;
    }
    
    return pricing;
  }
}

// Usage - Simple API for complex checkout process
const checkout = new CheckoutFacade();

// Preview order
const preview = await checkout.calculatePreview([
  { productId: 'p1', price: 99.99, quantity: 2 },
  { productId: 'p2', price: 49.99, quantity: 1 }
], 'SAVE10');

console.log('Order preview:', preview);

// Complete checkout
const result = await checkout.checkout({
  userId: 'user123',
  email: 'user@example.com',
  items: [
    { productId: 'p1', price: 99.99, quantity: 2 },
    { productId: 'p2', price: 49.99, quantity: 1 }
  ],
  shippingAddress: { street: '123 Main St', city: 'NYC', zip: '10001' },
  billingAddress: { street: '123 Main St', city: 'NYC', zip: '10001' },
  paymentMethod: { type: 'card', token: 'tok_xxx' },
  shippingMethod: 'express',
  discountCode: 'SAVE10'
});

console.log('Checkout result:', result);
```

---

## Proxy Pattern

### What is it?
Provides a surrogate or placeholder for another object to control access to it.

### When to Use
- Lazy loading
- Access control
- Caching
- Logging/monitoring
- Virtual objects

### Practical Example 1: Virtual Proxy for Images

```javascript
/**
 * Image Loading Proxy
 * Lazy load images only when needed
 */

// Real Image class
class RealImage {
  constructor(url) {
    this.url = url;
    this.data = null;
    this.loadImage();
  }
  
  loadImage() {
    console.log(`Loading image from ${this.url}...`);
    // Simulate network delay
    this.data = `image_data_${this.url}`;
    console.log(`Image loaded: ${this.url}`);
  }
  
  display() {
    console.log(`Displaying image: ${this.url}`);
    return this.data;
  }
  
  getSize() {
    return { width: 1920, height: 1080 };
  }
}

// Proxy Image
class ProxyImage {
  constructor(url) {
    this.url = url;
    this.realImage = null;
    this.placeholder = 'placeholder.jpg';
  }
  
  loadImage() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.url);
    }
  }
  
  display() {
    if (!this.realImage) {
      console.log(`Showing placeholder for ${this.url}`);
      return this.placeholder;
    }
    return this.realImage.display();
  }
  
  getSize() {
    // Can return cached/estimated size without loading
    return { width: 1920, height: 1080 };
  }
  
  // Preload when user might need it
  preload() {
    setTimeout(() => this.loadImage(), 0);
  }
}

// Image Gallery using Proxy
class ImageGallery {
  constructor() {
    this.images = [];
    this.currentIndex = 0;
  }
  
  addImage(url) {
    this.images.push(new ProxyImage(url));
  }
  
  displayCurrent() {
    const current = this.images[this.currentIndex];
    current.loadImage(); // Load current image
    
    // Preload adjacent images
    if (this.currentIndex > 0) {
      this.images[this.currentIndex - 1].preload();
    }
    if (this.currentIndex < this.images.length - 1) {
      this.images[this.currentIndex + 1].preload();
    }
    
    return current.display();
  }
  
  next() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      return this.displayCurrent();
    }
  }
  
  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.displayCurrent();
    }
  }
}

// Usage
const gallery = new ImageGallery();
gallery.addImage('photo1.jpg');
gallery.addImage('photo2.jpg');
gallery.addImage('photo3.jpg');
gallery.addImage('photo4.jpg');
gallery.addImage('photo5.jpg');

// Images are NOT loaded yet
console.log('Gallery created with 5 images');

// Only loads photo1.jpg (and preloads photo2.jpg)
gallery.displayCurrent();

// Loads photo2.jpg (if not preloaded), preloads photo1.jpg and photo3.jpg
gallery.next();
```

### Practical Example 2: Access Control Proxy

```javascript
/**
 * Access Control Proxy
 * Control access to sensitive objects
 */

// Sensitive Resource
class BankAccount {
  constructor(accountNumber, balance) {
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.transactions = [];
  }
  
  getBalance() {
    return this.balance;
  }
  
  deposit(amount) {
    this.balance += amount;
    this.transactions.push({ type: 'deposit', amount, date: new Date() });
    return this.balance;
  }
  
  withdraw(amount) {
    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
    this.transactions.push({ type: 'withdraw', amount, date: new Date() });
    return this.balance;
  }
  
  transfer(toAccount, amount) {
    this.withdraw(amount);
    toAccount.deposit(amount);
    return { from: this.accountNumber, to: toAccount.accountNumber, amount };
  }
  
  getTransactions() {
    return [...this.transactions];
  }
}

// Access Control Proxy
class BankAccountProxy {
  constructor(account, user) {
    this.account = account;
    this.user = user;
    this.permissions = this.getPermissions(user.role);
  }
  
  getPermissions(role) {
    const permissions = {
      customer: ['getBalance', 'deposit', 'withdraw'],
      teller: ['getBalance', 'deposit', 'withdraw', 'getTransactions'],
      manager: ['getBalance', 'deposit', 'withdraw', 'transfer', 'getTransactions'],
      admin: ['*']
    };
    return permissions[role] || [];
  }
  
  hasPermission(action) {
    return this.permissions.includes('*') || this.permissions.includes(action);
  }
  
  checkPermission(action) {
    if (!this.hasPermission(action)) {
      throw new Error(`Access denied: ${action} not allowed for role ${this.user.role}`);
    }
  }
  
  log(action, details) {
    console.log(`[AUDIT] User: ${this.user.id}, Action: ${action}, Time: ${new Date().toISOString()}`, details);
  }
  
  getBalance() {
    this.checkPermission('getBalance');
    this.log('getBalance', { account: this.account.accountNumber });
    return this.account.getBalance();
  }
  
  deposit(amount) {
    this.checkPermission('deposit');
    
    // Validation
    if (amount <= 0) throw new Error('Amount must be positive');
    if (amount > 10000 && this.user.role === 'customer') {
      throw new Error('Large deposits require teller assistance');
    }
    
    this.log('deposit', { account: this.account.accountNumber, amount });
    return this.account.deposit(amount);
  }
  
  withdraw(amount) {
    this.checkPermission('withdraw');
    
    // Validation
    if (amount <= 0) throw new Error('Amount must be positive');
    
    // Daily limit for customers
    if (this.user.role === 'customer' && amount > 1000) {
      throw new Error('Daily withdrawal limit exceeded');
    }
    
    this.log('withdraw', { account: this.account.accountNumber, amount });
    return this.account.withdraw(amount);
  }
  
  transfer(toAccountProxy, amount) {
    this.checkPermission('transfer');
    
    // Validation
    if (amount > 50000) {
      throw new Error('Transfers over $50,000 require additional approval');
    }
    
    this.log('transfer', { 
      from: this.account.accountNumber, 
      to: toAccountProxy.account.accountNumber, 
      amount 
    });
    
    return this.account.transfer(toAccountProxy.account, amount);
  }
  
  getTransactions() {
    this.checkPermission('getTransactions');
    this.log('getTransactions', { account: this.account.accountNumber });
    return this.account.getTransactions();
  }
}

// Usage
const account1 = new BankAccount('ACC001', 5000);
const account2 = new BankAccount('ACC002', 3000);

const customerUser = { id: 'U001', role: 'customer' };
const managerUser = { id: 'M001', role: 'manager' };

// Customer access
const customerProxy = new BankAccountProxy(account1, customerUser);
console.log(customerProxy.getBalance()); // Works
customerProxy.deposit(500); // Works
customerProxy.withdraw(200); // Works

try {
  customerProxy.getTransactions(); // Throws - no permission
} catch (e) {
  console.log(e.message);
}

// Manager access
const managerProxy = new BankAccountProxy(account1, managerUser);
console.log(managerProxy.getTransactions()); // Works
const managerProxy2 = new BankAccountProxy(account2, managerUser);
managerProxy.transfer(managerProxy2, 1000); // Works
```

### Practical Example 3: Caching Proxy with ES6 Proxy

```javascript
/**
 * Caching Proxy using ES6 Proxy
 * Automatically cache expensive API calls
 */

class APIService {
  async getUser(id) {
    console.log(`API: Fetching user ${id}...`);
    await new Promise(r => setTimeout(r, 1000)); // Simulate delay
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  }
  
  async getProducts(category) {
    console.log(`API: Fetching products in ${category}...`);
    await new Promise(r => setTimeout(r, 1500));
    return [
      { id: 1, name: `${category} Product 1` },
      { id: 2, name: `${category} Product 2` }
    ];
  }
  
  async createOrder(data) {
    console.log('API: Creating order...');
    await new Promise(r => setTimeout(r, 500));
    return { orderId: Date.now(), ...data };
  }
}

// Create caching proxy factory
function createCachingProxy(target, options = {}) {
  const cache = new Map();
  const ttl = options.ttl || 60000;
  const cacheMethods = options.methods || [];
  
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      
      if (typeof value !== 'function') {
        return value;
      }
      
      // Only cache specified methods
      if (!cacheMethods.includes(prop)) {
        return value.bind(obj);
      }
      
      return async function(...args) {
        const cacheKey = `${prop}:${JSON.stringify(args)}`;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
          console.log(`[CACHE HIT] ${cacheKey}`);
          return cached.value;
        }
        
        console.log(`[CACHE MISS] ${cacheKey}`);
        const result = await value.apply(obj, args);
        
        cache.set(cacheKey, {
          value: result,
          timestamp: Date.now()
        });
        
        return result;
      };
    }
  });
}

// Usage
const api = new APIService();
const cachedApi = createCachingProxy(api, {
  ttl: 30000, // 30 seconds
  methods: ['getUser', 'getProducts'] // Only cache these
});

// First call - fetches from API
const user1 = await cachedApi.getUser(1);
console.log(user1);

// Second call - returns from cache
const user1Again = await cachedApi.getUser(1);
console.log(user1Again);

// Different args - fetches from API
const user2 = await cachedApi.getUser(2);
console.log(user2);

// Create order - not cached (mutating operation)
const order = await cachedApi.createOrder({ items: [1, 2] });
console.log(order);
```

---

## Summary

| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| **Adapter** | Convert interface to another | Third-party integration, legacy code |
| **Decorator** | Add behavior dynamically | Feature composition, middleware |
| **Facade** | Simplify complex systems | Libraries, high-level APIs |
| **Proxy** | Control access to object | Caching, security, lazy loading |
| **Composite** | Tree structures | UI components, file systems |
| **Bridge** | Decouple abstraction from implementation | Cross-platform code |

मालिक, master these structural patterns to build flexible, maintainable systems! 🚀
