# Using Chrome DevTools to Analyze Critical Rendering Path

## Table of Contents
1. [Overview](#overview)
2. [Network Tab - Resource Analysis](#network-tab---resource-analysis)
3. [Performance Tab - Timeline Analysis](#performance-tab---timeline-analysis)
4. [Lighthouse - Automated Audits](#lighthouse---automated-audits)
5. [Coverage Tab - Unused Code](#coverage-tab---unused-code)
6. [Performance API - Programmatic Measurement](#performance-api---programmatic-measurement)
7. [Real-World Examples](#real-world-examples)
8. [Common Issues and Solutions](#common-issues-and-solutions)

---

## Overview

Chrome DevTools provides powerful features to analyze and optimize the Critical Rendering Path. This guide shows you exactly how to use each tool.

### Opening DevTools

```
Windows/Linux: F12 or Ctrl+Shift+I
Mac: Cmd+Option+I
Right-click: Inspect Element
```

### DevTools Tabs for CRP Analysis

```
Network Tab    → Resource loading and blocking
Performance Tab → Timeline and rendering phases
Lighthouse     → Automated performance audit
Coverage Tab   → Unused CSS/JavaScript
Console        → Performance API and metrics
```

---

## Network Tab - Resource Analysis

### What to Look For

The Network tab shows:
- What resources are loaded
- When they load
- How large they are
- Which resources block rendering

### Step-by-Step Guide

#### 1. Open Network Tab

```
DevTools → Network Tab → Refresh page (Cmd/Ctrl+R)
```

#### 2. Enable Key Features

```
☑️ Disable cache (important for testing!)
☑️ Preserve log
☐ Throttling: No throttling (or test with Slow 3G)
```

**To Enable:**
- Click the gear icon or checkboxes at top of Network tab
- Check "Disable cache"
- Check "Preserve log"

#### 3. Understanding the Waterfall

**The waterfall chart shows resource loading timeline:**

```
Document (HTML)
│
├─ styles.css     [=========]     ← Blocks rendering!
├─ app.js         [=========]     ← Blocks parsing!
├─ image.jpg      [=========]     ← Non-blocking
└─ font.woff2     [=========]     ← May block text
```

**Color Coding:**
- **Light stripe**: Queued/Waiting
- **Dark stripe**: Downloading
- **Thin line**: Blocked resource

#### 4. Identify Blocking Resources

**Look for resources that appear early and delay other resources:**

```
Priority Column:
├─ Highest    → Critical resources (HTML, CSS in <head>)
├─ High       → Important resources (scripts, fonts)
├─ Medium     → Less critical (images, stylesheets with media)
└─ Low        → Lazy-loaded or deferred resources
```

**To Show Priority Column:**
- Right-click on column headers
- Check "Priority"

#### 5. Analyze Resource Details

**Click on any resource to see:**

```
Headers Tab
├─ Request URL
├─ Request Method
├─ Status Code
├─ Response Headers
│  └─ Content-Encoding: gzip (check compression!)
│  └─ Cache-Control (check caching!)
└─ Request Headers

Timing Tab (Critical!)
├─ Queueing
├─ Stalled
├─ DNS Lookup
├─ Initial Connection
├─ SSL
├─ Request sent
├─ Waiting (TTFB - Time to First Byte)
├─ Content Download
└─ TOTAL TIME
```

#### 6. Key Metrics to Check

**At the bottom of Network tab:**

```
XX requests | XX MB transferred | XX MB resources | Finish: XX s | DOMContentLoaded: XX s | Load: XX s
                     ↑                                              ↑                        ↑
              (with compression)                          (scripts executed)         (all resources)
```

**What these mean:**

```
DOMContentLoaded (Blue line)
└─ HTML parsed, DOM ready, deferred scripts executed

Load (Red line)
└─ All resources loaded (images, stylesheets, etc.)

Finish
└─ Time until last resource completed
```

#### 7. Filter by Resource Type

**Use the filter bar to focus:**

```
Ctrl/Cmd+F → Search
Filters:
├─ All        → Everything
├─ XHR        → API calls
├─ JS         → JavaScript files
├─ CSS        → Stylesheets
├─ Img        → Images
├─ Media      → Video/Audio
├─ Font       → Web fonts
├─ Doc        → HTML documents
└─ WS         → WebSockets
```

#### 8. Analyze Blocking Example

**Example: Finding render-blocking CSS**

1. Look at the waterfall
2. Find CSS files loaded before "DOMContentLoaded"
3. These are render-blocking!

```
Timeline view:
0ms    [HTML]
10ms   ├─ [styles.css] ←────────┐
200ms  │                         │ BLOCKS RENDERING
210ms  │  [CSSOM built]          │ (200ms delay!)
220ms  │  [First Paint] ◄────────┘
```

### Network Tab Optimization Checklist

- [ ] **Check file sizes**: Are resources minified and compressed?
- [ ] **Check priority**: Are critical resources "Highest" or "High"?
- [ ] **Check blocking**: Do CSS/JS files delay DOMContentLoaded?
- [ ] **Check compression**: Look for "Content-Encoding: gzip" or "br"
- [ ] **Check caching**: Look for "Cache-Control" headers
- [ ] **Check TTFB**: Should be < 200ms for good performance
- [ ] **Count resources**: Fewer resources = faster load

---

## Performance Tab - Timeline Analysis

### What to Look For

The Performance tab shows:
- Exact rendering timeline
- When each CRP step occurs
- Long tasks blocking the main thread
- Frame rate and jank
- JavaScript execution time

### Step-by-Step Guide

#### 1. Record Performance Profile

```
1. Open Performance Tab
2. Click Record button (●) or press Cmd/Ctrl+E
3. Refresh the page (Cmd/Ctrl+R)
4. Wait for page to load completely
5. Stop recording (●)
```

**Or use "Reload" button:**
- Click the circular arrow icon
- Automatically records page load

#### 2. Understanding the Timeline

**The timeline shows multiple tracks:**

```
┌─────────────────────────────────────────────┐
│ Network (Top)                                │
│ ▓▓▓▓░░░░░░░░░░░░░░░░                       │ ← Resource loading
├─────────────────────────────────────────────┤
│ Frames                                       │
│ ██████████████████████████████              │ ← Green = good (60fps)
├─────────────────────────────────────────────┤
│ Main (Critical!)                             │
│ ▓▓▓[Parse HTML]▓▓[Script]▓▓[Layout]▓▓      │ ← Main thread activity
├─────────────────────────────────────────────┤
│ Raster                                       │
│     ░░░░░░░░▓▓▓▓░░░░░░                     │ ← GPU rasterization
└─────────────────────────────────────────────┘
```

#### 3. Analyzing Main Thread Activity

**The "Main" section is most important:**

**Zoom in** (click and drag or use mousewheel) to see details:

```
Main Thread
│
├─ Parse HTML (light blue)
│  └─ Building DOM
│
├─ Parse Stylesheet (purple)
│  └─ Building CSSOM
│
├─ Evaluate Script (yellow)
│  └─ JavaScript execution
│
├─ Recalculate Style (purple)
│  └─ Computing styles
│
├─ Layout (purple)
│  └─ Calculating positions
│
├─ Update Layer Tree (purple)
│  └─ Preparing layers
│
├─ Paint (green)
│  └─ Drawing pixels
│
└─ Composite Layers (green)
   └─ Final composition
```

**Color coding:**
- **Yellow**: JavaScript/Scripting
- **Purple**: Rendering (Layout, Paint prep)
- **Green**: Painting
- **Blue**: Loading, Parsing HTML
- **Red**: Long tasks (>50ms, bad!)

#### 4. Find CRP Steps

**Look for these specific events:**

```
1. Parse HTML
   └─ Time: Should be fast (< 50ms for small pages)
   
2. Parse Stylesheet
   └─ Time: Depends on CSS size
   └─ BLOCKS: First render!
   
3. Evaluate Script
   └─ Time: Should be deferred if possible
   └─ BLOCKS: HTML parsing (if synchronous)
   
4. Recalculate Style + Layout
   └─ Time: Should be < 16ms for 60fps
   └─ First occurrence: Initial render
   
5. Paint
   └─ Time: First Paint event!
   └─ This is when user sees content
   
6. Composite Layers
   └─ Time: Very fast (GPU accelerated)
```

#### 5. Using Summary Tab

**Click on any event to see details:**

```
Summary Panel (Bottom):
├─ Event: Paint
├─ Total Time: 8.2ms
├─ Self Time: 2.1ms
├─ Start Time: 245.3ms
└─ Details: Click to see call stack
```

#### 6. Finding Long Tasks

**Long tasks (>50ms) hurt responsiveness:**

```
1. Look for RED corners on yellow blocks
2. These are "Long Tasks" (>50ms)
3. Click to see what's taking time
4. Optimize or split into chunks
```

**Example long task:**

```
▓▓▓▓▓▓▓▓▓▓▓▓ Evaluate Script (230ms) 🔴
└─ myFunction
   ├─ heavyCalculation (180ms) ← Problem!
   └─ renderUI (45ms)
```

#### 7. Measuring Paint Events

**Look for these paint-related events:**

```
First Paint (FP)
├─ First pixel drawn
└─ May be just background color

First Contentful Paint (FCP)
├─ First text/image rendered
└─ User sees actual content! 🎯

Largest Contentful Paint (LCP)
├─ Largest element rendered
└─ Main content visible 🎯🎯
```

**To see paint events:**
1. Look for green "Paint" blocks
2. Check "Timings" section for FCP, LCP markers
3. Goal: FCP < 1.8s, LCP < 2.5s

#### 8. Analyzing Frame Rate

**The Frames section shows rendering smoothness:**

```
Frames
█████████░░░█████░░░░░████████
  ↑      ↑     ↑         ↑
Green  Yellow  Red    Green
60fps   30fps  <30fps  60fps

Green bars = Good (60fps)
Yellow bars = Warning (30-60fps)
Red bars = Janky (<30fps)
```

**Click on a frame to see why it's slow:**
- Long JavaScript execution
- Forced layout/reflow
- Heavy painting
- Complex CSS

#### 9. Network Waterfall in Performance Tab

**Top section shows network activity:**

```
Priority levels:
▓▓▓▓ Highest (HTML, critical CSS)
▓▓▓  High (Scripts, fonts)
▓▓   Medium (Images)
▓    Low (Lazy-loaded)
```

#### 10. Using Bottom-Up / Call Tree / Event Log

**Three tabs at bottom:**

```
Bottom-Up
├─ Shows activities sorted by time
└─ Find what took longest

Call Tree
├─ Shows call hierarchy
└─ Understand execution flow

Event Log
├─ Chronological list
└─ See exact sequence of events
```

### Performance Tab Checklist

- [ ] **FCP < 1.8s**: First content appears quickly
- [ ] **LCP < 2.5s**: Main content loads fast
- [ ] **No long tasks**: All yellow blocks < 50ms
- [ ] **Smooth frames**: Green bars at 60fps
- [ ] **Parse time < 100ms**: HTML/CSS parsing is fast
- [ ] **Script evaluation reasonable**: No blocking JS
- [ ] **Layout time < 16ms**: No layout thrashing

---

## Lighthouse - Automated Audits

### What Lighthouse Does

Lighthouse runs automated tests and gives you a performance score with specific recommendations.

### Step-by-Step Guide

#### 1. Run Lighthouse Audit

```
1. Open DevTools
2. Click "Lighthouse" tab
3. Select categories:
   ☑️ Performance (most important for CRP)
   ☑️ Accessibility
   ☑️ Best Practices
   ☑️ SEO
4. Select device: Mobile or Desktop
5. Click "Analyze page load"
6. Wait for results (30-60 seconds)
```

#### 2. Understanding the Performance Score

```
Performance Score: 0-100

90-100: Green (Excellent) ✅
50-89:  Orange (Needs Improvement) ⚠️
0-49:   Red (Poor) ❌
```

**Score is based on:**
- First Contentful Paint (10%)
- Speed Index (10%)
- Largest Contentful Paint (25%)
- Time to Interactive (10%)
- Total Blocking Time (30%)
- Cumulative Layout Shift (15%)

#### 3. Reading Core Web Vitals

**Lighthouse shows Core Web Vitals:**

```
Largest Contentful Paint (LCP)
├─ Good: < 2.5s (green)
├─ Needs Improvement: 2.5-4s (orange)
└─ Poor: > 4s (red)
📊 What it measures: When main content loads

First Input Delay (FID) / Total Blocking Time (TBT)
├─ Good: < 100ms (green)
├─ Needs Improvement: 100-300ms (orange)
└─ Poor: > 300ms (red)
📊 What it measures: Page responsiveness

Cumulative Layout Shift (CLS)
├─ Good: < 0.1 (green)
├─ Needs Improvement: 0.1-0.25 (orange)
└─ Poor: > 0.25 (red)
📊 What it measures: Visual stability
```

#### 4. CRP-Related Diagnostics

**Look for these specific issues:**

```
🔴 Eliminate render-blocking resources
├─ CSS files blocking first paint
├─ Synchronous JavaScript
└─ Fix: Inline critical CSS, defer JS

🔴 Reduce unused CSS
├─ CSS rules not used on page
└─ Fix: Remove or lazy-load

🔴 Reduce unused JavaScript
├─ JS code not executed on page
└─ Fix: Code splitting, tree shaking

🔴 Serve static assets with efficient cache policy
├─ Resources without cache headers
└─ Fix: Add Cache-Control headers

🔴 Minimize main-thread work
├─ Too much JavaScript execution
└─ Fix: Optimize JS, use Web Workers

🔴 Reduce JavaScript execution time
├─ Scripts taking too long to run
└─ Fix: Code splitting, defer non-critical

🔴 Avoid enormous network payloads
├─ Total download size too large
└─ Fix: Compression, optimization

🔴 Properly size images
├─ Images larger than displayed size
└─ Fix: Responsive images, lazy loading
```

#### 5. Opportunities Section

**Lighthouse provides specific savings:**

```
Opportunities (sorted by potential savings)

✅ Eliminate render-blocking resources
   Potential savings: 1,200 ms
   Resources: 2 CSS, 1 JS
   
✅ Properly size images
   Potential savings: 850 ms
   Transfer size savings: 1,200 KB
   
✅ Serve images in next-gen formats
   Potential savings: 500 ms
   Use WebP or AVIF instead of JPEG
```

**Click "▼" to expand and see specific resources!**

#### 6. Using the Treemap View

**Analyze JavaScript bundle size:**

```
1. Scroll to bottom of Lighthouse report
2. Click "View Treemap"
3. See visual representation of bundle
4. Larger boxes = larger file sizes
5. Click boxes to see what's inside
```

**Treemap shows:**
- Which libraries take up most space
- Unused code percentage
- Opportunities for tree shaking

#### 7. Comparing Before/After

**To track improvements:**

```
1. Run initial audit (save results)
2. Make optimizations
3. Run new audit
4. Compare scores and metrics
5. Verify improvements
```

**Lighthouse saves history:**
- Click the ⚙️ (gear) icon
- Enable "Generate report"
- Save HTML report for comparison

### Lighthouse Checklist

- [ ] **Performance score > 90**: Excellent performance
- [ ] **FCP < 1.8s**: Quick first paint
- [ ] **LCP < 2.5s**: Main content loads fast
- [ ] **TBT < 200ms**: Page is responsive
- [ ] **CLS < 0.1**: No layout shifts
- [ ] **No render-blocking resources**: CSS/JS optimized
- [ ] **Efficient caching**: Resources cached properly
- [ ] **Optimized images**: Right size and format

---

## Coverage Tab - Unused Code

### What Coverage Shows

The Coverage tab reveals CSS and JavaScript code that's loaded but never used.

### Step-by-Step Guide

#### 1. Open Coverage Tab

```
1. Open DevTools
2. Press Cmd/Ctrl+Shift+P (Command Menu)
3. Type "coverage"
4. Select "Show Coverage"
5. Coverage tab opens at bottom
```

#### 2. Record Coverage

```
1. Click ⟳ (reload) button in Coverage tab
2. Page reloads and coverage is recorded
3. Interact with page (click, scroll, etc.)
4. Coverage updates in real-time
```

#### 3. Understanding Coverage Data

**Coverage tab shows table:**

```
URL                    | Type | Total Bytes | Unused Bytes | Usage
-----------------------|------|-------------|--------------|-------
styles.css             | CSS  | 125 KB      | 95 KB (76%)  | ▓▓░░░░░
app.js                 | JS   | 200 KB      | 150 KB (75%) | ▓▓░░░░░
react.js               | JS   | 40 KB       | 5 KB (12%)   | ▓▓▓▓▓▓░
```

**Red bar = Unused code** (opportunity to reduce!)
**Blue bar = Used code**

#### 4. Inspecting Unused Code

**Click on a file to see details:**

```
Lines highlighted:
🔴 Red = Unused (never executed)
🔵 Blue = Used (executed at least once)
```

**Example:**

```css
/* styles.css */
.header { color: blue; }      /* 🔵 USED */
.footer { color: red; }       /* 🔴 UNUSED - remove! */
.modal { display: none; }     /* 🔴 UNUSED on initial load */
```

#### 5. Finding Critical vs Non-Critical Code

**Strategy:**

```
1. Record coverage on page load
2. Check what's UNUSED on initial load
3. These are candidates for:
   ├─ Code splitting
   ├─ Lazy loading
   └─ Removal if never used
```

#### 6. Analyzing CSS Coverage

**Common findings:**

```
Bootstrap/Tailwind CSS: 70-90% unused
├─ You're loading entire framework
└─ Only using small portion

Custom CSS: 30-50% unused
├─ Old styles from removed features
└─ Styles for hidden elements

Fix:
├─ Use PurgeCSS or similar tool
├─ Remove unused frameworks
└─ Extract only critical CSS
```

#### 7. Analyzing JavaScript Coverage

**Common findings:**

```
Third-party libraries: 50-80% unused
├─ Importing entire library
└─ Only using few functions

Polyfills: 90% unused (on modern browsers)
├─ Loading for older browsers
└─ Not needed for majority of users

Fix:
├─ Import only needed functions
├─ Use tree shaking
├─ Conditionally load polyfills
└─ Code split by route
```

### Coverage Optimization Strategy

```
Step 1: Record Initial Coverage
└─ See what's loaded but unused

Step 2: Categorize Unused Code
├─ Never used → Remove completely
├─ Used on interaction → Lazy load
├─ Used on specific pages → Code split
└─ Used below fold → Defer

Step 3: Implement Changes
├─ Remove dead code
├─ Implement code splitting
├─ Add lazy loading
└─ Defer non-critical resources

Step 4: Verify Improvements
└─ Re-run coverage and measure reduction
```

### Coverage Tab Checklist

- [ ] **CSS usage > 75%**: Most CSS is used
- [ ] **JS usage > 70%**: Most JavaScript is used
- [ ] **Remove unused frameworks**: No unnecessary libraries
- [ ] **Code split large bundles**: Separate by route
- [ ] **Lazy load below-fold**: Defer non-critical code

---

## Performance API - Programmatic Measurement

### Measuring CRP with JavaScript

You can measure CRP metrics programmatically using the Performance API.

### Basic Performance Metrics

```javascript
// Open Console tab in DevTools
// Run these commands:

// 1. Navigation Timing
const perfData = performance.getEntriesByType('navigation')[0];
console.log({
  'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
  'TCP Connection': perfData.connectEnd - perfData.connectStart,
  'TTFB (Time to First Byte)': perfData.responseStart - perfData.requestStart,
  'HTML Download': perfData.responseEnd - perfData.responseStart,
  'DOM Processing': perfData.domInteractive - perfData.responseEnd,
  'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.navigationStart,
  'Page Load Complete': perfData.loadEventEnd - perfData.navigationStart
});
```

### Paint Timing

```javascript
// 2. Paint Metrics
const paintMetrics = performance.getEntriesByType('paint');
paintMetrics.forEach(entry => {
  console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
});

// Output:
// first-paint: 245.30ms
// first-contentful-paint: 247.80ms
```

### Largest Contentful Paint (LCP)

```javascript
// 3. LCP (requires observer)
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime.toFixed(2), 'ms');
  console.log('LCP Element:', lastEntry.element);
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

### First Input Delay (FID)

```javascript
// 4. FID
new PerformanceObserver((list) => {
  const firstInput = list.getEntries()[0];
  console.log('FID:', firstInput.processingStart - firstInput.startTime, 'ms');
}).observe({ entryTypes: ['first-input'] });
```

### Cumulative Layout Shift (CLS)

```javascript
// 5. CLS
let clsScore = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
    }
  }
  console.log('CLS:', clsScore.toFixed(4));
}).observe({ entryTypes: ['layout-shift'] });
```

### Resource Timing

```javascript
// 6. Analyze all resources
const resources = performance.getEntriesByType('resource');

// Group by type
const byType = resources.reduce((acc, resource) => {
  const type = resource.initiatorType;
  if (!acc[type]) acc[type] = [];
  acc[type].push(resource);
  return acc;
}, {});

console.table(Object.keys(byType).map(type => ({
  Type: type,
  Count: byType[type].length,
  'Total Size (KB)': (byType[type].reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024).toFixed(2),
  'Avg Duration (ms)': (byType[type].reduce((sum, r) => sum + r.duration, 0) / byType[type].length).toFixed(2)
})));
```

### Complete CRP Report

```javascript
// 7. Generate comprehensive CRP report
function generateCRPReport() {
  const perfData = performance.getEntriesByType('navigation')[0];
  const paintMetrics = performance.getEntriesByType('paint');
  const resources = performance.getEntriesByType('resource');
  
  const report = {
    'Page Load Phases': {
      'DNS Lookup': `${(perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(2)}ms`,
      'TCP Connection': `${(perfData.connectEnd - perfData.connectStart).toFixed(2)}ms`,
      'TTFB': `${(perfData.responseStart - perfData.requestStart).toFixed(2)}ms`,
      'HTML Download': `${(perfData.responseEnd - perfData.responseStart).toFixed(2)}ms`,
      'DOM Processing': `${(perfData.domInteractive - perfData.responseEnd).toFixed(2)}ms`,
      'Resource Loading': `${(perfData.loadEventStart - perfData.domContentLoadedEventEnd).toFixed(2)}ms`
    },
    'Critical Milestones': {
      'DOM Content Loaded': `${perfData.domContentLoadedEventEnd.toFixed(2)}ms`,
      'Page Load Complete': `${perfData.loadEventEnd.toFixed(2)}ms`
    },
    'Paint Metrics': {},
    'Resources': {
      'Total Count': resources.length,
      'Total Size': `${(resources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024).toFixed(2)} KB`,
      'Critical Resources': resources.filter(r => 
        r.name.endsWith('.css') || 
        (r.name.endsWith('.js') && !r.name.includes('async'))
      ).length
    }
  };
  
  paintMetrics.forEach(entry => {
    report['Paint Metrics'][entry.name] = `${entry.startTime.toFixed(2)}ms`;
  });
  
  console.log('═══════════════════════════════════');
  console.log('   CRITICAL RENDERING PATH REPORT   ');
  console.log('═══════════════════════════════════');
  console.log(JSON.stringify(report, null, 2));
  
  return report;
}

// Run it:
generateCRPReport();
```

### Monitoring CRP in Production

```javascript
// 8. Send metrics to analytics
function sendCRPMetrics() {
  const perfData = performance.getEntriesByType('navigation')[0];
  const fcp = performance.getEntriesByType('paint')
    .find(entry => entry.name === 'first-contentful-paint');
  
  const metrics = {
    fcp: fcp?.startTime,
    domContentLoaded: perfData.domContentLoadedEventEnd,
    pageLoad: perfData.loadEventEnd,
    ttfb: perfData.responseStart
  };
  
  // Send to your analytics
  if (window.ga) {
    ga('send', 'event', 'Performance', 'CRP', JSON.stringify(metrics));
  }
  
  console.log('Metrics sent:', metrics);
}

// Run after page load
window.addEventListener('load', () => {
  setTimeout(sendCRPMetrics, 0);
});
```

---

## Real-World Examples

### Example 1: Diagnosing Slow Page Load

**Problem**: Page takes 5 seconds to show content

**Investigation:**

1. **Network Tab**:
   - Found 3 CSS files blocking render (2.5s total)
   - One synchronous script in `<head>` (1.2s)

2. **Performance Tab**:
   - "Parse Stylesheet" taking 800ms
   - "Evaluate Script" blocking HTML parsing for 1.2s
   - First Paint at 3.8s

3. **Lighthouse**:
   - Score: 35 (poor)
   - "Eliminate render-blocking resources" - potential 2.8s savings

**Solution**:
```html
<!-- Before -->
<head>
  <link rel="stylesheet" href="styles1.css">
  <link rel="stylesheet" href="styles2.css">
  <link rel="stylesheet" href="styles3.css">
  <script src="app.js"></script>
</head>

<!-- After -->
<head>
  <style>/* Critical CSS inlined - 8KB */</style>
  <link rel="preload" href="styles.css" as="style" 
        onload="this.rel='stylesheet'">
  <script src="app.js" defer></script>
</head>
```

**Result**: First Paint improved from 3.8s to 0.4s! 🎉

---

### Example 2: React App with Large Bundle

**Problem**: Blank screen for 3 seconds on mobile

**Investigation**:

1. **Network Tab**:
   - React bundle: 1.2 MB uncompressed
   - No gzip compression enabled
   - Takes 2.5s to download on 3G

2. **Coverage Tab**:
   - Only 35% of JavaScript used on initial load
   - 780 KB of unused code

3. **Lighthouse**:
   - Score: 48 (poor)
   - "Reduce JavaScript execution time" - 3.2s
   - "Enable text compression" - 1.8s savings

**Solution**:
```javascript
// Before: One huge bundle
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Settings from './Settings';

// After: Code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const Analytics = lazy(() => import('./Analytics'));
const Settings = lazy(() => import('./Settings'));

// Enable compression on server (nginx)
gzip on;
gzip_types text/javascript application/javascript;
```

**Result**: 
- Bundle reduced to 350 KB (gzipped)
- First Paint: 0.8s (from 3s)
- Lighthouse score: 89 (from 48)

---

### Example 3: Layout Shift Issues

**Problem**: Content jumps around while loading (poor CLS)

**Investigation**:

1. **Performance Tab**:
   - Multiple "Layout" events after page load
   - Images loading without dimensions
   - Web fonts causing text reflow

2. **Lighthouse**:
   - CLS: 0.45 (poor, should be < 0.1)
   - "Ensure text remains visible during webfont load"
   - "Image elements do not have explicit width and height"

**Solution**:
```html
<!-- Before -->
<img src="hero.jpg" alt="Hero">

<!-- After -->
<img src="hero.jpg" alt="Hero" width="1200" height="600">

<!-- Before -->
<style>
  @font-face {
    font-family: 'Custom';
    src: url('font.woff2');
  }
</style>

<!-- After -->
<style>
  @font-face {
    font-family: 'Custom';
    src: url('font.woff2');
    font-display: swap; /* Show fallback immediately */
  }
</style>
```

**Result**: CLS improved from 0.45 to 0.02! ✅

---

## Common Issues and Solutions

### Issue 1: Render-Blocking CSS

**Symptom**: Blank white screen until CSS loads

**How to Detect**:
- Network Tab: CSS files loaded before content appears
- Performance Tab: Long gap between HTML parse and First Paint
- Lighthouse: "Eliminate render-blocking resources"

**Solution**:
```html
<!-- Inline critical CSS -->
<style>/* Critical CSS here */</style>

<!-- Async load non-critical CSS -->
<link rel="preload" href="full.css" as="style" onload="this.rel='stylesheet'">
```

---

### Issue 2: Parser-Blocking JavaScript

**Symptom**: HTML parsing pauses until script loads

**How to Detect**:
- Network Tab: HTML document size vs DOMContentLoaded time
- Performance Tab: "Parse HTML" interrupted by "Evaluate Script"
- Lighthouse: "Eliminate render-blocking resources"

**Solution**:
```html
<!-- Use defer -->
<script src="app.js" defer></script>

<!-- Or move to end of body -->
<body>
  <!-- content -->
  <script src="app.js"></script>
</body>
```

---

### Issue 3: Unused CSS/JavaScript

**Symptom**: Large bundles, slow download, wasted bandwidth

**How to Detect**:
- Coverage Tab: > 50% unused code
- Network Tab: Large transfer sizes
- Lighthouse: "Reduce unused CSS" or "Reduce unused JavaScript"

**Solution**:
```bash
# Remove unused CSS
npm install -D @fullhuman/postcss-purgecss

# Tree shake JavaScript
# Use modern bundler (Webpack, Vite, Rollup)
# Ensure production mode enabled
```

---

### Issue 4: No Compression

**Symptom**: Large transfer sizes, slow downloads

**How to Detect**:
- Network Tab: Click resource → Headers → No "Content-Encoding"
- Lighthouse: "Enable text compression"

**Solution**:
```nginx
# Enable gzip compression (nginx)
gzip on;
gzip_types text/css text/javascript application/javascript application/json;
gzip_min_length 1000;

# Enable brotli (better compression)
brotli on;
brotli_types text/css text/javascript application/javascript;
```

---

### Issue 5: Slow TTFB (Time to First Byte)

**Symptom**: Long wait before HTML starts downloading

**How to Detect**:
- Network Tab: Long "Waiting (TTFB)" time (should be < 200ms)
- Lighthouse: Poor server response time

**Solution**:
- Use CDN for static assets
- Enable server-side caching
- Optimize database queries
- Use HTTP/2 or HTTP/3
- Consider server-side rendering (SSR)

---

## Quick Reference Commands

### Network Tab
```
Ctrl/Cmd+Shift+I → Network
Ctrl/Cmd+R (refresh with cache disabled)
Filter: CSS, JS, Img, XHR
Right-click columns → Add "Priority"
```

### Performance Tab
```
Ctrl/Cmd+Shift+I → Performance
Click ⟳ (reload and profile)
Zoom: Click and drag or mousewheel
Shift+Click: Zoom to selection
```

### Lighthouse
```
Ctrl/Cmd+Shift+I → Lighthouse
Select: Performance, Mobile/Desktop
Click "Analyze page load"
View Treemap for bundle analysis
```

### Coverage
```
Ctrl/Cmd+Shift+P → "Show Coverage"
Click ⟳ to record
Red = unused, Blue = used
Click file to see line-by-line
```

### Console (Performance API)
```javascript
// Quick check
performance.getEntriesByType('navigation')[0]
performance.getEntriesByType('paint')
performance.getEntriesByType('resource')

// Generate report
generateCRPReport() // (use function from above)
```

---

## Optimization Workflow

### Step 1: Baseline Measurement
```
1. Open Network Tab (cache disabled)
2. Record Performance profile
3. Run Lighthouse audit
4. Note current metrics
```

### Step 2: Identify Issues
```
1. Check Lighthouse opportunities
2. Find render-blocking resources
3. Check Coverage for unused code
4. Look for long tasks in Performance
```

### Step 3: Implement Fixes
```
1. Inline critical CSS
2. Defer JavaScript
3. Remove unused code
4. Enable compression
5. Optimize images
```

### Step 4: Verify Improvements
```
1. Re-run all measurements
2. Compare before/after
3. Verify all metrics improved
4. Test on slow connection (3G)
```

### Step 5: Monitor
```
1. Set up Real User Monitoring (RUM)
2. Track Core Web Vitals
3. Set performance budgets
4. Regular audits (weekly/monthly)
```

---

## Summary Checklist

**Network Tab:**
- [ ] Resources < 200KB (gzipped)
- [ ] TTFB < 200ms
- [ ] DOMContentLoaded < 1.5s
- [ ] Compression enabled
- [ ] Caching configured

**Performance Tab:**
- [ ] FCP < 1.8s
- [ ] No long tasks (>50ms)
- [ ] Smooth frames (green bars)
- [ ] Layout time < 16ms per frame

**Lighthouse:**
- [ ] Performance score > 90
- [ ] All Core Web Vitals green
- [ ] No render-blocking resources
- [ ] Optimized images

**Coverage:**
- [ ] CSS usage > 75%
- [ ] JS usage > 70%
- [ ] No large unused libraries

---

**Pro Tip**: Use DevTools regularly during development, not just at the end! Catching performance issues early saves time and makes optimization easier.

Happy profiling! 🚀

