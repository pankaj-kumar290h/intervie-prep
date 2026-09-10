# 1. Networking

Covers: how the web works · communication protocols · REST APIs · GraphQL · gRPC

---

## 1.2 How the Web Works

### From URL to pixels (the canonical interview walkthrough)

1. **URL parsing** – browser splits scheme, host, port, path, query, fragment.
2. **DNS resolution** – hostname → IP. Order of lookup: browser cache → OS cache →
   router cache → ISP resolver → recursive resolution (root → TLD → authoritative).
   Records: `A` (IPv4), `AAAA` (IPv6), `CNAME` (alias), `NS`, `MX`, `TXT`.
   TTL controls caching. DNS runs over UDP:53 (falls back to TCP for large responses),
   modern: DoH / DoT for privacy.
3. **TCP connection** – 3‑way handshake (SYN → SYN‑ACK → ACK). 1 RTT.
4. **TLS handshake** – TLS 1.2 = 2 RTT, TLS 1.3 = 1 RTT (0‑RTT resumption possible).
   Negotiates cipher suite, validates certificate chain, derives session keys.
5. **HTTP request** – method, path, headers, optional body.
6. **Server processing** – may hit CDN edge, load balancer, app server, DB, cache.
7. **HTTP response** – status line, headers, body.
8. **Browser rendering pipeline**:
   - Parse HTML → **DOM** tree.
   - Parse CSS → **CSSOM** tree.
   - `<script>` blocks parsing unless `async` / `defer` / `type=module`.
   - DOM + CSSOM → **Render tree** (only visible nodes).
   - **Layout / reflow** – compute geometry.
   - **Paint** – fill pixels into layers.
   - **Composite** – GPU combines layers (transform/opacity animations stay here → cheap).
9. **Subresource fetches** – images, fonts, more JS/CSS, triggered during parse via the
   **preload scanner**.

### Key concepts

- **Critical Rendering Path** – minimum resources needed for first paint. Optimise by
  inlining critical CSS, deferring non‑critical JS, minimising render‑blocking resources.
- **Render‑blocking**: CSS (all), synchronous JS. **Parser‑blocking**: synchronous JS.
- **`<link rel>` hints**: `dns-prefetch`, `preconnect`, `preload`, `prefetch`, `modulepreload`.
- **Repaint vs reflow**: changing color = repaint; changing size/position = reflow
  (more expensive, can cascade). Batch DOM reads then writes to avoid layout thrashing.
- **Event loop**: call stack → microtasks (Promises, `queueMicrotask`, MutationObserver)
  drained fully → one macrotask (setTimeout, I/O, UI events) → render (rAF, style, layout,
  paint) roughly at 60fps.

### Browser architecture

- Multi‑process: browser process, renderer process per site (site isolation), GPU
  process, network process, utility processes.
- Renderer has main thread (JS + DOM + layout), compositor thread, raster threads,
  Web Worker threads.

---

## 1.3 Communication Protocols

### The stack

| Layer | Examples | Frontend relevance |
|-------|----------|--------------------|
| Application | HTTP, WebSocket, DNS, FTP, SMTP | what your code speaks |
| Transport | TCP, UDP, QUIC | reliability vs latency |
| Network | IP, ICMP | routing |
| Link | Ethernet, Wi‑Fi | rarely |

### TCP vs UDP

- **TCP**: connection‑oriented, ordered, reliable, flow + congestion control, slower to
  start. Used by HTTP/1.1, HTTP/2.
- **UDP**: connectionless, no ordering/retransmission, low overhead. Used by DNS, VoIP,
  video, and **QUIC** (which rebuilds reliability + streams in userspace on top of UDP).

### HTTP versions

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transport | TCP | TCP | QUIC (UDP) |
| Multiplexing | No (6 conns/host, head‑of‑line blocking) | Yes (streams over 1 conn) | Yes (no TCP HOL blocking) |
| Header compression | No | HPACK | QPACK |
| Server push | No | Yes (deprecated in practice) | Yes |
| Prioritization | No | Yes (tree) | Yes |
| Connection setup | TCP+TLS | TCP+TLS | 1‑RTT / 0‑RTT combined |

- **Head‑of‑line blocking**: HTTP/2 solves it at the app layer but TCP still blocks all
  streams on a lost packet; HTTP/3 fixes this because QUIC streams are independent.

### HTTP anatomy

- **Methods**: GET (safe, idempotent, cacheable), POST (not idempotent), PUT (idempotent
  replace), PATCH (partial, not necessarily idempotent), DELETE (idempotent), HEAD,
  OPTIONS (used by CORS preflight).
- **Idempotent** = same result if called N times. **Safe** = no server state change.
- **Status codes**: 1xx info, 2xx success (200, 201 created, 204 no content, 206 partial),
  3xx redirect (301 permanent, 302/307 temp, 304 not modified), 4xx client
  (400, 401 unauthenticated, 403 unauthorized, 404, 409 conflict, 422, 429 rate limit),
  5xx server (500, 502 bad gateway, 503 unavailable, 504 timeout).
