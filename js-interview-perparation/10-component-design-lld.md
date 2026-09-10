# 10. Component Design / Low‑Level Design (Machine Coding)

Covers: component design principles · config‑driven UI · shimmer UI · routing & protected
routes · state management libraries · i18n · infinite scroll · accordion · nested
comments · image slider · pagination · real‑time updates · live chat UI · autocomplete

> Format tip for interviews: **clarify requirements → list components + data flow →
> define props/state/API → build incrementally → handle edge cases (loading/error/empty,
> a11y, perf) → discuss extensions.**

---

## 10.1 Component Design (LLD principles)

### Component API design

- **Single responsibility**; **composition over configuration** (compound components,
  `children`, slots) once props explode (>~7–10, boolean soup).
- **Controlled vs uncontrolled** — support both where sensible (`value`/`onChange` vs
  `defaultValue` + `ref`). Document which.
- **Prop patterns**: render props, compound components (`<Tabs><Tab/></Tabs>` via
  Context), headless/hooks (`useCombobox`), polymorphic `as` prop, `asChild` (Radix
  Slot), forwardRef, spreading `...rest` to the root, `className`/`style` overrides +
  design‑token variants (CVA / Tailwind variants).
- **State colocation**: keep state as local as possible; lift only when shared; derive
  don't store.
- **Separation**: presentational (dumb) vs container (data) — or hooks for logic +
  components for view.
- **Accessibility built in** (roles, keyboard, focus) — see §8.
- **Performance**: `React.memo` + stable props (`useCallback`/`useMemo`), list
  virtualization, `key` correctness, avoid inline object/array literals, split contexts,
  lazy‑load heavy children.
- **Error boundaries**, Suspense boundaries, loading/empty/error states as first‑class.
- **Testability**: predictable props, `data-testid` sparingly, no hidden globals.
- **Reusability checklist**: theming, i18n, RTL, responsive, SSR‑safe (no `window` at
  module scope), tree‑shakeable, typed props, Storybook stories.

### File/folder & design‑system layering

Primitives (Button, Input) → composites (SearchBar, Card) → features (ProductList) →
pages. Tokens → primitives → patterns. Keep dependencies pointing downward.

### SOLID / patterns you can name

Container/Presentational, HOC, Render Props, Custom Hooks, Provider, Compound Components,
Observer (event bus), Factory (component maps for config‑driven UI), Strategy
(pluggable behaviours), Facade (API client).

---

## 10.2 Config‑Driven UI

Render UI from a **data/schema config** (often server‑supplied JSON) instead of
hardcoded JSX. Powers dynamic forms, dashboards, feed cards, CMS pages, low‑code.

```jsx
const COMPONENTS = { text: TextField, select: SelectField, group: FieldGroup };
function Renderer({ config }) {
  return config.map((node) => {
    const Cmp = COMPONENTS[node.type];
    return Cmp ? <Cmp key={node.id} {...node.props} /> : null;
  });
}
```

- **Pros**: change UI without redeploy (server drives it), A/B/personalization, consistent
  rendering, one renderer for many screens, non‑devs can edit config.
- **Cons**: config schema becomes an API contract (version it), harder to type, debugging
  is indirect, validation needed, limited to registered component types, security
  (never `eval` config; sanitize any HTML; whitelist component types + prop shapes).
- **Design**: component registry/map (Factory), schema per node (`type`, `props`,
  `children`, `visibleWhen`, `validation`), conditional logic + expressions (safe
  evaluator), data binding (`{{user.name}}`), events mapping to actions, fallback for
  unknown types, JSON Schema / Zod validation of config.
- Real examples: JSON Forms, Formily, React JSONSchema Form, Builder.io, server‑driven UI
  (Airbnb, Lyft).

---

## 10.3 Shimmer UI (Skeleton screens)

Placeholder blocks mimicking content layout shown while data loads.

- **Why**: better *perceived* performance than a spinner; sets layout expectation;
  reduces **CLS** if skeleton matches final dimensions; feels faster than blank/spinner.
- **Implementation**: gray blocks matching content shape; animated gradient sweep
  (`@keyframes` translating a `linear-gradient`, or `background-position`); component
  per content type (`<PostSkeleton/>`, `<CardSkeleton/>`); render while `isLoading`.
- **Best practices**: match real layout dimensions closely; don't shimmer for < ~300ms
  loads (flash) — delay showing; cap max display time then show content/error; respect
  `prefers-reduced-motion` (no sweep animation); mark `aria-hidden` + provide
  `aria-busy="true"` / `role="status"` "Loading" for SR; reuse the same layout component
  with a `loading` prop so skeleton and content can't drift.
