# Browser Coordinate System & Grid Drag-and-Drop

How the browser represents "where things are" (window, viewport, document, element),
how to convert between those coordinate spaces, and how to use that to build a CSS Grid
dashboard with draggable, resizable, mixed-size items.

| File | Contents |
| --- | --- |
| [coordinate-systems.md](coordinate-systems.md) | Viewport/document/screen/element-local coordinate spaces, `getBoundingClientRect()` vs `offsetTop` vs `clientWidth`, converting between spaces, `transform` vs `top`/`left`, common gotchas |
| [css-grid-drag-drop.md](css-grid-drag-drop.md) | CSS Grid for variable-size items, Pointer Events vs the HTML5 Drag-and-Drop API, pointer→grid-cell math, a full draggable + resizable dashboard example with collision handling |
| [challenges.md](challenges.md) | 17 practice problems, Easy → Very Hard, applying both files above |

**Suggested order:** [coordinate-systems.md](coordinate-systems.md) →
[css-grid-drag-drop.md](css-grid-drag-drop.md) → [challenges.md](challenges.md).
