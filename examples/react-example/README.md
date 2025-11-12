# React Example - Critical Rendering Path

## Overview

This example demonstrates how the Critical Rendering Path works with React. It showcases React's approach and compares it with vanilla JavaScript.

## Files

- `index.html` - Minimal HTML with React loading state
- `app.jsx` - React application with hooks and optimizations

## CRP Characteristics (Client-Side React)

### ⚠️ Challenges

1. **Empty HTML Shell**
   - Initial HTML is nearly empty
   - Content only appears after React loads

2. **Large Bundle Size**
   - React + ReactDOM: ~130 KB (development)
   - React + ReactDOM: ~40 KB (production, gzipped)
   - Plus your application code

3. **JavaScript Required**
   - Page is blank without JavaScript
   - Must download, parse, and execute before content appears

### ✅ Advantages

1. **Automatic Optimizations**
   - Virtual DOM diffing
   - Automatic batching
   - Efficient updates

2. **Better Runtime Performance**
   - Minimal DOM operations
   - Smart reconciliation
   - Component memoization

## Critical Rendering Path Timeline

### Client-Side React (This Example)

```
0ms:    HTML received (nearly empty)
5ms:    Parse minimal HTML
10ms:   Show loading state
        ├─ Start downloading React (~130KB dev)
        ├─ Start downloading ReactDOM (~130KB dev)
        └─ Start downloading Babel (~250KB dev)
500ms:  All scripts downloaded
800ms:  Scripts parsed
        ├─ React initialized
        └─ Virtual DOM created
850ms:  React calls ReactDOM.render()
900ms:  ✅ First Contentful Paint (actual content!)
950ms:  ✅ Fully Interactive
```

**Total Time to First Paint: ~900ms** 🐌

### Server-Side React (Next.js, Remix)

```
0ms:    HTML received (with pre-rendered content!)
10ms:   Parse HTML
15ms:   ✅ First Contentful Paint (content visible!)
        └─ Start downloading React (in parallel)
200ms:  React bundle loaded
250ms:  React "hydrates" existing content
300ms:  ✅ Fully Interactive (with React benefits!)
```

**Total Time to First Paint: ~15ms** 🚀

## Performance Characteristics

### Bundle Size (Development - CDN)
- React: ~130 KB
- ReactDOM: ~130 KB  
- Babel: ~250 KB (only for dev, not needed in production)
- App code: ~5 KB
- **Total: ~515 KB**

### Bundle Size (Production - with build tools)
- React + ReactDOM: ~40 KB (gzipped)
- App code: ~3 KB (gzipped)
- **Total: ~43 KB**

### Critical Resources
- HTML (almost empty)
- React library
- ReactDOM library
- Application code

### CRP Metrics
- Critical Resources: **4**
- Critical Path Length: **2 RTT**
- Critical Bytes: **515 KB (dev)** or **43 KB (prod)**

## Running the Example

### Option 1: Double-click
Simply open `index.html` in your browser.

