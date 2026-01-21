# Critical Rendering Path - Deep Dive into Each Step

## Table of Contents
1. [Step 1: DOM Construction](#step-1-dom-construction)
2. [Step 2: CSSOM Construction](#step-2-cssom-construction)
3. [Step 3: JavaScript Execution](#step-3-javascript-execution)
4. [Step 4: Render Tree Construction](#step-4-render-tree-construction)
5. [Step 5: Layout (Reflow)](#step-5-layout-reflow)
6. [Step 6: Paint](#step-6-paint)
7. [Step 7: Composite](#step-7-composite)

---

## Step 1: DOM Construction

### What Happens
The browser converts HTML into a tree structure (DOM) that represents the page content.

### Process Flow

```
Bytes → Characters → Tokens → Nodes → DOM Tree
```

#### 1. **Bytes to Characters**
```
Bytes: 3C 68 31 3E 48 69 3C 2F 68 31 3E
   ↓
Characters: <h1>Hi</h1>
```

#### 2. **Characters to Tokens**
```
Characters: <h1>Hi</h1>
   ↓
Tokens:
  - StartTag: h1
  - Character: Hi
  - EndTag: h1
```

#### 3. **Tokens to Nodes**
```
Tokens → Node Objects with properties
- tagName: "h1"
- attributes: {}
- children: [TextNode("Hi")]
```

#### 4. **Nodes to DOM Tree**
```
Document
  └─ html
      ├─ head
      │   └─ title → "Page"
      └─ body
          └─ h1 → "Hi"
```

### Example HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <div id="header">
      <h1>Welcome</h1>
      <p>Hello World</p>
    </div>
  </body>
</html>
```

### Resulting DOM Tree

```
#document
└─ html
   ├─ head
   │  └─ title
   │     └─ #text: "My Page"
   └─ body
      └─ div (id="header")
         ├─ h1
         │  └─ #text: "Welcome"
         └─ p
            └─ #text: "Hello World"
```

### Key Characteristics

✅ **Incremental**: Browser can start building DOM as HTML arrives
✅ **Non-blocking**: Can render with partial DOM
⚠️ **Interrupted by scripts**: `<script>` tags pause DOM construction

### Performance Tips

```html
<!-- ❌ BAD: Script blocks DOM construction -->
<body>
  <div>Content 1</div>
  <script src="analytics.js"></script>  <!-- BLOCKS here -->
  <div>Content 2</div>  <!-- Must wait for script -->
</body>

<!-- ✅ GOOD: Script doesn't block -->
<body>
  <div>Content 1</div>
  <div>Content 2</div>
  <script src="analytics.js" defer></script>
</body>
```

---

## Step 2: CSSOM Construction

### What Happens
The browser converts CSS into a tree structure (CSSOM) that represents all styles and their cascade.

### Process Flow

```
CSS Bytes → Tokens → Nodes → CSSOM Tree
```

### Example CSS

```css
body { 
  font-size: 16px; 
  color: #333;
}

div { 
  display: block; 
}

.header { 
  margin: 20px; 
  padding: 10px;
}

.header h1 { 
  font-size: 32px; 
  color: blue;
}
```

### Resulting CSSOM Tree

```
body
├─ font-size: 16px
├─ color: #333
└─ div
   ├─ display: block
   └─ .header
      ├─ margin: 20px
      ├─ padding: 10px
      └─ h1
         ├─ font-size: 32px
         └─ color: blue (overrides inherited #333)
```

### Key Characteristics

❌ **NOT Incremental**: Browser must process entire CSS
🚫 **Render Blocking**: Must be complete before first render
📊 **Cascading**: Later rules override earlier ones

### Why CSSOM Can't Be Incremental

```css
/* Scenario showing why CSSOM must be complete */

/* Rule 1: At line 1 */
h1 { color: red; }

/* Rule 2: At line 100 */
h1 { color: blue; }  /* Overrides red! */

/* Rule 3: At line 200 */
.special h1 { color: green; }  /* Might override blue! */

/* Browser can't know final styles until ALL CSS is parsed */
```

### CSSOM + Browser Default Styles

```javascript
// What you write
h1 { color: blue; }

// What browser computes (CSSOM includes all properties)
h1 {
  color: blue;                    // Your style
  font-size: 2em;                 // Browser default
  font-weight: bold;              // Browser default
  display: block;                 // Browser default
  margin-block-start: 0.67em;     // Browser default
  margin-block-end: 0.67em;       // Browser default
  margin-inline-start: 0px;       // Browser default
  margin-inline-end: 0px;         // Browser default
  // ... hundreds more properties
}
```

### Performance Impact

```html
<head>
  <!-- Small CSS: CSSOM built in ~10ms -->
  <style>
    body { margin: 0; }
  </style>
  
  <!-- Large CSS: CSSOM built in ~200ms -->
  <link rel="stylesheet" href="bootstrap.css">  <!-- 200KB -->
  <link rel="stylesheet" href="custom.css">     <!-- 50KB -->
</head>

<!-- Nothing renders until ALL CSS is processed! -->
<body>
  <h1>Hello</h1>  <!-- Waits for ~210ms -->
</body>
```

---

## Step 3: JavaScript Execution

### What Happens
JavaScript runs and can modify both DOM and CSSOM.

### Three Execution Modes

#### 1. **Synchronous (Default) - BLOCKS EVERYTHING**

```html
<body>
  <div id="content">Initial</div>
  
  <!-- Parser stops, downloads, executes, then continues -->
  <script src="app.js"></script>
  
  <div id="more">More content</div>
</body>
```

**Timeline:**
```
0ms:   Parse <div id="content">
10ms:  Encounter <script> → STOP PARSING
15ms:  Download app.js (200ms)
215ms: Execute app.js (50ms)
265ms: RESUME PARSING
270ms: Parse <div id="more">
```

#### 2. **Async - Non-blocking download, immediate execution**

```html
<script src="analytics.js" async></script>
```

**Timeline:**
```
0ms:   Start parsing HTML + Start downloading analytics.js in parallel
100ms: HTML parsing continues...
150ms: analytics.js ready → PAUSE PARSING → Execute → Resume
```

#### 3. **Defer - Non-blocking, executes after parsing**

```html
<script src="app.js" defer></script>
```

**Timeline:**
```
0ms:   Start parsing HTML + Start downloading app.js in parallel
200ms: HTML fully parsed
205ms: Execute app.js
210ms: Fire DOMContentLoaded
```

### JavaScript Blocks on CSSOM

```html
<head>
  <link rel="stylesheet" href="styles.css">  <!-- Takes 200ms -->
  <script src="app.js"></script>             <!-- Must wait for CSS! -->
</head>
```

**Why?** JavaScript might ask for styles:
```javascript
// app.js might do this:
const color = getComputedStyle(element).color;
// So browser must have CSSOM ready before running JS
```

**Timeline:**
```
0ms:   Start downloading styles.css
10ms:  Encounter <script> → WAIT for CSSOM
200ms: CSS done → CSSOM built
205ms: NOW download and execute app.js
```

---

## Step 4: Render Tree Construction

### What Happens
Browser combines DOM and CSSOM to create Render Tree (only visible elements with styles).

### Formula
```
Render Tree = DOM (visible only) + CSSOM (computed styles)
```

### Example

**HTML (DOM):**
```html
<body>
  <div class="header">
    <h1>Title</h1>
    <p style="display: none;">Hidden</p>
  </div>
  <span>Visible</span>
</body>
```

**CSS (CSSOM):**
```css
.header { background: blue; }
h1 { font-size: 32px; }
```

**Render Tree (Result):**
```
RenderBody
└─ RenderBlock (.header)
   ├─ background: blue
   ├─ RenderBlock (h1)
   │  ├─ font-size: 32px
   │  └─ content: "Title"
   └─ [p is excluded - display:none]
└─ RenderInline (span)
   └─ content: "Visible"
```

### What's Excluded from Render Tree?

```html
<!-- These don't appear in Render Tree: -->
<head>...</head>                        <!-- Not visual -->
<script>...</script>                    <!-- Not visual -->
<meta>                                  <!-- Not visual -->
<div style="display: none;">...</div>   <!-- Not visible -->
<div hidden>...</div>                   <!-- Not visible -->

<!-- These DO appear: -->
<div style="visibility: hidden;">...</div>  <!-- Takes space, affects layout -->
<div style="opacity: 0;">...</div>          <!-- Takes space, affects layout -->
```

### Render Object Properties

Each render tree node contains:
```javascript
{
  domNode: <reference to DOM node>,
  computedStyles: {
    width: '200px',
    height: '100px',
    backgroundColor: 'blue',
    fontSize: '16px',
    // ... all CSS properties
  },
  children: [/* child render nodes */]
}
```

---

## Step 5: Layout (Reflow)

### What Happens
Browser calculates exact position and size of each element based on viewport and box model.

### The Box Model

```
┌─────────────────────────────────────┐
│           Margin (transparent)       │
│  ┌───────────────────────────────┐  │
│  │     Border                    │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Padding               │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │                   │  │  │  │
│  │  │  │  Content          │  │  │  │
│  │  │  │  (width × height) │  │  │  │
│  │  │  │                   │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Layout Process

```
1. Start at root (viewport)
2. Calculate each element's:
   - Position (x, y coordinates)
   - Size (width, height)
   - Box model (margin, border, padding)
3. Consider:
   - CSS positioning (static, relative, absolute, fixed)
   - Float, flex, grid
   - Text wrapping
   - Font metrics
```

### Example Calculation

```html
<style>
  .container { 
    width: 800px; 
    padding: 20px; 
  }
  .box { 
    width: 50%; 
    margin: 10px;
    padding: 15px;
    border: 2px solid black;
  }
</style>

<div class="container">
  <div class="box">Content</div>
</div>
```

**Layout Calculation:**
```
Container:
  - width: 800px
  - x: 0, y: 0
  - height: (calculated based on children)

Box:
  - width: 50% of 800px = 400px
  - content-box width: 400px - 30px (padding) - 4px (border) = 366px
  - x: 10px (margin), y: 20px (container padding)
  - height: (calculated based on content)
```

### When Layout Occurs

**Initial Layout:**
- First time browser calculates positions

**Reflow (Re-layout):**
Triggered by:
```javascript
// 1. Changing element dimensions
element.style.width = '500px';

// 2. Adding/removing elements
document.body.appendChild(newElement);

// 3. Changing text content
element.textContent = 'New text that wraps differently';

// 4. Window resize
window.addEventListener('resize', handler);

// 5. Reading certain properties (forces sync layout!)
const height = element.offsetHeight;  // ⚠️ Forces reflow!
const width = element.clientWidth;    // ⚠️ Forces reflow!
```

### Performance Cost

Layout is **EXPENSIVE** because:
1. Affects entire subtree of elements
2. Requires math for every element
3. Must happen before paint
4. Can cascade (changing parent affects children)

```javascript
// ❌ BAD: Multiple reflows
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  document.body.appendChild(div);  // Reflow × 100!
}

// ✅ GOOD: Single reflow
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);  // No reflow
}
document.body.appendChild(fragment);  // Reflow × 1
```

---

## Step 6: Paint

### What Happens
Browser converts render tree into actual pixels by creating "paint records" (drawing commands).

### Paint Layers

Browser creates layers for:
- Root element
- Elements with CSS transforms
- Elements with opacity
- Elements with filters
- Fixed/sticky positioned elements
- Overflow scroll areas

### Paint Process

```
1. Create paint records for each layer:
   - Fill background
   - Draw borders
   - Draw shadows
   - Render text
   - Draw images
   
2. Convert vector commands to raster (pixels)

3. Handle stacking context (z-index)
```

### Example Paint Records

```html
<div style="
  width: 200px; 
  height: 100px; 
  background: blue;
  border: 2px solid black;
  color: white;">
  Hello
</div>
```

**Paint Records:**
```
Layer 1:
  1. DrawRect(x: 0, y: 0, w: 200, h: 100, fill: blue)
  2. DrawRect(x: 0, y: 0, w: 200, h: 100, stroke: black, width: 2)
  3. DrawText(x: 10, y: 50, text: "Hello", color: white, font: ...)
```

### What Triggers Repaint?

```javascript
// Visual changes that don't affect layout:
element.style.color = 'red';            // Repaint
element.style.backgroundColor = 'blue'; // Repaint
element.style.visibility = 'hidden';    // Repaint
element.style.opacity = '0.5';          // Repaint (sometimes composite only)
```

### Paint vs Layout

```
Layout (Reflow)          Paint               Composite
├─ Changes geometry     ├─ Changes pixels    ├─ Changes layers
├─ Very expensive       ├─ Expensive         ├─ Cheap!
└─ Triggers paint       └─ No layout needed  └─ GPU accelerated
```

---

## Step 7: Composite

### What Happens
Browser combines all painted layers in correct order and sends to GPU for display.

### Compositing Layers

```html
<div class="layer-1">Base content</div>
<div class="layer-2" style="transform: translateZ(0);">Promoted layer</div>
<div class="layer-3" style="position: fixed;">Fixed layer</div>
```

**Layer Stack:**
```
┌──────────────────┐  GPU
│   Layer 3        │  ↑
├──────────────────┤  │
│   Layer 2        │  │  Composited
├──────────────────┤  │
│   Layer 1        │  │
└──────────────────┘  ↓
```

### Composite-Only Properties (Fastest!)

These properties can be animated without layout or paint:
```css
/* ✅ Composite-only changes (GPU accelerated) */
transform: translateX(100px);   /* 🚀 Very fast */
transform: scale(1.2);          /* 🚀 Very fast */
transform: rotate(45deg);       /* 🚀 Very fast */
opacity: 0.5;                   /* 🚀 Very fast */

/* ❌ Trigger layout + paint + composite */
left: 100px;                    /* 🐌 Slow */
width: 200px;                   /* 🐌 Slow */
margin-left: 100px;             /* 🐌 Slow */
```

### Performance Comparison

```javascript
// ❌ BAD: Triggers Layout → Paint → Composite
element.style.left = '100px';
// Cost: 16ms (can drop frames at 60fps!)

// ✅ GOOD: Triggers Composite only
element.style.transform = 'translateX(100px)';
// Cost: 1ms (smooth 60fps!)
```

### Will-Change Hint

```css
.animated {
  /* Tell browser to create a layer in advance */
  will-change: transform, opacity;
}

/* Later animation is smooth */
.animated.moving {
  transform: translateX(100px);
  opacity: 0.8;
}
```

**Warning:** Don't overuse!
```css
/* ❌ BAD: Too many layers consume memory */
* {
  will-change: transform;  /* Creates layer for EVERYTHING */
}

/* ✅ GOOD: Only for animated elements */
.slider-item {
  will-change: transform;
}
```

---

## Complete CRP Timeline Example

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">  <!-- 200ms -->
  <script src="app.js" defer></script>       <!-- 300ms, but non-blocking -->
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</body>
</html>
```

**Timeline:**
```
0ms:    ├─ HTML received, start parsing
5ms:    ├─ DOM construction begins
        │  └─ Start CSS download (parallel)
        │  └─ Start JS download (parallel, defer)
10ms:   ├─ DOM partially built
200ms:  ├─ CSS downloaded
210ms:  ├─ CSSOM built
        │  └─ ✅ Can now build Render Tree!
215ms:  ├─ Render Tree built
220ms:  ├─ Layout calculated
230ms:  ├─ Paint executed
235ms:  ├─ Composite done
        │  └─ 🎉 FIRST PAINT
240ms:  ├─ DOM fully parsed
300ms:  ├─ JS downloaded (defer waited)
310ms:  ├─ JS executed
320ms:  └─ 🎉 INTERACTIVE
```

---

## Optimization Checklist

- [ ] Minimize CSS size (critical path)
- [ ] Use `defer` for JavaScript
- [ ] Inline critical CSS
- [ ] Avoid synchronous scripts in `<head>`
- [ ] Batch DOM changes
- [ ] Use `transform` and `opacity` for animations
- [ ] Leverage `will-change` wisely
- [ ] Avoid forced synchronous layouts

---

Next: [04-vanilla-vs-react-comparison.md](./04-vanilla-vs-react-comparison.md)

