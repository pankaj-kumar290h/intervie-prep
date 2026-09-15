# Browser Coordinate Systems — Window, Element, and How to Manipulate Them

Every drag-and-drop, tooltip, virtualized list, or custom-scroll feature comes down to
the same question: "where is this thing, in which coordinate space, and where do I need
it to be?" This note covers the coordinate systems the browser exposes, the APIs that
read them, and the APIs that let you move things — before the CSS Grid / drag-and-drop
file, which builds directly on this.

## 1. The coordinate spaces

There are four distinct origins in play. Mixing them up is the #1 source of "my tooltip
is offset by the scroll amount" bugs.

| Space | Origin (0,0) | Moves when you scroll? | Read via |
| --- | --- | --- | --- |
| **Viewport** | Top-left of the visible browser window | No — always relative to what's currently visible | `clientX`/`clientY`, `getBoundingClientRect()` |
| **Document** | Top-left of the entire page (including scrolled-off content) | No, but the *viewport's* position within it does | `pageX`/`pageY`, `clientX + scrollX` |
| **Screen** | Top-left of the physical monitor | No | `screenX`/`screenY` |
| **Element-local** | Top-left of one specific element | No (relative to that element only) | `offsetX`/`offsetY`, or `clientX - rect.left` |

## 2. Window & viewport measurements

```js
window.innerWidth;    // viewport width, scrollbar included
window.innerHeight;   // viewport height
window.outerWidth;    // whole browser window, including toolbars/chrome
window.outerHeight;

window.screenX;       // position of the browser window on the physical screen (alias: screenLeft)
window.screenY;       // (alias: screenTop)

screen.width;         // full physical screen resolution
screen.height;
screen.availWidth;    // screen size minus OS taskbars/docks
screen.availHeight;

window.scrollX;        // how far the page is scrolled horizontally (alias: pageXOffset)
window.scrollY;        // (alias: pageYOffset)

document.documentElement.scrollWidth;  // full document size, including overflow off-screen
document.documentElement.scrollHeight;
```

## 3. Mouse / pointer event coordinates

Every `MouseEvent` / `PointerEvent` carries the same position expressed in multiple
spaces at once:

```js
el.addEventListener('pointermove', (e) => {
  e.clientX, e.clientY;   // viewport-relative — most common one to use
  e.pageX, e.pageY;       // document-relative — pageX = clientX + window.scrollX
  e.screenX, e.screenY;   // physical-screen-relative
  e.offsetX, e.offsetY;   // relative to e.target's padding edge — GOTCHA below
  e.movementX, e.movementY; // delta since the previous pointermove event
});
```

**Gotcha:** `offsetX`/`offsetY` are relative to `e.target` (whatever element the event
actually fired on), not `e.currentTarget` (the element you attached the listener to). If
you're using event delegation — one listener on a parent, reacting to clicks on its
children — `offsetX` silently changes meaning depending on which child was clicked. When
you need coordinates local to *the element you attached the listener to*, compute it
yourself:

```js
function localCoords(e, el) {
  const rect = el.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
```

## 4. Element geometry

```js
const rect = el.getBoundingClientRect();
// { x, y, top, left, right, bottom, width, height } — all VIEWPORT-relative,
// sub-pixel precision, reflects the element's actual rendered box (after CSS
// transforms are applied to its visual position).

el.offsetTop, el.offsetLeft;
// Relative to el.offsetParent — the nearest ancestor with position: relative/
// absolute/fixed/sticky (or the root if none). NOT the same reference point as
// getBoundingClientRect(), and offsetParent can be null if the element or an
// ancestor is display: none.

el.offsetWidth, el.offsetHeight;   // border-box size, rounded to the nearest integer
el.clientWidth, el.clientHeight;   // padding-box size (excludes border AND scrollbar)
el.scrollWidth, el.scrollHeight;   // full content size, including overflow you can't see
el.scrollTop, el.scrollLeft;       // how far THIS element (as a scroll container) is scrolled

getComputedStyle(el);              // fully resolved CSS, e.g. the actual transform matrix
```

