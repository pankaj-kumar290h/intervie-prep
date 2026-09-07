# `this`, call / apply / bind — Interview Questions

Asked at: Microsoft, Amazon, Adobe, Uber, Flipkart, Paytm, PhonePe.

`this` is decided by **how a function is called** (call-site), not where it's defined —
except arrow functions, which take `this` lexically.

The 4 rules, highest precedence first:
1. `new Fn()` → `this` = the new object
2. `fn.call(obj)` / `fn.apply(obj)` / `fn.bind(obj)` → `this` = `obj`
3. `obj.fn()` → `this` = `obj`
4. plain `fn()` → `this` = `undefined` (strict) / `globalThis` (sloppy)
Arrow functions ignore all 4 and inherit `this` from the enclosing scope.

---

## A. Output prediction

1. ```js
   const obj = {
     name: 'A',
     greet() { return this.name; },
     greetArrow: () => this.name,
   };
   console.log(obj.greet());       // ?
   console.log(obj.greetArrow());  // ?
   ```

2. Lost `this`:
   ```js
   const obj = { name: 'A', greet() { return this.name; } };
   const fn = obj.greet;
   console.log(fn()); // ?
   ```

3. ```js
   const obj = {
     name: 'A',
     nested() {
       function inner() { return this?.name; }
       return inner();
     },
   };
   console.log(obj.nested()); // ?  then fix inner to see 'A' two ways
   ```

4. ```js
   const obj = {
     count: 0,
     start() {
       setTimeout(function () { this.count++; console.log(this.count); }, 0);
     },
   };
   obj.start(); // ?  then fix with arrow / bind
   ```

5. ```js
   function Person(name) { this.name = name; }
   const p = Person('Bob'); // no `new`
   console.log(p);          // ?
   console.log(globalThis.name); // ? (sloppy mode)
   ```

6. ```js
   const arr = [1, 2, 3];
   const obj = { multiplier: 2 };
   console.log(arr.map(function (x) { return x * this.multiplier; }, obj)); // ?
   console.log(arr.map((x) => x * this.multiplier));                        // ?
   ```

7. Chained bind:
   ```js
   function f() { return this.v; }
   const g = f.bind({ v: 1 }).bind({ v: 2 });
   console.log(g()); // ? (bind can't be re-bound)
   ```

8. ```js
   class Counter {
     count = 0;
     inc() { this.count++; }
     incArrow = () => { this.count++; };
   }
   const c = new Counter();
   const { inc, incArrow } = c;
   incArrow(); console.log(c.count); // ?
   inc();      // ?
   ```

---

## B. Implement

9. **`myCall(fn, thisArg, ...args)`** — polyfill `Function.prototype.call`.
10. **`myApply(fn, thisArg, argsArray)`** — polyfill `apply`.
11. **`myBind`** — polyfill `Function.prototype.bind`. Follow-ups:
    - partial application (`bind` args + call args)
    - `new (boundFn)` must use the original prototype and ignore the bound `this`
12. **`bindAll(obj, ...methodNames)`** — bind listed methods to `obj` in place (React class pattern).
13. **`softBind(fn, obj)`** — like bind, but a later explicit `call`/`apply` still wins; only
    defaults `this` when it would otherwise be `undefined`/global.
14. **`function flatten this`** — write `debounce` / `throttle` that preserve caller's `this`
    (cross-reference `debounce-throttle/`).

---

## C. Conceptual follow-ups

15. Why does `const greet = obj.greet; greet()` lose `this` but `obj.greet()` doesn't?
16. Arrow function as an object method — why is it (almost always) a bug?
17. What is `this` at the top level of a module vs a script vs a CommonJS file vs a function?
18. Does `class` body run in strict mode? What is `this` in a method called without a receiver?
19. `Function.prototype.bind` — how many times does the executor / target run? Can you unbind?
20. Event handlers: `element.addEventListener('click', obj.handle)` — what is `this` in `handle`?
    Fix it two ways.

---

## Must be able to state

- `this` is dynamic (call-site) for normal functions, lexical for arrows.
- `call`/`apply` invoke immediately (apply takes an array); `bind` returns a new function.
- `new` + a bound function: the `this` from bind is ignored, prototype is preserved.
- Class fields defined as arrow functions are per-instance and auto-bound (costs memory).
- In strict mode a bare `fn()` has `this === undefined` — no accidental globals.
