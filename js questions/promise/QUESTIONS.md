# JS Promise Interview Questions

Questions in the style asked at top product companies (Google, Meta, Amazon, Uber, Atlassian,
Flipkart, Razorpay, Swiggy, PhonePe, etc.). Grouped by theme. Try each in `practice.js`
without looking at MDN first, then verify.

---

## A. Polyfills / "implement this" (most common in machine-coding rounds)

1. **Implement `Promise.all`** — `myPromiseAll(promises)`.
   - Resolves with an array of results in input order.
   - Rejects as soon as any promise rejects.
   - Must accept non-promise values in the array (wrap with `Promise.resolve`).
   - Handle empty array → resolves with `[]`.

2. **Implement `Promise.allSettled`** — return `{ status: 'fulfilled', value }` or
   `{ status: 'rejected', reason }` for each, never rejects.

3. **Implement `Promise.race`** — settle with the first promise that settles (resolve OR reject).

4. **Implement `Promise.any`** — resolve with first fulfilled; if all reject, reject with an
   `AggregateError` containing all reasons.

5. **Implement `Promise.finally`** as `myFinally(promise, cb)` — cb gets no args, does not change
   the resolved value, but a throw/rejection inside cb propagates.

6. **Write a `MyPromise` class** from scratch:
   - constructor takes an executor `(resolve, reject) => {}`
   - states: pending → fulfilled / rejected (one-way)
   - `.then(onFulfilled, onRejected)` returns a new chainable promise
   - `.then` callbacks run asynchronously (microtask / `queueMicrotask`)
   - `.catch`, `.finally`
   - static `MyPromise.resolve`, `MyPromise.reject`
   - bonus: thenable assimilation (resolving with another promise/thenable)

---

## B. Control-flow utilities (asked at Uber, Swiggy, Razorpay, Atlassian)

7. **`promiseAllWithConcurrency(tasks, limit)`** — `tasks` is an array of functions returning
   promises. Run at most `limit` at a time, resolve with all results in order.
   (a.k.a. "async pool" / "task scheduler with rate limit")

8. **`mapWithConcurrency(items, limit, asyncFn)`** — same idea, generic map.

9. **Retry with backoff** — `retry(fn, retries, delayMs)` that retries a failing async `fn`,
   waiting `delayMs * 2^attempt` between tries, rejecting with the last error.

10. **`promiseWithTimeout(promise, ms)`** — reject with `"Timeout"` if it doesn't settle in `ms`,
    otherwise pass through the result. (Bonus: cancel the timer so the process can exit.)

11. **`series(tasks)` / `waterfall(tasks)`** — run async task functions one after another;
    waterfall passes each result to the next.

12. **`raceWithIndex(promises)`** — resolve with `{ value, index }` of the first to settle.

13. **Implement `sleep(ms)`** and then use it to build a `debounceAsync(fn, ms)` that returns a
    promise resolving with the latest call's result.

---

## C. Sequencing & batching

14. **Run an array of async functions in sequence using `reduce`** — no `for` loop, no `await`
    in a loop written explicitly; classic "explain the reduce-over-promises pattern".

15. **`chunkedFetch(ids, batchSize, fetchByIds)`** — split ids into batches, fetch batches
    sequentially, flatten and return all results.

16. **`memoizeAsync(fn)`** — cache by argument key; concurrent calls with the same key share one
    in-flight promise; a rejection should NOT be cached.

17. **Cancellable promise** — wrap a promise so `.cancel()` makes it never resolve/reject
    (and ideally aborts the underlying `fetch` via `AbortController`).

---

## D. Output prediction / "what does this log" (screening rounds)

18. Order of logs:
    ```js
    console.log('1');
    setTimeout(() => console.log('2'), 0);
    Promise.resolve().then(() => console.log('3'));
    console.log('4');
    ```

19. Microtask vs macrotask:
    ```js
    console.log('start');
    setTimeout(() => console.log('timeout'), 0);
    Promise.resolve()
      .then(() => console.log('promise 1'))
      .then(() => console.log('promise 2'));
    console.log('end');
    ```

20. `async/await` desugaring:
    ```js
    async function a() { console.log('a-start'); await b(); console.log('a-end'); }
    async function b() { console.log('b'); }
    console.log('script-start');
    a();
    console.log('script-end');
    ```

21. What does this resolve to, and why?
    ```js
    Promise.resolve(1)
      .then(x => { throw new Error('boom'); })
      .catch(() => 2)
      .then(x => console.log(x));
    ```

22. Does `.finally` change the value?
    ```js
    Promise.resolve('a').finally(() => 'b').then(v => console.log(v)); // ?
    Promise.resolve('a').finally(() => { throw 'c'; }).catch(e => console.log(e)); // ?
    ```

23. Nested resolve:
    ```js
    const p = Promise.resolve(Promise.resolve(42));
    p.then(v => console.log(v)); // ?
    ```

24. Loop + closure + async:
    ```js
    for (let i = 0; i < 3; i++) {
      Promise.resolve().then(() => console.log(i));
    }
    // vs the same with `var`
    ```

25. Why does this swallow the error, and how do you fix it?
    ```js
    async function load() { return fetch('/x'); }
    load(); // rejection is unhandled
    ```

26. `Promise.all` vs `Promise.allSettled` with `[Promise.reject(1), Promise.resolve(2)]`.

27. Return vs no return in `.then`:
    ```js
    Promise.resolve(1)
      .then(v => { Promise.resolve(2); })   // no return
      .then(v => console.log(v));           // ?
    ```

---

## E. Real-world async design (senior / SDE-2+ discussion)

28. Build a **request de-duplicator** for an API client: identical GET requests fired within a
    short window should share one network call.

29. Build a **polling helper** `poll(fn, { interval, timeout, until })` that resolves when
    `until(result)` is true or rejects on timeout.

30. Implement a **promise queue** that guarantees FIFO execution of async tasks with a
    `.add(taskFn)` returning a promise for that task's result.

31. **Rate limiter**: allow N calls per T milliseconds; queued calls resolve when a slot frees.

32. Convert a **callback-style API to promises** (`promisify`) and handle the multi-arg callback
    case.

33. `for await...of` over an async generator that paginates an API — implement `fetchAllPages`.

---

## Verification tips

- Run `node practice.js`.
- For ordering questions, reason first, then run — the gap is where the learning is.
- Key facts to be able to state:
  - `.then` callbacks are **microtasks**; `setTimeout` is a **macrotask**; all microtasks
    drain before the next macrotask.
  - `await x` ≈ `Promise.resolve(x).then(...)` — the code after `await` is a microtask.
  - A promise can settle **once**; later resolve/reject calls are ignored.
  - `resolve(thenable)` adopts the thenable's state (one extra microtask tick per unwrap).
  - `Promise.all` is fail-fast; `allSettled` never rejects; `any` rejects only if all reject.