`document.elementFromPoint(x, y)` returns the topmost element at a given **viewport**
coordinate — this is the primitive every drag-and-drop implementation uses to answer
"what's currently under the pointer?"

## 5. Converting between spaces

```js
// viewport -> document
const docX = e.clientX + window.scrollX;
const docY = e.clientY + window.scrollY;

// element -> document (its position on the full page, independent of current scroll)
function toDocumentCoords(el) {
  const rect = el.getBoundingClientRect();
  return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
}

// element -> local coordinates of an ancestor (accounting for the ancestor's own scroll)
function relativeTo(el, ancestor) {
  const elRect = el.getBoundingClientRect();
  const ancestorRect = ancestor.getBoundingClientRect();
  return {
    top: elRect.top - ancestorRect.top + ancestor.scrollTop,
    left: elRect.left - ancestorRect.left + ancestor.scrollLeft,
  };
}

// is an element visible in the viewport right now?
function isInViewport(el, { partial = false } = {}) {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return partial
    ? r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw
    : r.top >= 0 && r.left >= 0 && r.bottom <= vh && r.right <= vw;
}
```

Note the `relativeTo` conversion assumes no CSS `scale()`/`rotate()` transform sits
between the two elements — a scaled ancestor changes the mapping from CSS pixels to
rendered pixels, at which point you need `getComputedStyle(ancestor).transform` parsed
into a `DOMMatrix` to correct for it.

## 6. Manipulating position

Four CSS `position` values, each anchored to a different coordinate origin:

- **`static`** (default) — `top`/`left`/`right`/`bottom` do nothing.
- **`relative`** — offsets the element from *its own normal position*; the space it
  originally occupied in layout is preserved (siblings don't reflow around it).
- **`absolute`** — positioned relative to the nearest ancestor whose `position` isn't
  `static` (its `offsetParent`); removed from normal flow entirely.
- **`fixed`** — relative to the viewport, ignores scrolling.
- **`sticky`** — `relative` until a scroll threshold, then behaves like `fixed` within
  its nearest scrolling ancestor.

**For anything that moves every frame (drag, animation): use `transform: translate()`,
not `top`/`left`.** Changing `top`/`left` triggers layout (reflow) on every frame, which
is expensive and can drop below 60fps. `transform` is handled by the compositor — it
repositions an already-painted layer, skipping layout and paint entirely:

```js
// Cheap: composited, no reflow
el.style.transform = `translate(${x}px, ${y}px)`;

// Expensive: triggers layout on every mousemove
el.style.left = `${x}px`;
el.style.top = `${y}px`;
```

`will-change: transform` hints the browser to promote the element to its own compositor
layer ahead of time, avoiding a layer-creation stall on the first frame of the drag.

## 7. Gotchas

- **`getBoundingClientRect()` changes on scroll.** It's always viewport-relative — don't
  cache it across a scroll or resize without recomputing.
- **Layout thrashing.** Reading `getBoundingClientRect()`/`offsetTop`/`getComputedStyle()`
  immediately after *writing* a style forces a synchronous reflow to answer you
  accurately. In a loop over many elements, this serializes read-write-read-write and can
  visibly stall the page — batch all your reads first, then all your writes.
- **`devicePixelRatio`.** All JS coordinates are in CSS pixels. For pixel-perfect
  `<canvas>` work on a high-DPI screen, multiply by `window.devicePixelRatio`.
- **RTL documents.** `getBoundingClientRect().left` is always the *visual* left edge
  regardless of text direction — it does not flip in `dir="rtl"`. If you need
  direction-aware logic, reach for logical properties (`inset-inline-start`) in CSS, but
  treat JS geometry as physical coordinates always.
- **Prefer `ResizeObserver`/`IntersectionObserver` to polling.** Re-running
  `getBoundingClientRect()` on every `scroll`/`resize` event (even throttled) is wasteful
  compared to observers that the browser only fires when something actually changed.

## What's next

[css-grid-drag-drop.md](css-grid-drag-drop.md) uses exactly these conversions — pointer
position → grid cell, pointer delta → resize amount — to build a draggable, resizable
CSS Grid dashboard where items have different sizes.
