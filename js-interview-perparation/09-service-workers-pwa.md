# 9. Service Workers & PWAs

Covers: service workers · Progressive Web Applications

---

## 9.1 Service Workers

A **script the browser runs in the background**, separate from the page, acting as a
programmable **network proxy** between the app and the network/cache.

### Characteristics

- Runs on its **own thread**, no DOM access, **no synchronous APIs**, terminated when
  idle and restarted on events → **no long‑lived in‑memory state** (use IndexedDB /
  Cache Storage).
- **HTTPS only** (localhost exempt). Scope = its directory and below
  (`/sw.js` → whole origin; `/app/sw.js` → `/app/*`). `Service-Worker-Allowed` header to
  widen scope.
- One SW controls many tabs/clients of its scope.

### Lifecycle

1. **register** – `navigator.serviceWorker.register('/sw.js')` (after load, or eagerly).
2. **install** – precache the app shell / static assets. `event.waitUntil()`.
3. **waiting** – if an old SW still controls pages, the new one waits. `skipWaiting()`
   to activate immediately.
4. **activate** – clean up old caches. `clients.claim()` to take control of open pages
   without reload.
5. **fetch** – intercept requests, respond from cache/network/compose.
6. Idle → terminated; wakes on `fetch`, `push`, `sync`, `message`, `notificationclick`.

### Events / capabilities

- `fetch` – caching strategies (see §6.9): cache‑first, network‑first, SWR, cache‑only,
  network‑only. Offline fallback page/image. **Navigation preload** to parallelize SW
  startup with the navigation request.
- `push` – **Push API** (needs a push service + VAPID keys + user permission) → show a
  notification even when the site is closed.
- `notificationclick` – focus/open a client.
- **Background Sync** (`sync`) – retry a failed action (send message, submit form) when
  connectivity returns; queue in IndexedDB. **Periodic Background Sync** for content
  refresh (limited support, requires installed PWA + engagement).
- `message` / `postMessage` – talk to pages (e.g. "new version available").

### Update & versioning pitfalls

- Browser checks for a new `sw.js` on navigation (and ~24h max cache). Byte‑diff triggers
  update.
- **Version skew**: page HTML is new but SW serves old chunks, or vice versa → stale UI,
  chunk load errors. Mitigate: precache manifest revisioned per build, `skipWaiting` +
  reload prompt, keep prior asset versions available, cache HTML network‑first.
- Provide an **"update available – reload"** UX (listen for `updatefound` /
  `controllerchange`).
- **Kill switch**: ship a no‑op SW that `unregister()`s and clears caches if you need to
  back out.

### Tooling

- **Workbox** – strategies, precaching + manifest injection (`workbox-build`,
  `InjectManifest` / `GenerateSW`), expiration + max‑entry plugins, background sync
  queue, Google Analytics offline. Vite PWA plugin / `next-pwa` wrap it.

### Other worker types (know the difference)

- **Web Worker** – offload CPU work from main thread (parsing, crypto, image processing),
  message‑passing, no DOM. `Comlink` for ergonomics.
- **Shared Worker** – one instance shared across tabs/windows of an origin.
- **Worklets** – Paint/Audio/Animation worklets (CSS Houdini, low‑latency audio).

---

## 9.2 Progressive Web Applications (PWAs)

A web app that uses modern platform features to be **installable, reliable (offline‑
capable), and app‑like**.

### Requirements / ingredients

1. **HTTPS**.
2. **Web App Manifest** (`manifest.webmanifest`, linked via `<link rel="manifest">`):
   `name`, `short_name`, `start_url`, `scope`, `display` (`standalone` /
   `fullscreen` / `minimal-ui` / `browser`), `theme_color`, `background_color`,
   `icons` (incl. **maskable** 512px), `screenshots` + `description` (richer install
   UI), `shortcuts`, `share_target`, `display_override`, `id`, `orientation`,
   `protocol_handlers`, `file_handlers`, `launch_handler`.
3. **Service worker** providing an offline experience (at minimum an offline fallback;
   ideally cached shell + data).
4. Meets **installability criteria** → browser fires `beforeinstallprompt`
   (Chromium) → you can show a custom "Install app" button and call `prompt()`.
   iOS/Safari: manual "Add to Home Screen", partial support, no `beforeinstallprompt`.

### Capabilities (progressively enhanced)

- Offline & caching, Push notifications + Background Sync, **Add to Home Screen** /
  standalone window, **App shortcuts**, **Web Share** + **Share Target**, **File System
  Access**, **Badging API**, **Screen Wake Lock**, **Contact Picker**, **Web Bluetooth /
  USB / Serial / HID** (Chromium), **Media Session**, **Payment Request**,
  **periodic sync**, **window controls overlay**, protocol/file handlers,
  **`launch_handler`** (focus‑existing).
- Feature‑detect everything; the same code must work as a normal site in unsupported
  browsers.

### App shell architecture

Cache the minimal HTML/CSS/JS chrome that's always the same → instant repeat loads →
dynamic content filled from cache/network. Pairs with SPA routing.

### Trade‑offs vs native

+ One codebase, instant updates (no store review), linkable/indexable, smaller install,
  no store cut.
− iOS limitations (storage caps, no push until iOS 16.4+ and only for installed PWAs,
  background limits), less OS integration, discoverability (though installable from
  store via TWA / PWABuilder), some hardware APIs Chromium‑only.

### Testing / auditing

- **Lighthouse PWA** category (installable, SW, manifest, offline, viewport, themed).
- DevTools **Application** panel: Manifest, Service Workers, Cache Storage, Storage,
  Background Services (push/sync).
- Test offline (DevTools "Offline"), test update flow, test install on Android + iOS,
  test maskable icons (maskable.app).
- **PWABuilder** to package for app stores (Android TWA, Windows, iOS wrapper).