- Related: **stale‑while‑revalidate** (show cached data instead of skeleton),
  progressive/streaming rendering, blur‑up images, optimistic UI.

---

## 10.4 Routing & Protected Routes

### Client‑side routing basics

- **History API** (`pushState`, `replaceState`, `popstate`) vs **hash** routing
  (`#/path`, no server config, worse SEO).
- React Router / TanStack Router / Next.js: route config, dynamic segments (`/user/:id`),
  nested/layout routes + `<Outlet>`, index routes, splat/catch‑all (404), search params,
  **lazy routes** (`React.lazy` / route‑level `import()`), data loaders + actions,
  scroll restoration, `<Link>` prefetch on hover/viewport.

### Protected routes

```jsx
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children; // optionally also check roles/permissions here
}
```

- **Patterns**: wrapper component, route‑config `meta: { requiresAuth, roles }` + a
  guard, layout route that gates its children, HOC.
- **Redirect back** after login (`state.from` / `?redirect=`), validate the redirect
  target (open‑redirect, §3.6).
- **Role/permission gating**: route‑level + component‑level (`<Can permission="...">`),
  server must still enforce — client gating is UX only.
- **Auth check**: token in memory + refresh cookie; on app boot, silent refresh /
  `/me` call → show splash until resolved to avoid flash of login page.
- **SSR/Next**: `middleware.ts` for edge redirects, `getServerSideProps` / server
  component checks, don't leak protected data to client.
- Handle: expired token mid‑session (interceptor → refresh → retry, or redirect),
  deep‑link to protected page while logged out, logout clears state + redirects,
  multi‑tab logout (storage event / BroadcastChannel).

---

## 10.5 State Management Libraries

(See §6.11 for the full breakdown.) Quick machine‑coding guidance:

- **Local**: `useState`/`useReducer`. **Server data**: React Query / SWR. **URL**: query
  params. **Global UI**: Zustand (default) or Redux Toolkit (large/complex).
- Build a **mini store** if asked:

```js
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    getState: () => state,
    setState: (partial) => {
      state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
      listeners.forEach((l) => l());
    },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  };
}
// hook: useSyncExternalStore(store.subscribe, store.getState)
```

- Talk about: selectors + equality to prevent re‑renders, middleware (logger, persist,
  thunk), immutability / Immer, devtools, SSR hydration, `useSyncExternalStore` as the
  official subscription primitive.

---

## 10.6 Multi‑Language Support (i18n / l10n)

- **i18n** = making the app translatable; **l10n** = the actual translations + regional
  formatting.
- **Libraries**: `react-i18next` / `i18next`, `react-intl` (FormatJS), `LinguiJS`,
  `next-intl` / Next.js i18n routing.
- **Message catalogs** per locale (`en.json`, `fr.json`), keyed strings, **ICU
  MessageFormat** for plurals/gender/select/number/date:
  `{count, plural, one {# item} other {# items}}`.
- **Interpolation** with components (`<Trans>`), never string‑concatenate sentences
  (word order differs).
- **Formatting** via `Intl`: `Intl.NumberFormat`, `Intl.DateTimeFormat`,
  `Intl.RelativeTimeFormat`, `Intl.PluralRules`, `Intl.ListFormat`, `Intl.Collator`
  (sorting), currency, units.
- **Loading strategy**: lazy‑load the active locale's bundle (code‑split by locale),
  namespace splitting, fallback locale chain (`fr-CA → fr → en`).
- **Locale detection**: URL (`/fr/…` — best for SEO), subdomain, `Accept-Language`,
  cookie/localStorage preference, user setting. Persist choice.
- **RTL**: `dir="rtl"`, CSS logical properties (`margin-inline-start`, `inset-inline`),
  mirror icons/animations, `:dir()` selector.
- **Pitfalls**: text expansion (German ~30% longer — flexible layouts, no fixed widths /
  truncation of critical text), pluralization rules vary (Arabic has 6), date/number/
  currency/timezone, translated `alt`/`aria-label`/`<title>`/meta, `lang` attribute,
  pseudo‑localization for testing, don't hardcode strings, extract with a linter,
  translator context/screenshots, handle missing keys gracefully.
- **SSR**: send correct locale + `dir` in initial HTML; `hreflang` tags; localized
  routes in sitemap.

---

## 10.7 Infinite Scroll

Load more content as the user nears the bottom.

### Implementation

```jsx
const sentinelRef = useRef(null);
useEffect(() => {
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && hasMore && !loading) loadNextPage();
  }, { rootMargin: '400px' }); // prefetch before it's visible
  if (sentinelRef.current) io.observe(sentinelRef.current);
  return () => io.disconnect();
}, [hasMore, loading]);
```

