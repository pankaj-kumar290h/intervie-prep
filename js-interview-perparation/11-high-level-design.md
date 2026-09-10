# 11. Frontend High‑Level Design (HLD)

Covers: HLD framework · Instagram · Amazon/Flipkart · Twitter/Facebook feed · Netflix ·
Spotify · CricInfo/Cricbuzz · Email client · Excalidraw · Analytics dashboard

> **Frontend** system design ≠ backend system design. Focus on: client architecture,
> component model, state/data flow, API design (what the client needs), rendering
> strategy, caching, performance, offline, real‑time, accessibility, i18n, security,
> observability. Mention backend only where it shapes the client contract.

---

## 11.1 HLD Framework (use this structure every time)

1. **Requirements**
   - *Functional*: core user features (list them, confirm scope, pick 2–3 to go deep).
   - *Non‑functional*: performance targets (CWV), scale (DAU, payload sizes), devices/
     browsers, offline, real‑time needs, i18n/RTL, a11y (WCAG AA), SEO, security.
2. **Assumptions & scale math** – DAU, requests/user, payload size, image/video weight,
   feed size, update frequency.
3. **High‑level architecture** – SPA / MPA / SSR / SSG / RSC / islands; micro‑frontends?
   CDN + edge; BFF (backend‑for‑frontend) layer; client ↔ API ↔ services.
4. **API design** – REST vs GraphQL vs gRPC‑web; endpoints/queries the client needs;
   pagination style; real‑time transport (WS/SSE/poll); batching; error contract.
5. **Data model / client state** – entities, normalization, cache layers, what's server
   state vs UI state vs URL state.
6. **Component architecture** – page → sections → components; which are lazy; design
   system; container vs presentational.
7. **Rendering & performance** – rendering pattern per route, code splitting,
   virtualization, image/video strategy, prefetch, skeletons, budgets, CWV levers.
8. **Caching** – HTTP cache, CDN, Service Worker, in‑memory query cache, IndexedDB,
   optimistic updates, offline.
9. **Cross‑cutting** – auth, security (XSS/CSP/CSRF), a11y, i18n/l10n, analytics/RUM/
   error tracking, feature flags/experiments, theming.
10. **Trade‑offs & bottlenecks** – call out what you'd optimize next, failure modes,
    scaling concerns.

**Common building blocks reused below**: infinite feed + virtualization + cursor
pagination; normalized cache (React Query/Redux); optimistic mutations; media CDN with
adaptive formats; Service Worker offline shell; WebSocket/SSE for live data;
skeleton/shimmer loading; RSC/SSR for first paint + SEO; feature flags.

---

## 11.2 HLD: Photo Sharing App (Instagram)

**Core scope**: feed (infinite), post detail, create post (upload + filters), stories,
profile, likes/comments (real‑time‑ish), explore/search.

- **Rendering**: SSR/RSC for profile + post pages (SEO, shareable, OG tags); feed is
  client‑driven infinite scroll after an SSR'd first screen. App shell + Service Worker.
- **Feed**:
  - **Cursor pagination** (`GET /feed?after=<cursor>&limit=10`), returns posts with
    pre‑signed media URLs + first page of comments + like state.
  - **Virtualized list** (`@tanstack/virtual`) — feed can be thousands of items;
    variable heights (measure + cache).
  - **IntersectionObserver** sentinel to prefetch next page (`rootMargin` ahead).
  - **Media**: `<img srcset>` with multiple resolutions from an image CDN (AVIF/WebP),
    LQIP/blurhash placeholder, `loading="lazy"` except first 1–2, `content-visibility`
    for far items. Video: autoplay muted when ≥ 50% visible via IO, pause off‑screen,
    HLS for longer clips, only one playing at a time.
  - **Scroll restoration** on back nav (cache pages + offset in sessionStorage / router
    state).
- **Likes/comments**: **optimistic updates** with rollback; debounce double‑tap like;
  comment posting optimistic with temp id → reconcile. New comments via **polling on
  focus** or SSE on the post detail.
