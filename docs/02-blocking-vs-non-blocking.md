# Blocking vs Non-Blocking Resources

## Table of Contents
1. [Understanding Blocking Resources](#understanding-blocking-resources)
2. [Types of Blocking](#types-of-blocking)
3. [CSS Blocking Behavior](#css-blocking-behavior)
4. [JavaScript Blocking Behavior](#javascript-blocking-behavior)
5. [Making Resources Non-Blocking](#making-resources-non-blocking)
6. [Visual Timeline Comparison](#visual-timeline-comparison)

---

## Understanding Blocking Resources

**Blocking resources** are files that prevent the browser from rendering the page until they are fully downloaded and processed.

### The Problem
```
User Request → HTML Download → [BLOCKED] → CSS/JS Download → Render
                                   ↑
                        User sees blank screen here
```

### The Goal
```
User Request → HTML Download → Partial Render → Progressive Enhancement
                                     ↑
                          User sees content quickly!
```

---

## Types of Blocking

### 1. **Parser Blocking** (Halts HTML Parsing)
Stops the browser from continuing to parse HTML.

**Culprits:**
- `<script>` tags without `async` or `defer`
- Inline `<script>` blocks

**Impact:**
```html
<html>
  <body>
    <h1>Hello</h1>
    <script src="big-file.js"></script>  <!-- Parser STOPS here -->
    <p>World</p>  <!-- This won't be parsed until script loads -->
  </body>
</html>
```

### 2. **Render Blocking** (Prevents Initial Render)
Stops the browser from rendering any content.

**Culprits:**
- CSS files in `<head>`
- Synchronous JavaScript in `<head>`

**Impact:**
```html
<head>
  <link rel="stylesheet" href="styles.css">  <!-- Render BLOCKED -->
</head>
<body>
  <h1>Content</h1>  <!-- Won't render until CSS loads -->
</body>
```

### 3. **Interactive Blocking** (Delays Interactivity)
Page renders but user can't interact.

**Culprits:**
- Long-running JavaScript on main thread
- Heavy computations during initial load

---

## CSS Blocking Behavior

### ❌ Render Blocking CSS (Default)

```html
<head>
  <!-- Browser MUST download and parse before rendering -->
  <link rel="stylesheet" href="styles.css">
</head>
```

**Timeline:**
```
0ms ─────── HTML received
10ms ────── Start CSS download
200ms ───── CSS downloaded
250ms ───── CSSOM built
260ms ───── FIRST RENDER (250ms blocked!)
```

### ✅ Non-Blocking CSS (Media Queries)

```html
<head>
  <!-- Only blocks render on print -->
  <link rel="stylesheet" href="print.css" media="print">
  
  <!-- Only blocks on mobile -->
  <link rel="stylesheet" href="mobile.css" media="(max-width: 600px)">
  
  <!-- Loads async, applied when ready -->
  <link rel="stylesheet" href="optional.css" media="print" 
        onload="this.media='all'">
</head>
```

### ✅ Critical CSS Pattern

```html
<head>
  <!-- Inline critical CSS (above-the-fold) -->
  <style>
    /* Critical styles for initial render */
    body { margin: 0; font-family: sans-serif; }
    .header { height: 60px; background: #333; }
  </style>
  
  <!-- Defer non-critical CSS -->
  <link rel="preload" href="full-styles.css" as="style" 
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="full-styles.css">
  </noscript>
</head>
```

---

## JavaScript Blocking Behavior

### ❌ Parser & Render Blocking (Default)

```html
<head>
  <!-- BLOCKS everything: parsing + rendering -->
  <script src="app.js"></script>
</head>
```

**Timeline:**
```
0ms ─────── HTML parsing starts
5ms ─────── <script> encountered → PARSING STOPPED
10ms ────── Start JS download
300ms ───── JS downloaded
320ms ───── JS executed
325ms ───── Resume HTML parsing
```

### ✅ Async (Non-Blocking Download)

```html
<head>
  <!-- Downloads in parallel, executes when ready -->
  <script src="analytics.js" async></script>
</head>
```

**Behavior:**
- ✅ Downloads in background (doesn't block parsing)
- ⚠️ Executes immediately when downloaded (can interrupt parsing)
- ⚠️ No execution order guarantee
- **Use for**: Independent scripts (analytics, ads)

**Timeline:**
```
0ms ─────── HTML parsing starts
5ms ─────── <script async> → Start download (parsing continues)
50ms ────── More HTML parsed
150ms ───── JS ready → PAUSE parsing → Execute → Resume
```

### ✅ Defer (Non-Blocking, Ordered)

```html
<head>
  <!-- Downloads in parallel, executes after HTML parsed -->
  <script src="app.js" defer></script>
  <script src="ui.js" defer></script>
</head>
```

**Behavior:**
- ✅ Downloads in background
- ✅ Waits until HTML fully parsed
- ✅ Maintains script order
- ✅ Executes before `DOMContentLoaded` event
- **Use for**: Scripts that need DOM or have dependencies

**Timeline:**
```
0ms ─────── HTML parsing starts (scripts download in background)
100ms ───── HTML fully parsed
105ms ───── Execute app.js (in order)
110ms ───── Execute ui.js (in order)
115ms ───── DOMContentLoaded fired
```

### ✅ Module Scripts (Modern)

```html
<head>
  <!-- Deferred by default, with ES6 module support -->
  <script type="module" src="app.js"></script>
</head>
```

**Behavior:**
- Acts like `defer` by default
- Supports `import/export`
- Only executes once (no duplicates)

---

## Making Resources Non-Blocking

### Strategy 1: Load Priority

```html
<head>
  <!-- Critical: Load first (blocking is OK) -->
  <link rel="stylesheet" href="critical.css">
  
  <!-- Important: Preload but don't block -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  
  <!-- Future page: Prefetch when idle -->
  <link rel="prefetch" href="next-page.js">
  
  <!-- This origin: Preconnect early -->
  <link rel="preconnect" href="https://api.example.com">
</head>
```

### Strategy 2: Conditional Loading

```html
<script>
  // Load based on conditions
  if (window.innerWidth > 768) {
    // Desktop: Load full experience
    const script = document.createElement('script');
    script.src = 'desktop.js';
    document.head.appendChild(script);
  } else {
    // Mobile: Load lighter version
    const script = document.createElement('script');
    script.src = 'mobile.js';
    document.head.appendChild(script);
  }
</script>
```

### Strategy 3: Lazy Loading

```html
<!-- Images: Native lazy loading -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Scripts: Intersection Observer -->
<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Load script when element is visible
        const script = document.createElement('script');
        script.src = 'feature.js';
        document.head.appendChild(script);
        observer.disconnect();
      }
    });
  });
  
  observer.observe(document.querySelector('#feature-section'));
</script>
```

---

## Visual Timeline Comparison

### Scenario: Loading a web page with CSS and JS

#### ❌ BAD: Everything Blocking
```html
<head>
  <link rel="stylesheet" href="styles.css">     <!-- 200ms -->
  <script src="app.js"></script>                <!-- 300ms -->
</head>
```

**Timeline:**
```
|─HTML─|──CSS──|───JS───|─Render─|
0ms   50ms   250ms    550ms    600ms
         
Total Time to First Render: 600ms 🐌
```

#### ✅ GOOD: Optimized Loading
```html
<head>
  <style>/* Critical CSS inlined */</style>
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
  <script src="app.js" defer></script>
</head>
```

**Timeline:**
```
|─HTML─|─Render─| (CSS & JS load in background)
0ms   50ms   100ms
         
Total Time to First Render: 100ms 🚀
(6x faster!)
```

---

## Resource Blocking Matrix

| Resource | Location | Default Behavior | Best Practice |
|----------|----------|------------------|---------------|
| CSS | `<head>` | Render blocking | Inline critical, defer rest |
| CSS | `<body>` | Blocks subsequent content | Avoid |
| JS | `<head>` | Parser + Render blocking | Use `defer` or `async` |
| JS | Before `</body>` | Parser blocking | OK for DOM manipulation |
| JS | `type="module"` | Deferred (non-blocking) | ✅ Recommended |
| Images | Anywhere | Non-blocking | Use `loading="lazy"` |
| Fonts | CSS `@font-face` | Blocks text render (FOIT) | Use `font-display: swap` |

---

## Quick Decision Tree

```
Does the resource affect above-the-fold content?
├─ YES: Is it CSS?
│  ├─ YES: Inline it or keep it blocking
│  └─ NO: Is it JS?
│     ├─ YES: Can it wait?
│     │  ├─ YES: Use defer
│     │  └─ NO: Keep it, but minimize
│     └─ NO: Preload/prefetch
└─ NO: Make it non-blocking
   ├─ CSS: Load async or lazily
   ├─ JS: Use async/defer or lazy load
   └─ Images: Use loading="lazy"
```

---

## Key Takeaways

1. **CSS is render-blocking by default** - This is usually necessary
2. **JavaScript is parser-blocking by default** - This is usually NOT necessary
3. **Use `defer` for most scripts** - Maintains order, non-blocking
4. **Use `async` for independent scripts** - Analytics, ads
5. **Inline critical CSS** - First paint happens faster
6. **Lazy load below-the-fold** - Images, scripts, components

---

Next: [03-crp-steps-deep-dive.md](./03-crp-steps-deep-dive.md) - Detailed breakdown of each CRP step