- **`IntersectionObserver`** (not scroll listener) on a sentinel element near the end.
- **Cursor/keyset pagination** from the API (stable under inserts), not offset.
- **De‑dupe** in‑flight requests; guard with `loading` + `hasMore`.
- **Virtualization** (`react-window` / `@tanstack/virtual`) for long lists — otherwise
  thousands of DOM nodes kill memory + scroll perf.
- **UX**: loading spinner at the bottom, error + retry row, "you're all caught up" end
  state, maintain scroll position on prepend (chat) — measure + adjust `scrollTop`.
- **A11y / SEO issues**: keyboard users + SR can't easily reach footer; provide a
  "Load more" button as well or instead; SEO crawlers may not scroll → paginated URLs
  or SSR first N + `rel=next`.
- **Scroll restoration** on back navigation: cache the loaded pages + scroll offset
  (sessionStorage / router state).
- Consider **"Load more" button** or classic pagination when footer access matters
  (see 10.11).

---

## 10.8 Accordion

Vertically stacked headers that expand/collapse a panel.

### Requirements to clarify

Single‑open vs multi‑open? Controlled? Default open items? Animated?

### Structure

- Header = **`<button>`** with `aria-expanded` and `aria-controls={panelId}`.
- Panel = region with `id`, `role="region"`, `aria-labelledby={headerId}`, hidden via
  `hidden` attribute (or height animation) when collapsed.
- Keyboard: Enter/Space toggle; (optional APG) Up/Down between headers, Home/End.
- State: `openItems: Set<id>`; single mode replaces, multi mode toggles membership.
- **Animation**: `hidden` toggles instantly; for smooth height use
  `grid-template-rows: 0fr → 1fr` trick, or measure `scrollHeight` and animate
  `max-height`, or the `details`/`::details-content` + `interpolate-size` modern
  approach.
- Native option: `<details>`/`<summary>` (multi‑open free; group with `name` attr for
  single‑open exclusive accordion).
- Edge cases: nested accordions, dynamic content changing panel height, deep‑link to an
  item (open on mount + scroll into view), lazy‑render panel content, `prefers-reduced-
  motion`.

---

## 10.9 Reddit‑style Nested Comments

### Data model

```
Comment { id, parentId | null, author, text, createdAt, score, children?: Comment[] }
```

- API returns either a **flat list** (build the tree client‑side) or a **nested tree**
  (paginated by depth / "load more replies").
- Build tree: map `id → node`, then link each node to `map[parentId].children`; roots =
  `parentId == null`.

### Rendering — recursion

```jsx
function Comment({ node, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ marginLeft: depth ? 16 : 0 }}>
      <button onClick={() => setCollapsed(c => !c)}>{collapsed ? '+' : '−'}</button>
      <CommentBody node={node} />
      {!collapsed && node.children?.map(child => (
        <Comment key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
```

- **Collapse/expand** subtree; show hidden count.
- **Deep nesting**: cap visual indentation past N levels, or "continue this thread" link
  that navigates to a permalink rooted at that comment.
- **Performance**: virtualize/flatten very large threads, lazy‑load replies, memoize
  nodes, paginate siblings ("load 20 more comments").
- **Features**: add reply (optimistic insert at right parent), edit/delete (tombstone
  "[deleted]" if it has children), vote (optimistic + debounce), sort (best/top/new/
  controversial), permalink, real‑time new comments (merge without losing scroll).
- Recursion depth / stack: convert to iterative build if threads can be huge.

---

## 10.10 Image Slider / Carousel

### Core

- Track (flex row) of slides inside an `overflow: hidden` viewport; translate the track
  by `-index * 100%`, or use **CSS scroll‑snap** (`scroll-snap-type: x mandatory`) +
  `scrollIntoView` — simpler, native momentum, less JS.
- State: `currentIndex`; `next`/`prev` with clamping or wrap‑around (for infinite, clone
  first/last slides or use modulo + reposition).
- Controls: prev/next buttons (disable at ends if not infinite), dot indicators
  (`aria-current`), keyboard (arrows), swipe (pointer events / touch delta), optional
  autoplay.

### Details that impress

- **Autoplay**: pause on hover, on focus‑within, when tab hidden
  (`visibilitychange`), and when `prefers-reduced-motion`; provide a play/pause control
  (WCAG — moving content).
- **A11y**: `role="region"` + `aria-roledescription="carousel"` + label; each slide
  `aria-roledescription="slide"` + "3 of 8"; announce slide changes politely; controls
  are real buttons; don't trap keyboard; visible focus.
