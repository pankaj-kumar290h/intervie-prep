# Critical Rendering Path (CRP) - Overview

## Table of Contents
1. [What is Critical Rendering Path?](#what-is-critical-rendering-path)
2. [The Six Steps of CRP](#the-six-steps-of-crp)
3. [Why CRP Matters](#why-crp-matters)
4. [Key Metrics](#key-metrics)

---

## What is Critical Rendering Path?

The **Critical Rendering Path (CRP)** is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels on the screen. Understanding and optimizing this path is crucial for improving web performance and user experience.

### The Journey from Code to Pixels

```
HTML → DOM Tree
CSS  → CSSOM Tree
DOM + CSSOM → Render Tree → Layout → Paint → Composite
JavaScript can modify DOM/CSSOM at any point
```

---

## The Six Steps of CRP

### 1. **DOM Construction (Document Object Model)**
- Browser receives HTML bytes
- Converts bytes → characters → tokens → nodes → DOM tree
- **Incremental process**: Browser can start building the DOM as it receives the HTML

**Example Flow:**
```
Bytes: <html><head>...
  ↓
Characters: <, h, t, m, l, >
  ↓
Tokens: StartTag:html, StartTag:head
  ↓
Nodes: html node, head node
  ↓
DOM Tree: Hierarchical structure
```

### 2. **CSSOM Construction (CSS Object Model)**
- Browser receives CSS
- Constructs CSSOM tree similar to DOM
- **NOT incremental**: Browser must process entire CSS before moving forward
- Represents all the styles and how they cascade

**Why CSSOM is not incremental:**
- CSS rules can override each other (cascading)
- Later rules can change earlier rules
- Browser needs complete picture before rendering

### 3. **Render Tree Construction**
- Combines DOM and CSSOM
- Contains only visible content (excludes `display: none`, `<head>`, etc.)
- Each visible node has its computed styles attached

**Formula:**
```
Render Tree = DOM (visible nodes only) + CSSOM (computed styles)
```

### 4. **Layout (Reflow)**
- Calculate exact position and size of each element
- Considers viewport size, box model, positioning
- Outputs "box model" with coordinates
- **Expensive operation** - affects all descendant elements

### 5. **Paint**
- Convert render tree nodes into actual pixels
- Creates "paint records" (drawing commands)
- Handles visibility, transforms, z-index ordering
- Can be broken into multiple layers

### 6. **Composite**
- Combines all painted layers in correct order
- Handles GPU acceleration
- Most performant operation
- Final pixels sent to screen

---

## Why CRP Matters

### Performance Impact
- **First Contentful Paint (FCP)**: Time until user sees content
- **Largest Contentful Paint (LCP)**: Time until main content visible
- **Time to Interactive (TTI)**: When page becomes interactive

### User Experience
- Faster CRP = Better perceived performance
- Users abandon sites that take >3 seconds to load
- Each second delay can cost conversions

### Business Impact
```
100ms faster = 1% increase in conversions (Amazon)
2s delay = 103% increase in bounce rate (Google)
```

---

## Key Metrics

### 1. **Critical Resources**
Resources needed before page can render:
- HTML document (always critical)
- CSS in `<head>` (render-blocking)
- JavaScript with no `async`/`defer` (parser-blocking)

### 2. **Critical Path Length**
Number of round trips to fetch critical resources:
```
CRP Length = Maximum depth of dependency chain
```

### 3. **Critical Bytes**
Total bytes of critical resources:
```
Lower Critical Bytes = Faster initial render
```

---

## Optimization Goals

To optimize CRP, we aim to:
1. ✅ Minimize number of critical resources
2. ✅ Minimize critical bytes
3. ✅ Minimize critical path length
4. ✅ Prioritize above-the-fold content
5. ✅ Defer non-critical resources

---

## Quick Reference

| Step | Incremental? | Render Blocking? | Notes |
|------|-------------|------------------|-------|
| DOM Construction | ✅ Yes | No | Can start rendering with partial DOM |
| CSSOM Construction | ❌ No | ✅ Yes | Must be complete before render |
| JavaScript Execution | Depends | ✅ Yes (by default) | Can be made async |
| Render Tree | N/A | N/A | Combines DOM + CSSOM |
| Layout | N/A | N/A | Expensive calculation |
| Paint | N/A | N/A | Draws pixels |

---

## Next Steps

Continue to:
- [02-blocking-vs-non-blocking.md](./02-blocking-vs-non-blocking.md) - Understanding resource blocking
- [03-crp-steps-deep-dive.md](./03-crp-steps-deep-dive.md) - Detailed breakdown of each step
- [Examples](../examples/) - Practical implementations

---

**Remember**: The faster you can get through the Critical Rendering Path, the sooner users see content and can interact with your page!

