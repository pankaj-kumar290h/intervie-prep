# 5. Web Performance

Covers: overview · importance · monitoring · tools · network optimization · rendering
patterns · build optimization

---

## 5.1–5.2 Overview & Why It Matters

- **Business impact**: every 100ms of latency can cost measurable conversion (Amazon,
  Walmart, Pinterest case studies). Bounce rate rises sharply past 3s load. SEO — Core
  Web Vitals are a Google ranking signal. Accessibility + reach on low‑end devices /
  slow networks.
- **Perceived vs actual performance** – responsiveness, skeletons, optimistic UI and
  progress feedback often matter more than raw numbers.
- **RAIL model**: **Response** < 100ms, **Animation** 60fps (~16ms/frame, ~10ms budget),
  **Idle** work in ≤ 50ms chunks, **Load** interactive within ~5s on mid device / 3G
  (or the CWV targets).

### Core Web Vitals (field, p75)

| Metric | Good | What it measures | Main levers |
|---|---|---|---|
| **LCP** | ≤ 2.5s | largest element paint | TTFB, render‑blocking resources, image/font loading, hero preload, SSR/streaming |
| **INP** | ≤ 200ms | responsiveness to *all* interactions | long tasks, JS execution, main‑thread work, hydration, over‑rendering |
| **CLS** | ≤ 0.1 | visual stability | size attrs on media, reserved space for ads/embeds, no injecting content above, font‑swap |

Supporting: **TTFB**, **FCP**, **TBT** (lab proxy for INP), FID (deprecated).

---

## 5.3 Performance Monitoring

- **Lab / synthetic**: reproducible, pre‑deploy, controlled. Lighthouse, WebPageTest,
  Lighthouse CI, SpeedCurve, Calibre. Good for debugging + regression gates, not
  representative of real users.
- **Field / RUM**: real conditions, real devices, distributions not averages. Use
  `web-vitals` JS → send to your analytics; Google CrUX / PageSpeed Insights; Sentry,
  Datadog RUM, New Relic, Vercel Speed Insights, SpeedCurve LUX.
- Watch **p75 / p95**, segment by device class, country, connection, page type,
  logged‑in vs out, browser.
- Key APIs: `PerformanceObserver` (`largest-contentful-paint`, `layout-shift`,
  `event`, `longtask`, `long-animation-frame`), `Navigation Timing`, `Resource Timing`,
  `Server Timing` header, `performance.mark/measure`, `Element Timing`.
- **Performance budgets** + CI gates (Lighthouse CI assertions, bundlesize,
  `size-limit`). Alert on regression, not just absolute thresholds.
- Attribution: `web-vitals/attribution` build tells you *which element / script* caused
  a bad LCP/INP/CLS.

---

## 5.4 Performance Tools

- **Chrome DevTools**: Performance panel (flame chart, long tasks, main‑thread,
  interactions track), Performance Insights, Network (waterfall, priorities, blocking),
  Coverage (unused JS/CSS), Memory (heap snapshots, allocation timeline for leaks),
  Rendering (paint flashing, layer borders, FPS meter), Lighthouse panel, CPU/network
  throttling.
- **Lighthouse** – audits perf/a11y/SEO/best‑practices/PWA; `lighthouse` CLI, Lighthouse CI.
- **WebPageTest** – filmstrip, waterfall, multi‑location/device, `Speed Index`,
  connection view, request blocking experiments.
- **Bundle analysis** – `webpack-bundle-analyzer`, `rollup-plugin-visualizer` (Vite),
  `source-map-explorer`, `bundlephobia`, Next.js `@next/bundle-analyzer`.
- **React**: Profiler (flamegraph, why‑did‑you‑render, ranked commits), `<Profiler>` API,
  React DevTools "Highlight updates".
- `performance.now()`, `console.time`, User Timing marks, `PerformanceObserver`.
- `web-vitals` extension, CrUX dashboard / API, Chrome UX Report on BigQuery.

---

## 5.5 Network Optimization

### Reduce bytes

- **Compression**: Brotli (static + dynamic) > gzip. Compress text assets.
- **Minify** JS/CSS/HTML/SVG; tree‑shake; drop dead code, moment→dayjs, lodash→lodash‑es
  + per‑method.
- **Images**: right format (AVIF > WebP > JPEG/PNG), responsive `srcset`/`sizes`,
  `<picture>`, correct dimensions, `loading="lazy"`, `decoding="async"`,
  `fetchpriority="high"` for LCP image, CDN image resizing, blur‑up placeholders, strip
  metadata. **SVG** for icons (sprite / inline).
- **Fonts**: `woff2`, subset (unicode‑range), `font-display: swap` (or `optional`),
  preload the critical face, `size-adjust`/`ascent-override` to cut CLS, self‑host,
  limit weights.

### Reduce round trips / latency

- **CDN** + edge caching; cache static assets `immutable, max-age=31536000` with hashed
  filenames.
