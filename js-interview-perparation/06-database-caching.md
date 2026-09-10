# 6. Client Storage, Caching & State Management

Covers: overview · localStorage · sessionStorage · cookies · IndexedDB · normalization ·
HTTP caching · service worker caching · API caching · state management

---

## 6.2 Overview — client storage options

| | Capacity | Persistence | Scope | Sent to server | API | Sync/async |
|---|---|---|---|---|---|---|
| **Cookies** | ~4KB each, ~50/domain | expiry / session | domain + path | **yes, every request** | `document.cookie` / `Set-Cookie` | sync |
| **localStorage** | ~5–10MB | forever until cleared | origin | no | `getItem/setItem` | sync (blocking!) |
| **sessionStorage** | ~5MB | per tab, until tab closed | origin + tab | no | same as localStorage | sync |
| **IndexedDB** | 100s of MB – GBs (quota %) | persistent | origin | no | transactional object store | **async** |
| **Cache Storage** | large (quota) | persistent | origin (SW) | no | `caches` / `Cache` | async (promises) |
| **Cookie Store API** | as cookies | | | | `cookieStore` (async) | async |

Storage eviction: under pressure browsers evict **best‑effort** storage; request
`navigator.storage.persist()` for durability. Check `navigator.storage.estimate()`.
Private mode / ITP can cap or clear (e.g. Safari clears script‑writable storage after
7 days of no interaction).

**Rule**: never store secrets/JWTs in localStorage (XSS‑readable). Small prefs →
localStorage. Structured/bulk/offline data → IndexedDB. Auth/session → HttpOnly cookie.

---

## 6.3 localStorage

- Synchronous key/value, strings only (`JSON.stringify`/`parse`). Per‑origin.
- **`storage` event** fires in *other* tabs of the same origin → cross‑tab sync.
- Downsides: **blocks the main thread** (bad for large/frequent writes → jank, INP),
  no indexes, no transactions, string‑only, ~5MB, not available in workers, can throw
  `QuotaExceededError` (Safari private mode throws on any write).
- Use for: theme, language, feature flags, last route, non‑sensitive UI state, "dismissed
  banner". Always wrap in try/catch and feature‑detect.

---

## 6.4 sessionStorage

- Same API as localStorage but **scoped to the tab/session** — cleared when the tab
  closes; a duplicated tab copies it; separate tabs are isolated; survives reload +
  in‑tab navigation within the origin.
- Use for: multi‑step form/wizard state, scroll restoration, one‑time redirect intent,
  per‑tab context you don't want leaking across tabs.

---

## 6.5 Cookie Storage

- Set by server (`Set-Cookie`) or JS (`document.cookie`, unless `HttpOnly`).
- Attributes:
  - **`HttpOnly`** – not readable by JS (XSS mitigation).
  - **`Secure`** – HTTPS only.
  - **`SameSite`** – `Lax` (default), `Strict`, `None; Secure` (cross‑site) — CSRF lever.
  - **`Domain` / `Path`** – scope. `__Host-` prefix = must be Secure, Path=/, no Domain.
  - **`Max-Age` / `Expires`** – persistence; omit → session cookie.
  - **`Partitioned`** (CHIPS) – separate cookie jar per top‑level site for embedded
    third‑party contexts (post‑third‑party‑cookie world).
- Cost: attached to **every matching request** → keep small, don't put app state here.
- Use for: session id / auth token (HttpOnly+Secure+SameSite), CSRF token
  (double‑submit), locale for SSR, A/B bucket for edge, consent.

---

## 6.6 IndexedDB

- Transactional, asynchronous, indexed NoSQL object database in the browser. Stores
  structured clone‑able values (objects, blobs, files, ArrayBuffers).
- Model: **database → object stores → records** (keyPath or out‑of‑line keys), **indexes**
  for querying by non‑key fields, **cursors** for iteration, **transactions**
  (`readonly` / `readwrite`, auto‑commit when microtask queue empties), **versioned
  schema** via `onupgradeneeded`.
- Works in **Web Workers / Service Workers** → good for background sync.
- Raw API is clunky → use wrappers: **`idb`** (Jake Archibald, promise‑based), **Dexie**,
  **localForage** (falls back localStorage), RxDB / PouchDB for sync.
- Use for: offline‑first apps, caching large API datasets, storing files/media for PWAs,
  outbox/queue for Background Sync, full‑text search indexes, draft documents.
- Gotchas: Safari historically buggy, eviction under pressure, no cross‑origin, schema
  migrations need care, blocked events when other tabs hold an old version open.

---

## 6.7 Normalization (client‑side data modeling)

- Store entities **flat, keyed by id**, reference by id instead of nesting duplicates —
  like a relational DB in your store.

```js
// denormalized (bad for updates)
{ posts: [{ id: 1, author: { id: 9, name: 'Ana' } }, { id: 2, author: { id: 9, name: 'Ana' } }] }

// normalized
{
  posts:   { 1: { id: 1, author: 9 }, 2: { id: 2, author: 9 } },
  users:   { 9: { id: 9, name: 'Ana' } },
  postIds: [1, 2],
}
```

- **Why**: single source of truth (update user once, reflected everywhere), no stale
  copies, cheaper updates, easy dedupe, predictable cache.
- **Cost**: need selectors to re‑assemble (denormalize) for the view; more boilerplate.
- Tools: **normalizr**, Redux Toolkit **`createEntityAdapter`**, RTK Query / Apollo /
  urql normalized caches (keyed by `__typename:id`), React Query (usually keeps response
  shape, normalize manually if needed).
- Use `reselect` / memoized selectors to avoid recomputing + unnecessary re‑renders.

---

## 6.8 HTTP Caching

### Two mechanisms

