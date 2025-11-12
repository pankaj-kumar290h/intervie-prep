# Examples - Critical Rendering Path

This folder contains practical examples demonstrating the Critical Rendering Path with different approaches.

## Examples Overview

### 1. Vanilla JavaScript Example (`vanilla-example/`)

A todo application built with pure HTML, CSS, and JavaScript.

**Features:**
- ✅ Inlined critical CSS
- ✅ Deferred JavaScript
- ✅ Fast first paint (~20ms)
- ✅ Small bundle size (~11 KB)
- ✅ Content immediately visible

**CRP Metrics:**
- Critical Resources: 1
- Critical Path Length: 1 RTT
- Critical Bytes: ~7 KB

**Best for:** Understanding optimal CRP for static/simple sites

[View Vanilla Example →](./vanilla-example/)

---

### 2. React Example (`react-example/`)

The same todo application built with React (client-side rendering).

**Features:**
- ⚛️ Component-based architecture
- ⚛️ Virtual DOM
- ⚛️ Automatic optimizations
- ⚛️ React hooks (useState, useEffect, useMemo, etc.)
- ⚛️ Memoization with React.memo

**CRP Metrics:**
- Critical Resources: 4
- Critical Path Length: 2 RTT
- Critical Bytes: ~515 KB (dev) / ~43 KB (prod)

**Best for:** Understanding React's CRP challenges and solutions

[View React Example →](./react-example/)

---

## Quick Start

### Vanilla Example
```bash
cd vanilla-example
# Open index.html in browser or:
python -m http.server 8000
# Visit: http://localhost:8000
```

### React Example
```bash
cd react-example
# Open index.html in browser or:
python -m http.server 8000
# Visit: http://localhost:8000
```

---

## Performance Comparison

### Initial Page Load

| Metric | Vanilla | React (Dev) | React (Prod) |
|--------|---------|-------------|--------------|
| **First Paint** | ~20ms | ~900ms | ~300ms |
| **Time to Interactive** | ~60ms | ~950ms | ~350ms |
| **Bundle Size** | 11 KB | 515 KB | 43 KB |
| **HTML Size** | 7 KB | 2 KB | 2 KB |
| **Critical Resources** | 1 | 4 | 3 |

**Winner:** Vanilla JavaScript 🏆

---

### Runtime Updates (1000 items)

| Operation | Vanilla (Naive) | Vanilla (Optimized) | React |
|-----------|-----------------|---------------------|-------|
| **Initial Render** | ~50ms | ~18ms | ~45ms |
| **Update All** | ~200ms | ~20ms | ~30ms |
| **Update One** | ~150ms | ~0.3ms | ~5ms* |
| **Reorder** | ~180ms | ~50ms | ~8ms* |

*React automatically optimizes without manual code

**Winner:** React for complex updates 🏆

---

## Key Takeaways

### Vanilla JavaScript

**Pros:**
- ✅ Extremely fast initial load
- ✅ Minimal bundle size
- ✅ No dependencies
- ✅ Simple and direct
- ✅ Content-first approach

**Cons:**
- ❌ Manual optimization required
- ❌ More boilerplate for complex UIs
- ❌ Easy to make performance mistakes
- ❌ Harder to maintain at scale

**Best for:**
- Blogs, documentation sites
- Landing pages
- Marketing sites
- Simple applications
- When bundle size is critical

---

### React

**Pros:**
- ✅ Automatic optimizations
- ✅ Virtual DOM diffing
- ✅ Component reusability
- ✅ Rich ecosystem
- ✅ Great for complex UIs
- ✅ Better maintainability

**Cons:**
- ❌ Slower initial load (client-side)
- ❌ Larger bundle size
- ❌ Requires build tools
- ❌ Learning curve
- ❌ Blank page without JS

**Best for:**
- Web applications (dashboards, tools)
- Complex, dynamic UIs
- Large codebases
- Team collaboration
- When maintainability > initial load speed

---

## Testing Performance

### Chrome DevTools

1. **Network Tab**
   - Compare resource sizes
   - Check load order
   - Identify blocking resources

2. **Performance Tab**
   - Record page load
   - Analyze flame graph
   - Check First Paint and TTI

3. **Lighthouse**
   - Run audit on both examples
   - Compare scores
   - Review suggestions

4. **Coverage Tab**
   - Find unused CSS/JS
   - Measure code efficiency

### Console Commands

**Vanilla Example:**
```javascript
// Run performance demo
todoApp.performanceDemo();

// Check current todos
todoApp.todos

// Manual performance test
console.time('render');
todoApp.render();
console.timeEnd('render');
```

**React Example:**
```javascript
// Learn about React optimizations
reactPerformanceDemo();

// Use React DevTools:
// 1. Install React DevTools extension
// 2. Open Profiler tab
// 3. Record interactions
// 4. Analyze re-renders
```

