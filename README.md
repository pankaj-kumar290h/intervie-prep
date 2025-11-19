# Critical Rendering Path (CRP) - Complete Guide

A comprehensive guide to understanding and optimizing the Critical Rendering Path, with detailed documentation and practical examples comparing vanilla JavaScript and React implementations.

## 📚 What's Inside

This repository contains:

1. **Detailed Documentation** - In-depth guides covering every aspect of CRP
2. **Practical Examples** - Working todo apps in vanilla JS and React
3. **Performance Comparisons** - Real metrics and benchmarks
4. **Optimization Strategies** - Actionable techniques to improve your sites
5. **JavaScript Interview Questions** ⭐ **NEW** - Advanced frontend and backend questions for senior developers
6. **System Design Questions** ⭐ **NEW** - Comprehensive system design interview prep for frontend and backend

---

## 🚀 Quick Start

### Read the Documentation

Start with these guides in order:

1. [Critical Rendering Path Overview](./docs/01-critical-rendering-path-overview.md)
   - What is CRP and why it matters
   - The 6 steps: DOM, CSSOM, Render Tree, Layout, Paint, Composite
   - Key metrics and goals

2. [Blocking vs Non-Blocking Resources](./docs/02-blocking-vs-non-blocking.md)
   - Understanding render-blocking resources
   - CSS and JavaScript blocking behavior
   - Making resources non-blocking
   - Visual timeline comparisons

3. [CRP Steps - Deep Dive](./docs/03-crp-steps-deep-dive.md)
   - Detailed breakdown of each CRP step
   - DOM and CSSOM construction
   - JavaScript execution models
   - Layout, Paint, and Composite phases

4. [Vanilla vs React Comparison](./docs/04-vanilla-vs-react-comparison.md)
   - How CRP differs between approaches
   - Initial load vs runtime performance
   - When each approach is faster
   - Real-world benchmarks

5. [Optimization Strategies](./docs/05-optimization-strategies.md)
   - Complete optimization checklist
   - HTML, CSS, and JavaScript optimizations
   - Resource loading strategies
   - Performance measurement tools

6. [Using DevTools to Analyze CRP](./docs/06-devtools-crp-analysis.md)
   - Network Tab: Resource analysis and blocking detection
   - Performance Tab: Timeline and rendering phases
   - Lighthouse: Automated audits and recommendations
   - Coverage Tab: Finding unused code
   - Performance API: Programmatic measurement
   - Real-world debugging examples

7. [Advanced Methods for Senior Developers](./docs/07-advanced-methods-for-senior-developers.md) ⭐ **NEW**
   - requestAnimationFrame: Smooth 60fps animations
   - Intersection Observer: Lazy loading and visibility tracking
   - Resize Observer: Responsive components
   - Mutation Observer: React to DOM changes
   - Performance Observer: Real User Monitoring (RUM)
   - Web Workers: Parallel processing
   - requestIdleCallback: Background tasks
   - Page Visibility API: Optimize hidden tabs
   - Complete code examples and use cases

### Try the Examples

```bash
# Clone or download this repository
cd examples

# Vanilla JavaScript Example
cd vanilla-example
# Open index.html in your browser

# React Example
cd react-example
# Open index.html in your browser
```

Or use a local server:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

---

## 📊 Performance Comparison

### Initial Page Load

| Metric | Vanilla | React (Client) | React (SSR) |
|--------|---------|----------------|-------------|
| **First Paint** | ~20ms ✅ | ~900ms ⚠️ | ~15ms ✅ |
| **Time to Interactive** | ~60ms ✅ | ~950ms ⚠️ | ~350ms ⚠️ |
| **Bundle Size** | 11 KB ✅ | 515 KB (dev) ❌ | 50 KB ⚠️ |
| **Critical Resources** | 1 ✅ | 4 ❌ | 3 ⚠️ |

**Winner:** Vanilla JavaScript for simple sites, SSR React for complex apps

### Runtime Performance (1000 items)

| Operation | Vanilla (Optimized) | React (Automatic) |
|-----------|---------------------|-------------------|
| **Initial Render** | ~18ms | ~45ms |
| **Update All** | ~20ms | ~30ms |
| **Update One** | ~0.3ms | ~5ms* |
| **Reorder** | ~50ms | ~8ms* |

*React optimizes automatically without manual code

**Winner:** Both are fast, but React wins on developer experience

---

## 🎯 Key Concepts

### What is Critical Rendering Path?

