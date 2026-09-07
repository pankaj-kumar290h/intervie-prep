# Output Prediction — Answers & Reasons

Cover this file, answer aloud, reveal. The *reason* matters more than the output.

## Coercion & equality

1. `false` — 0.1 + 0.2 = 0.30000000000000004 (IEEE-754 double).
2. `true` — `![]` is `false`; `[] == false` → `[] == 0` → `'' == 0` → `0 == 0`.
3. `true`, `false` — loose equality treats null/undefined as equal; strict checks type.
4. `false`, `true` — `NaN` is never `===` anything; `Object.is` special-cases it.
5. `'object'`, `'number'`, `'object'`, `'function'` — `typeof null` is a historic bug.
6. `true false` — left-associative. `1<2<3`: `(1<2)` → `true` → `true<3` → `1<3` → `true`. `3>2>1`: `(3>2)` → `true` → `true>1` → `1>1` → `false`.
7. `2`, `'53'`, `10` — `-`/`*` coerce to number; `+` with a string concatenates.
8. `''`, `'[object Object]'`, `0` — `{}` at statement start is a block, so `{} + []` is `+[]` = 0. Inside `console.log(...)` it's `'[object Object]'`.
9. `3` — `true` coerces to `1`.
10. `0, 0, 16, 0, NaN, 0, 1, NaN` — `+''`→0, `+'0x10'`→16, `+null`→0, `+undefined`→NaN, `+[]`→0, `+[1]`→1, `+[1,2]`→NaN.

## Scope, hoisting, closures

11. `var`: `3 3 3` (one shared binding, loop finished before callbacks). `let`: `0 1 2` (fresh binding per iteration).
12. `ReferenceError` — `x` inside `f` is in the TDZ; the inner `let x` shadows the outer.
13. `undefined` — `var a` is hoisted inside `foo`, shadows outer, not yet assigned at the log.
14. `'function'` — function declaration `bar` is hoisted above the `var bar` and the log.

## `this`

15. `1`, `undefined` (strict) / throws on `this.n` — `o.get()` has receiver `o`; `g()` is a bare call.
16. `undefined` — arrow takes `this` from module/global scope, not `o`.
17. `2` — constructor returning an object replaces the instance.

## Event loop / async

18. `1 4 3 2` — sync first, then microtask (`.then`), then macrotask (`setTimeout`).
19. `start a end b` — `f()` runs sync to `await`, suspends; `b` is a microtask after sync code.
20. `boom` — throw becomes rejection, `.catch` maps to the message string, next `.then` logs it.
21. `1` — `.then(3)` ignores a non-function argument; the value 1 passes through.
22. `'t'` never prints — the infinite loop inside a microtask blocks the event loop forever; the timer callback never runs.

## Objects, arrays, references

23. `2` — `b` and `a` reference the same object.
24. `4` — `copy` is the same array reference.
25. `[1, NaN, NaN]` — `parseInt(v, i)`: `parseInt('1',0)`=1, `parseInt('2',1)`=NaN (radix 1 invalid), `parseInt('3',2)`=NaN (3 not a binary digit).
26. `[1, 10, 2]` — default sort is lexicographic on stringified elements.
27. `1`, `{ b: 2 }` — rest collects remaining own enumerable props.
28. `'x'` — array key is coerced via `toString()` → `'1,2'`.
29. `{"c":null,"d":[null]}` — `undefined` & functions as **object values** are dropped (`a`, `b` gone); `NaN` → `null`; `undefined` as an **array element** → `null`.
30. `[1, '1', NaN]` — Set uses SameValueZero: `1` and `'1'` differ; `NaN` is deduped against itself.

## Numbers & misc

31. `'string'` — `typeof 1` is `'number'` (a string), `typeof 'number'` is `'string'`.
32. `'0.10000000000000000555'` — the closest double to 0.1, shown to 20 places.
33. `10000000000000000` — beyond `Number.MAX_SAFE_INTEGER`, rounds.
34. `-Infinity`, `Infinity` — identity elements of max/min with no args.
35. `0`, `'5e-7'` — `parseInt` stops at `.`; `toString` uses exponential for small numbers.
36. `2 1` — array-destructuring swap.
37. `[1, 1]`, `[1, 2]` — default param `b = a` uses the already-bound `a`.
38. `3`, `3` — `arguments` reflects all passed args; rest param collects them.
39. `0 0`, `1 0`, `2 0` — `continue label` jumps to the next iteration of the *outer* loop.
40. `11`, `'20'`, `true` — `+` uses `valueOf` (10) → `10 + 1`; template string uses `toString` → `'20'`; `==` uses `valueOf` → `10 == 10`.

---

### The rules these all reduce to

- **Coercion**: `+` prefers string if either side is a string; `-`,`*`,`/`,`<` coerce to number. `==` unwraps objects via `valueOf`/`toString`, treats `null`/`undefined` as a pair.
- **Hoisting**: declarations register at scope entry; `var`→`undefined`, `let`/`const`/`class`→TDZ, function declarations→fully defined.
- **`this`**: call-site decides (`new` > `bind`/`call`/`apply` > `obj.method()` > bare call); arrows ignore all of it.
- **Event loop**: all sync → drain all microtasks → one macrotask → repeat.
- **References**: objects/arrays are passed and assigned by reference; spread/slice copy one level.
