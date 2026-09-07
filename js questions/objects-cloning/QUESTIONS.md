# Objects: Deep Clone, Deep Equal, Immutability — Interview Questions

Asked at: Amazon, Microsoft, Uber, Atlassian, Flipkart, Razorpay, Swiggy, Walmart, CRED.

---

## A. Deep clone

1. **`deepClone(value)`** — handle nested objects & arrays.
2. Extend it to handle: `Date`, `RegExp`, `Map`, `Set`, `Symbol` keys, `undefined`, `NaN`.
3. Handle **circular references** (use a `WeakMap` of seen → clone).
4. Preserve the **prototype** (`Object.create(Object.getPrototypeOf(obj))`).
5. Copy **non-enumerable** properties and getters/setters (`Object.getOwnPropertyDescriptors`).
6. When is `structuredClone` enough, and what does it NOT clone? (functions, DOM nodes, prototype)
7. Why is `JSON.parse(JSON.stringify(obj))` a bad general solution? (loses `undefined`,
   functions, `Date` → string, `NaN`/`Infinity` → null, `Map`/`Set`, throws on cycles)

---

## B. Deep equality

8. **`deepEqual(a, b)`** — primitives, nested objects/arrays, key-count check.
9. Handle `NaN === NaN` → true, `+0` vs `-0`, `Date`, `RegExp`, `Map`, `Set`.
10. Circular-safe deep equal (track pairs visited).
11. **`shallowEqual(a, b)`** — the React re-render check; explain the difference and when each
    is appropriate.

---

## C. Immutability

12. **`deepFreeze(obj)`** — recursively `Object.freeze`, handle cycles.
13. **`produce(state, recipe)`** — a tiny Immer-like: recipe mutates a draft, you return a new
    frozen object, unchanged branches are shared (structural sharing) — simplified version ok.
14. **`setIn(obj, path, value)`** / **`updateIn(obj, path, fn)`** — return a new object,
    copy only along the path.
15. **`getIn(obj, path, default)`** — safe deep read (`'a.b[0].c'` and `['a','b',0,'c']`).
16. **`mergeDeep(target, ...sources)`** — recursive merge, arrays replace vs concat (ask which).
17. **`omitDeep(obj, keys)`** / **`pick(obj, keys)`**.

---

## D. Object utilities

18. **`Object.assign` polyfill** (also in `polyfills/`).
19. **`invert(obj)`** — swap keys/values.
20. **`mapValues(obj, fn)`** / **`mapKeys(obj, fn)`**.
21. **`groupBy(arr, keyFn)`** → `{ key: [...] }`.
22. **`flattenObject(obj)`** → `{ 'a.b.c': 1 }`, and **`unflatten`** back.
23. **`diff(a, b)`** — return the keys/paths that changed between two objects.
24. Count / find deeply nested value; sum all numeric leaves.

---

## E. Discussion

25. `WeakMap` vs `Map` for the "seen" cache in deepClone — why WeakMap?
26. `Object.freeze` is shallow — demonstrate the gotcha.
27. Structural sharing: why does Redux/Immer copy only the changed path?
28. `hasOwnProperty` vs `Object.hasOwn` vs `in` when walking keys.
29. Enumerable vs own vs inherited — which does `Object.keys` / `for...in` / spread see?
30. Symbol keys — do they survive spread? `Object.keys`? `JSON.stringify`? `structuredClone`?

---

## Must be able to state

- `structuredClone` handles cycles, `Date`, `Map`/`Set`, typed arrays — NOT functions, DOM
  nodes, or the prototype chain.
- Deep clone needs a `WeakMap` seen-cache for cycles and to preserve shared references.
- `Object.freeze` is one level deep; `deepFreeze` recurses.
- `deepEqual` must special-case `NaN`, `Date`, `RegExp`, `Map`, `Set`, and check key counts.
- Immutable updates copy only along the changed path; siblings are referentially shared.