The Critical Rendering Path is the sequence of steps browsers take to convert HTML, CSS, and JavaScript into pixels on screen:

```
HTML → DOM Tree
CSS  → CSSOM Tree
DOM + CSSOM → Render Tree → Layout → Paint → Composite
JavaScript can modify DOM/CSSOM at any point
```

### The Three Pillars of CRP Optimization

1. **Minimize Critical Resources**
   - Fewer files that block rendering
   - Target: 1-3 critical resources

2. **Minimize Critical Bytes**
   - Smaller files load faster
   - Target: < 14KB for critical CSS (first TCP packet)

3. **Minimize Critical Path Length**
   - Fewer round trips to server
   - Target: 1-2 RTT for critical resources

---

## 🛠️ Quick Optimization Wins

### For Any Website

```html
<!-- 1. Inline critical CSS -->
<head>
  <style>
    /* Critical above-the-fold styles (< 14KB) */
  </style>
</head>

<!-- 2. Defer JavaScript -->
<script src="app.js" defer></script>

<!-- 3. Lazy load images -->
<img src="hero.jpg" loading="lazy">

<!-- 4. Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
```

### For Vanilla JS Sites

```javascript
// Use DocumentFragment for batch DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
  fragment.appendChild(createItem(item));
});
container.appendChild(fragment); // Single reflow!
```

### For React Sites

```jsx
// Use Server-Side Rendering (Next.js)
// Fast first paint + React benefits
export async function getServerSideProps() {
  return { props: { data: await fetchData() } };
}

// Code splitting
const Dashboard = lazy(() => import('./Dashboard'));

// Memoization
const ExpensiveComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

---

## 📖 Documentation Structure

### `docs/` Folder

Comprehensive guides covering:
- CRP fundamentals and steps
- Blocking vs non-blocking resources
- Deep dive into each rendering phase
- Framework comparisons
- Optimization techniques
- Performance measurement
- DevTools analysis and debugging
- **Advanced JavaScript APIs** (requestAnimationFrame, Observers, Web Workers, etc.) ⭐ NEW

### `examples/` Folder

Working applications demonstrating:
- **Vanilla Example** - Pure HTML/CSS/JS with optimal CRP
- **React Example** - Client-side React with performance monitoring
- Performance comparison tools
- Interactive demos

### `javaScript/` Folder ⭐ **NEW**

Advanced interview questions for senior developers:
- **Frontend Advanced Questions** - Virtual DOM, Event Loop, Memory Management, Service Workers, Promises, Browser Rendering, State Management, Performance, Security
- **Backend Advanced Questions** - Event Loop, Streams & Buffers, Cluster & Workers, Memory Management, Connection Pooling, Microservices, Authentication, Rate Limiting, Error Handling

### `system-design/` Folder ⭐ **NEW**

Comprehensive system design interviews:
- **Frontend System Design** - Chat apps, News feeds, Video streaming, Image galleries, Collaborative editors, E-commerce, Autocomplete, Notifications, Dashboards, Component libraries
- **Backend System Design** - URL shortener, Rate limiter, Distributed cache, Message queues, API Gateway, Auth systems, Order systems, Leaderboards, Search engines, Payment systems
- **Complete with**: Architecture diagrams, Capacity estimation, API design, Database schemas, Code examples, Trade-off analysis

---

## 🔍 What You'll Learn

### Understanding CRP

- [ ] How browsers convert code to pixels
- [ ] DOM and CSSOM construction
- [ ] Render tree and layout calculation
- [ ] Paint and composite processes
- [ ] JavaScript's impact on rendering

### Identifying Bottlenecks

- [ ] What resources block rendering
- [ ] Parser-blocking vs render-blocking
- [ ] How CSS blocks JavaScript
- [ ] Measuring CRP metrics
- [ ] Using Chrome DevTools effectively

### Optimization Techniques

- [ ] Critical CSS extraction and inlining
- [ ] JavaScript loading strategies (defer, async)
- [ ] Resource prioritization
- [ ] Code splitting and lazy loading
- [ ] Image and font optimization

### Advanced JavaScript APIs

- [ ] requestAnimationFrame for smooth animations
- [ ] Intersection Observer for lazy loading
- [ ] Resize Observer for responsive components
- [ ] Mutation Observer for DOM monitoring
- [ ] Performance Observer for RUM
- [ ] Web Workers for parallel processing
- [ ] requestIdleCallback for background tasks

### Framework-Specific Knowledge

- [ ] Vanilla JS optimization patterns
- [ ] React's Virtual DOM impact
- [ ] Client-side vs Server-side rendering
- [ ] When to use each approach
- [ ] Production build optimizations

---

## 🎓 Learning Path

### Beginner (Start Here)

1. Read [01-critical-rendering-path-overview.md](./docs/01-critical-rendering-path-overview.md)
2. Try the [vanilla example](./examples/vanilla-example/)
3. Open Chrome DevTools and observe the Network/Performance tabs

### Intermediate

1. Read [02-blocking-vs-non-blocking.md](./docs/02-blocking-vs-non-blocking.md)
2. Read [03-crp-steps-deep-dive.md](./docs/03-crp-steps-deep-dive.md)
3. Read [06-devtools-crp-analysis.md](./docs/06-devtools-crp-analysis.md) ⭐ **Hands-on!**
4. Compare both examples side-by-side
5. Run Lighthouse audits on both
6. Use Coverage tab to find unused code

### Advanced

1. Read [04-vanilla-vs-react-comparison.md](./docs/04-vanilla-vs-react-comparison.md)
2. Read [05-optimization-strategies.md](./docs/05-optimization-strategies.md)
3. Read [07-advanced-methods-for-senior-developers.md](./docs/07-advanced-methods-for-senior-developers.md) ⭐ **Essential!**
4. Implement optimizations on your own projects
5. Set up performance monitoring with Performance Observer
6. Use Web Workers for heavy computations
7. Implement lazy loading with Intersection Observer
8. Create performance budgets

### Senior Developer Interview Prep ⭐ **NEW**

1. **JavaScript Mastery**:
   - Review [Frontend Advanced Questions](./javaScript/frontend-advanced-questions.md)
   - Practice [Backend Advanced Questions](./javaScript/backend-advanced-questions.md)
   - Implement all code examples from scratch

2. **System Design**:
   - Study [Frontend System Design](./system-design/frontend-system-design.md)
   - Study [Backend System Design](./system-design/backend-system-design.md)
   - Practice drawing architecture diagrams
   - Do capacity estimation exercises
   - Understand trade-offs for each design decision

3. **Interview Practice**:
   - Mock interviews with peers
   - Time yourself (45 minutes per design question)
   - Practice explaining your thought process
   - Study real-world architectures (Netflix, Uber, Instagram)
   - Review common patterns and anti-patterns

---

## 🧪 Hands-On Experiments

### Experiment 1: Measure CRP Metrics

```javascript
// Run in browser console
const perfData = performance.getEntriesByType('navigation')[0];
console.log({
  'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd),
  'Page Load': Math.round(perfData.loadEventEnd),
  'TTFB': Math.round(perfData.responseStart)
});
```

### Experiment 2: Compare Blocking vs Non-Blocking

```html
<!-- Test A: Blocking script -->
<script src="large-file.js"></script>

