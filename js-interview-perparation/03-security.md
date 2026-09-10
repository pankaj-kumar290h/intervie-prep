# 3. Frontend Security

Covers: overview · XSS · iframe protection · security headers · client‑side security ·
HTTPS · dependency security · compliance · input validation · SSRF · SSJI · Permissions
Policy · SRI · CORS · CSRF

---

## 3.2 Security Overview

- **CIA triad**: Confidentiality, Integrity, Availability.
- **Defense in depth** – multiple layers; never trust one control.
- **Never trust the client** – all validation/authorization must be re‑done server‑side.
  Client‑side checks are UX, not security.
- **Least privilege**, **fail securely** (deny by default), **secure defaults**.
- **OWASP Top 10** (2021): Broken Access Control, Cryptographic Failures, Injection,
  Insecure Design, Security Misconfiguration, Vulnerable/Outdated Components,
  Identification & Auth Failures, Software/Data Integrity Failures, Logging/Monitoring
  Failures, SSRF.
- Frontend attack surface: XSS, CSRF, clickjacking, open redirects, sensitive data in
  JS bundles / localStorage, dependency supply chain, insecure `postMessage`, DOM
  clobbering, prototype pollution.

---

## 3.3 Cross‑Site Scripting (XSS)

Attacker runs **their JavaScript in your origin** → steals cookies/tokens, does actions as
the user, keylogs, rewrites the page.

### Types

- **Stored** – payload persisted (comment, profile) and served to other users. Worst.
- **Reflected** – payload in URL/param echoed straight into the response.
- **DOM‑based** – vulnerability is entirely client‑side: a **source**
  (`location.hash`, `document.referrer`, `postMessage`, URL params) flows into a **sink**
  (`innerHTML`, `document.write`, `eval`, `setTimeout(string)`, `element.setAttribute`,
  `location`, jQuery `.html()`, `dangerouslySetInnerHTML`).

### Prevention

1. **Contextual output encoding** – HTML body, HTML attribute, JS, CSS, URL contexts each
   need different escaping. Let the framework do it: React/Vue/Angular auto‑escape `{}`
   interpolation.
2. **Avoid dangerous sinks.** No `innerHTML` with untrusted data; use `textContent`.
   Avoid `eval`, `new Function`, string `setTimeout`.
3. **Sanitize** rich HTML with **DOMPurify** before inserting.
4. **Content Security Policy** (see 3.5) – blocks inline scripts + unknown origins, big
   mitigation even if a bug slips through.
5. **Trusted Types** (`require-trusted-types-for 'script'`) – forces all DOM‑sink writes
   through a policy function; kills most DOM XSS.
6. **HttpOnly cookies** so JS can't read the session token (limits impact, not the bug).
7. Escape/validate `href` (block `javascript:` URLs), validate redirect targets.
8. Framework caveats: React is safe *except* `dangerouslySetInnerHTML`, `href={userUrl}`,
   `ref` DOM manipulation, `<script>` injection via libraries.

---

## 3.4 iFrame Protection (Clickjacking)

**Clickjacking**: attacker loads your site in a transparent iframe over their UI and
tricks the user into clicking (e.g. "delete account", "transfer funds").

### Defenses

- **`X-Frame-Options: DENY`** or `SAMEORIGIN` (legacy, no allow‑list).
- **CSP `frame-ancestors 'self' https://trusted.com`** – modern replacement, supports a
  list. `frame-ancestors 'none'` = deny all.
- **Framebusting JS** (last resort, bypassable): `if (top !== self) top.location = self.location`.
- **`SameSite` cookies** reduce the damage of a framed authenticated action.

### Being the embedder safely

- Sandbox untrusted iframes: `sandbox="allow-scripts allow-forms"` (omit
  `allow-same-origin` to keep it in a null origin; **never** combine `allow-scripts` +
  `allow-same-origin` for untrusted content — it can remove its own sandbox).
- `allow=` attribute controls Permissions Policy delegation (camera, mic, geolocation).
- `referrerpolicy`, `loading="lazy"`, `credentialless`.
- Cross‑origin iframes can't access parent DOM (same‑origin policy) — communicate via
  `postMessage` with **strict `targetOrigin` and `event.origin` checks**.

---

