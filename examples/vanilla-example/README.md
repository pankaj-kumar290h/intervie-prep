# Vanilla JavaScript Example - Critical Rendering Path

## Overview

This example demonstrates how the Critical Rendering Path works with vanilla HTML, CSS, and JavaScript. It showcases best practices for optimal performance.

## Files

- `index.html` - Main HTML file with inlined critical CSS
- `app.js` - JavaScript application logic (deferred loading)

## CRP Optimization Techniques Used

### 1. **Inlined Critical CSS**
```html
<style>
  /* Critical above-the-fold styles */
  /* Total size: ~3KB */
</style>
```

**Benefit:** No network request for CSS, immediate first paint

### 2. **Deferred JavaScript**
```html
<script src="app.js" defer></script>
```

**Benefit:** Non-blocking script loading, HTML parses without interruption

### 3. **Meaningful Content Immediately**
The HTML includes actual content that users can see before JavaScript loads.

### 4. **Performance Monitoring**
Built-in performance measurement using Performance API.

## Critical Rendering Path Timeline

```
0ms:    HTML received
2ms:    Start parsing HTML
        ├─ Inline CSS parsed (no network request!)
        ├─ DOM construction begins
        └─ Start downloading app.js in parallel (defer)
15ms:   ✅ DOM complete
16ms:   ✅ CSSOM complete (inline CSS)
17ms:   ✅ Render Tree built
18ms:   ✅ Layout calculated
20ms:   ✅ First Contentful Paint (content visible!)
50ms:   app.js downloaded
55ms:   app.js executed
60ms:   ✅ Fully Interactive
```

**Total Time to First Paint: ~20ms** 🚀

## Performance Characteristics

### Bundle Size
- HTML (with inline CSS): ~7 KB
- JavaScript: ~4 KB
- **Total Critical Bytes: ~7 KB**

### Critical Resources
- HTML (1 resource)
- JavaScript (deferred, not blocking)

### CRP Metrics
- Critical Resources: **1**
- Critical Path Length: **1 RTT** (round trip time)
- Critical Bytes: **7 KB**

## Running the Example

### Option 1: Double-click
Simply open `index.html` in your browser.

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then visit: http://localhost:8000
```

### Option 3: VS Code Live Server
Right-click on `index.html` → Open with Live Server

## Measuring Performance

Open Chrome DevTools:

### 1. Network Tab
- See HTML loads instantly
- JavaScript loads in parallel (non-blocking)
- No render-blocking resources!

### 2. Performance Tab
- Record page load
- See First Contentful Paint happens quickly
- No long tasks blocking the main thread

### 3. Lighthouse
- Run audit
- Should score 95-100 for Performance
- No render-blocking resources warning

### 4. Console
Performance metrics are logged automatically:
```javascript
🚀 Vanilla JS Performance Metrics:
-----------------------------------
DOM Content Loaded: ~60 ms
Page Fully Loaded: ~65 ms
HTML Size: ~7 KB
```

## Code Techniques Demonstrated

### 1. Efficient DOM Manipulation
```javascript
// ❌ BAD: Multiple reflows
todos.forEach(todo => {
  todoList.appendChild(createTodoElement(todo));
});

// ✅ GOOD: Single reflow
const fragment = document.createDocumentFragment();
todos.forEach(todo => {
  fragment.appendChild(createTodoElement(todo));
});
todoList.appendChild(fragment);
```

### 2. Cached DOM References
```javascript
// Cache references (don't query repeatedly)
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
```

### 3. Event Delegation (Not shown here, but consider for large lists)
```javascript
// Instead of adding listener to each item:
todoList.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    deleteTodo(e.target.closest('.todo-item').dataset.id);
  }
});
```

## Performance Demo

Try this in the console:
```javascript
// Run performance comparison
todoApp.performanceDemo();

// This will show:
// ❌ Individual updates (100 items): ~45ms
// ✅ Batch updates (100 items): ~8ms
// 🚀 Performance improvement: 5.6x faster
```

## Optimization Checklist

- [x] Critical CSS inlined
- [x] JavaScript deferred
- [x] Minimal HTML size
- [x] No render-blocking resources
- [x] Efficient DOM manipulation (DocumentFragment)
- [x] Cached DOM references
- [x] Performance monitoring
- [x] LocalStorage for persistence

## Advantages of Vanilla Approach

✅ **Fast Initial Load**
- Minimal HTML with content
- No framework overhead
- Content visible in ~20ms

✅ **Small Bundle Size**
- ~11 KB total
- No dependencies

✅ **Simple and Direct**
- Easy to understand
- No build step required
- Works in any browser

## Disadvantages

❌ **Manual Optimization**
- Must remember to batch DOM updates
- Easy to make performance mistakes
- More boilerplate code

❌ **Scalability**
- Complex UIs become harder to manage
- More code for state management
- Event listener management can be tricky

❌ **No Automatic Diffing**
- Must manually track what changed
- Can over-render if not careful

## Comparison with React

See the React example in `../react-example/` and the comparison doc in `../../docs/04-vanilla-vs-react-comparison.md`

## Next Steps

1. Open Chrome DevTools
2. Run Lighthouse audit
3. Compare with React example
4. Try the performance demo in console
5. Modify and see how it affects metrics

## Learn More

- [Critical Rendering Path Overview](../../docs/01-critical-rendering-path-overview.md)
- [Blocking vs Non-Blocking](../../docs/02-blocking-vs-non-blocking.md)
- [Optimization Strategies](../../docs/05-optimization-strategies.md)