<!-- Test B: Deferred script -->
<script src="large-file.js" defer></script>

<!-- Measure difference in First Paint time -->
```

### Experiment 3: Critical CSS Impact

1. Start with external CSS (measure FCP)
2. Inline critical CSS (measure FCP)
3. Compare the difference

### Experiment 4: React Performance

```javascript
// In React example, try:
reactPerformanceDemo();

// Use React DevTools Profiler to see:
// - Component render times
// - Which components re-render
// - Why they re-render
```

---

## 📈 Performance Metrics to Track

### Core Web Vitals

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

### CRP-Specific Metrics

- **Critical Resources**: Number of blocking resources
- **Critical Path Length**: Round trips for critical resources
- **Critical Bytes**: Total size of critical resources
- **First Contentful Paint (FCP)**: When first content appears
- **Time to Interactive (TTI)**: When page becomes interactive

---

## 🛠️ Tools and Resources

### Chrome DevTools
- **Network Tab**: Analyze resource loading
- **Performance Tab**: Record and analyze page load
- **Lighthouse**: Comprehensive audits
- **Coverage Tab**: Find unused CSS/JS
- 📖 **See [DevTools Guide](./docs/06-devtools-crp-analysis.md) for detailed tutorial!**

### Online Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Build Tools
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Critical](https://github.com/addyosmani/critical) - Extract critical CSS
- [PurgeCSS](https://purgecss.com/) - Remove unused CSS
- [Vite](https://vitejs.dev/) - Fast build tool

---

## 💡 Best Practices Summary

### HTML
- ✅ Minimize HTML size
- ✅ Put critical resources first
- ✅ Avoid inline scripts in `<head>`
- ✅ Use semantic HTML

### CSS
- ✅ Inline critical CSS (< 14KB)
- ✅ Load non-critical CSS async
- ✅ Remove unused CSS
- ✅ Use media queries for conditional loading
- ✅ Avoid @import in CSS

### JavaScript
- ✅ Use `defer` for most scripts
- ✅ Use `async` for independent scripts
- ✅ Code split large bundles
- ✅ Tree shake unused code
- ✅ Minimize and compress

### Images
- ✅ Use modern formats (WebP, AVIF)
- ✅ Lazy load below-the-fold images
- ✅ Preload critical images
- ✅ Use responsive images
- ✅ Set width/height to prevent CLS

### Fonts
- ✅ Use `font-display: swap`
- ✅ Preload critical fonts
- ✅ Subset fonts (only include used characters)
- ✅ Use system fonts when possible

---

## 🎯 When to Use What

### Use Vanilla JavaScript When:
- Simple, static, or mostly static sites
- Initial load speed is critical
- Bundle size is a primary concern
- No complex state management needed
- Examples: Blogs, landing pages, documentation

### Use React (Client-Side) When:
- Building complex web applications
- UI has frequent updates
- Team familiar with React
- Developer experience > initial load speed
- Examples: Dashboards, admin panels, SPAs

### Use React (Server-Side) When:
- Need both fast initial load AND React benefits
- SEO is important
- Large, complex application
- Can afford server infrastructure
- Examples: E-commerce, social platforms, content sites

---

## 📚 Additional Resources

### Official Documentation
- [MDN - Critical Rendering Path](https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path)
- [Web.dev - Optimize CRP](https://web.dev/critical-rendering-path/)
- [React Documentation](https://react.dev)

### Books
- "High Performance Browser Networking" by Ilya Grigorik
- "Designing for Performance" by Lara Hogan
- "Web Performance in Action" by Jeremy Wagner
- "Designing Data-Intensive Applications" by Martin Kleppmann ⭐ **System Design**
- "System Design Interview" by Alex Xu ⭐ **System Design**

### Articles
- [Optimizing Content Efficiency](https://web.dev/performance-optimizing-content-efficiency/)
- [Rendering Performance](https://web.dev/rendering-performance/)
- [JavaScript Performance](https://web.dev/fast/)

### System Design Resources ⭐ **NEW**
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [High Scalability Blog](http://highscalability.com/)
- [Grokking the System Design Interview](https://www.educative.io/courses/grokking-the-system-design-interview)
- Company Engineering Blogs: [Netflix](https://netflixtechblog.com/), [Uber](https://eng.uber.com/), [Airbnb](https://medium.com/airbnb-engineering)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Improve documentation
- Add more examples
- Fix errors
- Suggest optimizations
- Share your findings

---

## 📝 License

MIT License - feel free to use this for learning and teaching!

---

## 🎉 Conclusion

Understanding the Critical Rendering Path is fundamental to building fast web experiences. Whether you choose vanilla JavaScript or React, the principles remain the same:

1. **Minimize blocking resources**
2. **Optimize critical bytes**
3. **Reduce critical path length**

Start with the basics, experiment with the examples, and gradually apply these concepts to your own projects.

**Remember**: Fast websites aren't just about technology—they're about better user experiences, higher conversion rates, and happier users!

---

## 📞 Quick Reference Card

```
CRP Steps: HTML→DOM, CSS→CSSOM, JS Execution, Render Tree, Layout, Paint, Composite

Critical Resources:
├─ HTML (always critical)
├─ CSS in <head> (render-blocking)
└─ Sync JavaScript (parser-blocking)

Quick Wins:
├─ Inline critical CSS
├─ Defer JavaScript
├─ Lazy load images
└─ Preconnect to external domains

Metrics to Track:
├─ First Contentful Paint (FCP) < 1.8s
├─ Time to Interactive (TTI) < 3.8s
└─ Total Bundle Size < 200KB (gzipped)

Tools:
├─ Chrome DevTools (built-in)
├─ Lighthouse (built-in)
├─ PageSpeed Insights (online)
└─ WebPageTest (online)
```

---

**Happy Optimizing! 🚀**

For questions or discussions about Critical Rendering Path, check out:
- [Web Performance Working Group](https://www.w3.org/webperf/)
- [Performance Now Conference](https://perfnow.nl/)
- [#webperf on Twitter](https://twitter.com/hashtag/webperf)

