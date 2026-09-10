# 4. Testing

Covers: overview · unit & integration · E2E & automation · A/B testing · performance
testing · TDD · security testing

---

## 4.2 Testing Overview

### Testing pyramid (vs trophy)

- **Pyramid**: many unit → fewer integration → few E2E. Fast, cheap at the base.
- **Testing Trophy** (Kent C. Dodds, popular for frontend): static (TS, ESLint) →
  **integration is the biggest layer** (best confidence‑per‑cost) → unit → E2E.
- Anti‑pattern: **ice‑cream cone** (mostly manual + E2E) — slow, flaky, expensive.

### Terms

- **Test double** types: **dummy**, **stub** (canned answers), **spy** (records calls),
  **mock** (pre‑programmed with expectations), **fake** (working lightweight impl, e.g.
  in‑memory DB).
- **Coverage** metrics: line, statement, branch, function. High coverage ≠ good tests;
  use as a floor, watch for asserting nothing.
- **Flaky test** – passes/fails non‑deterministically (timing, order, network, shared
  state). Quarantine + fix; don't just retry forever.
- **AAA**: Arrange, Act, Assert. One logical assertion/behaviour per test.
- **Deterministic**: control time (fake timers), randomness (seed), network (mock),
  timezone/locale.

### What to test on frontend

Behaviour users care about, edge cases, error/loading/empty states, accessibility roles,
conditional rendering, reducers/selectors/utils, custom hooks, form validation. Don't
test implementation details (internal state names, that a specific lib method was called).

---

## 4.3 Unit and Integration Testing

### Unit

Smallest isolated piece — pure function, reducer, hook, single component with deps
stubbed. Fast (ms), run on every save.

```js
test('formatPrice adds currency and 2 decimals', () => {
  expect(formatPrice(5)).toBe('$5.00');
});
```

### Integration

Multiple units together — a component tree + its store + a mocked API. Highest ROI for
UI. Use **Testing Library** philosophy: query by accessible role/text/label, interact
like a user, assert on rendered output.

```jsx
test('shows error when login fails', async () => {
  server.use(rest.post('/login', (_, res, ctx) => res(ctx.status(401))));
  render(<LoginForm />);
  await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials/i);
});
```

### Tooling

- **Runners**: Jest, **Vitest** (Vite‑native, fast, ESM, Jest‑compatible API).
- **Component**: React Testing Library, Vue Testing Library, `@testing-library/user-event`.
- **Network mocking**: **MSW** (Mock Service Worker) — intercepts at network level, same
  handlers for tests + dev + Storybook. Preferred over mocking `fetch`.
- **Snapshots**: use sparingly (inline, small); large snapshots rot and get rubber‑stamped.
- **jsdom / happy‑dom** simulate the DOM in Node (no real layout, no real paint).
- Mock modules: `vi.mock` / `jest.mock`; fake timers: `vi.useFakeTimers()`.

### Best practices

- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId` (last
  resort). `findBy*` for async, `queryBy*` for asserting absence.
- Avoid `act` warnings by awaiting `findBy` / `waitFor`.
- Don't test third‑party libs; do test your integration with them.
- Keep tests isolated: reset handlers, clear mocks, no shared mutable state.

---

## 4.4 E2E and Automation Testing

Drives a **real browser** against a **running app** (ideally full stack or realistic
mocks). Highest confidence, slowest, flakiest.

### Tools

- **Playwright** – multi‑browser (Chromium/Firefox/WebKit), auto‑waiting, parallel,
  trace viewer, network interception, mobile emulation, component testing. Current default.
- **Cypress** – great DX, time‑travel debugger, runs in‑browser (some architectural
  limits: single tab, same‑origin history, no true multi‑domain until recent).
- **Selenium / WebDriver** – legacy, language‑agnostic, Grid for scale.
- **Puppeteer** – Chrome automation, more for scraping/PDF than test framework.

### Making E2E reliable

- **Auto‑waiting / web‑first assertions** — never `sleep`; wait for elements/network.
- **Stable selectors**: `data-testid` or roles, not CSS classes / nth‑child.
- **Isolation**: fresh state per test — seed DB via API/task, `beforeEach` reset,
  unique test users, clean up.
- **Auth shortcuts**: log in via API + set cookie/localStorage once, reuse storage state.
- **Control external deps**: mock third‑party (payments, maps) at network layer.
- **Parallelize + sharding** in CI; retry only known‑flaky with tracking.
- **Artifacts on failure**: screenshots, video, trace, console/network logs.
- Run a **smoke subset** on every PR, full suite nightly / pre‑release.
- **Visual regression** (Percy, Chromatic, Playwright `toHaveScreenshot`) — catches CSS
  regressions; manage flakiness with thresholds, freeze animations/fonts/time.
- **Cross‑browser / device**: BrowserStack, Sauce Labs, LambdaTest.

---

## 4.5 A/B Testing

Split‑test: show variant A vs B (vs C…) to random user segments, measure a metric,
decide with statistics.

### Concepts

- **Hypothesis** → **primary metric** (conversion, CTR, revenue/user) + **guardrail
  metrics** (latency, error rate, churn) that must not regress.
- **Randomization unit**: usually user (sticky via hashed user/anon id → bucket), or
  session. Consistent bucketing so a user always sees the same variant.
- **Sample size / power** – compute upfront from baseline rate, minimum detectable
  effect, power (0.8), significance (α = 0.05). Don't **peek** and stop early (inflates
  false positives) unless using **sequential testing** / Bayesian methods.
- **Statistical significance** (p‑value / confidence interval) vs **practical
  significance**. Beware multiple comparisons (Bonferroni / FDR), novelty effect,
  seasonality, Simpson's paradox.
- **Feature flags** power rollouts: kill switch, gradual %, targeting rules, holdouts.

### Frontend implementation

- **Flicker / FOOC** (flash of original content): variant applied after render.
  Mitigate with server‑side / edge assignment, or a synchronous anti‑flicker snippet
  (hide body briefly), or SSR the assigned variant.
- Send the assigned variant with analytics events (exposure logging) — only count users
  actually *exposed*.
- Keep variant code isolated + easy to delete; clean up finished experiments.
- CLS/perf impact of the experiment framework itself.
- Tools: LaunchDarkly, Optimizely, GrowthBook (OSS), Statsig, Split, Unleash,
  GA4 + custom.

### Related

- **Multivariate testing** (multiple factors at once), **feature experimentation**,
  **canary release**, **shadow / dark launch**, **interleaving** (search ranking).

---

## 4.6 Performance Testing

### Types

- **Load** – expected traffic, verify SLAs hold.
- **Stress** – beyond capacity, find the breaking point + failure mode.
- **Spike** – sudden surge (flash sale).
- **Soak / endurance** – sustained load for hours → memory leaks, resource exhaustion.
- **Scalability** – how metrics change as you add load/instances.
- **Frontend / client perf** – rendering, bundle, runtime (distinct from backend load).

### Backend tooling

k6 (JS scripting), Artillery, Gatling, Locust, JMeter. Measure **p50/p95/p99 latency**,
throughput (RPS), error rate, saturation (CPU/mem/connections). Test in prod‑like env,
with think time + realistic data + warm caches noted.

### Frontend perf testing

- **Lab** (synthetic, reproducible): Lighthouse / Lighthouse CI, WebPageTest,
  `playwright` traces, `performance.mark/measure`, bundle analyzers.
- **Field** (RUM — real users): `web-vitals` lib → analytics; Chrome CrUX / PSI for the
  75th‑percentile of real users.
- **Core Web Vitals**: **LCP** (< 2.5s), **INP** (< 200ms, replaced FID), **CLS**
  (< 0.1). Plus TTFB, FCP, TBT (lab proxy for INP).
- **Performance budgets** in CI (max bundle KB, max LCP) → fail the build on regression.
- Test on **throttled CPU (4–6×) + slow 3G/4G**, low‑end device, cold cache.
- Regression detection: track metrics over time, alert on p75 drift.

---

## 4.7 Test‑Driven Development (TDD)

### Cycle: Red → Green → Refactor

1. **Red** – write a failing test for the next small behaviour.
2. **Green** – simplest code to pass (even if ugly).
3. **Refactor** – clean up with the safety net, tests stay green.
Small steps, commit often.

### Benefits

Forces you to design the API from the caller's view, gives fast feedback, produces a
regression suite as a by‑product, discourages over‑engineering (YAGNI), keeps units
testable/decoupled, doubles as documentation.

### Costs / caveats

Slower upfront, hard when requirements are fuzzy or design is exploratory, can over‑mock
and couple tests to implementation, UI/visual work is awkward (pair with Storybook /
visual tests). Not a substitute for integration/E2E.

### Variants

- **BDD** – describe behaviour in `Given/When/Then`, ubiquitous language, tools like
  Cucumber/`jest-cucumber`; RTL encourages BDD‑style ("it shows an error when…").
- **ATDD** – acceptance tests written with stakeholders first.
- **Outside‑in (London school)** – start from a failing acceptance test, mock
  collaborators, drive downward. **Inside‑out (Detroit/classicist)** – build from core
  units with real objects.

---

## 4.8 Security Testing

### Approaches

- **SAST** – static analysis of source (Semgrep, CodeQL, SonarQube, ESLint security
  plugins). Finds injection sinks, hardcoded secrets, unsafe APIs. Fast, in CI, some
  false positives.
- **DAST** – runs against the running app (OWASP ZAP, Burp Suite). Finds runtime issues:
  missing headers, XSS, auth flaws, misconfig.
- **IAST** – instruments a running app during tests, combines both.
- **SCA** – dependency/CVE scanning (Snyk, Dependabot, `npm audit`, Trivy, OWASP
  Dependency‑Check) + license compliance + SBOM.
- **Secret scanning** – gitleaks, trufflehog, GitHub secret scanning, pre‑commit hooks.
- **Penetration testing** – manual expert testing, usually pre‑release / annual.
- **Fuzzing** – random/mutated inputs to find crashes/edge cases.
- **Container / IaC scanning** – Trivy, Checkov, tfsec.

### Frontend‑specific checks

- CSP present + effective (csp-evaluator), all **security headers** (securityheaders.com,
  Mozilla Observatory).
- No secrets/source maps in the bundle; check `connect-src` allow‑list.
- XSS in every user‑input render path; sanitizer in place for rich text.
- Dependency audit clean; SRI on external scripts.
- CSRF protections on state‑changing endpoints; cookie flags (`HttpOnly`, `Secure`,
  `SameSite`).
- CORS config not overly permissive (`*` + credentials, reflecting any origin).
- Auth: token expiry/refresh, logout invalidates, no sensitive data in `localStorage`,
  clickjacking (`frame-ancestors`).
- Open redirect / `postMessage` origin checks / `target=_blank` rel.

### Shift left

Security in CI (SAST + SCA + secret scan on every PR), DAST on staging, threat modeling
in design, security acceptance criteria on stories, dependency update automation.