- **Headers**: `Content-Type`, `Accept`, `Authorization`, `Cache-Control`, `ETag`,
  `Cookie`/`Set-Cookie`, `Origin`, `Referer`, `User-Agent`, `Content-Encoding` (gzip/br).
- **Connection reuse**: `Connection: keep-alive` (default in 1.1).

### TLS / HTTPS (see also 3.7)

- Asymmetric crypto for handshake + cert validation, symmetric (AES) for bulk data.
- Certificate chain: leaf → intermediate → root CA (in OS/browser trust store).
- **HSTS** header forces HTTPS. **SNI** lets one IP serve many certs.

---

## 1.4 REST APIs

### Principles (Roy Fielding)

- **Client–server** separation, **stateless** (no server session per request — auth token
  on every call), **cacheable**, **uniform interface**, **layered system**, code‑on‑demand
  (optional).
- **Resource‑oriented**: nouns in URLs (`/users/123/orders`), verbs are HTTP methods.
- **HATEOAS** – responses include links to related actions (rarely fully implemented).

### Good practice

- Plural nouns, nesting for relationships, filtering/sorting/pagination via query params
  (`?page=2&limit=20&sort=-createdAt&status=active`).
- Versioning: URL (`/v1/`), header (`Accept: application/vnd.api+json;version=1`), or param.
- Use proper status codes; return errors in a consistent envelope
  (`{ error: { code, message, details } }`).
- Pagination styles: **offset** (simple, drifts on inserts, slow deep pages) vs
  **cursor/keyset** (stable, scalable, no random access).
- **Idempotency keys** for safe retries on POST (payments).

### Pros / cons

+ Simple, ubiquitous, cache‑friendly (HTTP caching, CDNs), great tooling.
− Over‑fetching / under‑fetching, multiple round trips for related data, no schema by
  default (mitigate with OpenAPI/Swagger).

### Frontend concerns

- Design a data layer: fetch wrapper, retry/backoff, auth refresh, request dedupe,
  cancellation (`AbortController`), normalized cache (React Query / RTK Query / SWR).
- Handle partial failure, optimistic updates, stale‑while‑revalidate.

---

## 1.5 GraphQL

### What it is

A query language + runtime. Single endpoint (`POST /graphql`). Client specifies exactly
the fields it needs. Strongly typed **schema** (SDL) is the contract.

### Operations

- **Query** (read), **Mutation** (write, run serially), **Subscription** (real‑time,
  usually over WebSocket / SSE).
- **Resolvers** – one function per field; resolve tree top‑down.
- **Fragments** – reusable field sets. **Variables**, **directives** (`@include`, `@skip`,
  `@defer`, `@stream`).

### Solves REST pain

- No over/under‑fetching – one round trip for a nested graph.
- Schema introspection → autocompletion, codegen, typed clients.
- Evolve without versioning (add fields, deprecate with `@deprecated`).

### New problems

- **N+1 queries** in resolvers → solve with **DataLoader** (batch + cache per request).
- HTTP caching is hard (POST, single URL) → rely on client cache (Apollo/urql/Relay
  normalized cache) + **persisted queries** (send hash, enables GET + CDN caching).
- Complex queries can DoS the server → **query cost analysis**, depth limiting, timeouts,
  allowlists.
- File uploads, error handling (partial data + `errors` array), rate limiting are all
  non‑trivial.

### Frontend

- Normalized cache keyed by `__typename` + `id`; cache updates after mutations
  (refetch vs manual cache write vs optimistic response).
- Codegen for TS types from schema.
- Pagination: Relay‑style connections (`edges`, `node`, `pageInfo`, `cursor`).

---

## 1.6 gRPC

### What it is

RPC framework by Google. **Protocol Buffers** (protobuf) as IDL + binary serialization.
Runs over **HTTP/2**. Contract‑first: define `.proto`, generate client + server stubs in
many languages.

### Call types

- **Unary** (req → res), **server streaming**, **client streaming**, **bidirectional
  streaming** (all leverage HTTP/2 streams).

### Why it's fast

- Binary protobuf is smaller + faster to parse than JSON.
- HTTP/2 multiplexing, header compression, persistent connections.
- Strongly typed, code‑generated, low boilerplate.

### Trade‑offs

- Not human‑readable; needs tooling to debug.
- **Browsers can't speak native gRPC** (no raw access to HTTP/2 frames / trailers) →
  need **gRPC‑Web** + a proxy (Envoy) that translates. gRPC‑Web has limited streaming
  (server streaming only, no client/bidi over old transports; better with fetch/WHATWG
  streams).
- Best fit: **service‑to‑service** internal comms, polyglot microservices, low‑latency /
  high‑throughput.

### REST vs GraphQL vs gRPC (one‑liner each)

- **REST** – resource CRUD over HTTP, cache‑friendly, browser‑native, loose contract.
- **GraphQL** – client‑shaped queries, one round trip, typed schema, hard to cache.
- **gRPC** – fast binary RPC, strict contract, streaming, not browser‑native.
