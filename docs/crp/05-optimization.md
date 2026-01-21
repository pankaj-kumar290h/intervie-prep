# Critical Rendering Path - Optimization Strategies

## Table of Contents
1. [General Optimization Principles](#general-optimization-principles)
2. [HTML Optimizations](#html-optimizations)
3. [CSS Optimizations](#css-optimizations)
4. [JavaScript Optimizations](#javascript-optimizations)
5. [Resource Loading Strategies](#resource-loading-strategies)
6. [Runtime Performance](#runtime-performance)
7. [Measuring Performance](#measuring-performance)
8. [Optimization Checklist](#optimization-checklist)

---

## General Optimization Principles

### The Three Pillars of CRP Optimization

```
1. MINIMIZE Critical Resources
   └─ Fewer files to block rendering

2. MINIMIZE Critical Bytes
   └─ Smaller files load faster

3. MINIMIZE Critical Path Length
   └─ Fewer round trips to server
```

### The 3-Second Rule

```
Users expect pages to load in 3 seconds or less:
├─ 0-1s: Fast (excellent)
├─ 1-3s: Acceptable (good)
├─ 3-5s: Slow (losing users)
└─ 5s+: Very Slow (users leave)
```

### Priority Framework

```
Critical (above-the-fold)
  ├─ HTML (minimal, required)
  ├─ Critical CSS (inline, < 14KB)
  └─ Core JavaScript (defer if possible)

Important (enhances experience)
  ├─ Full CSS (load async)
  ├─ Fonts (preload, font-display: swap)
  └─ Above-fold images (preload)

Nice-to-have (progressive enhancement)
  ├─ Below-fold images (lazy load)
  ├─ Analytics/tracking (async)
  ├─ Third-party widgets (defer)
  └─ Non-critical features (code split)
```

---

## HTML Optimizations

### 1. Minimize HTML Size

```html
<!-- ❌ BAD: Bloated HTML -->
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
    <!-- Lots of whitespace and comments -->
    <meta name="description" content="..." />
    <meta name="keywords" content="..." />
    <!-- ... lots more meta tags ... -->
  </head>
  <body>
    <div class="container">
      <div class="wrapper">
        <div class="inner">
          <h1>Title</h1>
        </div>
      </div>
    </div>
  </body>
</html>

<!-- ✅ GOOD: Minimal HTML -->
<!DOCTYPE html>
<html>
<head>
<title>My Page</title>
<meta name="description" content="...">
</head>
<body>
<div class="container">
<h1>Title</h1>
</div>
</body>
</html>
```

### 2. Optimal Resource Order

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. Critical metadata -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Page Title</title>
  
  <!-- 2. Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://api.example.com">
  
  <!-- 3. Critical CSS (inline or external) -->
  <style>/* Critical CSS here (< 14KB) */</style>
  
  <!-- 4. Preload critical resources -->
  <link rel="preload" href="hero.jpg" as="image">
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- 5. Deferred JavaScript -->
  <script src="app.js" defer></script>
  
  <!-- 6. Non-critical CSS (load async) -->
  <link rel="preload" href="styles.css" as="style" 
        onload="this.onload=null;this.rel='stylesheet'">
</head>
<body>
  <!-- Content here -->
</body>
</html>
```

### 3. Avoid Inline Scripts in `<head>`

```html
<!-- ❌ BAD: Blocks parser -->
<head>
  <script>
    // Heavy computation
    for (let i = 0; i < 1000000; i++) {
      // Do something
    }
  </script>
</head>

<!-- ✅ GOOD: Defer until needed -->
<head>
  <script defer>
    // Wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      // Do something after page loaded
    });
  </script>
</head>
```

---

## CSS Optimizations

### 1. Critical CSS Pattern (Most Important!)

```html
<head>
  <!-- Step 1: Inline critical CSS -->
  <style>
    /* Only styles for above-the-fold content */
    body { margin: 0; font-family: sans-serif; }
    .header { height: 60px; background: #333; }
    .hero { height: 400px; background: blue; }
    /* Total: < 14KB (fits in first TCP packet) */
  </style>
  
  <!-- Step 2: Async load full CSS -->
  <link rel="preload" href="styles.css" as="style" 
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="styles.css">
  </noscript>
</head>
```

**Tools to extract critical CSS:**
- [Critical](https://github.com/addyosmani/critical)
- [Penthouse](https://github.com/pocketjoso/penthouse)
- [Critters](https://github.com/GoogleChromeLabs/critters)

### 2. Minimize and Compress CSS

```bash
# Before optimization
styles.css: 150 KB

# After minification
styles.min.css: 120 KB (-20%)

# After compression (gzip)
styles.min.css.gz: 25 KB (-83%)

# After compression (brotli)
styles.min.css.br: 20 KB (-87%)
```

### 3. Remove Unused CSS

```css
/* ❌ BAD: Shipping entire Bootstrap */
@import 'bootstrap.css';  /* 200KB */
/* You only use: buttons, grid, utilities = 30KB */

/* ✅ GOOD: Import only what you need */
@import 'bootstrap/buttons.css';
@import 'bootstrap/grid.css';
@import 'bootstrap/utilities.css';
/* Total: 30KB */
```

**Tools:**
- [PurgeCSS](https://purgecss.com/)
- [UnCSS](https://github.com/uncss/uncss)
- Chrome DevTools Coverage

### 4. Media Queries for Non-Critical CSS

```html
<!-- ✅ These don't block render on desktop -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="(max-width: 600px)">

<!-- Trick: Load CSS async -->
<link rel="stylesheet" href="non-critical.css" media="print" 
      onload="this.media='all'">
```

### 5. Avoid @import in CSS

```css
/* ❌ BAD: Serial loading (slow) */
/* main.css */
@import url('reset.css');      /* Must wait */
@import url('typography.css'); /* Must wait */
@import url('layout.css');     /* Must wait */

/* Timeline: 0ms → 100ms → 200ms → 300ms */
```

```html
<!-- ✅ GOOD: Parallel loading -->
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="typography.css">
<link rel="stylesheet" href="layout.css">

<!-- Timeline: All load simultaneously at 0ms → 100ms -->
```

---

## JavaScript Optimizations

### 1. Use Defer/Async Appropriately

```html
<head>
  <!-- ❌ BAD: Blocks everything -->
  <script src="app.js"></script>
  
  <!-- ✅ GOOD: For independent scripts -->
  <script src="analytics.js" async></script>
  
  <!-- ✅ BETTER: For most scripts -->
  <script src="app.js" defer></script>
  
  <!-- ✅ BEST: ES6 modules (defer by default) -->
  <script type="module" src="app.js"></script>
</head>
```

### 2. Code Splitting

```javascript
// ❌ BAD: One huge bundle (500KB)
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Settings from './Settings';
// ... 50 more imports

// ✅ GOOD: Split by route
import React, { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Analytics = lazy(() => import('./Analytics'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Now: Initial bundle: 150KB, each route: ~50KB (loaded on demand)
```

### 3. Tree Shaking

```javascript
// ❌ BAD: Imports entire library
import _ from 'lodash';  // 70KB
_.debounce(fn, 300);

// ✅ GOOD: Import only what you need
import debounce from 'lodash/debounce';  // 2KB

// ✅ BETTER: Use modern alternatives
// Native or smaller alternatives
```

### 4. Minification and Compression

```javascript
// Before minification: app.js (200KB)
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

// After minification: app.min.js (120KB)
function calculateTotal(t){let e=0;for(let l=0;l<t.length;l++)e+=t[l].price;return e}

// After compression: app.min.js.br (35KB)
// Brotli compressed
```

### 5. Avoid Long Tasks

```javascript
// ❌ BAD: Blocks main thread for 500ms
function processItems(items) {
  items.forEach(item => {
    // Heavy computation
    complexCalculation(item);
  });
}

// ✅ GOOD: Split into chunks
async function processItems(items) {
  const chunkSize = 100;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(item => complexCalculation(item));
    
    // Yield to browser
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// ✅ BETTER: Use Web Worker
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ items });
worker.onmessage = (e) => {
  console.log('Processed:', e.data);
};

// worker.js (runs in separate thread)
onmessage = (e) => {
  const results = e.data.items.map(item => complexCalculation(item));
  postMessage(results);
};
```

---

## Resource Loading Strategies

### 1. Resource Hints

```html
<head>
  <!-- DNS prefetch: Resolve DNS early -->
  <link rel="dns-prefetch" href="https://analytics.example.com">
  
  <!-- Preconnect: DNS + TCP + TLS handshake -->
  <link rel="preconnect" href="https://api.example.com">
  
  <!-- Prefetch: Low-priority fetch for next page -->
  <link rel="prefetch" href="next-page.html">
  
  <!-- Preload: High-priority fetch for this page -->
  <link rel="preload" href="hero.jpg" as="image">
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- Prerender: Load and render entire page (use sparingly!) -->
  <link rel="prerender" href="next-page.html">
</head>
```

**When to use what:**

```
dns-prefetch: Third-party domains you'll definitely use
   └─ Example: Analytics, ads, CDN

preconnect: Critical third-party resources
   └─ Example: API, fonts, critical images

prefetch: Resources for next navigation
   └─ Example: Next page, next route

preload: Critical resources for current page
   └─ Example: Hero image, custom font, critical CSS

prerender: Next page user will likely visit (rare)
   └─ Example: "Next" button destination
```

### 2. Image Optimization

```html
<!-- ❌ BAD: Large image blocks rendering -->
<img src="hero.jpg" alt="Hero">  <!-- 3MB -->

<!-- ✅ GOOD: Responsive images -->
<img 
  srcset="
    hero-400.jpg 400w,
    hero-800.jpg 800w,
    hero-1200.jpg 1200w
  "
  sizes="
    (max-width: 600px) 400px,
    (max-width: 900px) 800px,
    1200px
  "
  src="hero-800.jpg"
  alt="Hero"
  loading="lazy"
  decoding="async"
>

<!-- ✅ BETTER: Modern formats with fallback -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero" loading="lazy">
</picture>

<!-- ✅ BEST: Preload critical images -->
<head>
  <link rel="preload" as="image" href="hero.avif" type="image/avif">
</head>
```

### 3. Font Loading Optimization

```css
/* ❌ BAD: Font blocks text rendering (FOIT) */
@font-face {
  font-family: 'Custom';
  src: url('custom.woff2');
}

/* ✅ GOOD: Show fallback while loading */
@font-face {
  font-family: 'Custom';
  src: url('custom.woff2');
  font-display: swap;  /* Show fallback immediately */
}

/* Options:
   - auto: Browser default (usually block)
   - block: Invisible text up to 3s (FOIT)
   - swap: Show fallback immediately (FOUT)
   - fallback: Short block, then fallback
   - optional: Very short block, then give up if slow
*/
```

```html
<!-- ✅ Preload critical fonts -->
<head>
  <link 
    rel="preload" 
    href="font.woff2" 
    as="font" 
    type="font/woff2"
    crossorigin
  >
</head>
```

### 4. Third-Party Scripts

```html
<!-- ❌ BAD: Blocks your page -->
<script src="https://analytics.com/script.js"></script>

<!-- ✅ GOOD: Load asynchronously -->
<script src="https://analytics.com/script.js" async></script>

<!-- ✅ BETTER: Defer until page ready -->
<script>
  window.addEventListener('load', () => {
    const script = document.createElement('script');
    script.src = 'https://analytics.com/script.js';
    document.head.appendChild(script);
  });
</script>

<!-- ✅ BEST: Facade pattern (load on interaction) -->
<div id="chat-widget-placeholder">
  <button id="load-chat">Open Chat</button>
</div>

<script>
  document.getElementById('load-chat').addEventListener('click', () => {
    const script = document.createElement('script');
    script.src = 'https://chat.com/widget.js';
    document.head.appendChild(script);
  }, { once: true });
</script>
```

---

## Runtime Performance

### 1. Batch DOM Reads and Writes

```javascript
// ❌ BAD: Interleaved reads/writes (causes layout thrashing)
elements.forEach(el => {
  const height = el.offsetHeight;  // Read (triggers layout)
  el.style.height = height + 10 + 'px';  // Write
  // This pattern × 100 = 100 layouts!
});

// ✅ GOOD: Batch reads, then writes
// Read phase
const heights = elements.map(el => el.offsetHeight);

// Write phase
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';
});
// Only 2 layouts total!

// ✅ BETTER: Use requestAnimationFrame
function updateElements() {
  requestAnimationFrame(() => {
    // All DOM updates here happen in one frame
    elements.forEach(el => {
      el.style.height = calculateHeight(el) + 'px';
    });
  });
}
```

### 2. Use Efficient Selectors

```javascript
// ❌ SLOW
document.querySelectorAll('div.container .item'); // Complex selector

// ✅ FASTER
document.querySelectorAll('.item'); // Simple class

// ✅ FASTEST
document.getElementById('item'); // Direct ID lookup

// ✅ Best: Cache references
const items = document.querySelectorAll('.item'); // Query once
items.forEach(item => {
  // Use cached reference
});
```

### 3. Optimize Animations

```css
/* ❌ BAD: Triggers layout + paint + composite */
.animate {
  transition: left 0.3s, width 0.3s;
}

/* ✅ GOOD: Triggers composite only (GPU accelerated) */
.animate {
  transition: transform 0.3s, opacity 0.3s;
}

/* ✅ Hint browser to create layer */
.will-animate {
  will-change: transform, opacity;
}
```

```javascript
// ❌ BAD: JavaScript animation (60fps hard)
function animate() {
  element.style.left = element.offsetLeft + 1 + 'px';
  if (element.offsetLeft < 500) {
    setTimeout(animate, 16);
  }
}

// ✅ GOOD: CSS animation
element.classList.add('animate');

// ✅ BETTER: requestAnimationFrame for complex animations
function animate(timestamp) {
  const progress = timestamp / 1000;  // seconds
  element.style.transform = `translateX(${progress * 100}px)`;
  
  if (progress < 5) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

---

## Measuring Performance

### 1. Key Metrics

```javascript
// Measure using Performance API
const perfData = performance.getEntriesByType('navigation')[0];

console.log('Time to First Byte:', perfData.responseStart);
console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd);
console.log('Page Fully Loaded:', perfData.loadEventEnd);

// Core Web Vitals
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.value);
  }
});

observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
```

**Core Web Vitals:**
```
LCP (Largest Contentful Paint)
├─ Good: < 2.5s
├─ Needs Improvement: 2.5-4s
└─ Poor: > 4s

FID (First Input Delay)
├─ Good: < 100ms
├─ Needs Improvement: 100-300ms
└─ Poor: > 300ms

CLS (Cumulative Layout Shift)
├─ Good: < 0.1
├─ Needs Improvement: 0.1-0.25
└─ Poor: > 0.25
```

### 2. Chrome DevTools

```bash
# 1. Performance Tab
- Record page load
- Analyze flame graph
- Identify long tasks
- Check frame rate

# 2. Coverage Tab
- Find unused CSS/JS
- Reduce bundle size

# 3. Lighthouse
- Run audit
- Get actionable suggestions
- Track improvements over time

# 4. Network Tab
- Check resource sizes
- Verify compression
- Check load order
- Identify slow resources
```

### 3. Real User Monitoring (RUM)

```javascript
// Send metrics to your analytics
function sendMetrics() {
  const paint = performance.getEntriesByType('paint');
  const FCP = paint.find(entry => entry.name === 'first-contentful-paint');
  
  // Send to analytics
  analytics.track('performance', {
    fcp: FCP?.startTime,
    connection: navigator.connection?.effectiveType,
    deviceMemory: navigator.deviceMemory
  });
}

window.addEventListener('load', sendMetrics);
```

---

## Optimization Checklist

### Critical (Do First!)

- [ ] Inline critical CSS (< 14KB)
- [ ] Use `defer` for scripts
- [ ] Minimize critical resources
- [ ] Enable text compression (gzip/brotli)
- [ ] Optimize images (WebP/AVIF)
- [ ] Use `font-display: swap`

### Important (High Impact)

- [ ] Code splitting
- [ ] Tree shaking
- [ ] Remove unused CSS
- [ ] Lazy load below-fold images
- [ ] Preload critical resources
- [ ] Minify HTML/CSS/JS

### Nice to Have (Progressive Enhancement)

- [ ] Service Worker caching
- [ ] HTTP/2 or HTTP/3
- [ ] CDN for static assets
- [ ] Prefetch next pages
- [ ] Implement skeleton screens
- [ ] Use `will-change` for animations

### Continuous

- [ ] Monitor Core Web Vitals
- [ ] Regular Lighthouse audits
- [ ] Performance budgets
- [ ] A/B test optimizations

---

## Quick Wins Summary

### 5-Minute Fixes
```html
<!-- 1. Add defer to scripts -->
<script src="app.js" defer></script>

<!-- 2. Add lazy loading to images -->
<img src="image.jpg" loading="lazy">

<!-- 3. Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
```

### 1-Hour Optimizations
- Extract and inline critical CSS
- Enable compression on server
- Optimize and convert images to WebP
- Add resource hints

### Long-Term Strategy
- Implement code splitting
- Set up performance monitoring
- Create performance budget
- Regular audits and improvements

---

**Remember**: Optimize for the user's experience, not just the numbers. A page that loads in 3s but feels responsive is better than a page that loads in 2s but feels janky!

Next: See practical examples in the [examples folder](../examples/)

