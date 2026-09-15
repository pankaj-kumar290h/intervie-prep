# Browser Coordinates & Grid Drag-and-Drop — Challenges (Easy → Very Hard)

Asked at: Google, Meta, Atlassian, Adobe, Figma, Notion, Uber, Flipkart, Razorpay —
anywhere with a canvas/whiteboard, dashboard builder, or DnD-heavy UI. Work through
[coordinate-systems.md](coordinate-systems.md) and
[css-grid-drag-drop.md](css-grid-drag-drop.md) first — every technique needed below is
covered there. Build vanilla JS/CSS (no libraries) unless a question says otherwise.

---

## Easy

1. **`getDocumentPosition(el)`** — return an element's `{ top, left }` relative to the
   whole document (not the viewport), correct at any scroll position.

2. **`isInViewport(el, { partial })`** — return whether an element is fully, or (with the
   option) at least partially, visible in the current viewport.

3. **Position a tooltip at the cursor.** On `mousemove` over a container, move a tooltip
   `<div>` so it sits just below-right of the pointer. Handle the case where that would
   push the tooltip off the right/bottom edge of the viewport — flip it to the other side
   instead of letting it overflow.

4. **`localCoords(e, el)`** — given a `MouseEvent` and a target element, return the
   pointer's `{ x, y }` relative to that element's top-left corner, without relying on
   the event's own `offsetX`/`offsetY` (so it stays correct under event delegation).

5. **Highlight-on-hover for a delegated list.** One `mouseover` listener on a `<ul>`
   highlights whichever `<li>` the pointer is over, using `elementFromPoint` or
   `closest()` — explain which approach is cheaper and why.

---

## Medium

6. **Free-drag within bounds.** Make a single absolutely-positioned element draggable
   with pointer events, clamped so it can never be dragged outside its parent container's
   edges. Use `transform: translate()`, not `top`/`left`, and explain why.

7. **Live drop-target highlighting.** While dragging item A over a row of drop zones,
   highlight whichever zone is currently under the pointer (`document.elementFromPoint`),
   and un-highlight it the instant the pointer leaves — without a `mouseover` listener on
   every zone (the dragged element itself is what's under the cursor, not the zone).

8. **Resizable split panes.** Two panes side by side with a draggable divider between
   them; dragging the divider resizes both panes via `grid-template-columns`. Convert the
   pointer's `movementX` into a percentage/fr change on every frame.

9. **Scroll-snap carousel "current page" indicator.** Given a horizontally scrolling,
   `scroll-snap`-enabled row of cards, compute which card is currently centered using
   `scrollLeft` and each card's `getBoundingClientRect()` — update a page-dot indicator
   as the user scrolls.

10. **Drag velocity & direction.** Track a dragged element's instantaneous velocity
    (px/ms) using timestamped position samples (don't just use one `movementX` — explain
    why a single sample is noisy). Use it to add "throw" momentum when the drag ends.

---

## Hard

11. **Sortable list (reorder-on-drag).** A vertical list where dragging an item up/down
    reorders the list live — compute the insertion index by comparing the pointer's Y
    position against each sibling's `getBoundingClientRect()` midpoint, and animate the
    siblings sliding into their new slots (FLIP technique: read positions **F**irst,
    **L**ast, compute the **I**nvert transform, then **P**lay it).

12. **CSS Grid dashboard drag** (extend [css-grid-drag-drop.md](css-grid-drag-drop.md)).
    Instead of swap-on-collision, implement **push**: when a dragged item's new footprint
    overlaps another, push that item down by one row, and recursively push anything *it*
    now overlaps — without infinite-looping or letting items overlap after the push
    resolves.

13. **Unified mouse + touch drag, no duplicate firing.** Implement a single drag handler
    using Pointer Events that correctly handles a device that can produce *both* touch
    and mouse events for the same physical gesture (common on hybrid laptops), without
    handling the interaction twice.

14. **Auto-scroll near the edge.** While dragging an item inside a scrollable container,
    if the pointer gets within 40px of the container's top/bottom edge, auto-scroll the
    container (faster the closer to the edge), computed from the pointer's distance to
    `container.getBoundingClientRect().top/bottom`.

---

## Very Hard

15. **Full dashboard: drag + resize + push-based reflow, persisted.** Combine #12's push
    algorithm with resize handles from `css-grid-drag-drop.md`, so both dragging and
    resizing can trigger cascading pushes. Persist the layout model (not the DOM) to
    `localStorage` on every change and restore it on load.

16. **Virtualized drag-and-drop.** A list of 10,000 rows where only the ~20 visible rows
    are actually rendered (using `isInViewport`-style checks to mount/unmount rows as the
    container scrolls). Support dragging a row to reorder it, including dragging it near
    the top/bottom edge to auto-scroll and reveal rows that aren't currently mounted, and
    dropping it among them.

17. **Pan/zoom canvas (whiteboard).** Elements live in "world space"; the canvas can be
    panned and zoomed, so world space and screen space are related by a transform
    (`translate` + `scale`). Implement: converting a pointer click to the correct world
    coordinate at the current zoom/pan, dragging a world-space element correctly at any
    zoom level, and zooming centered on the cursor position (not the canvas origin).

---

## Must be able to state

- The four coordinate spaces (viewport / document / screen / element-local) and which
  event property or API belongs to each.
- Why `transform: translate()` beats `top`/`left` for anything animated: it skips layout
  and paint, running on the compositor instead.
- Why `offsetX`/`offsetY` are unsafe under event delegation (`e.target` vs
  `e.currentTarget`).
- Why Pointer Events (not the HTML5 Drag-and-Drop API) are the right primitive for a
  custom drag experience — control over the visual, unified touch/mouse/pen handling.
- The difference between "swap," "push," and "block" collision strategies in a grid, and
  the trade-off each makes.
- Why `getBoundingClientRect()` must be re-read after scroll/resize rather than cached.
