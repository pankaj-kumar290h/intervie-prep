# Debounce / Throttle / Rate Limiting — Interview Questions

Asked at: Uber, Atlassian, Flipkart, Razorpay, Swiggy, Meesho, PhonePe, Groww, CRED.
Extremely common machine-coding warm-up. Interviewers then pile on options.

- **Debounce**: wait until calls stop for `wait` ms, then fire once. (search-as-you-type)
- **Throttle**: fire at most once per `wait` ms. (scroll / resize / mousemove)

---

## A. Core implementations

1. **`debounce(fn, wait)`** — basic trailing-edge. Preserve `this` and arguments.
2. **`debounce(fn, wait, { leading, trailing })`** — leading edge, trailing edge, or both.
3. **`debounce` with `.cancel()` and `.flush()`** methods.
4. **Debounce that returns a promise** resolving with the eventual result of `fn`
   (all pending callers resolve with the same result).
5. **`throttle(fn, wait)`** — leading-edge basic.
6. **`throttle(fn, wait, { leading, trailing })`** — Lodash semantics: guarantee a trailing
   call with the latest args if invoked during the cooldown.
7. **`throttle` implemented with timestamps** vs **with `setTimeout`** — implement both, explain
   the trade-off.
8. **`rafThrottle(fn)`** — throttle to one call per animation frame.

---

## B. Related utilities

9. **`once(fn)`** — call `fn` at most once, cache and return the first result.
10. **`after(n, fn)`** / **`before(n, fn)`** (Lodash) — invoke only after / up to N calls.
11. **`limit(fn, n, windowMs)`** — allow N calls per rolling window; extra calls rejected or queued.
12. **`rateLimiter({ tokens, interval })`** — token-bucket; `await limiter()` before each call.
13. **`batch(fn, { maxSize, maxWait })`** — collect args, flush as one call on size or time.
14. **`queueMicrotaskDebounce`** — coalesce multiple sync calls into one microtask (React-style
    batched updates).

---

## C. Applied / discussion

15. Build a **search box**: debounce the API call, cancel the in-flight request when a new
    keystroke arrives (`AbortController`), ignore out-of-order responses.
16. **Infinite scroll**: throttle the scroll handler; explain why debounce is wrong here.
17. **Autosave**: debounce with a `maxWait` so the user never loses more than N seconds.
18. **Button double-click guard**: which one, and why leading-edge?
19. Why must debounce/throttle keep a single shared `timerId` in closure? What breaks if each
   call had its own?
20. How do `.cancel()` / `.flush()` interact with a pending leading vs trailing call?
21. Testing: how would you unit-test debounce deterministically? (fake timers — `jest.useFakeTimers`)
22. Memory/GC: does a never-flushed debounce leak? What about listeners you forgot to remove?

---

## Reference behaviour to match (Lodash)

| | leading | trailing | on a single call | on rapid calls |
|---|---|---|---|---|
| `debounce` default | false | true | fires once after `wait` | one call, `wait` after the last |
| `debounce {leading:true, trailing:false}` | true | false | fires immediately | one call, at the start |
| `throttle` default | true | true | fires immediately | first now, then every `wait` |

---

## Must be able to state

- Both rely on a **closure** holding `timerId` (+ `lastArgs`, `lastThis`, `lastCallTime`).
- Debounce resets the timer on every call; throttle ignores calls until the window elapses.
- Always forward `this` and `arguments` to `fn` (use a normal function or `fn.apply`).
- `AbortController` cancels the actual network request; debounce only delays firing it.
- `rafThrottle` is the right tool for visual updates tied to scroll/mousemove.