- **Perf**: lazy‑load off‑screen images (`loading="lazy"` + `fetchpriority` for first),
  `srcset`/`sizes`, preload the next image, `will-change: transform` only during
  animation, `content-visibility` for far slides.
- **Responsive**: multiple slides per view via CSS (`flex-basis` / grid), recalc on
  resize (ResizeObserver).
- **Edge cases**: 0/1 slide (hide controls), dynamic slides, RTL direction, drag vs
  click disambiguation (threshold), snapping after partial swipe.

---

## 10.11 & 10.12 Pagination (Part 1 & 2)

### Part 1 — UI component

- Props: `totalItems` (or `totalPages`), `currentPage`, `pageSize`, `onPageChange`,
  `siblingCount`, `boundaryCount`.
- **Page range algorithm**: always show first + last; show `siblingCount` pages each side
  of current; insert `…` ellipsis where there's a gap; keep the control a **stable width**
  (don't jump as numbers grow).
- Include Prev/Next (disabled at bounds), optionally First/Last, "page X of Y",
  page‑size selector, jump‑to‑page input.
- **A11y**: `<nav aria-label="Pagination">`, links/buttons with
  `aria-label="Go to page 3"`, `aria-current="page"` on current, ellipsis is
  `aria-hidden` / non‑interactive.

```js
function paginationRange({ current, total, siblings = 1 }) {
  const totalNumbers = siblings * 2 + 5; // first,last,current,2 ellipsis
  if (total <= totalNumbers) return range(1, total);
  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;
  if (!showLeftDots && showRightDots) return [...range(1, 3 + 2 * siblings), '…', total];
  if (showLeftDots && !showRightDots) return [1, '…', ...range(total - (2 + 2 * siblings), total)];
  return [1, '…', ...range(left, right), '…', total];
}
```

### Part 2 — data / architecture

- **Offset pagination** (`?page=3&limit=20` → `OFFSET 40`): supports random page access
  + total count, but **drifts** when items are inserted/deleted (skips/dupes) and is
  **slow for deep pages** (DB scans offset rows).
- **Cursor / keyset** (`?after=<opaque cursor>` encoding last seen sort key + id):
  **stable**, O(1)‑ish deep pages, best for feeds/infinite scroll; **no random access**,
  no exact total, needs a stable unique sort key.
- **Where pagination state lives**: **URL query params** — shareable, bookmarkable,
  back‑button works, SSR‑friendly, SEO (`rel=prev/next`, canonical). Sync component
  `currentPage` ↔ `?page`.
- **Client concerns**: cache pages (React Query `keepPreviousData` / `placeholderData`
  to avoid flashing), prefetch next page on hover/idle, handle out‑of‑range page (clamp / 404),
  loading skeleton for the table rows only, preserve scroll, debounce rapid clicks,
  reset to page 1 when filters/sort change.
- **Infinite scroll vs numbered**: numbered for goal‑oriented/reference (search results,
  admin tables, SEO); infinite for exploratory feeds. "Load more" button is the
  compromise (footer reachable, no auto‑fetch surprises).

---

## 10.13 Real‑Time Updates (UI)

Bringing live data into the UI (prices, presence, notifications, collaborative state).

- **Transport** (see §2): WebSocket (bidi/chat/collab), SSE (server→client feeds), long
  polling fallback, or plain polling for low‑freq.
- **Client architecture**:
  - Single shared connection (context/singleton), not one per component; subscribe/
    unsubscribe by topic.
  - **Reconnection** with exponential backoff + jitter; resubscribe + **resync** on
    reconnect (fetch snapshot, then apply buffered deltas; use a version/seq to detect
    gaps).
  - **Message queue / buffer** while disconnected; flush on reconnect.
  - Apply updates to the store; **merge** with local optimistic state carefully.
- **Rendering perf**: batch high‑frequency updates (`requestAnimationFrame` /
  throttle / `useDeferredValue`); only re‑render affected rows (normalized store +
  selectors + memo + virtualization); coalesce bursts.
- **Consistency**: server is source of truth; last‑write‑wins vs **CRDT/OT** for
  collaborative editing; show "stale"/"reconnecting" indicators; conflict resolution UX.
- **Correctness**: dedupe by message id, handle out‑of‑order (seq numbers), idempotent
  apply.
- **Edge cases**: tab backgrounded (pause/reduce, then resync), many tabs
  (BroadcastChannel / SharedWorker to share one socket), auth token expiry mid‑stream,
  memory growth (cap list length), notification permission, presence heartbeat + "user
  left" on disconnect timeout.

---

## 10.14 YouTube Live Stream Chat UI

A high‑volume, append‑only real‑time chat.

### Challenges & solutions

- **Message firehose** (hundreds/sec): don't render every message.
  - **Sampling / rate‑limiting** display (YouTube actually drops messages client‑side).
  - **Buffer** incoming, flush to UI on a timer (e.g. every 200–500ms) in batches via
    `requestAnimationFrame`.
  - **Cap the DOM**: keep only the last ~150–250 messages; drop from the top (ring
    buffer). Virtualize if keeping more.
- **Auto‑scroll behaviour**: stick to bottom while the user is at the bottom; if the
  user scrolls up, **pause auto‑scroll** and show a "▼ New messages" chip; resume on
  click / scroll‑to‑bottom.
  - Maintain scroll: when trimming from the top, adjust `scrollTop` so the view doesn't
    jump.
- **Rendering**: each message = avatar + name (badges: moderator, member, owner) +
  parsed text (emoji/emote replacement, links → anchors with `rel=noopener`, **sanitize**
  — untrusted user text, §3.3), super‑chat/highlighted messages pinned/colored.
- **Transport**: WebSocket or SSE; for pure viewing SSE is enough; sending needs a POST
  or WS. Long‑poll fallback (YouTube historically used long polling).
- **State**: `messages` array (bounded), `pinned`, `isAtBottom`, `pendingCount`,
  connection status.
- **Perf**: memoized message rows, `content-visibility: auto`, avoid layout thrash
  (measure then mutate), throttle emoji parsing (precompute regex, cache parsed nodes),
  Web Worker for heavy parsing if needed.
- **Features**: slow mode, moderation (delete → remove by id, timeout user → filter),
  emoji picker, mentions, replies, message send with optimistic echo + rate limit,
  reconnect resync (fetch recent N on reconnect), backgrounded tab throttling.
- **A11y**: `role="log"` `aria-live="polite"` but *don't* announce every message
  (overwhelming) — announce sparingly or offer a "screen reader mode"; keyboard access
  to input; focus management.

---

## 10.15 Autocomplete / Search Bar (Typeahead)

### Behaviour

1. User types → **debounce** (~200–300ms) → fire request (or filter local data).
2. Show dropdown of suggestions; highlight the matched substring.
3. Keyboard: **Down/Up** move active option, **Enter** select, **Esc** close, **Tab**
   accept/close, Home/End.
4. Click or Enter → fill input, close, trigger search / navigate.

### Correctness

- **Debounce** input; also **cancel stale requests** (`AbortController`) and **ignore
  out‑of‑order responses** (track latest query / request id — response for "reac" must
  not overwrite results for "react").
- **Cache** results per query (`Map<query, results>`); serve instantly on repeat /
  backspace; LRU cap.
- **Min characters** before querying (e.g. ≥ 2); trim; handle empty → show recent
  searches / popular.
- **Loading / error / no‑results** states in the dropdown; keep old results visible with
  a subtle spinner (avoid flicker).
- **Prefetch** on focus (recent/trending). Optional: preconnect to the search API.

### Accessibility (WAI‑ARIA combobox pattern)

- Input: `role="combobox"`, `aria-expanded`, `aria-controls={listboxId}`,
  `aria-activedescendant={activeOptionId}`, `aria-autocomplete="list"`.
- List: `role="listbox"` with `role="option"` children, `aria-selected` on active.
- Announce result count via a visually‑hidden `aria-live` region ("5 suggestions").
- Don't move DOM focus to options — use `aria-activedescendant` so typing continues.

### Performance & scale

- Local dataset: precompute lowercased index / trie / use a lib (Fuse.js for fuzzy,
  `match-sorter`). Large remote: server does the ranking (Elasticsearch / Algolia /
  Typesense).
- Virtualize long suggestion lists; cap to top N (~10).
- Fuzzy matching, typo tolerance, synonyms, ranking (popularity + recency + match
  quality), category‑grouped results, "search for '<query>'" fallback row.
- Analytics: log queries + selections (privacy aware) to improve ranking.

### Component skeleton

```jsx
function Autocomplete({ fetchSuggestions }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const cache = useRef(new Map());
  const reqId = useRef(0);

  const search = useMemo(() => debounce(async (q) => {
    if (q.length < 2) { setItems([]); return; }
    if (cache.current.has(q)) { setItems(cache.current.get(q)); return; }
    const id = ++reqId.current;
    const res = await fetchSuggestions(q);
    if (id !== reqId.current) return;          // stale response guard
    cache.current.set(q, res);
    setItems(res); setOpen(true);
  }, 250), [fetchSuggestions]);

  // onChange -> setQuery + search(q); onKeyDown -> move `active`, Enter select, Esc close
}
```
