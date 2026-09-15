# CSS Grid + Drag & Drop for Mixed-Size Elements

Builds on [coordinate-systems.md](coordinate-systems.md). The goal: a dashboard-style
grid (think Trello power-ups, a widget dashboard, a bento layout) where items span
different numbers of columns/rows, and the user can drag to reposition and drag a handle
to resize — like `gridstack.js` or `react-grid-layout`, built from first principles.

## 1. CSS Grid essentials for variable-size items

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 equal-width columns */
  grid-auto-rows: 100px;                 /* every implicit row is 100px tall */
  gap: 8px;
}

.item {
  grid-column: 1 / span 2; /* start at column 1, occupy 2 columns */
  grid-row: 2 / span 1;    /* start at row 2, occupy 1 row */
}
```

- `grid-column: <start> / span <n>` and `grid-row: <start> / span <n>` are how an
  individual item claims a footprint bigger than one cell — this is what lets a 2×1
  "wide" widget and a 1×2 "tall" widget share a grid with plain 1×1 items.
- `grid-auto-flow: dense` backfills earlier gaps with later items instead of leaving
  holes — the standard trick for Pinterest/bento-style layouts with mixed sizes, at the
  cost of possibly reordering items visually away from source order.
- `minmax(120px, 1fr)` in `grid-template-columns` lets columns grow but never shrink
  below a usable width — useful before you add drag/resize on top.

## 2. Native HTML5 Drag-and-Drop vs. Pointer Events

The browser has a built-in Drag and Drop API (`draggable="true"`, `dragstart`,
`dragover`, `drop`). **Don't use it for a resizable/draggable grid.** It's designed for
dragging data (text, files, links) between drop zones, not for pixel-precise repositioning:

- No control over the drag visual beyond a static "ghost" image.
- Poor/no touch support — mobile requires an entirely separate touch-event fallback.
- `dragover` must call `preventDefault()` or `drop` never fires — an easy silent bug.
- No fine-grained access to intermediate positions the way `pointermove` gives you.

**Use Pointer Events instead** (`pointerdown` / `pointermove` / `pointerup`) — they unify
mouse, touch, and pen input into one event model, and give you a continuous stream of
positions to do your own coordinate math on, exactly as covered in
[coordinate-systems.md](coordinate-systems.md). This is what every serious drag/resize
library (`interact.js`, `muuri`, `gridstack.js`) actually uses under the hood.

## 3. The core algorithm

Three pieces, kept deliberately separate:

1. **A data model**, independent of the DOM — each item is `{ id, col, row, colSpan,
   rowSpan }`. The DOM only ever *reflects* this model; drag/resize logic mutates the
   model, then a `render()` function writes `grid-column`/`grid-row` styles.
2. **Pointer position → grid cell**, using the container's `getBoundingClientRect()` and
   known column count (the same viewport→local conversion from the coordinate-systems
   note).
3. **Collision handling** — when a dragged item's new footprint overlaps another item's,
   decide what happens (swap positions, push the other item aside, or block the move).

```js
function pointerToCell(grid, cols, rowHeight, clientX, clientY) {
  const rect = grid.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(grid).gap) || 0;
  const cellWidth = (rect.width - gap * (cols - 1)) / cols;

  const col = Math.floor((clientX - rect.left) / (cellWidth + gap)) + 1;
  const row = Math.floor((clientY - rect.top) / (rowHeight + gap)) + 1;
  return { col: Math.min(Math.max(col, 1), cols), row: Math.max(row, 1) };
}

function footprintsOverlap(a, b) {
  return (
    a.col < b.col + b.colSpan &&
    a.col + a.colSpan > b.col &&
    a.row < b.row + b.rowSpan &&
    a.row + a.rowSpan > b.row
  );
}
```

## 4. Full worked example — draggable + resizable dashboard

```html
<div id="grid" class="grid">
  <div class="item" data-id="a">A (2×1)<div class="resize-handle"></div></div>
  <div class="item" data-id="b">B (1×2)<div class="resize-handle"></div></div>
  <div class="item" data-id="c">C (1×1)<div class="resize-handle"></div></div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 100px;
  gap: 8px;
}

.item {
  position: relative;
  background: #4f46e5;
  color: white;
  border-radius: 8px;
  cursor: grab;
  touch-action: none; /* stop the browser handling scroll/zoom so WE own the gesture */
}

.item.dragging {
  opacity: 0.6;
  z-index: 10;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
  background: rgba(255, 255, 255, 0.5);
}
```

```js
const COLS = 4;
const ROW_HEIGHT = 100;
const grid = document.getElementById('grid');

const layout = new Map([
  ['a', { col: 1, row: 1, colSpan: 2, rowSpan: 1 }],
  ['b', { col: 3, row: 1, colSpan: 1, rowSpan: 2 }],
  ['c', { col: 1, row: 2, colSpan: 1, rowSpan: 1 }],
]);

function render() {
  for (const [id, pos] of layout) {
    const el = grid.querySelector(`[data-id="${id}"]`);
    el.style.gridColumn = `${pos.col} / span ${pos.colSpan}`;
    el.style.gridRow = `${pos.row} / span ${pos.rowSpan}`;
  }
}