- **Create post**: client‑side image resize/compress (`<canvas>` / `createImageBitmap` /
  OffscreenCanvas in a Worker), filters via CSS/WebGL, **direct‑to‑S3 upload** with
  pre‑signed URL, **resumable/chunked** upload for video (tus), progress UI, retry,
  Background Sync if offline.
- **Stories**: preloaded queue (prefetch next 1–2), progress bar segments, tap L/R,
  pause on hold, auto‑advance; mark seen (batch beacon).
- **State**: normalized entity cache (`posts`, `users`, `comments` by id); React Query
  for server cache; UI state (modals, composer) in Zustand.
- **Cross‑cutting**: OG/Twitter meta for shares; a11y (alt text prompt on upload, focus
  mgmt in modal/story viewer, `prefers-reduced-motion` for autoplay); CSP for
  user‑content domains; i18n.
- **Bottlenecks**: feed media bandwidth (adaptive formats, CDN, lazy), long list DOM
  (virtualize), re‑render storms (memo + normalized selectors).

---

## 11.3 HLD: E‑commerce App (Amazon / Flipkart)

**Core scope**: home, search + filters, category/PLP, product detail (PDP), cart,
checkout, orders. SEO and conversion are king.

- **Rendering per route**:
  - Home / PLP / PDP → **SSR or ISR** (SEO, fast LCP, fresh price/stock; personalize
    with a client hydration pass or edge).
  - Cart / checkout / account → **CSR** (behind auth, no SEO need).
- **PDP**: SSR the above‑the‑fold (title, price, image, buy box); lazy‑load reviews,
  recommendations, Q&A, "frequently bought together" (separate calls, Suspense
  boundaries). Image gallery with zoom, variant selector updates price/stock/images.
- **Search / PLP**:
  - Filters + sort + pagination in **URL query params** (shareable, SEO, back button).
  - **Faceted filters**: server returns facet counts; optimistic filter UI; debounce;
    keep results visible while refetching (`placeholderData`).
  - Numbered pagination (SEO, `rel=prev/next`, canonical) — not infinite scroll for
    indexable pages; "load more" hybrid acceptable.
  - Autocomplete search bar (see 10.15) backed by Algolia/Elasticsearch.
- **Cart**: source of truth on server (multi‑device) + optimistic local mirror; merge
  guest cart on login; handle price/stock changes at checkout (re‑validate); persist
  guest cart in localStorage.
- **Checkout**: multi‑step wizard, state in memory + sessionStorage; **address/payment
  validation** client + server; **PCI** — use hosted payment fields (Stripe Elements /
  Braintree) so card data never touches your JS (SAQ‑A, §3.9); idempotency key on
  "place order"; disable button + spinner to prevent double‑submit; 3DS redirect flow.
- **Performance**: strict budgets (LCP < 2.5s on 4G mid device), critical CSS, defer
  third‑party (analytics, chat, A/B) to idle, image CDN + AVIF + `fetchpriority` on hero,
  route prefetch on hover, skeletons for PLP grid + PDP.
- **Resilience**: graceful degradation of recommendation/personalization widgets (they
  fail independently), retry with backoff, stale price banner.
- **Cross‑cutting**: structured data (JSON‑LD Product/Offer/BreadcrumbList), hreflang +
  currency/locale, consent management before ad/analytics tags, experiment framework
  with anti‑flicker, RUM + conversion funnel analytics, error tracking on checkout as
  SEV1.
- **Bottlenecks**: third‑party script weight, PDP TTFB (cache + edge), search latency,
  cart consistency across devices.

---

## 11.4 HLD: News/Media Feed (Facebook / Twitter)

**Core scope**: home timeline (infinite, ranked), compose, post detail + replies, likes/
reposts, notifications, real‑time new‑post indicator.

- **Feed delivery**: backend does fan‑out + ranking; client requests
  `GET /timeline?cursor=…`. Client shows **"N new posts"** pill (poll head of feed on
  interval / focus, or SSE) — prepend without moving scroll (adjust `scrollTop`).
