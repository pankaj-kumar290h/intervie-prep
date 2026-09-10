# Study Plan — Frontend Dev (4 yrs + some backend) → Product-Based Company

**Goal:** Land a Frontend / Full-stack SDE-2 (or equivalent) role at a product company
(FAANG-tier, unicorns, well-funded startups).

**Time budget:** ~12 weeks at 1.5–2 hrs on weekdays + 4–5 hrs on weekends (~15 hrs/week).
Compress to 8 weeks by doubling weekend load; stretch to 16 if working full-time leaves
less bandwidth.

---

## What product companies actually test

| Round | What they check | Your prep bucket |
| --- | --- | --- |
| DSA / Problem Solving (1–2 rounds) | Arrays, strings, hashmaps, trees, graphs, DP, two pointers, sliding window, recursion | Weeks 1–7 |
| JavaScript deep-dive (often 1 round) | Closures, `this`, event loop, promises, prototypes, polyfills, perf | Weeks 1–4 (parallel) |
| Machine coding / Frontend build (1 round, 60–120 min) | Build a working UI feature from scratch — component design, state, API calls, edge cases | Weeks 5–9 |
| Frontend system design (1 round) | Design Twitter feed / autocomplete / image gallery / a design system — rendering, caching, pagination, accessibility, perf | Weeks 8–11 |
| HLD / backend system design (sometimes, for full-stack) | Load balancing, caching, DB choice, queues, sharding, CAP | Weeks 9–11 |
| Behavioral / Hiring manager | Ownership, conflict, impact, "why leave", failure stories | Weeks 1–12 (ongoing) |

---

## Phase 1 — Foundations (Weeks 1–4)

### DSA (5 hrs/week)
Pattern-first, not topic-count. Do ~4 problems per pattern (1 easy, 2 medium, 1 hard).

- **Week 1:** Arrays + Hashing, Two Pointers. → [../dsa/array-questions.md](../dsa/array-questions.md)
- **Week 2:** Sliding Window, Stack (monotonic stack, valid parentheses, min stack).
- **Week 3:** Binary Search (on array + on answer), Linked List (reverse, cycle, merge, LRU cache).
- **Week 4:** Trees — BFS/DFS, BST ops, level order, LCA, diameter, serialize/deserialize.

**Method for every problem:**
1. 5 min brute force out loud → state time/space.
2. 20 min to optimal. If stuck, read the editorial, close it, re-implement from scratch.
3. Write the pattern + trigger in a personal notes doc ("saw sorted array + pair → two pointers").
4. Re-solve anything you failed 3 days later (spaced repetition).

### JavaScript deep-dive (4 hrs/week, runs in parallel)
Your edge over pure-DSA candidates — don't skip it.

- Execution context, hoisting, scope chain, closures (write 5 closure puzzles).
- `this` binding rules, `call`/`apply`/`bind` — implement your own `bind`.
- Prototypes & prototype chain, `new`, `Object.create`, ES6 classes under the hood.
- Event loop: macro vs micro tasks, `Promise` resolution order (predict console output drills).
- Implement from scratch: `Promise.all`, `Promise.race`, `debounce`, `throttle`, `curry`,
  `deepClone`, `memoize`, event emitter, `Array.prototype.map/reduce`.
- `async`/`await` error handling, promise chaining pitfalls.

### Behavioral (30 min/week)
Start a **brag doc** now. List every project from the last 4 years. For each: problem,
your specific action, measurable impact, what you learned. You'll need 8–10 polished
STAR stories by week 12.

---

## Phase 2 — Core skills (Weeks 5–8)

### DSA (5 hrs/week)
- **Week 5:** Recursion & Backtracking — subsets, permutations, combination sum, N-queens, word search.
- **Week 6:** Graphs — adjacency list, BFS/DFS, topological sort, Union-Find, number of islands, course schedule.
- **Week 7:** Dynamic Programming — 1D (climb stairs, house robber, coin change), 2D (grid paths, LCS, edit distance, 0/1 knapsack).
- **Week 8:** Heaps / Priority Queue — top-K, merge k sorted lists, median from data stream. Intervals — merge, insert, meeting rooms.

### Machine coding (4 hrs/week — the round FE devs win or lose on)
Build each in a 90-min timed session, vanilla JS or React (pick what the target company uses):

- Week 5: Todo app with filters + localStorage persistence; Star rating; Accordion.
- Week 6: Autocomplete/typeahead with debounce + keyboard nav + caching; Tic-tac-toe.
- Week 7: Infinite scroll list; Image carousel; Nested comments (recursive component).
- Week 8: Kanban board with drag-drop; Data table with sort/filter/pagination; Toast notification system.