function pointerToCell(clientX, clientY) {
  const rect = grid.getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(grid).gap) || 0;
  const cellWidth = (rect.width - gap * (COLS - 1)) / COLS;
  const col = Math.floor((clientX - rect.left) / (cellWidth + gap)) + 1;
  const row = Math.floor((clientY - rect.top) / (ROW_HEIGHT + gap)) + 1;
  return { col: Math.min(Math.max(col, 1), COLS), row: Math.max(row, 1) };
}

function footprintsOverlap(a, b) {
  return (
    a.col < b.col + b.colSpan &&
    a.col + a.colSpan > b.col &&
    a.row < b.row + b.rowSpan &&
    a.row + a.rowSpan > b.row
  );
}

function findOverlapping(id, candidate) {
  for (const [otherId, pos] of layout) {
    if (otherId !== id && footprintsOverlap(candidate, pos)) return otherId;
  }
  return null;
}

// --- Drag to reposition ---
let dragId = null;

grid.addEventListener('pointerdown', (e) => {
  if (e.target.classList.contains('resize-handle')) return; // handled separately below
  const item = e.target.closest('.item');
  if (!item) return;

  dragId = item.dataset.id;
  item.setPointerCapture(e.pointerId);
  item.classList.add('dragging');
});

grid.addEventListener('pointermove', (e) => {
  if (!dragId) return;
  const current = layout.get(dragId);
  const { col, row } = pointerToCell(e.clientX, e.clientY);
  const candidate = {
    ...current,
    col: Math.min(col, COLS - current.colSpan + 1), // keep footprint inside the grid
    row,
  };

  const collidingId = findOverlapping(dragId, candidate);
  if (collidingId) {
    // swap footprints rather than blocking the move
    layout.set(collidingId, { ...layout.get(collidingId), col: current.col, row: current.row });
  }
  layout.set(dragId, candidate);
  render();
});

grid.addEventListener('pointerup', (e) => {
  if (!dragId) return;
  grid.querySelector(`[data-id="${dragId}"]`).classList.remove('dragging');
  dragId = null;
});

// --- Drag handle to resize ---
grid.addEventListener('pointerdown', (e) => {
  if (!e.target.classList.contains('resize-handle')) return;
  const item = e.target.closest('.item');
  const id = item.dataset.id;
  const start = { x: e.clientX, y: e.clientY, ...layout.get(id) };
  item.setPointerCapture(e.pointerId);

  function onMove(ev) {
    const rect = grid.getBoundingClientRect();
    const cellWidth = rect.width / COLS;
    const deltaCols = Math.round((ev.clientX - start.x) / cellWidth);
    const deltaRows = Math.round((ev.clientY - start.y) / ROW_HEIGHT);

    layout.set(id, {
      ...layout.get(id),
      colSpan: Math.max(1, Math.min(start.colSpan + deltaCols, COLS - start.col + 1)),
      rowSpan: Math.max(1, start.rowSpan + deltaRows),
    });
    render();
  }
  function onUp(ev) {
    item.releasePointerCapture(ev.pointerId);
    item.removeEventListener('pointermove', onMove);
    item.removeEventListener('pointerup', onUp);
  }
  item.addEventListener('pointermove', onMove);
  item.addEventListener('pointerup', onUp);
});

render();
```

**Why it's structured this way.**
- `setPointerCapture` keeps `pointermove`/`pointerup` targeting the element you grabbed
  even if the cursor moves faster than the mouse can visually "keep up" and leaves the
  element's bounds mid-drag.
- `touch-action: none` is required for touch devices — without it, the browser
  intercepts the gesture for its own scrolling before your `pointermove` handler ever
  sees it.
- Resize and drag are two *separate* `pointerdown` listeners, each guarding on whether
  `e.target` is the resize handle, rather than one handler with a big if/else — keeps the
  swap-on-collision logic (drag) and the clamp-to-grid logic (resize) from tangling
  together.
- The swap-on-collision strategy is the simplest correct option for a teaching example.
  Real dashboards (`gridstack.js`) typically **push** the colliding item to the next free
  row instead of swapping, which avoids widgets jumping to an unrelated part of the grid.

## 5. Where to go from here

- **Push instead of swap:** on collision, recursively shift the colliding item (and
  anything *it* now collides with) down by one row rather than teleporting it to the
  dragged item's old slot.
- **Ghost/placeholder preview:** render a dashed outline at the candidate cell before
  drop, instead of moving the real item live.
- **Persistence:** serialize the `layout` Map to `localStorage`/a backend on `pointerup`.
- **Real-world libraries:** `gridstack.js`, `react-grid-layout`, `muuri`, and
  `interact.js` solve this same problem with production-grade collision resolution,
  animation, and touch handling — worth reading their source once you've built this by
  hand, to see how they generalize past this minimal version.

## Practice

See [challenges.md](challenges.md) for a set of coordinate-system and grid-drag-drop
problems, ordered easy → very hard.
