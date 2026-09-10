# 7. Logging & Monitoring

Covers: overview · telemetry · alerting · fixing

---

## 7.2 Overview

**Observability** = ability to understand system state from its outputs. Three pillars:

- **Logs** – discrete timestamped events ("what happened").
- **Metrics** – aggregated numeric time‑series ("how much / how often").
- **Traces** – causally‑linked spans across a request's journey ("where time went").

Frontend adds a fourth concern: **RUM** (real‑user monitoring) — perf + errors + behaviour
from actual browsers.

### Logging best practices

- **Structured logs** (JSON): `{ timestamp, level, message, requestId, userId?, route,
  context }` — machine‑queryable.
- **Levels**: `error` (needs attention), `warn` (recoverable oddity), `info` (business
  events), `debug`/`trace` (dev). Configurable per env.
- **Correlation id / trace id** propagated client → server (`traceparent` header) so you
  can stitch a session together.
- **Don't log PII / secrets / tokens / full payloads** — redact, hash, or drop
  (GDPR/CCPA, §3.9). Scrub before send.
- **Sampling** high‑volume logs; always keep errors.
- Client logging: batch + send on `visibilitychange`/`pagehide` via
  `navigator.sendBeacon` or `fetch(keepalive)`; cap volume; respect consent; guard
  against infinite error loops (logging failing → logs the failure).
- Log **decisions and context**, not just "error" — inputs, feature flags, variant,
  app version, build hash, browser/device.

### Frontend error tracking

- `window.onerror`, `window.onunhandledrejection`, framework **error boundaries**
  (React `componentDidCatch` / `<ErrorBoundary>`), `event` listener error option,
  resource load errors (`addEventListener('error', …, true)`).
- Tools: **Sentry**, Bugsnag, Rollbar, Datadog RUM, LogRocket / FullStory (session
  replay), Highlight, GlitchTip.
- Enrich: **source maps** uploaded privately for readable stack traces, release/version
  tag, breadcrumbs (clicks, navigations, XHRs, console), user context (id only),
  tags (route, feature flags).
- **Group / fingerprint** errors; track **regression** (resolved → reappeared); ignore
  known noise (browser extensions, `ResizeObserver loop`, network‑offline).
- Crash‑free sessions/users as a headline metric.

---

## 7.3 Telemetry

Automated collection + transmission of data about system behaviour and usage.

### OpenTelemetry (OTel)

- Vendor‑neutral standard: **API + SDK + Collector**, signals = traces, metrics, logs
  (+ emerging: profiling, RUM/browser).
- **Context propagation** via `traceparent`/`tracestate` (W3C Trace Context) — a browser
  fetch span links to the backend server span → one distributed trace.
- Exporters → OTLP → Collector → any backend (Jaeger, Tempo, Prometheus, Datadog,
  Honeycomb, Grafana Cloud).
- Browser instrumentation: `@opentelemetry/sdk-trace-web`, auto‑instrument
  `fetch`/`XHR`/document‑load/user‑interaction.

### What frontend telemetry to capture

- **Performance**: Core Web Vitals (LCP/INP/CLS), TTFB, FCP, long tasks, resource
  timings, route‑change timing, API latency, hydration time, bundle sizes.
- **Errors**: JS exceptions, unhandled rejections, failed requests (4xx/5xx rates),
  chunk load failures, CSP violations (`report-to`).
- **Product analytics / events**: page views, feature usage, funnel steps, clicks,
  experiment exposures. Tools: GA4, Amplitude, Mixpanel, PostHog, Snowplow, Segment
  (CDP that fans out to all).
- **Business KPIs**: conversion, checkout success, search success rate.
- **Custom spans**: `performance.mark/measure` around expensive flows.

### Concerns

- **Privacy / consent**: gate non‑essential telemetry behind consent, honor GPC/DNT,
  anonymize IPs, no PII, EU data residency.
- **Overhead**: telemetry JS itself costs KB + main‑thread; load async / on idle, batch,
  sample, consider server‑side / edge collection, Partytown for tag managers.
- **Data quality**: consistent event schema (tracking plan), versioned, typed
  (e.g. Amplitude Analytics SDK codegen), avoid free‑text properties.

---

## 7.4 Alerting

### Principles

- Alert on **symptoms users feel** (error rate up, checkout down, LCP p75 regressed),
  not every internal blip. **SLI → SLO → error budget**; page when the budget burns fast.
- **Actionable**: every alert has an owner, a runbook link, and a clear "what to do".
- **Severity tiers**: SEV1 page immediately (on‑call, phone), SEV2 notify (Slack),
  SEV3 ticket. Business hours vs 24/7.
- Fight **alert fatigue**: tune thresholds, dedupe, group, add "for: 5m" so transient
  spikes don't fire, auto‑resolve, review noisy alerts weekly, delete alerts nobody
  acts on.

### Techniques

- **Threshold** (static), **anomaly detection** (baseline/seasonality), **rate of
  change**, **multi‑window multi‑burn‑rate** (fast + slow windows, Google SRE pattern),
  **composite / dependency‑aware** (suppress downstream when upstream is down),
  **absence** alerts ("no events in 10m" = pipeline broken).
- **Frontend‑specific alerts**: JS error spike after a deploy, crash‑free rate drop,
  chunk‑load‑error spike (stale deploy / CDN), CWV p75 regression, API 5xx from client
  telemetry, conversion drop, third‑party script failing, CSP violation surge,
  synthetic check (Checkly / Pingdom / Datadog Synthetics) failing key user journey.
- **Deploy correlation**: annotate dashboards with releases; auto‑rollback / halt rollout
  on error‑budget burn (progressive delivery).
- Routing: PagerDuty / Opsgenie / Grafana OnCall → schedules, escalation policies.

---

## 7.5 Fixing (Incident Response)

### Lifecycle

1. **Detect** – alert / user report / dashboard.
2. **Triage** – assess impact + severity, declare an incident, assign **Incident
   Commander**, open a channel/bridge.
3. **Mitigate first, diagnose later** – stop the bleeding: **rollback / revert**, toggle
   a **feature flag** off, scale up, fail over, disable the bad third‑party, serve
   cached/degraded mode. Mitigation ≠ root cause.
4. **Diagnose** – correlate with recent deploys/config/flag changes/traffic; use
   logs + traces + RUM + error grouping; reproduce; bisect.
5. **Resolve** – deploy the real fix, verify metrics recover, monitor.
6. **Communicate** – status page, stakeholder updates at intervals, customer comms.
7. **Postmortem** – **blameless**, timeline, contributing factors (5 whys / causal
   analysis), what detected it / what delayed it, **action items with owners + due
   dates**, share widely.

### Frontend‑specific fixing

- **Chunk load errors** after deploy: keep old asset versions on the CDN for a grace
  window; add a global handler that force‑reloads once on `ChunkLoadError`; prompt "new
  version available".
- **Bad release**: instant rollback (previous immutable build), or flag‑gate features so
  you can disable without redeploy.
- **Regression triage**: source‑mapped stack trace → offending commit; check if it's one
  browser/OS/locale; check third‑party status.
- **Perf regression**: compare Lighthouse CI / RUM before‑after, bundle diff, check for
  new large dependency, un‑lazy‑loaded route, render‑blocking script.
- **Reproduce** with session replay + user's env; add a regression test before closing.
- **Prevent**: canary/gradual rollout, pre‑deploy synthetic checks, error‑budget gates,
  automated rollback, better tests, dependency pinning.

### MTTx metrics

MTTD (detect), MTTA (acknowledge), MTTR (resolve), MTBF (between failures). Track to
improve the process, not to blame people.