### Option 2: Local Server (Required for file:// protocol issues)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Visit: http://localhost:8000
```

### Option 3: VS Code Live Server
Right-click on `index.html` → Open with Live Server

## Measuring Performance

Open Chrome DevTools:

### 1. Network Tab
- See React/ReactDOM loading
- Large bundle sizes (dev mode)
- Multiple blocking resources

### 2. Performance Tab
- Record page load
- See loading state first
- Then React renders actual content
- Compare with vanilla example

### 3. Lighthouse
- Performance score: ~70-80 (dev mode)
- Performance score: ~95+ (production build with SSR)
- Will warn about render-blocking resources

### 4. Console
Performance metrics are logged:
```javascript
🚀 React Performance Metrics:
-----------------------------------
DOM Content Loaded: ~800 ms
Page Fully Loaded: ~950 ms
React Bundle Size: ~515 KB (dev)
Time until React rendered: ~900 ms
```

## React Optimizations Used

### 1. Component Memoization
```jsx
const TodoItem = memo(({ todo, onToggle, onDelete }) => {
  // This component only re-renders if props change
  return <li>...</li>;
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.todo.id === nextProps.todo.id &&
         prevProps.todo.text === nextProps.todo.text &&
         prevProps.todo.completed === nextProps.todo.completed;
});
```

**Benefit:** Prevents unnecessary re-renders

### 2. useMemo for Expensive Calculations
```jsx
const stats = useMemo(() => ({
  total: todos.length,
  active: todos.filter(t => !t.completed).length,
  completed: todos.filter(t => t.completed).length
}), [todos]);
```

**Benefit:** Only recalculates when todos change

### 3. useCallback for Stable Functions
```jsx
const toggleTodo = useCallback((id) => {
  setTodos(prev => prev.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
}, []);
```

**Benefit:** Function reference stays the same, preventing child re-renders

### 4. Automatic Batching
```jsx
// React automatically batches these:
setTodos([...]);
setInputValue('');
setNextId(prev => prev + 1);
// All three updates = ONE re-render!
```

**Benefit:** Multiple state updates cause single re-render

### 5. Smart Reconciliation
React's Virtual DOM finds minimal changes needed:

```jsx
// Change 1 todo out of 100:
setTodos(prev => prev.map(todo =>
  todo.id === targetId ? { ...todo, completed: true } : todo
));

// React only updates that ONE todo in the real DOM!
// Other 99 todos are not touched
```

## Why React Can Be Faster (Runtime)

### Scenario: Update 1 of 1000 Todos

**Vanilla JS (naive):**
```javascript
// Recreate entire list
container.innerHTML = todos.map(t => `<div>${t}</div>`).join('');
// Time: ~100ms (1000 elements destroyed and recreated)
```

**Vanilla JS (optimized):**
```javascript
// Find and update specific element
const element = container.children[index];
element.textContent = newValue;
// Time: ~0.3ms (but requires manual tracking)
```

**React:**
```jsx
// Update state
setTodos(prev => {
  const newTodos = [...prev];
  newTodos[index] = newValue;
  return newTodos;
});
// React automatically finds and updates only changed element
// Time: ~5ms (automatic, no manual tracking needed)
```

## Why Vanilla Can Be Faster (Initial Load)

**Vanilla:**
- HTML has content: 7 KB
- Content visible: ~20ms
- Interactive: ~60ms

**React (Client-Side):**
- HTML nearly empty: 2 KB
- React bundle: 40-130 KB
- Content visible: ~900ms (dev) or ~300ms (prod)
- Interactive: ~950ms (dev) or ~350ms (prod)

**Winner for initial load:** Vanilla! 🏆

**React (Server-Side):**
- HTML with pre-rendered content: 10 KB
- Content visible: ~15ms
- React hydrates: ~300ms
- Interactive: ~350ms

**Winner for initial load:** SSR React! 🏆

## Best Practices for React CRP

### 1. Use Server-Side Rendering (SSR)
```jsx
// Next.js example
export async function getServerSideProps() {
  return { props: { todos: await fetchTodos() } };
}

// Page loads with content!
```

### 2. Code Splitting
```jsx
// Load components only when needed
const Dashboard = lazy(() => import('./Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### 3. Optimize Bundle Size
```bash
# Use production build
npm run build

# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
```

### 4. Use React.memo Strategically
```jsx
// Expensive components that don't change often
const ExpensiveChart = memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});
```

### 5. Implement Progressive Hydration
```jsx
// Hydrate critical components first
// Defer non-critical components
```

## Performance Demo

Try in the console:
```javascript
// Learn about React's automatic optimizations
reactPerformanceDemo();

// Check React DevTools Profiler:
// 1. Install React DevTools extension
// 2. Open Profiler tab
// 3. Click record
// 4. Add/delete todos
// 5. See which components re-render
```

## Production Optimization Checklist

### Build Configuration
- [ ] Use production build (`NODE_ENV=production`)
- [ ] Enable minification
- [ ] Enable tree shaking
- [ ] Enable code splitting
- [ ] Use dynamic imports

### Deployment
- [ ] Enable gzip/brotli compression
- [ ] Use CDN for React bundles
- [ ] Implement caching headers
- [ ] Use HTTP/2 or HTTP/3

### React Optimizations
- [ ] Server-Side Rendering (Next.js/Remix)
- [ ] Static Site Generation where possible
- [ ] Lazy load routes
- [ ] Memoize expensive components
- [ ] Use production React build

### Monitoring
- [ ] Measure Real User Metrics (RUM)
- [ ] Set performance budgets
- [ ] Regular Lighthouse audits
- [ ] Monitor bundle size

## Advantages of React Approach

✅ **Developer Experience**
- Declarative code
- Component reusability
- Rich ecosystem
- Great tooling

✅ **Runtime Performance**
- Automatic optimizations
- Efficient updates
- Smart diffing

✅ **Maintainability**
- Clear component structure
- Easier to understand
- Better for large teams

✅ **Scalability**
- Handles complex UIs well
- State management patterns
- Testing infrastructure

## Disadvantages

❌ **Initial Load (Client-Side)**
- Blank page until JS loads
- Large bundle size
- Higher Time to Interactive

❌ **Complexity**
- Build tools required
- Learning curve
- More dependencies

❌ **Bundle Size**
- Minimum ~40 KB for React itself
- More than vanilla for simple sites

## When to Use React

✅ **Perfect for:**
- Complex web applications
- Dynamic, interactive UIs
- Large codebases
- Team collaboration
- Long-term maintenance

❌ **Overkill for:**
- Static content sites
- Simple landing pages
- Content-focused sites (use SSR/SSG)
- Sites where bundle size is critical

## Hybrid Approach (Recommended)

Use **Next.js** or **Remix** for best of both worlds:
- Server-rendered HTML (fast first paint)
- React hydration (interactive)
- Automatic code splitting
- Optimized production builds

```bash
# Create Next.js app
npx create-next-app@latest

# Built-in optimizations:
# ✅ Server-Side Rendering
# ✅ Static Site Generation
# ✅ Automatic code splitting
# ✅ Image optimization
# ✅ Font optimization
```

## Comparison with Vanilla

| Metric | Vanilla | React (CSR) | React (SSR) |
|--------|---------|-------------|-------------|
| First Paint | ~20ms | ~900ms | ~15ms |
| Time to Interactive | ~60ms | ~950ms | ~350ms |
| Bundle Size | 11 KB | 515 KB (dev) | 50 KB |
| Runtime Updates | Manual | Automatic | Automatic |
| Complexity | Low | High | High |
| Scalability | Medium | High | High |

## Next Steps

1. Compare with vanilla example
2. Try production build with Vite/Next.js
3. Use React DevTools Profiler
4. Read the comparison doc

## Learn More

- [Vanilla vs React Comparison](../../docs/04-vanilla-vs-react-comparison.md)
- [Optimization Strategies](../../docs/05-optimization-strategies.md)
- [React Official Docs](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)