---

## Optimization Techniques Demonstrated

### Vanilla Example

1. **Inlined Critical CSS**
   ```html
   <style>/* Critical styles here */</style>
   ```

2. **Deferred JavaScript**
   ```html
   <script src="app.js" defer></script>
   ```

3. **DocumentFragment for Batching**
   ```javascript
   const fragment = document.createDocumentFragment();
   // Add all elements to fragment
   container.appendChild(fragment); // Single reflow!
   ```

4. **Cached DOM References**
   ```javascript
   const todoList = document.getElementById('todo-list');
   // Reuse reference, don't query repeatedly
   ```

### React Example

1. **Component Memoization**
   ```jsx
   const TodoItem = memo(({ todo }) => <li>{todo.text}</li>);
   ```

2. **useMemo for Calculations**
   ```jsx
   const stats = useMemo(() => calculateStats(todos), [todos]);
   ```

3. **useCallback for Functions**
   ```jsx
   const handleClick = useCallback(() => {}, []);
   ```

4. **Automatic Batching**
   ```jsx
   setTodos([...]);
   setCount(0);
   // Both updates = 1 re-render
   ```

---

## Production Recommendations

### For Vanilla Projects
1. Inline critical CSS (< 14KB)
2. Defer all JavaScript
3. Use DocumentFragment for batch updates
4. Implement lazy loading for images
5. Minimize and compress assets

### For React Projects
1. **Use Server-Side Rendering (SSR)**
   - Next.js
   - Remix
   - Gatsby (for static)

2. **Code Splitting**
   ```jsx
   const Dashboard = lazy(() => import('./Dashboard'));
   ```

3. **Production Build**
   ```bash
   npm run build
   ```

4. **Bundle Analysis**
   ```bash
   npm install --save-dev webpack-bundle-analyzer
   ```

5. **Performance Monitoring**
   - Web Vitals
   - Real User Monitoring (RUM)
   - Lighthouse CI

---

## The Hybrid Approach (Best of Both)

### Next.js Example

```jsx
// pages/index.js
export default function Home({ todos }) {
  // Server renders HTML with content (like vanilla)
  // React hydrates for interactivity (like React)
  return <TodoList initialTodos={todos} />;
}

export async function getServerSideProps() {
  // Fetch data on server
  const todos = await fetchTodos();
  return { props: { todos } };
}
```

**Result:**
- ✅ Fast first paint (~15ms) - like vanilla
- ✅ React benefits for interactivity
- ✅ Best of both worlds!

---

## Measuring Your Own Sites

### Quick Performance Check

```javascript
// Run in console on any site
const perfData = performance.getEntriesByType('navigation')[0];

console.log({
  'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd) + 'ms',
  'Page Fully Loaded': Math.round(perfData.loadEventEnd) + 'ms',
  'First Byte (TTFB)': Math.round(perfData.responseStart) + 'ms'
});

// Get paint metrics
performance.getEntriesByType('paint').forEach(entry => {
  console.log(entry.name + ':', Math.round(entry.startTime) + 'ms');
});
```

### Performance Budget

Set goals based on your audience:

```
Fast 3G Connection (~1.6 Mbps):
├─ HTML: < 14 KB (compressed)
├─ CSS: < 50 KB (compressed)
├─ JS: < 150 KB (compressed)
├─ First Paint: < 3s
└─ Interactive: < 5s

4G Connection (~25 Mbps):
├─ HTML: < 30 KB
├─ CSS: < 100 KB
├─ JS: < 300 KB
├─ First Paint: < 1s
└─ Interactive: < 2s
```

---

## Further Learning

### Documentation
- [01 - Critical Rendering Path Overview](../docs/01-critical-rendering-path-overview.md)
- [02 - Blocking vs Non-Blocking](../docs/02-blocking-vs-non-blocking.md)
- [03 - CRP Steps Deep Dive](../docs/03-crp-steps-deep-dive.md)
- [04 - Vanilla vs React Comparison](../docs/04-vanilla-vs-react-comparison.md)
- [05 - Optimization Strategies](../docs/05-optimization-strategies.md)

### External Resources
- [Web.dev - Optimize CRP](https://web.dev/critical-rendering-path/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)

---

## Experiments to Try

1. **Add 1000 todos** - Compare performance
2. **Disable JavaScript** - See vanilla still works, React doesn't
3. **Throttle network** - See impact on each approach
4. **Profile with DevTools** - Find bottlenecks
5. **Run Lighthouse** - Compare scores

---

## Contributing

Feel free to:
- Add more examples
- Improve existing code
- Add more optimizations
- Create production builds
- Add testing examples

---

**Remember:** The best approach depends on your specific use case. Choose based on:
- Application complexity
- Team expertise
- Performance requirements
- Maintenance needs
- User expectations

Happy learning! 🚀

