# Closures — Interview Questions

Asked at: Amazon, Uber, Atlassian, Flipkart, Razorpay, Adobe, Walmart.

A **closure** = a function + the lexical environment it was created in. The inner function
keeps a live reference to outer variables even after the outer function returns.

---

## A. Warm-up / output prediction

1. Classic loop bug:
   ```js
   for (var i = 0; i < 3; i++) {
     setTimeout(() => console.log(i), 0);
   }
   ```
   What logs? Fix it **three ways** (`let`, IIFE, `setTimeout` 3rd arg).

2. ```js
   function counter() {
     let count = 0;
     return () => ++count;
   }
   const a = counter(), b = counter();
   console.log(a(), a(), b()); // ?
   ```

3. ```js
   let fns = [];
   for (let i = 0; i < 3; i++) fns.push(() => i);
   console.log(fns.map(f => f())); // ?  and with var?
   ```

4. ```js
   function outer() {
     let x = 10;
     function inner() { console.log(x); }
     x = 20;
     return inner;
   }
   outer()(); // ? (captures variable, not value)
   ```

---

## B. Implement using closures

5. **`createCounter(initial = 0)`** returning `{ increment, decrement, reset, value }`.
   `value` must reflect current count; internal count not accessible from outside.

6. **`once(fn)`** — returns a function that invokes `fn` only the first time; subsequent calls
   return the first result. (Follow-up: preserve `this` and arguments.)

7. **`memoize(fn)`** — cache results by arguments. Follow-ups: custom key resolver, cache size
   limit (LRU), handle object args.

8. **`makeAdder`** — `add(2)(3)(4)() === 9` (curry-ish with closure accumulation).

9. **Private counter module** using an IIFE — expose only `inc` and `get`, keep `count` private.

10. **`limitCalls(fn, n)`** — allow `fn` to be called at most `n` times, then throw / no-op.

11. **`createLogger(namespace)`** — returns `log(msg)` that prefixes every message with the
    namespace and an incrementing sequence number.

12. **`range(start, end, step)`** implemented as a closure-based iterator with a `.next()` method.

---

## C. Trickier / conceptual

13. What's printed and why — shared vs independent closure state:
    ```js
    function makeFuncs() {
      let arr = [];
      for (let i = 0; i < 3; i++) arr.push(function () { return i * 2; });
      return arr;
    }
    ```

14. Memory: does a closure keep the **entire** outer scope alive, or only what it references?
    (Modern engines: only referenced variables — but be able to describe an accidental leak.)

15. Fix this leak:
    ```js
    function attach() {
      const huge = new Array(1e6).fill('*');
      document.getElementById('btn').onclick = () => console.log('clicked'); // huge is retained?
    }
    ```

16. Explain why `this` is NOT part of a closure (it's determined by call-site), then show how
    an arrow function "closes over" `this` lexically.

17. Build a **debounce** (full impl belongs in `debounce-throttle/`, but explain which parts
    rely on closure — the `timerId` and `lastArgs`).

18. **`curry(fn)`** generic — explain how the closure accumulates arguments until `fn.length`
    is reached. (Full impl in `currying-composition/`.)

19. Interview favorite: implement `sum(1)(2)(3)...()` **and** `sum(1,2)(3)(4)()` in one function.

20. What does this print?
    ```js
    const funcs = [];
    for (let i = 0; i < 3; i++) {
      funcs[i] = function () { console.log(i); };
    }
    funcs[0](); funcs[1](); funcs[2]();
    // Now: what if you also did `i = 99` right after the loop with `var`?
    ```

---

## Must be able to state

- Closures are created **every time a function is created**, at function-creation time.
- `let`/`const` are block-scoped → each loop iteration gets a fresh binding; `var` has one
  function-scoped binding shared by all iterations.
- Closures capture **variables (bindings)**, not values at capture time.
- Common uses: data privacy / encapsulation, function factories, currying, memoization,
  maintaining state in async callbacks, the module pattern.