## 3.5 Security Headers

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | whitelist sources for scripts/styles/img/connect/frame; blocks inline JS |
| `Strict-Transport-Security` | force HTTPS (`max-age=31536000; includeSubDomains; preload`) |
| `X-Content-Type-Options: nosniff` | stop MIME sniffing (prevents e.g. text served as JS) |
| `X-Frame-Options` / CSP `frame-ancestors` | anti‑clickjacking |
| `Referrer-Policy: strict-origin-when-cross-origin` | limit `Referer` leakage |
| `Permissions-Policy` | disable/limit browser features (see 3.13) |
| `Cross-Origin-Opener-Policy: same-origin` | isolate browsing context group (needed for `SharedArrayBuffer`) |
| `Cross-Origin-Embedder-Policy: require-corp` | only load resources that opt in |
| `Cross-Origin-Resource-Policy` | control who can embed this resource |
| `Cache-Control: no-store` | keep sensitive responses out of caches |

### CSP details

- Directives: `default-src`, `script-src`, `style-src`, `img-src`, `connect-src`
  (XHR/fetch/WS/SSE), `font-src`, `frame-src`, `frame-ancestors`, `base-uri`,
  `form-action`, `object-src 'none'`, `upgrade-insecure-requests`.
- Prefer **nonces** (`script-src 'nonce-<random>'`) or **hashes** over `'unsafe-inline'`.
- `'strict-dynamic'` – trust scripts loaded by an already‑trusted script (good for
  bundlers) and ignore host allow‑lists.
- Roll out with `Content-Security-Policy-Report-Only` + `report-to` / `report-uri`.
- Common blockers: inline event handlers, `javascript:` URLs, inline `<style>`, `eval`
  (webpack `devtool`, some libs).

---

## 3.6 Client‑Side Security

- **Token storage**: `localStorage` is XSS‑readable → prefer `HttpOnly`, `Secure`,
  `SameSite` cookies for session tokens, or keep short‑lived access token in memory +
  refresh token in HttpOnly cookie. In‑memory = lost on refresh but safest from XSS.
- **Never ship secrets in the bundle** – API keys, private tokens are visible. Use a
  backend proxy / BFF. Public keys (publishable Stripe key, Firebase config) are fine.
- **Source maps** – don't deploy to public prod, or restrict access.
- **`Object.freeze`**, avoid `__proto__` merges → **prototype pollution** (lodash
  `merge`, `set`, query‑string parsers historically). Use `Object.create(null)` maps,
  `structuredClone`, guard keys.
- **DOM clobbering** – `id="config"` in injected HTML shadows `window.config`.
- **`target="_blank"`** → add `rel="noopener noreferrer"` (reverse tabnabbing); modern
  browsers default noopener.
- **`postMessage`** – always validate `event.origin` and specify exact `targetOrigin`.
- **Third‑party scripts** – analytics/tag managers run with full origin privileges;
  isolate via `<iframe sandbox>` where possible, use SRI, review Partytown.
- **Extensions / user scripts** can't be defended against fully.
- Feature‑detect + guard `eval`, disable React devtools messaging in prod, obfuscation is
  not security.

---

## 3.7 Secure Communication (HTTPS)

- TLS provides **confidentiality** (encryption), **integrity** (MAC/AEAD), **authenticity**
  (server cert; optionally client cert = mTLS).
- **Handshake**: ClientHello (versions, ciphers, SNI) → ServerHello + certificate →
  key exchange (ECDHE for **forward secrecy**) → Finished. TLS 1.3 = 1 RTT, drops old
  ciphers, encrypts more of the handshake.
- **Certificate validation**: chain to trusted root, not expired, hostname match,
  not revoked (OCSP stapling / CRL), correct key usage.
- **HSTS** + preload list prevents SSL‑strip / first‑visit downgrade.
- **Mixed content** – HTTPS page loading HTTP subresource → blocked (active) or
  upgraded. Use `upgrade-insecure-requests`.
- **Certificate pinning** (mobile/native) – pin a key; risky for web (bricking), HPKP
  deprecated.
- Use `wss://`, `https://` everywhere; redirect 80→443; disable TLS < 1.2.

---

## 3.8 Dependency Security (Supply Chain)

- Most frontend code is `node_modules`. Risks: known CVEs, typosquatting, malicious
  post‑install scripts, compromised maintainer, protestware, dependency confusion
  (internal package name published to public registry).
- **Practices**:
  - `npm audit` / `pnpm audit`, **Dependabot / Renovate**, Snyk, `socket.dev`.
  - Commit a **lockfile**; `npm ci` for reproducible installs.
  - `--ignore-scripts` where feasible; review post‑install scripts.
  - Pin versions or use ranges cautiously; verify **provenance** (npm provenance /
    sigstore), enable 2FA, use `.npmrc` scoped registries to prevent dependency confusion.
  - Minimise dependency count; prefer well‑maintained, audited libs; watch bundle for
    unexpected additions.
  - SBOM (CycloneDX / SPDX) for compliance.
  - Subresource Integrity for CDN‑hosted deps (see 3.14).