1. **Freshness (no request at all)** – `Cache-Control`:
   - `max-age=<s>`, `s-maxage` (shared caches/CDN), `no-cache` (revalidate every time),
     `no-store` (never cache), `private` / `public`, `immutable`,
     `stale-while-revalidate=<s>` (serve stale, refresh in background),
     `stale-if-error`.
   - Legacy: `Expires`, `Pragma`.
2. **Validation (conditional request)** – when stale:
   - `ETag` ↔ `If-None-Match`; `Last-Modified` ↔ `If-Modified-Since`. Server returns
     **304 Not Modified** (no body) or 200 with new content.

### Strategy

- **Hashed static assets** (`app.9f3a.js`): `Cache-Control: public, max-age=31536000, immutable`.
- **HTML**: `no-cache` (always revalidate) or short max-age → so new asset URLs propagate.
- **API GETs**: short `max-age` + `stale-while-revalidate`, or `ETag` for revalidation.
- CDN layering: `s-maxage` high + purge on deploy; `Vary` (Accept‑Encoding, Accept,
  sometimes Cookie — careful, Cookie kills cache hit rate).
- Cache locations: browser memory/disk cache, Service Worker, forward/reverse proxy, CDN.
- **Cache busting**: filename hash > query string.

---

## 6.9 Service Worker Caching

(See also §9.) SW sits between page and network, intercepts `fetch`, reads/writes
**Cache Storage**.

### Strategies

| Strategy | Behaviour | Use for |
|---|---|---|
| **Cache first** | cache → fallback network | hashed assets, fonts, app shell |
| **Network first** | network → fallback cache | HTML, frequently changing APIs |
| **Stale‑while‑revalidate** | serve cache now, update cache in bg | avatars, non‑critical API, CSS |
| **Cache only** | never hit network | precached offline assets |
| **Network only** | never cache | analytics, POSTs, auth |

- **Precache** (build manifest, revisioned) vs **runtime cache** (populated on use, with
  expiration + max entries).
- **Workbox** abstracts these (`workbox-strategies`, `precacheAndRoute`,
  `ExpirationPlugin`, `CacheableResponsePlugin`).
- Lifecycle: install (precache) → activate (clean old caches) → fetch. `skipWaiting` +
  `clients.claim` for immediate control (careful: version skew between page + SW).
- **Navigation preload** to avoid SW boot latency on navigations.
- Offline fallback page/image; **Background Sync** to retry failed writes; cache
  versioning + cleanup to avoid quota bloat.
- Pitfall: caching HTML too aggressively → users stuck on old app; always have an update
  path + "new version available, refresh" prompt.

---

## 6.10 API Caching (application layer)

- **In‑memory client cache** keyed by request (URL + params + body): **React Query /
  TanStack Query**, **SWR**, **RTK Query**, Apollo. Features: dedupe in‑flight requests,
  `staleTime` vs `cacheTime/gcTime`, background refetch, refetch‑on‑focus / reconnect /
  interval, pagination + infinite queries, optimistic updates + rollback, prefetching,
  query invalidation after mutations.
- **Stale‑while‑revalidate** pattern: instantly show cached data, revalidate in
  background, swap when new data arrives.
- **Normalization** (6.7) for entity‑level cache updates without refetch.
- **Persistence**: persist the query cache to localStorage/IndexedDB for instant cold
  start (with max‑age + buster on deploy).
- **Server/edge**: CDN caching of GET APIs (`s-maxage` + tag‑based purge), Redis /
  Memcache, GraphQL persisted queries + `@cacheControl`, Next.js Data Cache / `fetch`
  caching + `revalidateTag`.
- **Cache invalidation** approaches: TTL, event‑driven purge (on write), tag/key‑based,
  versioned keys, manual. "Two hard things" — be explicit about staleness tolerance per
  data type.
- Idempotency + `AbortController` for cancellation; request coalescing.

---

## 6.11 State Management

### Categories of state (don't manage them all the same way)

1. **Server cache state** – data owned by the backend → React Query / SWR / RTK Query /
   Apollo. *Not* Redux.
2. **Global client / UI state** – theme, auth user, modals, sidebar, cross‑page selections
   → Context (small), Zustand, Redux Toolkit, Jotai, Recoil, Valtio, XState.
3. **Local component state** – `useState` / `useReducer`.
4. **URL state** – filters, tabs, pagination, search → query params / router (shareable,
   back‑button friendly). Often the right place.
5. **Form state** – React Hook Form / Formik / TanStack Form.
6. **Machine / workflow state** – XState for complex flows (wizards, media players).

### Library models

- **Redux (Toolkit)** – single store, reducers, actions, middleware (thunk/saga/listener),
  time‑travel devtools, `createSlice` + `createEntityAdapter` + RTK Query. Predictable,
  scales, verbose; great for large teams / complex shared state / audit needs.
- **Zustand** – tiny hook‑based store, no boilerplate, selectors, middleware
  (persist, immer, devtools). Good default for most apps.
- **Jotai / Recoil** – atomic; bottom‑up; fine‑grained subscriptions, good for
  derived/async atoms, avoids provider re‑render storms.
- **Context API** – dependency injection, not a state manager; every consumer re‑renders
  on value change → split contexts, memoize value, or use a store lib for hot state.
- **Valtio / MobX** – proxy‑based mutable, automatic reactivity.
- **Signals** (Preact/Solid/Angular) – fine‑grained reactive primitives, minimal
  re‑render.

### Performance concerns

- Selector granularity + memoization (`useSelector` with equality fn, `reselect`).
- Avoid putting fast‑changing values (mouse pos, scroll) in global state.
- Normalize; keep derived data in selectors not the store.
- Colocate state as low as possible; lift only when shared.
- Persist deliberately (`redux-persist`, `zustand/persist`) with migrations + partialize.
