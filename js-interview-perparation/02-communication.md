# 2. Client–Server Communication Patterns

Covers: overview · short polling · long polling · WebSockets · Server‑Sent Events · WebHooks

---

## 2.2 Overview

The core problem: **HTTP is request–response, client‑initiated.** The server cannot push.
These patterns are the workarounds for getting server → client updates.

| Pattern | Direction | Transport | Real‑time? | Server cost | Use when |
|---|---|---|---|---|---|
| Short polling | client pulls on timer | HTTP | near (latency = interval) | wasted requests | simple, low‑freq updates |
| Long polling | client pulls, server holds | HTTP | yes‑ish | held connections | need real‑time, no WS infra |
| SSE | server → client stream | HTTP (one‑way) | yes | 1 held conn/client | feeds, notifications, progress |
| WebSocket | full duplex | TCP (ws/wss) | yes | 1 conn/client + stateful | chat, games, colla*, trading |
| WebHook | server → server | HTTP callback | yes | none (event‑driven) | 3rd‑party integrations, backend events |

Decision guide: **need bidirectional / low latency / high frequency → WebSocket.
Server‑to‑client only → SSE. Occasional updates / legacy → long polling. Backend‑to‑backend
notifications → WebHooks.**

---

## 2.3 Short Polling

Client calls the API on a fixed interval (`setInterval`, or `setTimeout` chained to avoid
overlap).

```js
async function poll() {
  try {
    const data = await fetch('/api/status').then(r => r.json());
    render(data);
  } finally {
    setTimeout(poll, 5000); // schedule next only after this finishes
  }
}
```

**Pros**: trivial, stateless, works everywhere, no special infra, easy to load balance.
**Cons**: latency up to one interval, most responses are "no change" (wasted bandwidth,
battery, server CPU), doesn't scale to many clients or short intervals.
**Tuning**: exponential backoff when idle, pause when tab hidden
(`document.visibilityState`), send `ETag` / `If-None-Match` so unchanged responses are 304.

---

## 2.4 Long Polling

Client sends a request; server **holds it open** until there's data (or a timeout), then
responds. Client immediately re‑requests.

```
client → GET /updates?since=42
server ... (holds, no data yet) ...
server → 200 { events: [...], cursor: 55 }   // when event arrives OR ~30s timeout
client → GET /updates?since=55                // reconnect right away
```

**Pros**: near real‑time, works over plain HTTP / proxies / old browsers, no protocol
upgrade.
**Cons**: each client ties up a server connection/thread (bad with sync servers; fine with
async/event‑loop servers), reconnect overhead, message ordering + missed‑message handling
needs a cursor, load balancers must allow long timeouts.
Historically the fallback in SockJS / old Socket.IO.

---

## 2.5 WebSockets

Full‑duplex, persistent connection over a single TCP socket.

### Handshake

Starts as HTTP GET with `Upgrade: websocket`, `Connection: Upgrade`,
`Sec-WebSocket-Key`. Server responds `101 Switching Protocols`. After that it's a binary
framed protocol, **not HTTP**. `wss://` = over TLS (always use it — proxies mangle `ws://`).

### API

```js
const ws = new WebSocket('wss://example.com/socket');
ws.onopen    = () => ws.send(JSON.stringify({ type: 'subscribe', room: 'general' }));
ws.onmessage = (e) => handle(JSON.parse(e.data));
ws.onclose   = (e) => scheduleReconnect(e.code);
ws.onerror   = (e) => console.error(e);
```

### Production concerns

- **Reconnection** with exponential backoff + jitter; resubscribe on reconnect; buffer
  outgoing messages while down.
- **Heartbeat / ping‑pong** to detect dead connections and keep NAT/proxy mappings alive
  (browsers can't send WS ping frames from JS → app‑level `{type:'ping'}`).
- **Backpressure**: check `ws.bufferedAmount` before sending large data.
- **Auth**: can't set custom headers in browser `WebSocket`; pass token via query param
  (logged — use short‑lived), subprotocol header, or a cookie, or authenticate first
  message.
- **Scaling**: connections are stateful and sticky → need a pub/sub backplane (Redis,
  Kafka, NATS) to broadcast across server instances; sticky sessions or a connection
  gateway layer; horizontal scaling is harder than stateless HTTP.
- **Fallbacks**: Socket.IO auto‑falls back to long polling; raw WS does not.
- **Message design**: type field, versioning, ack/id for reliability, compression
  (permessage‑deflate).

**Use for**: chat, multiplayer games, collaborative editing (with CRDT/OT), live trading
dashboards, presence.

---

## 2.6 Server‑Sent Events (SSE)

One‑way stream **server → client** over a long‑lived HTTP response with
`Content-Type: text/event-stream`.

```js
const es = new EventSource('/api/stream');
es.onmessage = (e) => append(JSON.parse(e.data));
es.addEventListener('price', (e) => updatePrice(e.data));
es.onerror = () => { /* browser auto-reconnects */ };
```

Wire format:
```
event: price
id: 1699999999
data: {"symbol":"AAPL","price":184.2}
retry: 3000

```

### Pros

- Built on plain HTTP → works with HTTP/2, proxies, CORS, compression, standard auth
  (cookies/headers via fetch‑based polyfill).
- **Automatic reconnection** with `Last-Event-ID` header → server can replay missed events.
- Simple text protocol, low overhead vs WebSocket for pure fan‑out.

### Cons

- Server → client only (client still uses normal HTTP requests to send).
- **HTTP/1.1: 6 connections per domain limit** — many SSE tabs exhaust it (HTTP/2
  multiplexing fixes this).
- Text only (base64 for binary). No native `EventSource` support for custom headers
  (use `fetch` + `ReadableStream` or a polyfill).
- Some corporate proxies buffer the stream.

**Use for**: notifications, activity feeds, live scores, LLM token streaming, progress bars,
log tailing.

---

## 2.7 WebHooks

**Reverse API**: instead of you polling a provider, the provider makes an HTTP POST to a
URL you registered when an event happens (`payment.succeeded`, `push`, `issue.opened`).

### Flow

1. You expose `POST https://yourapp.com/webhooks/stripe`.
2. Register the URL + subscribed events with the provider.
3. Provider POSTs a JSON event payload on each occurrence.
4. You respond `2xx` fast (< a few seconds) then process async (queue it).

### Security & reliability (interview gold)

- **Verify authenticity**: HMAC signature header (`Stripe-Signature`) computed over the
  raw body with a shared secret — compare with constant‑time equality. Or mTLS, or
  a shared bearer token.
- **Replay protection**: signature includes a timestamp; reject if too old.
- **Idempotency**: providers retry on non‑2xx or timeout → dedupe on event `id`.
- **Ordering not guaranteed** — use event timestamps / versioning.
- **Retries**: providers retry with backoff for hours; you need a dead‑letter path.
- Respond 2xx immediately, do work in a background worker.
- Local dev: tunnels (ngrok, Cloudflare Tunnel, `stripe listen`).

### WebHook vs polling

WebHook = push, no wasted calls, near‑instant, but needs a public endpoint and you don't
control delivery. Polling = you control cadence, works behind firewalls, but laggy and
wasteful. Some APIs offer both.

Frontend angle: usually backend territory, but you consume the *effects* — e.g. a webhook
updates DB, then your app learns via SSE/WebSocket or on next fetch. Also "webhook‑like"
in the browser = **`postMessage`** between windows/iframes/workers.