---

## 3.9 Compliance and Regulation

- **GDPR** (EU): lawful basis for processing, consent for non‑essential cookies, right to
  access/erasure/portability, data minimization, breach notification (72h), DPIA,
  privacy by design. Applies by data‑subject location.
- **CCPA/CPRA** (California): right to know/delete/opt‑out of "sale/share", "Do Not Sell"
  link, Global Privacy Control signal.
- **PCI‑DSS** – handling card data. Easiest path: never touch the PAN — use hosted fields
  / tokenization (Stripe Elements) so card data never hits your servers (SAQ‑A).
- **HIPAA** (US health), **SOC 2** (security controls audit), **WCAG / ADA / Section 508 /
  EN 301 549** (accessibility, see §8), **COPPA** (children < 13).
- Frontend implications: **consent management platform** before firing analytics/ads,
  cookie banners that actually block scripts pre‑consent, honor DNT/GPC, geo‑gating,
  data‑retention on client storage, anonymize/pseudonymize logs, PII not in URLs/logs,
  configurable data residency.

---

## 3.10 Input Validation and Sanitization

- **Validation** = reject bad input (is this a valid email / in range / expected enum).
  **Sanitization** = clean/normalize input (strip tags, escape). **Output encoding** =
  make data safe for a specific sink. You often need all three.
- **Allow‑list > deny‑list.** Define what's valid, reject the rest.
- **Validate server‑side always**; client‑side is UX only.
- Validate **type, length, format, range, and business rules**; canonicalize first
  (Unicode NFC, decode once), then validate.
- Context matters: SQL → parameterized queries; HTML → DOMPurify/encoding; shell → avoid,
  or arg arrays; LDAP/XML/NoSQL → their own escaping; file paths → block `../`,
  resolve + check prefix; file uploads → check magic bytes not extension, size limits,
  store off‑web‑root, random names, scan.
- Libraries: **zod / yup / valibot / Joi** (schema), **validator.js**, **DOMPurify**.
  Share a schema between client and server when possible.
- Reject overly large payloads early (body size limits) to prevent DoS.

---

## 3.11 Server‑Side Request Forgery (SSRF)

App fetches a URL supplied by the user → attacker points it at **internal** resources:
`http://169.254.169.254/` (cloud metadata → credentials), `localhost` admin panels,
internal services, or uses it to port‑scan the private network.

### Where it hits frontend‑adjacent code

Node/Next.js API routes, image proxies, "fetch URL preview" / oEmbed, webhook senders,
PDF/screenshot generators, SSR data fetching, file import‑from‑URL.

### Defenses

- **Allow‑list** destination hosts/schemes; reject everything else.
- Block private/reserved IP ranges (`10/8`, `172.16/12`, `192.168/16`, `127/8`,
  `169.254/16`, `::1`, `fc00::/7`) **after DNS resolution** — and re‑check after
  redirects (**DNS rebinding / TOCTOU**): resolve, validate the IP, then connect to that
  IP.
- Disable redirects or validate each hop.
- Use a dedicated egress proxy with policy; no metadata endpoint access (IMDSv2, block
  link‑local).
- Least‑privilege network (egress firewall), short timeouts, no raw error/response
  echoed back to the user.

---

## 3.12 Server‑Side JavaScript Injection (SSJI)

Injecting JS that a **Node.js server** executes. Sinks: `eval`, `new Function`,
`vm`/`vm2` (vm2 had sandbox escapes — avoid), `setTimeout(string)`, `child_process` with
shell, unsafe template engines, `JSON` parsing via `eval`, deserialization of untrusted
data, `require(userInput)`, prototype pollution → gadget → RCE.

### Defenses

- Never `eval` untrusted input. Use `JSON.parse`, not `eval`.
- No dynamic `require` / dynamic import of user paths.
- `child_process.execFile` / `spawn` with argument arrays, never `exec` with string
  concatenation; avoid shells.
- Sandbox real untrusted code in **isolates / separate processes / containers / WASM**,
  not `vm`.
- Safe template engines with auto‑escaping; disable code execution in YAML/templates.
- Guard against prototype pollution (see 3.6).

---

## 3.13 Feature Policy / Permissions Policy

Header (and iframe `allow=`) that controls which **browser features** a page and its
iframes may use.