**Rubric to self-grade:** works end-to-end, component decomposition, no prop-drilling mess,
handles loading/error/empty states, keyboard accessible, no console errors, clean naming.

---

## Phase 3 — System design + polish (Weeks 9–11)

### Frontend system design (4 hrs/week)
Framework: **Requirements → Component architecture → Data model → API design →
Rendering strategy → State management → Performance → Accessibility → Edge cases.**

Practice designs:
- News feed / infinite timeline (pagination, virtualization, optimistic updates, caching).
- Autocomplete search (debounce, request cancellation, caching, ranking, a11y).
- Image gallery / Pinterest grid (lazy loading, responsive images, CDN, layout shift).
- Chat application (websockets, message ordering, offline queue, read receipts).
- Design system / component library (theming, tokens, tree-shaking, versioning).
- Google Docs-lite / collaborative editor (CRDT/OT at a high level, cursor presence).

Cross-cutting topics to be fluent in: CSR vs SSR vs SSG vs ISR, hydration, code splitting,
bundle analysis, Core Web Vitals (LCP/CLS/INP), caching layers (HTTP, service worker,
in-memory, CDN), CDN, image optimization, accessibility (ARIA, focus management,
semantic HTML), security (XSS, CSRF, CSP).

### Backend / HLD (2 hrs/week — leverage your backend experience)
- Horizontal vs vertical scaling, load balancers, reverse proxy.
- Caching: Redis, cache-aside, write-through, eviction, TTL.
- Databases: SQL vs NoSQL trade-offs, indexing, replication, sharding, N+1 problem.
- Message queues (Kafka/SQS), async processing, idempotency.
- API design: REST vs GraphQL, pagination, rate limiting, versioning, auth (JWT, OAuth, sessions).
- CAP theorem, consistency models, idempotency keys.
- Design: URL shortener, rate limiter, notification service, news feed backend.

### Resume & applications (start Week 9)
- One-page resume, impact-first bullets: "Reduced bundle size 40% (2.1MB → 1.3MB), cutting
  LCP from 4.1s to 2.3s." Numbers on every line.
- Update LinkedIn; turn on "open to work" (recruiters only).
- Target list: 15–20 companies in 3 tiers (reach / match / safe). Apply to safe + match
  first to warm up interviewing, reach companies once you've done 2–3 real loops.
- Get referrals — message ex-colleagues, don't cold-apply where you can avoid it.

---

## Phase 4 — Interview mode (Week 12+)

- 3–4 mock interviews: 2 DSA (peer or paid), 1 machine coding, 1 system design.
- Re-solve your "failed" DSA list. Aim: solve any Blind-75 medium in < 20 min.
- Rehearse behavioral stories out loud until they're 2 min each, no rambling.
- Prep your questions for interviewers (team, on-call, growth, tech stack, why the role is open).
- Keep 2–3 problems + one JS polyfill warm daily so skills don't decay between loops.

---

## Question banks / resources

- **DSA:** Blind 75, then NeetCode 150. LeetCode company-tagged lists for your targets.
- **JS:** [../javaScript/dsa-interview-questions.md](../javaScript/dsa-interview-questions.md),
  [../javaScript/frontend-advanced-questions.md](../javaScript/frontend-advanced-questions.md),
  [../javaScript/react-advanced-questions.md](../javaScript/react-advanced-questions.md),
  BFE.dev, GreatFrontEnd.
- **Frontend system design:** "Frontend Interview Handbook", GreatFrontEnd system design,
  `systemdesign.fyi` frontend section.
- **Backend HLD:** [../system-design/](../system-design/), "System Design Interview" (Alex Xu) Vol 1 & 2.
- **Behavioral:** Amazon Leadership Principles doc (good template even for non-Amazon).

---

## Weekly checklist template

```
Week __ / 12
[ ] DSA: ___ problems  (___ solved unaided, ___ needed editorial)
[ ] JS: ___ polyfills / concepts
[ ] Build: ______________________  (time taken: ___ min)
[ ] System design: ______________________
[ ] Behavioral: ___ new STAR stories drafted
[ ] Applications sent: ___   Referrals asked: ___
[ ] Re-solved from fail list: ___
Reflection: what was hard? what pattern did I miss?
```

---

## Realistic milestones

- **End of Week 4:** Comfortable with arrays/strings/hashing/trees; can implement core JS polyfills cold.
- **End of Week 8:** Solve most LeetCode mediums in 25–30 min; ship a working machine-coding
  feature in 90 min.
- **End of Week 11:** Can drive a 45-min frontend system design discussion; resume + target list ready.
- **Week 12+:** Actively interviewing; first offers typically land 4–8 weeks into applying.