- **HTTP/2 or HTTP/3** (multiplexing; H3 removes TCP head‑of‑line blocking).
- Resource hints: `preconnect` / `dns-prefetch` for critical third‑party origins,
  `preload` critical CSS/font/hero image, `modulepreload`, `prefetch` next‑nav routes,
  Speculation Rules API for prerender/prefetch.
- **Critical CSS** inline, defer the rest (`media="print"` swap, or
  `rel="preload" as="style"`).
- `defer` / `async` scripts, `type="module"`, code‑split, lazy‑load below the fold.
- **Caching strategy**: `Cache-Control`, `ETag`/`Last-Modified`, stale‑while‑revalidate;
  Service Worker for offline + runtime caching (see §9).
- Avoid redirect chains, reduce request count, coalesce API calls, use HTTP caching /
  client cache (React Query) to dedupe.
- **Streaming SSR** + early flush + `103 Early Hints` for preloads.
- Prioritize: `fetchpriority`, script `type=module` async, avoid long request chains
  (dependency waterfalls) — flatten data fetching.

---

## 5.6 Rendering Patterns

| Pattern | Where HTML built | First paint | Interactive | Data freshness | Notes |
|---|---|---|---|---|---|
| **CSR** (SPA) | browser | slow (blank → JS → render) | after JS + fetch | always fresh | simplest deploy (static), bad SEO/LCP without care |
| **SSR** | server per request | fast HTML | after hydration | fresh | server cost, TTFB sensitive, hydration cost |
| **SSG** | build time | fastest (CDN) | after hydration | stale until rebuild | great for content sites |
| **ISR / on‑demand revalidation** | build + background regen | fast (CDN) | after hydration | eventually fresh | SSG scale + freshness |
| **Streaming SSR** | server, chunked | fast (shell first) | progressive | fresh | React 18 `renderToPipeableStream`, Suspense boundaries |
| **RSC** (React Server Components) | server, no client JS for those parts | fast | less JS shipped | fresh | Next App Router; server/client component split |
| **Islands architecture** | server HTML + selective hydration | fast | per‑island | fresh | Astro, Fresh; minimal JS |
| **Progressive / partial hydration** | SSR + hydrate on demand | fast | prioritized | fresh | hydrate on visible/interaction/idle |
| **Edge rendering** | CDN edge nodes | fast + low latency | after hydration | fresh | limited runtime APIs |

### Key ideas

- **Hydration cost** is the SSR tax — TBT/INP hit while JS attaches listeners. Mitigations:
  RSC, islands, partial/lazy hydration, resumability (**Qwik**), less client JS.
- **App shell** model: cache the shell, fill content dynamically.
- **PRPL**: Push critical, Render initial route, Pre‑cache remaining, Lazy‑load rest.
- Choose per‑page: marketing/blog → SSG/ISR; dashboard behind auth → CSR or SSR;
  e‑commerce PDP → SSR/ISR (SEO + freshness); highly interactive tool → CSR.

---

## 5.7 Build Optimization

- **Code splitting**: route‑based (`React.lazy` + `Suspense`, dynamic `import()`),
  component‑based (modals, charts, editors), vendor splitting, shared chunks.
- **Tree shaking**: ESM only, `sideEffects: false` in `package.json`, avoid barrel files
  that defeat it, prefer named imports, per‑method lodash.
- **Bundlers**: Vite/Rollup (esbuild dev, Rollup prod), webpack, **Turbopack**,
  esbuild, Rspack (fast webpack‑compatible), Parcel. SWC/esbuild for transpile speed.
- **Minification**: Terser / esbuild / SWC minify; CSS via cssnano / Lightning CSS;
  `PurgeCSS` / Tailwind JIT to drop unused CSS.
- **Long‑term caching**: content‑hashed filenames, stable vendor chunk, extract runtime
  manifest, `immutable` cache headers.
- **Modern output**: target modern browsers, ship `type=module` (skip legacy transpile);
  optional module/nomodule pattern; drop unnecessary polyfills (`browserslist`,
  core‑js `useBuiltIns: 'usage'`).
- **Compression at build**: pre‑generate `.br` / `.gz`.
- **Analyze**: bundle analyzer in CI, `size-limit` budget, watch for accidental large
  deps (moment, full lodash, entire icon set, duplicate React).
- **Dedupe**: single React version, `resolutions`/`overrides`, check for duplicate deps.
- **Assets**: inline tiny assets as data URIs (threshold), SVGO, hash + CDN.
- **Framework**: Next.js `next/dynamic`, `next/image`, `next/font`, `optimizePackageImports`;
  React `use client` boundary discipline to keep server components server‑only.
- **CI**: cache `node_modules` / build cache, parallelize, incremental builds,
  remote caching (Turborepo, Nx).
- Defer non‑critical third‑party (tag managers) — load on idle / interaction, consider
  **Partytown** to move them to a worker.
