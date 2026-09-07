# Event Loop, Microtasks & Macrotasks — Interview Questions

Asked at: Google, Meta, Uber, Atlassian, Booking, Razorpay, CRED — almost always as
"what is the order of the console output".

Model:
- Call stack runs synchronous code to completion.
- After each task, the engine **drains the entire microtask queue** (Promise callbacks,
  `queueMicrotask`, `MutationObserver`, `await` continuations).
- Then it takes **one macrotask** (`setTimeout`, `setInterval`, `setImmediate` (Node), I/O,
  UI events) and repeats.
- Node also has `process.nextTick` (runs before other microtasks) and phases.

---

## A. Order-of-output (predict, then run)

1. ```js
   console.log(1);
   setTimeout(() => console.log(2), 0);
   Promise.resolve().then(() => console.log(3));
   console.log(4);
   ```

2. ```js
   console.log('start');
   setTimeout(() => console.log('timeout'), 0);
   Promise.resolve().then(() => console.log('p1')).then(() => console.log('p2'));
   console.log('end');
   ```

3. ```js
   Promise.resolve().then(() => {
     console.log('a');
     setTimeout(() => console.log('b'), 0);
   });
   setTimeout(() => {
     console.log('c');
     Promise.resolve().then(() => console.log('d'));
   }, 0);
   ```

4. ```js
   async function f() {
     console.log(1);
     await null;
     console.log(2);
   }
   console.log(3);
   f();
   console.log(4);
   Promise.resolve().then(() => console.log(5));
   ```

5. ```js
   console.log('A');
   setTimeout(() => console.log('B'), 0);
   Promise.resolve().then(() => {
     console.log('C');
     return Promise.resolve();
   }).then(() => console.log('D'));
   queueMicrotask(() => console.log('E'));
   console.log('F');
   ```
   (note: `return Promise.resolve()` inside `.then` costs **extra** microtask ticks)

6. Node-only:
   ```js
   setTimeout(() => console.log('timeout'), 0);
   setImmediate(() => console.log('immediate'));
   process.nextTick(() => console.log('nextTick'));
   Promise.resolve().then(() => console.log('promise'));
   ```

7. ```js
   for (let i = 0; i < 3; i++) {
     setTimeout(() => console.log('timeout', i), 0);
     Promise.resolve().then(() => console.log('promise', i));
   }
   ```

8. ```js
   console.log(1);
   setTimeout(() => {
     console.log(2);
     Promise.resolve().then(() => console.log(3));
   }, 0);
   setTimeout(() => {
     console.log(4);
     Promise.resolve().then(() => console.log(5));
   }, 0);
   Promise.resolve().then(() => console.log(6));
   console.log(7);
   ```

9. `await` in a loop vs `Promise.all`:
   ```js
   async function seq() { for (const x of [1,2,3]) { console.log(await x); } }
   async function par() { console.log(await Promise.all([1,2,3])); }
   ```
   Reason about tick counts.

10. ```js
    new Promise((resolve) => { console.log('executor'); resolve(); })
      .then(() => console.log('then'));
    console.log('after');
    ```
    (executor is synchronous!)

---

## B. Conceptual

11. Difference between microtask and macrotask queue. Give 3 examples of each.
12. Can a microtask starve the event loop? (yes — infinite `.then` chain blocks rendering)
13. Why does `setTimeout(fn, 0)` not run immediately? Minimum delay clamping (4ms nested).
14. Where does `requestAnimationFrame` fit? (before paint, not a normal macrotask)
15. How does `await` desugar? Show `await x` ≈ `Promise.resolve(x).then(continuation)`.
16. In Node, order of `process.nextTick` vs `Promise.then` vs `setImmediate` vs `setTimeout`.
17. Does `Promise` executor code run sync or async? What about `.then` callbacks?
18. What happens to an unhandled rejection? (`unhandledrejection` event / process crash in Node)
19. Rendering: when does the browser get a chance to paint relative to tasks/microtasks?
20. `queueMicrotask` vs `Promise.resolve().then` — any practical difference?

---

## C. Build

21. **`scheduler`** that runs tasks with priorities: `nextTick` > microtask > macrotask —
    simulate the ordering with your own queues.
22. **`asyncSeries` vs `asyncParallel`** and log the event-loop tick each callback runs on.
23. **`nextFrame()`** helper returning a promise that resolves on next `requestAnimationFrame`.
24. **Break a long task** into chunks that yield to the event loop (`await scheduler.yield()` /
    `setTimeout(0)` between chunks) so the UI stays responsive.

---

## Must be able to state

- Sync code first → drain ALL microtasks → one macrotask → drain ALL microtasks → repeat.
- Promise `.then`/`.catch`/`.finally` callbacks and `await` continuations are microtasks.
- `setTimeout`/`setInterval`/DOM events/`setImmediate` are macrotasks.
- `process.nextTick` (Node) jumps ahead of the Promise microtask queue.
- The Promise **executor** runs synchronously; only the reactions are deferred.
