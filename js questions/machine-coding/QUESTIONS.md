# Machine Coding — Bigger Builds (45–90 min rounds)

Asked at: Uber, Atlassian, Flipkart, Razorpay, Swiggy, PhonePe, CRED, Meesho, Groww,
Walmart, Microsoft, ThoughtWorks, Arcesium, tekion.

Each of these has been an actual machine-coding problem. Build vanilla JS (no libraries),
write a few test cases, handle edge cases, keep the API clean.

---

## A. Core data structures / utilities

1. **`EventEmitter`** — `on(event, cb)`, `once`, `off`, `emit(event, ...args)`, `listenerCount`.
   Follow-ups: wildcard `*`, error if no `error` listener, `prependListener`, return an
   unsubscribe function from `on`.

2. **`LRUCache(capacity)`** — `get(key)`, `put(key, value)`, O(1) both (Map, or Map + DLL).
   Follow-ups: TTL per entry, `peek`, stats (hits/misses), `LFUCache`.

3. **`ObservableStore` / mini-Redux** — `createStore(reducer, initialState)` with
   `getState`, `dispatch`, `subscribe`. Then add `combineReducers` and middleware
   (`applyMiddleware`, thunk).

4. **`PubSub`** with topic hierarchy (`'order.created'` also fires `'order.*'` listeners).

5. **`Promise` polyfill** (full A+) — see `promise/`.

6. **`JSON.stringify` / `JSON.parse`** from scratch — see `polyfills/`.

7. **`deepClone` / `deepEqual`** — see `objects-cloning/`.

8. **`_.get` / `_.set`** deep path accessors with array-notation support.

9. **`memoize`** with configurable cache key, size limit, TTL, and `.clear()`.

10. **`retry` + `timeout` + `circuit breaker`** wrapper for an async function.

---

## B. Async / scheduling

11. **Task scheduler with concurrency limit** — `scheduler.add(taskFn)` → promise;
    runs ≤ N at once, FIFO. (see `promise/` Q7)

12. **Rate limiter** — token bucket / sliding window; `await limiter.acquire()`.

13. **Request de-duplication + cache layer** over `fetch` (in-flight sharing, TTL cache,
    `stale-while-revalidate`).

14. **Polling utility** — `poll(fn, { interval, timeout, until, backoff })`.

15. **Async retry queue** that persists failed jobs and retries with backoff.

16. **`asyncSeries` / `asyncParallel` / `asyncRace`** utility library (like `async` npm pkg).

17. **Cancelable fetch wrapper** with `AbortController` + timeout + retry.

---

## C. DOM / UI logic (describe or build with jsdom)

18. **Event delegation** helper — `delegate(root, selector, event, handler)`.

19. **Custom `document.getElementsByClassName`** / a tiny DOM query engine.

20. **Virtualized list** — given 100k rows, render only visible ones on scroll.

21. **`classNames(...)`** utility (conditional class strings).

22. **Accordion / Tabs / Modal / Carousel / Typeahead** — state machine + rendering,
    keyboard accessible. (Typeahead: debounce + abort + highlight + arrow-key nav.)

23. **Drag and drop** list reordering (pointer events).

24. **Infinite scroll** with `IntersectionObserver` + loading + error + retry states.

25. **`todo` app / `star rating` / `progress bar` / `OTP input` / `stopwatch`** — classic
    front-end machine-coding warm-ups.

26. **Grid / Board**: Tic-Tac-Toe, Connect Four, Minesweeper, Snake — game loop + state.

---

## D. Parsing / algorithms in JS

27. **Calculator** — evaluate `"2 + 3 * (4 - 1)"` (tokenize → shunting-yard → RPN eval).

28. **JSON path query** — `query(obj, 'a.b[0].c')` returning all matches, support `*`.

29. **Template engine** — `render('Hi {{user.name}}, you have {{count}} msgs', data)`,
    support conditionals / loops (`{{#each}}`) for bonus.

30. **CSV parser** — handle quoted fields, embedded commas, newlines, escaped quotes.

31. **URL builder / parser** — `parseQuery`, `stringifyQuery`, nested (`a[b]=1`).

32. **Trie / autocomplete** — `insert(word)`, `search(prefix)` → top-k suggestions.

33. **Debounce / throttle library** with cancel/flush — see `debounce-throttle/`.

34. **`i18n` / pluralization** helper — `t('key', { count })` with ICU-lite messages.

35. **Undo/redo manager** (command stack) for a text editor or drawing app.

---

## E. System-ish (senior)

36. **Client-side router** — `route(path, handler)`, history API, params (`/user/:id`),
    guards, lazy loading.

37. **Form library** — field registration, validation (sync + async), `dirty`/`touched`,
    submit handling, error display.

38. **Analytics batching client** — queue events, flush on size/time/`beforeunload`,
    retry with backoff, dedupe.

39. **Feature-flag SDK** — evaluate flags with targeting rules, local cache, polling refresh.

40. **In-memory DB** — `insert`, `find(query)` with operators (`$gt`, `$in`), `update`,
    indexes.

---

## Evaluation rubric (what they score)

- **Working solution first**, then edge cases, then extensions.
- Clean API / naming; small focused functions.
- Correct async handling (no unhandled rejections, no race conditions).
- Test cases you write yourself — show 3–5 covering happy path + edges.
- Talk while coding: state assumptions, call out trade-offs.
- Time-box: 60% build core, 20% edge cases, 20% tests + polish.

Start with `EventEmitter`, `LRUCache`, and the concurrency scheduler — they cover ~50% of
real machine-coding rounds.
