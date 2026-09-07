# Polyfills — Interview Questions

Asked at: Amazon, Uber, Flipkart, Razorpay, Swiggy, Zomato, PhonePe, Meesho, CRED, Groww.
Machine-coding staple — "implement `Array.prototype.map` from scratch, no built-in map".

Rules interviewers expect you to respect:
- Attach to the right `prototype`, non-enumerable if asked.
- Read `this` as the array/object; support the `thisArg` parameter where the spec has one.
- Skip holes in sparse arrays for `map`/`filter`/`forEach` (bonus points).
- Callback signature `(element, index, array)`.

---

## A. Array methods

1. **`Array.prototype.myMap(cb, thisArg)`**
2. **`Array.prototype.myFilter(cb, thisArg)`**
3. **`Array.prototype.myReduce(cb, initialValue)`** — handle missing initial value (throw on
   empty array with no init), correct starting index.
4. **`Array.prototype.myForEach(cb, thisArg)`** — returns `undefined`.
5. **`Array.prototype.mySome` / `myEvery`** — short-circuit correctly.
6. **`Array.prototype.myFind` / `myFindIndex`**
7. **`Array.prototype.myFlat(depth = 1)`** — recursion or stack; then `myFlatMap`.
8. **`Array.prototype.myIndexOf` / `myIncludes`** — `includes` must match `NaN`, `indexOf` must not.
9. **`Array.prototype.myFill(value, start, end)`** and **`mySlice`** (non-mutating).
10. **`Array.from` polyfill** — array-likes, iterables, `mapFn`, `thisArg`.
11. **`Array.prototype.myGroupBy(cb)`** (a.k.a `Object.groupBy`).

---

## B. Function methods

12. **`Function.prototype.myCall(thisArg, ...args)`**
13. **`Function.prototype.myApply(thisArg, argsArray)`**
14. **`Function.prototype.myBind(thisArg, ...bound)`** — partial args + `new` safety
    (bound function used as constructor must ignore `thisArg`, keep prototype).

---

## C. Object / misc

15. **`Object.assign` polyfill** — own enumerable props, invoke getters, skip null/undefined sources.
16. **`JSON.stringify` polyfill** (subset) — strings, numbers, booleans, null, arrays, plain
    objects; skip `undefined`/functions in objects, render them as `null` in arrays; handle
    nested. (Bonus: `toJSON`, throw on circular.)
17. **`JSON.parse`** — recursive-descent parser for the JSON grammar (hard; senior-level).
18. **`Promise.all` / `race` / `allSettled` / `any`** — see `promise/` folder.
19. **`_.get(obj, 'a.b[0].c', default)`** — safe deep path getter.
20. **`_.debounce` / `_.throttle`** — see `debounce-throttle/`.
21. **`curry`** — see `currying-composition/`.
22. **`deepClone`** — see `objects-cloning/`.
23. **`EventEmitter`** (`on`, `off`, `once`, `emit`) — see `machine-coding/`.
24. **`setInterval` using `setTimeout`** and **`clearInterval`** counterpart.
25. **`Array.prototype[Symbol.iterator]`** custom / a `range` iterable.

---

## D. Follow-ups they always ask

- Why non-enumerable? (`Object.defineProperty` with `enumerable: false` so `for...in` / spread
  don't pick it up)
- What if `this` is `null`/`undefined` in `call`? (defaults to global in sloppy mode)
- How do you generate a unique property key for the temp method in `myCall`? (`Symbol()`)
- `myReduce` with no initial value on `[]` → `TypeError`.
- `myMap` should preserve array length and holes.
- `myBind` returning a function whose `.length` and `.name` ideally match.

---

## Must be able to state

- `call`/`apply` differ only in how args are passed; both invoke now. `bind` returns a fn.
- `reduce` without an initial value uses element 0 as the accumulator and starts at index 1.
- `includes` uses SameValueZero (so `NaN` matches); `indexOf` uses strict `===`.
- `flat` default depth is 1; `Infinity` fully flattens.
- Polyfill = feature detect (`if (!Array.prototype.map)`) then define non-enumerable.