- **Virtualized infinite list** with variable heights; recycle DOM; cache rendered page
  data; scroll restoration on back.
- **Normalized store**: `posts`, `users`, `threads` by id — a post appears in timeline,
  profile, and detail; update once. Reposts reference the original.
- **Optimistic**: like/repost/bookmark instant with rollback; compose → optimistic insert
  at top with "sending" state; reply → optimistic in thread.
- **Post detail / replies**: nested/threaded (see 10.9), "show more replies" pagination,
  real‑time new replies merged.
- **Composer**: mentions + hashtag autocomplete, media upload (as Instagram), draft
  autosave (localStorage), character counter, link preview (server‑side unfurl → SSRF
  safe, §3.11).
- **Rendering**: SSR/RSC for individual post + profile pages (SEO, embeds, OG cards);
  timeline is client after first screen. App shell cached in SW.
- **Real‑time**: SSE or WebSocket for notifications + live counters; batch/throttle
  counter updates; presence not needed.
- **Performance**: text‑heavy so JS + hydration cost dominate → RSC / partial hydration,
  minimal client JS, `content-visibility`, defer media. INP focus (feed interactions).
- **Cross‑cutting**: a11y `role="feed"` + `aria-busy`, keyboard nav between articles,
  reduced motion, i18n/RTL, robust link sanitization (XSS), CSP.
- **Bottlenecks**: timeline re‑render on updates (granular subscriptions), long‑session
  memory growth (cap list, unmount far items), notification fan‑out.

---

## 11.5 HLD: Video Streaming (Netflix)

**Core scope**: browse (rows of rails), title detail, video player, search, continue
watching, profiles.

- **Browse page**:
  - **Horizontally‑scrolling rails**, each lazy‑loaded as it nears viewport (IO);
    within a rail, virtualize/paginate ("load more" on horizontal scroll end).
  - Artwork from image CDN, multiple sizes, AVIF/WebP, lazy, preview‑on‑hover video
    (muted, low‑res, after ~400ms hover).
  - **SSR first screen** for TTFB/LCP + SEO of title pages; rails hydrate progressively.
