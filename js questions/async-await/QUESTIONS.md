# async / await — Interview Questions

Asked at: Meta, Amazon, Uber, Booking, Atlassian, Swiggy, PhonePe, CRED.

`async` function always returns a promise. `await` pauses the function, schedules the rest as
a microtask when the awaited value settles. A `throw` in an async function rejects its promise.

---

## A. Output prediction

1. ```js
   async function f() {
     console.log('a');
     await Promise.resolve();
     console.log('b');
   }
   console.log('start');
   f();
   console.log('end');
   ```

2. ```js
   async function g() { return 1; }
   console.log(g());          // ?
   g().then(v => console.log(v)); // ?
   ```

3. Sequential vs parallel timing:
   ```js
   const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
   async function seq() {
     const a = await wait(100, 'a');
     const b = await wait(100, 'b');
     return [a, b];
   }
   async function par() {
     const [a, b] = await Promise.all([wait(100, 'a'), wait(100, 'b')]);
     return [a, b];
   }
   // How long does each take? 200ms vs 100ms.
   ```

4. ```js
   async function f() {
     try {
       await Promise.reject(new Error('boom'));
     } catch (e) {
       return 'caught';
     } finally {
       console.log('finally');
     }
   }
   f().then(console.log);
   ```

5. Error NOT caught:
   ```js
   async function f() {
     setTimeout(() => { throw new Error('async throw'); }, 0);
   }
   f().catch(() => console.log('caught?')); // does this catch it?
   ```

6. ```js
   const arr = [1, 2, 3];
   arr.forEach(async (x) => {
     await Promise.resolve();
     console.log(x);
   });
   console.log('after forEach'); // order?
   ```

7. `await` a non-promise:
   ```js
   async function f() { console.log(await 42); }
   f();
   console.log('sync');
   ```

8. ```js
   async function f() {
     console.log(1);
     await (async () => { console.log(2); })();
     console.log(3);
   }
   f();
   console.log(4);
   ```

9. Return await vs return:
   ```js
   async function inner() { throw new Error('x'); }
   async function withAwait() { try { return await inner(); } catch { return 'handled'; } }
   async function withoutAwait() { try { return inner(); } catch { return 'handled'; } }
   // which one returns 'handled'?
   ```

10. ```js
    for await (const x of [Promise.resolve(1), Promise.resolve(2)]) console.log(x);
    ```

---

## B. Implement

11. **`asyncForEach(arr, fn)`** — run `fn` sequentially, awaiting each.
12. **`asyncMap(arr, fn, { concurrency })`** — parallel with a concurrency cap.
13. **`asyncFilter(arr, predicate)`** — predicate is async.
14. **`asyncReduce(arr, fn, init)`** — reducer is async, strictly sequential.
15. **`parallelLimit(tasks, limit)`** — see `promise/` Q7, re-implement with async/await.
16. **`retryAsync(fn, { retries, delay, factor, onRetry })`**.
17. **`withTimeout(promise, ms)`** using `Promise.race` + `AbortController` cleanup.
18. **`pMap` clone** — like `Promise.all(arr.map(fn))` but bounded and preserves order.
19. **`waterfall([fn1, fn2, ...])`** — each receives previous result.
20. **`asyncQueue(concurrency)`** — `.push(taskFn)` returns a promise; runs ≤ concurrency at once.
21. **`fetchAllPages(fetchPage)`** — async generator, then collect with `for await`.
22. **`debounceAsync(fn, ms)`** — returns a promise that resolves with the last invocation's result.

---

## C. Conceptual

23. Why is `array.forEach(async ...)` a common bug? What to use instead.
24. `return await x` vs `return x` inside try/catch — when does it matter?
25. Top-level `await` — where is it allowed? (ES modules only)
26. How to run 3 independent async calls in parallel but still `try/catch` each individually.
27. What happens if you never `await` or `.catch` a rejected promise?
28. `Promise.all` vs `Promise.allSettled` for "fetch N things, don't fail all if one fails".
29. Does `await` block the main thread? (No — it yields; other tasks run.)
30. Convert a Promise `.then` chain into `async/await` and vice-versa; watch error propagation.

---

## Must be able to state

- `async` fn → always returns a promise; `return v` fulfills, `throw` rejects.
- Code after `await` runs as a microtask, even when awaiting a non-promise.
- `try/catch` around `await` catches rejections; it does NOT catch errors thrown later in
  detached callbacks (`setTimeout`, event handlers).
- Kick off promises **before** awaiting to parallelize; awaiting in sequence serializes them.
- `for await...of` iterates async iterables and awaits each value.