```
Permissions-Policy: geolocation=(self), camera=(), microphone=(), fullscreen=(self "https://embed.example.com"), payment=()
```

- `feature=()` → disabled for everyone. `(self)` → only same origin. `(self "https://x")`
  → same origin + that origin. `*` → all.
- Controllable: camera, microphone, geolocation, payment, usb, autoplay, fullscreen,
  accelerometer, gyroscope, clipboard‑write, display‑capture, screen‑wake‑lock,
  interest‑cohort (FLoC opt‑out), `browsing-topics`, `unload`.
- iframe: `<iframe allow="camera 'none'; geolocation 'self'">` — delegates or denies to
  the embedded frame; the frame can only get what the parent grants.
- **Document Policy** is a related newer mechanism for config like `js-profiling`,
  `oversized-images`.
- Use it to shrink attack surface and stop third‑party scripts/iframes abusing device
  APIs.

---

## 3.14 Subresource Integrity (SRI)

Ensures a fetched script/style hasn't been tampered with (compromised CDN, MITM).

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

- Browser hashes the fetched bytes; if it doesn't match `integrity`, the resource is
  **not executed**.
- Multiple hashes allowed (`sha384-... sha512-...`); strongest supported wins.
- Requires **CORS** (`crossorigin`) for cross‑origin resources; server must send
  `Access-Control-Allow-Origin`.
- Doesn't work well for resources that change per request or are versionless.
- Bundlers/plugins (`webpack-subresource-integrity`, Vite plugin) generate hashes at
  build time.
- Combine with CSP `require-sri-for script style` (or `require-trusted-types`).
- Limitation: doesn't cover things the script *then* loads; pair with `'strict-dynamic'`.

---

## 3.15 Cross‑Origin Resource Sharing (CORS)

Relaxes the **Same‑Origin Policy** to let a page make cross‑origin requests and read the
response. **Origin = scheme + host + port.**

### Mechanics

- **Simple requests** (GET/HEAD/POST, only "safe" headers, limited content types):
  browser sends `Origin`; server must return
  `Access-Control-Allow-Origin: <origin>` (or `*`) for JS to read the response. The
  request still *reaches* the server regardless.
- **Preflight** (`OPTIONS`) for anything else (custom headers, PUT/DELETE/PATCH,
  `application/json` sometimes, etc.): browser asks with
  `Access-Control-Request-Method` / `-Headers`; server answers with
  `Access-Control-Allow-Methods`, `-Allow-Headers`, `-Max-Age` (cache preflight).
- **Credentials** (cookies, `Authorization` set by app, TLS client certs): request needs
  `credentials: 'include'`; server needs `Access-Control-Allow-Credentials: true` **and**
  a specific origin (**not `*`**), and `Access-Control-Allow-Headers` can't be `*` with
  credentials.
- `Access-Control-Expose-Headers` – which response headers JS may read.
- **`Vary: Origin`** when reflecting origin, or caches poison.

### Common gotchas

- CORS is **browser‑enforced**, not a server auth mechanism. curl/servers ignore it.
- "CORS error" often = server returned an error / no CORS headers on the *error*
  response, or preflight failed.
- `no-cors` mode → opaque response you can't read.
- Wildcard subdomains not supported — must echo the Origin against an allow‑list.

---

## 3.16 Cross‑Site Request Forgery (CSRF)

The browser **auto‑attaches cookies** to requests. A malicious site can trigger a
state‑changing request to your app; if you authenticate purely by cookie, it succeeds
"as the user" (they can't read the response, but the write happened).

### Defenses

- **SameSite cookies**: `Lax` (default now — sent on top‑level GET navigations, not
  cross‑site POST/subresource), `Strict` (never cross‑site), `None; Secure` (needed for
  legit cross‑site, e.g. embedded widgets, SSO). `Lax` blocks most classic CSRF.
- **CSRF token** (synchronizer token): server issues a random token, embedded in form /
  sent as header, validated per request. Store server‑side or use **double‑submit
  cookie** (token in a JS‑readable cookie + mirrored in a header; server checks they
  match). Bind to session; consider signing/HMAC.
- **`Origin` / `Referer` header check** on state‑changing requests.
- **Custom header requirement** (e.g. `X-Requested-With`) — can't be set cross‑origin
  without a preflight, which CORS would block.
- Use **safe methods correctly** — GET must never mutate.
- For token‑in‑header APIs (no cookies) CSRF largely doesn't apply — but then you have
  the XSS‑stealable‑token problem instead.
- Double‑check: login CSRF, logout CSRF, JSON endpoints that also accept form encoding.