- **Player** (the meat):
  - **Adaptive Bitrate Streaming**: **HLS**/**DASH** via **Media Source Extensions**
    (`hls.js` / `shaka-player` / `dash.js`); segments (2–10s) at multiple renditions;
    **ABR algorithm** picks rendition from bandwidth estimate + buffer level.
  - **DRM**: **EME** (Encrypted Media Extensions) — Widevine / PlayReady / FairPlay;
    license request flow.
  - Buffering strategy: forward buffer target, prefetch next segments, seek → flush +
    refill; startup uses low rendition then ramps.
  - **Preload** next episode's manifest + first segments near end of current; "skip
    intro" (server‑provided markers); resume position (send heartbeats every ~10–30s +
    on pause/exit via `sendBeacon`).
  - Player UI: custom controls (progress with thumbnails/sprites, volume, captions menu,
    quality, playback rate), keyboard shortcuts, PiP, fullscreen, `MediaSession` API
    (lock‑screen controls), captions (WebVTT), audio track switching.
- **Performance / TV constraints**: low‑end TV/console CPUs → minimal JS, avoid heavy
  re‑renders, GPU‑friendly animations, image budget, spatial (D‑pad) navigation +
  focus management.
- **State**: profile, continue‑watching list, "my list" (optimistic), player state
  (mostly local/ref, not React state for high‑freq time updates — use refs + rAF).
- **Cross‑cutting**: CDN selection (multi‑CDN, client‑side switching on errors),
  QoE analytics (startup time, rebuffer ratio, bitrate, errors) — critical RUM;
  A/B on artwork + ABR params; a11y (captions, described audio, focus); i18n subtitles.
- **Bottlenecks**: rebuffering (ABR tuning, CDN), startup latency, TV memory, artwork
  bandwidth.

---

## 11.6 HLD: Music Streaming (Spotify)

**Core scope**: browse/search, playlist/album/artist pages, **persistent player bar**,
queue, likes, offline downloads, lyrics.

- **App structure**: SPA with a **persistent bottom player** that survives route changes
  (player lives above the router outlet; audio element never unmounts). Left nav +
  main scroll area + player = classic 3‑zone layout.
- **Audio playback**:
  - Progressive streaming or short segments; `<audio>` or MSE; formats: Opus/AAC at
    multiple bitrates chosen by connection + user setting.
  - **Gapless playback / crossfade**: preload next track (Web Audio API for crossfade;
    two audio elements swap), start buffering next when current is ~30s from end.
  - **Media Session API** for OS/lockscreen/headset controls + metadata + artwork.
  - Scrubbing, buffering indicator, "waiting for connection".
- **Queue model**: `currentTrack`, `queue[]`, `history[]`, `context` (playlist/album +
  shuffle/repeat state). Shuffle = deterministic seeded permutation. Repeat one/all.
- **Offline / PWA**: download tracks (encrypted) into **IndexedDB / Cache Storage** via
  Service Worker; download queue with progress; play from cache when offline; sync
  library metadata; respect storage quota + eviction (`persist()`).
- **State**: normalized cache for tracks/albums/artists/playlists; playback state in a
  dedicated store; optimistic like/add‑to‑playlist; **playback events** (play, skip, 30s
  threshold for a "stream") batched to analytics via beacon (also drives royalties —
  must be reliable, dedupe by event id).
- **Search**: instant typeahead across tracks/artists/playlists (grouped results),
  recent searches, debounce + cancel stale.
- **Real‑time**: "listening on another device" (Spotify Connect) → WebSocket for device
  state sync + remote control; collaborative playlist updates via WS.
- **Performance**: virtualize long track lists (playlists with 10k songs), image CDN for
  art, minimal re‑render on time updates (refs + rAF for the progress bar), route
  prefetch.
- **Cross‑cutting**: a11y (fully keyboard operable player, `aria` on controls,
  announce track changes), i18n, DRM for premium content, CSP.
- **Bottlenecks**: gapless/crossfade complexity, offline storage limits, long‑list perf,
  reliable playback‑event delivery.

---

## 11.7 HLD: Live Commentary (CricInfo / Cricbuzz)

**Core scope**: live match page — scorecard, ball‑by‑ball commentary feed, stats,
multi‑match list, notifications.

- **Update transport**:
  - **SSE** is the sweet spot (server→client only, auto‑reconnect with `Last-Event-ID`
    to replay missed balls, works through proxies, HTTP/2 multiplexing for multiple
    matches). WebSocket if you also push rich interactions.
  - **Polling fallback** with `ETag` / `since` cursor for locked‑down networks; adaptive
    interval (faster during play, slower between overs).
- **Data model**: `match` snapshot (score, batsmen, bowler, RR, RRR) + append‑only
  `commentary[]` (ball events) + `scorecard`. Each event has a monotonic `id`/seq →
  detect gaps → fetch missing range.
- **Rendering**:
  - Commentary feed = **prepend newest at top**, virtualized/capped; highlight
    boundaries/wickets; "over complete" summary rows.
  - Score header updates in place; animate score change subtly (respect reduced motion).
  - On reconnect: fetch snapshot + events since last seq, reconcile, don't duplicate.
- **Scale**: huge spikes (India match = tens of millions concurrent) → **CDN‑cached
  snapshots** (1–3s TTL) for the score/scorecard, SSE from edge, aggressive HTTP caching,
  static shell. Client backoff + jitter on reconnect storms.
- **Offline / background**: pause stream when tab hidden, resync on return; push
  notifications (wickets, milestones, match start) via Service Worker Push.
- **Multi‑match**: list page polls a lightweight aggregate endpoint; open match opens a
  dedicated stream.
- **Rendering strategy**: SSR the match page (SEO — people Google "IND vs AUS score"),
  then attach the live stream; JSON‑LD SportsEvent.
- **Cross‑cutting**: a11y `aria-live="polite"` for score (not every ball — announce
  wickets/boundaries + score), i18n, low‑end device + 2G/3G friendliness (tiny payloads,
  delta updates), RUM.
- **Bottlenecks**: fan‑out at spike scale (edge + cache + SSE), reconnect thundering
  herd, delta correctness.

---

## 11.8 HLD: Email Client (Gmail‑like)

**Core scope**: folder list, message list (threaded), reading pane, compose, search,
labels, offline.

- **Architecture**: SPA + heavy **offline‑first** (IndexedDB as local store, Service
  Worker). Three‑pane layout; keyboard‑driven (Gmail shortcuts).
- **Sync engine**:
  - Local **IndexedDB** mirror of messages/threads/labels; **incremental sync** via a
    server change cursor / history id (like Gmail API `historyId`) — pull deltas
    (added/removed/label‑changed), not full refetch.
  - **Optimistic** everything: archive/delete/label/read → apply locally + queue mutation
    in an **outbox** (IndexedDB) → **Background Sync** flushes when online → reconcile
    with server response (handle conflicts: server wins, re‑apply).
  - Send mail: queue in outbox, show "Sending", retry, "Undo send" (delay actual send
    5–30s).
- **Message list**: virtualized, thread grouping (collapse thread → count), lazy‑load
  bodies (list has headers/snippet only; fetch full body + attachments on open),
  pagination by cursor.
- **Reading rich HTML email safely**: render body in a **sandboxed iframe**
  (`sandbox` without `allow-same-origin`, no scripts), **sanitize** (DOMPurify),
  block remote images by default (privacy/tracking pixels) with "display images"
  opt‑in, rewrite links (`rel=noopener`, warn on external), CSP.
- **Compose**: rich text editor (contentEditable / ProseMirror / Lexical), draft
  autosave (debounced, to server + local), attachments (chunked upload, virus scan
  status), recipient autocomplete from contacts, inline images.
- **Search**: server‑side full‑text (operators `from: subject: has:attachment`); local
  cache search for offline; instant results + query suggestions.
- **State**: normalized (`messages`, `threads`, `labels`); selection state; current
  view (label + filters) in URL.
- **Performance**: fast folder switching (cache per label), prefetch next message on
  hover/selection, minimal re‑render (row memo), keyboard nav must be instant.
- **Cross‑cutting**: a11y (full keyboard model, `aria-live` for "message archived",
  focus moves to next message on archive/delete), i18n/RTL, push notifications for new
  mail, multi‑account, security (iframe isolation is the big one).
- **Bottlenecks**: sync conflict handling, large mailbox local storage, rich‑email
  rendering safety + performance, offline outbox correctness.

---

## 11.9 HLD: Diagram Tool (Excalidraw)

**Core scope**: infinite canvas, draw shapes/arrows/text/freehand, select/move/resize/
rotate, multi‑select, undo/redo, export, real‑time collaboration.

- **Rendering**: **HTML5 Canvas** (or WebGL for scale). Scene = array of elements
  `{ id, type, x, y, w, h, angle, points?, style, seed, version, versionNonce }`.
  Redraw on change; **only redraw dirty regions** / use layered canvases (static vs
  active); render at devicePixelRatio.
- **Viewport**: pan (`scrollX/Y`) + zoom (`scale`); transform scene→screen coords;
  **culling** — only render elements intersecting the viewport (spatial index / bounding
  boxes) so 10k elements stay smooth.
- **Interaction**: pointer events; hit‑testing (reverse z‑order, bounding box then
  precise); selection handles; snapping/guides; `requestAnimationFrame` render loop;
  keyboard shortcuts; tools state machine (selection/rectangle/arrow/draw/text).
- **State & history**: immutable‑ish scene; **undo/redo** = command stack or scene
  snapshots (debounced); persist to **localStorage/IndexedDB** (debounced autosave);
  export to `.excalidraw` JSON, PNG/SVG (render to offscreen canvas / serialize).
- **Real‑time collaboration**:
  - **CRDT** (or per‑element last‑write‑wins with `version` + `versionNonce`
    tiebreaker — Excalidraw's actual approach) so concurrent edits converge without a
    central lock.
  - Transport: WebSocket room; broadcast element diffs + **ephemeral** cursor/selection
    (throttled, not persisted); **E2E encryption** (Excalidraw encrypts scene client‑side,
    server is a relay — can't read content).
  - Reconciliation on join: fetch scene snapshot, then apply live updates; handle
    reconnect (resend local changes, merge).
  - Presence: colored cursors + name, follow‑user, "X is editing".
- **Performance**: throttle pointermove, batch state updates, `OffscreenCanvas` +
  Worker for heavy rendering/export, avoid React re‑render per frame (canvas is imperative;
  React only for UI chrome), memoize, `will-change`.
- **Cross‑cutting**: a11y is hard for canvas — provide keyboard shape creation/movement,
  text alternative/export, respect reduced motion; i18n for UI; large‑scene memory.
- **Bottlenecks**: render perf at scale (culling, dirty rects, layers), CRDT/merge
  correctness, collaboration latency, export fidelity.

---

## 11.10 HLD: Analytics Dashboard (Google Analytics)

**Core scope**: date‑range picker, KPI tiles, time‑series charts, tables with drill‑down,
segments/filters, real‑time view, custom report builder, exports.

- **Architecture**: SPA (behind auth, no SEO). Dashboard = grid of **widgets**, each an
  independent data‑fetching component (own query, loading/error state, refetch) —
  **config‑driven** (see 10.2): layout + widget configs in JSON, editable, saved per
  user.
- **Data / API**:
  - Query API takes `{ metrics, dimensions, dateRange, filters, segment, granularity,
    orderBy, limit }` → returns rows. GraphQL or a POST query endpoint.
  - **Server does aggregation** (OLAP store: BigQuery/ClickHouse/Druid); client never
    aggregates raw events.
  - **Caching**: cache by full query signature (React Query); dashboards reuse queries
    across widgets — **dedupe + batch** (combine widget queries in one request where
    possible); `staleTime` generous for historical ranges, short for "today".
  - **Comparison** ranges (vs previous period / year) = parallel queries.
- **Charts**: virtualization for big tables; downsample time‑series to ~pixel width
  (LTTB algorithm) before rendering; canvas/WebGL charts (uPlot, ECharts, visx) for
  large series; SVG fine for small. Tooltips, brush‑to‑zoom, legend toggle, cross‑filter
  (click a bar → filters other widgets).
- **Real‑time widget**: SSE/WebSocket or short polling (5–10s) of a live endpoint
  (active users, events/min); separate from historical path.
- **Date range + filters** in **URL** (shareable dashboards, back button); global
  filter bar propagates to all widgets (context/store) with a single "Apply" to avoid
  refetch storms.
- **Report builder**: drag metrics/dimensions, preview, validation (incompatible
  metric/dimension combos), save.
- **Exports**: CSV/PDF — large exports go async (job → download link / email) not
  in‑browser; scheduled reports.
- **Performance**: lazy‑load widgets below the fold, skeletons per widget, cancel
  in‑flight queries on range change, Web Worker for CSV parsing/formatting, memoized
  selectors, `content-visibility`.
- **Cross‑cutting**: timezone handling (display vs storage — huge source of bugs),
  currency/number/locale formatting (`Intl`), a11y (charts need data tables /
  `aria` summaries / keyboard), permissions (row/metric‑level access), sampling
  indicators ("results based on X% of sessions"), RUM + query‑latency monitoring.
- **Bottlenecks**: query latency + cost (cache, pre‑aggregation, sampling), rendering
  large datasets (downsample, virtualize, canvas), refetch storms on filter change
  (batch + debounce + single apply), timezone correctness.
