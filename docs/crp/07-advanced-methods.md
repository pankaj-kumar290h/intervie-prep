# Advanced JavaScript Methods for Senior Developers

## Table of Contents
1. [requestAnimationFrame - Smooth Animations](#requestanimationframe---smooth-animations)
2. [Intersection Observer - Lazy Loading](#intersection-observer---lazy-loading)
3. [Resize Observer - Responsive Elements](#resize-observer---responsive-elements)
4. [Mutation Observer - DOM Changes](#mutation-observer---dom-changes)
5. [Performance Observer - Real User Monitoring](#performance-observer---real-user-monitoring)
6. [Web Workers - Parallel Processing](#web-workers---parallel-processing)
7. [requestIdleCallback - Background Tasks](#requestidlecallback---background-tasks)
8. [Page Visibility API - Optimize Hidden Tabs](#page-visibility-api---optimize-hidden-tabs)
9. [Navigation Timing API - Performance Metrics](#navigation-timing-api---performance-metrics)
10. [queueMicrotask - Fine-Grained Control](#queuemicrotask---fine-grained-control)

---

## requestAnimationFrame - Smooth Animations

### What It Does

Tells the browser you want to perform an animation and requests the browser call your function before the next repaint. Guarantees smooth 60fps animations.

### Why It Matters

- **Performance**: Syncs with browser's refresh rate (60fps)
- **Battery**: Pauses when tab is hidden
- **Smooth**: Avoids janky animations
- **CRP**: Doesn't trigger layout thrashing

### Basic Usage

```javascript
// ❌ BAD: Using setTimeout
function animate() {
  element.style.left = element.offsetLeft + 5 + 'px';
  setTimeout(animate, 16); // Try to hit 60fps (16.67ms)
}

// ✅ GOOD: Using requestAnimationFrame
function animate() {
  element.style.left = element.offsetLeft + 5 + 'px';
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### Advanced Example: Smooth Scroll

```javascript
/**
 * Smooth scroll to element
 */
function smoothScrollTo(targetY, duration = 1000) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();
  
  function scroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-in-out)
    const easing = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    window.scrollTo(0, startY + distance * easing);
    
    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }
  
  requestAnimationFrame(scroll);
}

// Usage
smoothScrollTo(1000, 800); // Scroll to 1000px in 800ms
```

### Real-World Use Case: Custom Progress Bar

```javascript
class ProgressBar {
  constructor(element) {
    this.element = element;
    this.progress = 0;
    this.targetProgress = 0;
    this.animationId = null;
  }
  
  setProgress(value) {
    this.targetProgress = Math.max(0, Math.min(100, value));
    
    if (!this.animationId) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }
  
  animate() {
    // Smooth interpolation
    const diff = this.targetProgress - this.progress;
    
    if (Math.abs(diff) > 0.1) {
      this.progress += diff * 0.1; // Smooth acceleration
      this.element.style.width = this.progress + '%';
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.progress = this.targetProgress;
      this.element.style.width = this.progress + '%';
      this.animationId = null;
    }
  }
}

// Usage
const progressBar = new ProgressBar(document.querySelector('.progress'));
progressBar.setProgress(75);
```

### Performance Optimization: Batching DOM Updates

```javascript
/**
 * Batch multiple element updates in a single frame
 */
class DOMBatcher {
  constructor() {
    this.reads = [];
    this.writes = [];
    this.scheduled = false;
  }
  
  read(callback) {
    this.reads.push(callback);
    this.scheduleFlush();
  }
  
  write(callback) {
    this.writes.push(callback);
    this.scheduleFlush();
  }
  
  scheduleFlush() {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }
  
  flush() {
    // Execute all reads first (no layout thrashing!)
    this.reads.forEach(fn => fn());
    this.reads = [];
    
    // Then execute all writes
    this.writes.forEach(fn => fn());
    this.writes = [];
    
    this.scheduled = false;
  }
}

// Usage: Avoid layout thrashing
const batcher = new DOMBatcher();

elements.forEach(element => {
  let height;
  
  // Schedule read
  batcher.read(() => {
    height = element.offsetHeight; // Read phase
  });
  
  // Schedule write
  batcher.write(() => {
    element.style.height = (height + 10) + 'px'; // Write phase
  });
});

// All reads happen together, then all writes
// Only 2 layouts instead of N layouts!
```

---

## Intersection Observer - Lazy Loading

### What It Does

Asynchronously observes changes in the intersection of a target element with an ancestor element or viewport. Perfect for lazy loading.

### Why It Matters

- **Performance**: No scroll event listeners needed
- **Efficient**: Browser-optimized, runs on separate thread
- **CRP**: Load resources only when needed
- **Battery**: More efficient than scroll listeners

### Basic Usage

```javascript
// ❌ BAD: Scroll listener (expensive!)
window.addEventListener('scroll', () => {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      img.src = img.dataset.src; // Load image
    }
  });
}); // Runs on every scroll! 🐌

// ✅ GOOD: Intersection Observer
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img); // Stop observing
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

### Advanced Example: Lazy Load Images with Fade-In

```javascript
/**
 * Lazy load images with smooth fade-in effect
 */
class LazyImageLoader {
  constructor(options = {}) {
    this.rootMargin = options.rootMargin || '50px';
    this.threshold = options.threshold || 0.01;
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: this.rootMargin,
        threshold: this.threshold
      }
    );
  }
  
  observe(image) {
    this.observer.observe(image);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    // Create temporary image to preload
    const tempImg = new Image();
    
    tempImg.onload = () => {
      // Image loaded successfully
      if (srcset) img.srcset = srcset;
      img.src = src;
      img.classList.add('loaded');
      this.observer.unobserve(img);
    };
    
    tempImg.onerror = () => {
      console.error('Failed to load image:', src);
      img.classList.add('error');
      this.observer.unobserve(img);
    };
    
    tempImg.src = src;
  }
}

// CSS for fade-in effect
const style = `
  img[data-src] {
    opacity: 0;
    transition: opacity 0.3s ease-in;
  }
  
  img[data-src].loaded {
    opacity: 1;
  }
`;

// Usage
const lazyLoader = new LazyImageLoader({
  rootMargin: '100px', // Start loading 100px before visible
  threshold: 0.01
});

document.querySelectorAll('img[data-src]').forEach(img => {
  lazyLoader.observe(img);
});
```

### Real-World Use Case: Infinite Scroll

```javascript
/**
 * Infinite scroll with Intersection Observer
 */
class InfiniteScroll {
  constructor(options) {
    this.container = options.container;
    this.loadMore = options.loadMore;
    this.loading = false;
    this.hasMore = true;
    
    // Create sentinel element
    this.sentinel = document.createElement('div');
    this.sentinel.className = 'sentinel';
    this.container.appendChild(this.sentinel);
    
    // Observe sentinel
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      { rootMargin: '200px' }
    );
    
    this.observer.observe(this.sentinel);
  }
  
  async handleIntersection(entries) {
    const entry = entries[0];
    
    if (entry.isIntersecting && !this.loading && this.hasMore) {
      this.loading = true;
      
      try {
        const items = await this.loadMore();
        
        if (items.length === 0) {
          this.hasMore = false;
          this.observer.disconnect();
        } else {
          this.appendItems(items);
        }
      } catch (error) {
        console.error('Failed to load more:', error);
      } finally {
        this.loading = false;
      }
    }
  }
  
  appendItems(items) {
    items.forEach(item => {
      const element = this.createItemElement(item);
      this.container.insertBefore(element, this.sentinel);
    });
  }
  
  createItemElement(item) {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = item.title;
    return div;
  }
}

// Usage
const infiniteScroll = new InfiniteScroll({
  container: document.querySelector('.items-container'),
  loadMore: async () => {
    const response = await fetch('/api/items?page=' + currentPage++);
    return response.json();
  }
});
```

### Analytics: Track Element Visibility

```javascript
/**
 * Track when elements become visible (for analytics)
 */
class VisibilityTracker {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.5; // 50% visible
    this.onVisible = options.onVisible || (() => {});
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      { threshold: this.threshold }
    );
    
    this.visibleElements = new Set();
  }
  
  track(element, metadata = {}) {
    element.dataset.trackingMetadata = JSON.stringify(metadata);
    this.observer.observe(element);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const elementId = element.id || element.dataset.trackingId;
      
      if (entry.isIntersecting && !this.visibleElements.has(elementId)) {
        this.visibleElements.add(elementId);
        
        const metadata = JSON.parse(element.dataset.trackingMetadata || '{}');
        this.onVisible({
          element,
          elementId,
          metadata,
          intersectionRatio: entry.intersectionRatio
        });
      }
    });
  }
}

// Usage
const tracker = new VisibilityTracker({
  threshold: 0.5,
  onVisible: ({ elementId, metadata }) => {
    // Send to analytics
    analytics.track('Element Viewed', {
      elementId,
      ...metadata
    });
  }
});

// Track specific elements
tracker.track(document.querySelector('.hero'), { 
  section: 'hero', 
  campaign: 'summer-sale' 
});

tracker.track(document.querySelector('.cta-button'), {
  type: 'cta',
  variant: 'primary'
});
```

---

## Resize Observer - Responsive Elements

### What It Does

Observes changes to the size of elements. More efficient than window resize events.

### Why It Matters

- **Performance**: Only fires when observed element resizes
- **Accurate**: Works for any element, not just window
- **No Layout Thrashing**: Browser-optimized
- **Responsive**: Build truly responsive components

### Basic Usage

```javascript
// ❌ BAD: Window resize listener
window.addEventListener('resize', () => {
  const width = element.offsetWidth;
  // Do something with width
  // Fires even when element doesn't change!
});

// ✅ GOOD: Resize Observer
const resizeObserver = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    console.log(`Element resized to: ${width}x${height}`);
  });
});

resizeObserver.observe(element);
```

### Advanced Example: Responsive Component

```javascript
/**
 * Component that adapts to its container size
 */
class ResponsiveComponent {
  constructor(element) {
    this.element = element;
    this.breakpoints = {
      small: 0,
      medium: 600,
      large: 900,
      xlarge: 1200
    };
    
    this.observer = new ResizeObserver(entries => {
      this.handleResize(entries[0]);
    });
    
    this.observer.observe(this.element);
  }
  
  handleResize(entry) {
    const width = entry.contentRect.width;
    const size = this.getSize(width);
    
    // Update data attribute for CSS hooks
    this.element.dataset.size = size;
    
    // Trigger custom event
    this.element.dispatchEvent(new CustomEvent('sizechange', {
      detail: { width, size }
    }));
  }
  
  getSize(width) {
    if (width >= this.breakpoints.xlarge) return 'xlarge';
    if (width >= this.breakpoints.large) return 'large';
    if (width >= this.breakpoints.medium) return 'medium';
    return 'small';
  }
  
  disconnect() {
    this.observer.disconnect();
  }
}

// CSS
const style = `
  .component[data-size="small"] {
    /* Small styles */
  }
  
  .component[data-size="medium"] {
    /* Medium styles */
  }
  
  .component[data-size="large"] {
    /* Large styles */
  }
`;

// Usage
const component = new ResponsiveComponent(
  document.querySelector('.component')
);

component.element.addEventListener('sizechange', (e) => {
  console.log('Size changed to:', e.detail.size);
});
```

### Real-World Use Case: Responsive Text Sizing

```javascript
/**
 * Automatically adjust text size based on container
 */
class AutoSizeText {
  constructor(element, options = {}) {
    this.element = element;
    this.minSize = options.minSize || 12;
    this.maxSize = options.maxSize || 48;
    this.ratio = options.ratio || 0.05; // 5% of container width
    
    this.observer = new ResizeObserver(() => {
      this.adjustSize();
    });
    
    this.observer.observe(this.element.parentElement);
    this.adjustSize(); // Initial sizing
  }
  
  adjustSize() {
    const containerWidth = this.element.parentElement.offsetWidth;
    let fontSize = containerWidth * this.ratio;
    
    // Clamp between min and max
    fontSize = Math.max(this.minSize, Math.min(this.maxSize, fontSize));
    
    this.element.style.fontSize = fontSize + 'px';
  }
}

// Usage
const autoSizeText = new AutoSizeText(
  document.querySelector('.hero-title'),
  { minSize: 24, maxSize: 72, ratio: 0.08 }
);
```

---

## Mutation Observer - DOM Changes

### What It Does

Observes changes to the DOM tree (additions, removals, attribute changes). Essential for monitoring dynamic content.

### Why It Matters

- **React to Changes**: Know when DOM changes occur
- **Performance**: More efficient than polling
- **Flexibility**: Observe specific types of changes
- **Debugging**: Track unexpected DOM modifications

### Basic Usage

```javascript
// Observe DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log('Type:', mutation.type);
    console.log('Target:', mutation.target);
    
    if (mutation.type === 'childList') {
      console.log('Added:', mutation.addedNodes);
      console.log('Removed:', mutation.removedNodes);
    }
    
    if (mutation.type === 'attributes') {
      console.log('Attribute:', mutation.attributeName);
      console.log('Old value:', mutation.oldValue);
    }
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,      // Watch for child additions/removals
  attributes: true,     // Watch for attribute changes
  subtree: true,        // Watch entire subtree
  attributeOldValue: true,  // Record old attribute values
  characterData: true   // Watch for text changes
});

// Stop observing
observer.disconnect();
```

### Advanced Example: Auto-Initialize Components

```javascript
/**
 * Automatically initialize components when they're added to DOM
 */
class ComponentInitializer {
  constructor() {
    this.components = new Map();
    this.initialized = new WeakSet();
    
    this.observer = new MutationObserver(mutations => {
      this.handleMutations(mutations);
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  register(selector, ComponentClass) {
    this.components.set(selector, ComponentClass);
    // Initialize any existing elements
    this.initializeExisting(selector, ComponentClass);
  }
  
  handleMutations(mutations) {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.initializeComponents(node);
        }
      });
    });
  }
  
  initializeComponents(root) {
    this.components.forEach((ComponentClass, selector) => {
      const elements = root.matches?.(selector) 
        ? [root] 
        : root.querySelectorAll?.(selector) || [];
      
      elements.forEach(element => {
        if (!this.initialized.has(element)) {
          new ComponentClass(element);
          this.initialized.add(element);
        }
      });
    });
  }
  
  initializeExisting(selector, ComponentClass) {
    document.querySelectorAll(selector).forEach(element => {
      if (!this.initialized.has(element)) {
        new ComponentClass(element);
        this.initialized.add(element);
      }
    });
  }
}

// Usage
const initializer = new ComponentInitializer();

// Register components
initializer.register('.dropdown', DropdownComponent);
initializer.register('.modal', ModalComponent);
initializer.register('.tooltip', TooltipComponent);

// Now any element added to DOM with these classes
// will automatically be initialized!
```

### Real-World Use Case: Watch for Third-Party Changes

```javascript
/**
 * Monitor and fix changes made by third-party scripts
 */
class DOMProtector {
  constructor(protectedElements) {
    this.protectedElements = new Map();
    this.observer = new MutationObserver(mutations => {
      this.handleMutations(mutations);
    });
    
    protectedElements.forEach(({ element, attributes }) => {
      this.protect(element, attributes);
    });
    
    this.observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeOldValue: true
    });
  }
  
  protect(element, attributes) {
    const originalValues = {};
    attributes.forEach(attr => {
      originalValues[attr] = element.getAttribute(attr);
    });
    this.protectedElements.set(element, originalValues);
  }
  
  handleMutations(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes') {
        const element = mutation.target;
        const protected = this.protectedElements.get(element);
        
        if (protected) {
          const attr = mutation.attributeName;
          const originalValue = protected[attr];
          
          if (originalValue !== undefined) {
            const currentValue = element.getAttribute(attr);
            
            if (currentValue !== originalValue) {
              console.warn(`Protected attribute "${attr}" changed, restoring...`);
              element.setAttribute(attr, originalValue);
            }
          }
        }
      }
    });
  }
}

// Usage: Protect critical elements from third-party modifications
const protector = new DOMProtector([
  {
    element: document.querySelector('.critical-banner'),
    attributes: ['data-visible', 'class']
  }
]);
```

---

## Performance Observer - Real User Monitoring

### What It Does

Observes performance measurement events (paint, navigation, resource timing, etc.). Essential for RUM (Real User Monitoring).

### Why It Matters

- **Real Metrics**: Measure actual user experience
- **CRP Monitoring**: Track paint times, resource loading
- **Production Insights**: Know how your site performs in the wild
- **Optimization**: Find real-world bottlenecks

### Basic Usage

```javascript
// Observe paint timing
const paintObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(`${entry.name}: ${entry.startTime}ms`);
  });
});

paintObserver.observe({ entryTypes: ['paint'] });

// Output:
// first-paint: 245.30ms
// first-contentful-paint: 247.80ms
```

### Advanced Example: Complete RUM System

```javascript
/**
 * Real User Monitoring system
 */
class RealUserMonitoring {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/metrics';
    this.sampleRate = options.sampleRate || 1.0; // 100% of users
    this.metrics = {};
    
    // Only sample certain % of users
    if (Math.random() > this.sampleRate) return;
    
    this.setupObservers();
    this.setupBeacon();
  }
  
  setupObservers() {
    // Observe paint events
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.metrics[entry.name] = entry.startTime;
      });
    }).observe({ entryTypes: ['paint'] });
    
    // Observe LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.metrics.lcpElement = lastEntry.element?.tagName;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Observe FID
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      this.metrics.fid = firstInput.processingStart - firstInput.startTime;
    }).observe({ entryTypes: ['first-input'] });
    
    // Observe CLS
    let clsScore = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.metrics.cls = clsScore;
    }).observe({ entryTypes: ['layout-shift'] });
    
    // Observe resources
    new PerformanceObserver((list) => {
      const resources = list.getEntries();
      this.metrics.resourceCount = resources.length;
      this.metrics.totalSize = resources.reduce(
        (sum, r) => sum + (r.transferSize || 0), 
        0
      );
    }).observe({ entryTypes: ['resource'] });
  }
  
  setupBeacon() {
    // Send metrics when page unloads
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
    
    // Also send after page fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => this.sendMetrics(), 0);
    });
  }
  
  sendMetrics() {
    // Add navigation timing
    const navTiming = performance.getEntriesByType('navigation')[0];
    if (navTiming) {
      this.metrics.domContentLoaded = navTiming.domContentLoadedEventEnd;
      this.metrics.loadComplete = navTiming.loadEventEnd;
      this.metrics.ttfb = navTiming.responseStart;
    }
    
    // Add page info
    this.metrics.url = window.location.href;
    this.metrics.userAgent = navigator.userAgent;
    this.metrics.connection = navigator.connection?.effectiveType;
    this.metrics.deviceMemory = navigator.deviceMemory;
    
    // Send using sendBeacon (works even when page is unloading)
    const data = JSON.stringify(this.metrics);
    navigator.sendBeacon(this.endpoint, data);
    
    console.log('📊 RUM Metrics sent:', this.metrics);
  }
}

// Usage
const rum = new RealUserMonitoring({
  endpoint: '/api/rum',
  sampleRate: 0.1 // Sample 10% of users
});
```

### Real-World Use Case: Performance Budget Alerts

```javascript
/**
 * Alert when performance budgets are exceeded
 */
class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets;
    this.violations = [];
    
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    // Monitor LCP
    new PerformanceObserver((list) => {
      const lcp = list.getEntries()[list.getEntries().length - 1];
      this.check('lcp', lcp.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Monitor FID
    new PerformanceObserver((list) => {
      const fid = list.getEntries()[0];
      const delay = fid.processingStart - fid.startTime;
      this.check('fid', delay);
    }).observe({ entryTypes: ['first-input'] });
    
    // Monitor CLS
    let clsScore = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      this.check('cls', clsScore);
    }).observe({ entryTypes: ['layout-shift'] });
    
    // Monitor bundle size
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const jsSize = resources
        .filter(r => r.name.endsWith('.js'))
        .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
      this.check('jsBundleSize', jsSize / 1024); // KB
    });
  }
  
  check(metric, value) {
    const budget = this.budgets[metric];
    
    if (budget && value > budget) {
      const violation = {
        metric,
        value,
        budget,
        exceeded: value - budget,
        timestamp: Date.now()
      };
      
      this.violations.push(violation);
      this.alert(violation);
    }
  }
  
  alert(violation) {
    console.error(`⚠️ Performance Budget Exceeded!`, {
      metric: violation.metric,
      value: violation.value.toFixed(2),
      budget: violation.budget,
      exceeded: violation.exceeded.toFixed(2)
    });
    
    // Send to monitoring service
    if (window.Sentry) {
      Sentry.captureMessage('Performance Budget Exceeded', {
        level: 'warning',
        extra: violation
      });
    }
  }
}

// Usage
const budget = new PerformanceBudget({
  lcp: 2500,           // 2.5s
  fid: 100,            // 100ms
  cls: 0.1,            // 0.1
  jsBundleSize: 300    // 300 KB
});
```

---

## Web Workers - Parallel Processing

### What It Does

Runs JavaScript in background threads, separate from the main thread. Prevents blocking UI.

### Why It Matters

- **Performance**: Offload heavy computations
- **Responsiveness**: Keep UI smooth during processing
- **CRP**: Don't block rendering
- **Scalability**: Utilize multi-core CPUs

### Basic Usage

```javascript
// main.js
const worker = new Worker('worker.js');

// Send data to worker
worker.postMessage({ data: [1, 2, 3, 4, 5] });

// Receive result from worker
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

worker.onerror = (error) => {
  console.error('Worker error:', error);
};

// worker.js
self.onmessage = (e) => {
  const data = e.data.data;
  
  // Heavy computation
  const result = data.reduce((sum, n) => sum + n, 0);
  
  // Send result back
  self.postMessage({ result });
};
```

### Advanced Example: Image Processing

```javascript
/**
 * Process images in Web Worker
 */
class ImageProcessor {
  constructor() {
    this.worker = new Worker('image-worker.js');
    this.pending = new Map();
    this.nextId = 0;
    
    this.worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const { resolve, reject } = this.pending.get(id);
      
      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
      
      this.pending.delete(id);
    };
  }
  
  async processImage(imageData, operation) {
    const id = this.nextId++;
    
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      
      this.worker.postMessage({
        id,
        imageData,
        operation
      }, [imageData.data.buffer]); // Transfer ownership
    });
  }
  
  async grayscale(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const result = await this.processImage(imageData, 'grayscale');
    ctx.putImageData(result, 0, 0);
  }
  
  async blur(canvas, radius = 5) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const result = await this.processImage(imageData, { type: 'blur', radius });
    ctx.putImageData(result, 0, 0);
  }
  
  terminate() {
    this.worker.terminate();
  }
}

// image-worker.js
self.onmessage = (e) => {
  const { id, imageData, operation } = e.data;
  
  try {
    let result;
    
    if (operation === 'grayscale') {
      result = applyGrayscale(imageData);
    } else if (operation.type === 'blur') {
      result = applyBlur(imageData, operation.radius);
    }
    
    self.postMessage({ 
      id, 
      result 
    }, [result.data.buffer]);
  } catch (error) {
    self.postMessage({ 
      id, 
      error: error.message 
    });
  }
};

function applyGrayscale(imageData) {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;     // R
    data[i + 1] = avg; // G
    data[i + 2] = avg; // B
  }
  
  return imageData;
}

// Usage
const processor = new ImageProcessor();
const canvas = document.querySelector('canvas');

processor.grayscale(canvas); // Non-blocking! UI stays smooth
```

### Real-World Use Case: Data Processing

```javascript
/**
 * Process large datasets without blocking UI
 */
class DataProcessor {
  constructor(workerCount = 4) {
    this.workers = [];
    this.nextWorker = 0;
    
    // Create worker pool
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker('data-worker.js');
      this.workers.push({
        worker,
        busy: false,
        queue: []
      });
      
      worker.onmessage = (e) => this.handleResult(i, e);
    }
  }
  
  async process(data, operation) {
    // Find available worker or use round-robin
    const workerInfo = this.getAvailableWorker();
    
    return new Promise((resolve, reject) => {
      workerInfo.queue.push({ resolve, reject });
      workerInfo.busy = true;
      
      workerInfo.worker.postMessage({
        data,
        operation
      });
    });
  }
  
  getAvailableWorker() {
    // Try to find idle worker
    let workerInfo = this.workers.find(w => !w.busy);
    
    // Otherwise use round-robin
    if (!workerInfo) {
      workerInfo = this.workers[this.nextWorker];
      this.nextWorker = (this.nextWorker + 1) % this.workers.length;
    }
    
    return workerInfo;
  }
  
  handleResult(workerIndex, event) {
    const workerInfo = this.workers[workerIndex];
    const { result, error } = event.data;
    const { resolve, reject } = workerInfo.queue.shift();
    
    workerInfo.busy = workerInfo.queue.length > 0;
    
    if (error) {
      reject(new Error(error));
    } else {
      resolve(result);
    }
  }
  
  terminateAll() {
    this.workers.forEach(w => w.worker.terminate());
  }
}

// Usage
const processor = new DataProcessor(4); // 4 worker threads

// Process data in parallel
const results = await Promise.all([
  processor.process(data1, 'analyze'),
  processor.process(data2, 'analyze'),
  processor.process(data3, 'analyze'),
  processor.process(data4, 'analyze')
]);

console.log('All data processed!', results);
```

---

## requestIdleCallback - Background Tasks

### What It Does

Queues a function to be called during browser's idle periods. Perfect for non-critical tasks.

### Why It Matters

- **Performance**: Don't interrupt critical rendering
- **Priority**: Do work when browser has spare time
- **Battery**: More efficient resource usage
- **UX**: Keep UI responsive

### Basic Usage

```javascript
// ❌ BAD: Heavy work immediately
function doHeavyWork() {
  // Blocks UI for 100ms
  complexCalculation();
}
doHeavyWork(); // Runs immediately, blocks UI

// ✅ GOOD: Defer to idle time
requestIdleCallback((deadline) => {
  // deadline.timeRemaining() tells you how much time you have
  
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    const task = tasks.shift();
    task();
  }
  
  // If more tasks, schedule another callback
  if (tasks.length > 0) {
    requestIdleCallback(processTasksprocess);
  }
}, { timeout: 2000 }); // Max 2s delay
```

### Advanced Example: Task Scheduler

```javascript
/**
 * Schedule non-critical tasks during idle time
 */
class IdleTaskScheduler {
  constructor() {
    this.tasks = [];
    this.running = false;
  }
  
  schedule(task, options = {}) {
    this.tasks.push({
      fn: task,
      priority: options.priority || 0,
      timeout: options.timeout
    });
    
    // Sort by priority (higher first)
    this.tasks.sort((a, b) => b.priority - a.priority);
    
    if (!this.running) {
      this.start();
    }
  }
  
  start() {
    this.running = true;
    this.processNextBatch();
  }
  
  processNextBatch() {
    requestIdleCallback((deadline) => {
      // Process tasks while we have time
      while (deadline.timeRemaining() > 0 && this.tasks.length > 0) {
        const task = this.tasks.shift();
        
        try {
          task.fn();
        } catch (error) {
          console.error('Task error:', error);
        }
      }
      
      // Continue if more tasks
      if (this.tasks.length > 0) {
        this.processNextBatch();
      } else {
        this.running = false;
      }
    });
  }
  
  clear() {
    this.tasks = [];
    this.running = false;
  }
}

// Usage
const scheduler = new IdleTaskScheduler();

// Schedule analytics
scheduler.schedule(() => {
  sendAnalytics();
}, { priority: 1 });

// Schedule prefetch
scheduler.schedule(() => {
  prefetchNextPage();
}, { priority: 2, timeout: 1000 });

// Schedule cleanup
scheduler.schedule(() => {
  cleanupOldData();
}, { priority: 0 });
```

### Real-World Use Case: Progressive Enhancement

```javascript
/**
 * Load and initialize non-critical features
 */
class ProgressiveEnhancer {
  constructor() {
    this.features = new Map();
    this.initialized = new Set();
  }
  
  register(name, initializer, options = {}) {
    this.features.set(name, {
      initializer,
      priority: options.priority || 0,
      timeout: options.timeout || 5000
    });
  }
  
  start() {
    // Sort features by priority
    const sorted = Array.from(this.features.entries())
      .sort((a, b) => b[1].priority - a[1].priority);
    
    sorted.forEach(([name, feature]) => {
      this.initializeWhenIdle(name, feature);
    });
  }
  
  initializeWhenIdle(name, feature) {
    requestIdleCallback(
      (deadline) => {
        if (!this.initialized.has(name)) {
          console.log(`Initializing ${name}...`);
          
          try {
            feature.initializer();
            this.initialized.add(name);
            console.log(`✓ ${name} initialized`);
          } catch (error) {
            console.error(`Failed to initialize ${name}:`, error);
          }
        }
      },
      { timeout: feature.timeout }
    );
  }
}

// Usage
const enhancer = new ProgressiveEnhancer();

// Register features
enhancer.register('analytics', () => {
  loadAnalytics();
}, { priority: 1, timeout: 2000 });

enhancer.register('chat-widget', () => {
  loadChatWidget();
}, { priority: 2, timeout: 5000 });

enhancer.register('animations', () => {
  initializeAnimations();
}, { priority: 3, timeout: 3000 });

// Start after page load
window.addEventListener('load', () => {
  enhancer.start();
});
```

---

## Page Visibility API - Optimize Hidden Tabs

### What It Does

Detects when page is visible or hidden. Stop unnecessary work when tab is hidden.

### Why It Matters

- **Battery**: Don't waste resources on hidden tabs
- **Performance**: Pause animations, polling
- **User Experience**: Resume when tab becomes visible
- **Analytics**: Track actual engagement time

### Basic Usage

```javascript
// Check if page is currently hidden
if (document.hidden) {
  console.log('Page is hidden');
}

// Listen for visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('User switched away');
    // Pause video, stop polling, etc.
  } else {
    console.log('User came back');
    // Resume video, restart polling, etc.
  }
});
```

### Advanced Example: Smart Resource Management

```javascript
/**
 * Manage resources based on page visibility
 */
class VisibilityManager {
  constructor() {
    this.listeners = [];
    this.hiddenTime = null;
    this.visibleTime = performance.now();
    
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
  }
  
  onVisible(callback) {
    this.listeners.push({ type: 'visible', callback });
  }
  
  onHidden(callback) {
    this.listeners.push({ type: 'hidden', callback });
  }
  
  handleVisibilityChange() {
    const now = performance.now();
    
    if (document.hidden) {
      this.hiddenTime = now;
      const visibleDuration = now - this.visibleTime;
      
      this.listeners
        .filter(l => l.type === 'hidden')
        .forEach(l => l.callback({ visibleDuration }));
        
    } else {
      this.visibleTime = now;
      const hiddenDuration = this.hiddenTime ? now - this.hiddenTime : 0;
      
      this.listeners
        .filter(l => l.type === 'visible')
        .forEach(l => l.callback({ hiddenDuration }));
    }
  }
  
  isVisible() {
    return !document.hidden;
  }
}

// Usage
const visibility = new VisibilityManager();

visibility.onHidden(({ visibleDuration }) => {
  console.log('Tab hidden after', visibleDuration, 'ms');
  
  // Pause video
  video.pause();
  
  // Stop animations
  cancelAnimationFrame(animationId);
  
  // Stop polling
  clearInterval(pollInterval);
  
  // Disconnect WebSocket
  websocket.close();
});

visibility.onVisible(({ hiddenDuration }) => {
  console.log('Tab visible after', hiddenDuration, 'ms hidden');
  
  // Resume video
  video.play();
  
  // Restart animations
  startAnimation();
  
  // Restart polling
  startPolling();
  
  // Reconnect WebSocket
  connectWebSocket();
});
```

### Real-World Use Case: Video Player

```javascript
/**
 * Smart video player that pauses when tab is hidden
 */
class SmartVideoPlayer {
  constructor(videoElement) {
    this.video = videoElement;
    this.wasPlaying = false;
    
    this.setupVisibilityHandling();
  }
  
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Save playing state and pause
        this.wasPlaying = !this.video.paused;
        if (this.wasPlaying) {
          this.video.pause();
          console.log('Video paused (tab hidden)');
        }
      } else {
        // Resume if it was playing
        if (this.wasPlaying) {
          this.video.play();
          console.log('Video resumed (tab visible)');
        }
      }
    });
  }
}

// Usage
const player = new SmartVideoPlayer(document.querySelector('video'));
```

---

## Navigation Timing API - Performance Metrics

### What It Does

Provides accurate timing information about page navigation and loading. Essential for performance monitoring.

### Why It Matters

- **Accuracy**: Precise timing from browser
- **CRP Metrics**: Measure every phase
- **Debugging**: Find bottlenecks
- **Monitoring**: Track performance over time

### Complete Example

```javascript
/**
 * Comprehensive performance metrics
 */
class PerformanceMetrics {
  static getMetrics() {
    const navTiming = performance.getEntriesByType('navigation')[0];
    const paintTiming = performance.getEntriesByType('paint');
    
    return {
      // Connection
      dns: this.getDNSTime(navTiming),
      tcp: this.getTCPTime(navTiming),
      ssl: this.getSSLTime(navTiming),
      
      // Request/Response
      ttfb: this.getTTFB(navTiming),
      download: this.getDownloadTime(navTiming),
      
      // Processing
      domProcessing: this.getDOMProcessing(navTiming),
      domContentLoaded: this.getDOMContentLoaded(navTiming),
      
      // Paint
      firstPaint: this.getFirstPaint(paintTiming),
      firstContentfulPaint: this.getFCP(paintTiming),
      
      // Complete
      pageLoad: this.getPageLoad(navTiming)
    };
  }
  
  static getDNSTime(timing) {
    return timing.domainLookupEnd - timing.domainLookupStart;
  }
  
  static getTCPTime(timing) {
    return timing.connectEnd - timing.connectStart;
  }
  
  static getSSLTime(timing) {
    return timing.secureConnectionStart > 0 
      ? timing.connectEnd - timing.secureConnectionStart 
      : 0;
  }
  
  static getTTFB(timing) {
    return timing.responseStart - timing.requestStart;
  }
  
  static getDownloadTime(timing) {
    return timing.responseEnd - timing.responseStart;
  }
  
  static getDOMProcessing(timing) {
    return timing.domInteractive - timing.responseEnd;
  }
  
  static getDOMContentLoaded(timing) {
    return timing.domContentLoadedEventEnd - timing.navigationStart;
  }
  
  static getFirstPaint(paintTiming) {
    const fp = paintTiming.find(e => e.name === 'first-paint');
    return fp ? fp.startTime : null;
  }
  
  static getFCP(paintTiming) {
    const fcp = paintTiming.find(e => e.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }
  
  static getPageLoad(timing) {
    return timing.loadEventEnd - timing.navigationStart;
  }
  
  static printReport() {
    const metrics = this.getMetrics();
    
    console.log('═══════════════════════════════════');
    console.log('      PERFORMANCE METRICS          ');
    console.log('═══════════════════════════════════');
    console.log('Connection:');
    console.log(`  DNS Lookup:        ${metrics.dns.toFixed(2)}ms`);
    console.log(`  TCP Connection:    ${metrics.tcp.toFixed(2)}ms`);
    console.log(`  SSL Handshake:     ${metrics.ssl.toFixed(2)}ms`);
    console.log('');
    console.log('Request/Response:');
    console.log(`  TTFB:              ${metrics.ttfb.toFixed(2)}ms`);
    console.log(`  Download:          ${metrics.download.toFixed(2)}ms`);
    console.log('');
    console.log('Processing:');
    console.log(`  DOM Processing:    ${metrics.domProcessing.toFixed(2)}ms`);
    console.log(`  DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
    console.log('');
    console.log('Paint:');
    console.log(`  First Paint:       ${metrics.firstPaint.toFixed(2)}ms`);
    console.log(`  First Contentful:  ${metrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log('');
    console.log(`Page Load Complete:  ${metrics.pageLoad.toFixed(2)}ms`);
    console.log('═══════════════════════════════════');
  }
}

// Usage
window.addEventListener('load', () => {
  setTimeout(() => {
    PerformanceMetrics.printReport();
  }, 0);
});
```

---

## queueMicrotask - Fine-Grained Control

### What It Does

Queues a microtask to be executed before the next task. More precise than `setTimeout(fn, 0)`.

### Why It Matters

- **Precision**: Execute after current task, before next
- **Order**: Control execution order precisely
- **Performance**: No timer overhead
- **Batching**: Group operations efficiently

### Usage

```javascript
// ❌ setTimeout - adds to task queue (slower)
setTimeout(() => {
  console.log('Task queue');
}, 0);

// ✅ queueMicrotask - adds to microtask queue (faster)
queueMicrotask(() => {
  console.log('Microtask queue');
});

// Promise.then also uses microtask queue
Promise.resolve().then(() => {
  console.log('Promise (microtask)');
});

// Order: Microtask queue → Promise → Task queue
```

### Advanced Example: Batch State Updates

```javascript
/**
 * Batch state updates using microtasks
 */
class StateManager {
  constructor() {
    this.state = {};
    this.listeners = new Set();
    this.pendingUpdate = false;
    this.pendingChanges = {};
  }
  
  setState(updates) {
    // Collect changes
    Object.assign(this.pendingChanges, updates);
    
    // Schedule microtask if not already scheduled
    if (!this.pendingUpdate) {
      this.pendingUpdate = true;
      
      queueMicrotask(() => {
        this.flush();
      });
    }
  }
  
  flush() {
    // Apply all changes at once
    const oldState = { ...this.state };
    Object.assign(this.state, this.pendingChanges);
    
    // Notify listeners
    this.listeners.forEach(listener => {
      listener(this.state, oldState);
    });
    
    // Reset
    this.pendingChanges = {};
    this.pendingUpdate = false;
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Usage
const state = new StateManager();

state.subscribe((newState, oldState) => {
  console.log('State updated:', newState);
});

// These all batch into ONE update
state.setState({ name: 'John' });
state.setState({ age: 30 });
state.setState({ city: 'NYC' });

// Only ONE listener call with all changes!
```

---

## Summary: When to Use What

| Method | Use Case | Priority |
|--------|----------|----------|
| `requestAnimationFrame` | Animations, visual updates | High |
| `Intersection Observer` | Lazy loading, visibility tracking | High |
| `Resize Observer` | Responsive components | Medium |
| `Mutation Observer` | React to DOM changes | Medium |
| `Performance Observer` | RUM, metrics tracking | High |
| `Web Workers` | Heavy computations | Medium |
| `requestIdleCallback` | Non-critical tasks | Low |
| `Page Visibility API` | Pause/resume on tab switch | Medium |
| `Navigation Timing API` | Performance monitoring | High |
| `queueMicrotask` | Precise execution order | Low |

---

## Best Practices

1. **Always clean up observers**
   ```javascript
   observer.disconnect(); // Stop observing
   ```

2. **Use WeakMap/WeakSet for metadata**
   ```javascript
   const metadata = new WeakMap();
   metadata.set(element, data); // GC-friendly
   ```

3. **Handle errors gracefully**
   ```javascript
   try {
     // Observer callback
   } catch (error) {
     console.error('Observer error:', error);
   }
   ```

4. **Debounce expensive operations**
   ```javascript
   let timeout;
   observer.observe(element, entries => {
     clearTimeout(timeout);
     timeout = setTimeout(() => {
       // Expensive operation
     }, 100);
   });
   ```

5. **Test browser support**
   ```javascript
   if ('IntersectionObserver' in window) {
     // Use it
   } else {
     // Fallback
   }
   ```

---

## Browser Support

Most of these APIs are widely supported. Check [caniuse.com](https://caniuse.com) for specifics:

- ✅ `requestAnimationFrame`: 96%+
- ✅ `Intersection Observer`: 95%+
- ✅ `Resize Observer`: 95%+
- ✅ `Mutation Observer`: 98%+
- ✅ `Performance Observer`: 95%+
- ✅ `Web Workers`: 98%+
- ⚠️ `requestIdleCallback`: 94% (no Safari yet)
- ✅ `Page Visibility API`: 97%+
- ✅ `Navigation Timing API`: 98%+
- ✅ `queueMicrotask`: 90%+

---

## Next Steps

1. **Practice**: Implement these in your projects
2. **Measure**: Use DevTools to see performance impact
3. **Combine**: Use multiple APIs together
4. **Monitor**: Set up RUM to track real-world performance

**Remember**: These aren't just APIs—they're tools for building fast, responsive, user-friendly web applications! 🚀

