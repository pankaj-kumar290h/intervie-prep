# Currying, Partial Application & Composition — Interview Questions

Asked at: Amazon, Adobe, Uber, Flipkart, Razorpay, Meesho, PhonePe, tekion, Groww.

- **Currying**: turn `f(a, b, c)` into `f(a)(b)(c)`.
- **Partial application**: fix some args now, supply the rest later.
- **Composition**: `compose(f, g)(x) === f(g(x))`; `pipe` is left-to-right.

---

## A. Currying

1. **`curry(fn)`** — generic. `curry(fn)(1)(2)(3) === curry(fn)(1, 2)(3) === curry(fn)(1)(2, 3)`.
   Collect args until `args.length >= fn.length`, then invoke.
2. **`curry` with placeholders** — `curry(fn)(_, 2)(1)` fills the gap. Use a `curry._` symbol.
3. **Infinite curry / sum**:
   - `sum(1)(2)(3)()` → 6  (terminate on empty call)
   - `sum(1)(2)(3)` that `== 6` via `toString`/`valueOf` coercion
   - `sum(1, 2)(3)(4)()` mixed arity
4. **`curryN(n, fn)`** — curry to a fixed arity even if `fn.length` is unreliable (rest params).
5. **`add`** such that `add(2, 4)` → 6 and `add(2)(4)` → 6 and `add(2)(4)(6)` → 12.

---

## B. Partial application

6. **`partial(fn, ...preset)`** — `partial(fn, a)(b, c)`.
7. **`partialRight(fn, ...preset)`**.
8. **`bindPartial`** — like `Function.prototype.bind` but explain the difference vs `partial`
   (bind also fixes `this`).

---

## C. Composition

9. **`compose(...fns)`** — right-to-left; `compose(f, g, h)(x) === f(g(h(x)))`.
10. **`pipe(...fns)`** — left-to-right.
11. **`pipe` / `compose` that support async fns** — each may return a promise; thread with
    `reduce` + `await` (or `.then`).
12. **`composeWithArgs`** — first function may take multiple args, rest take one.
13. **`tap(fn)`** — run a side effect, pass the value through (for debugging pipelines).
14. **`pipeline` operator emulation** — `pipe(x, f, g, h)` value-first variant.

---

## D. Applied / discussion

15. Use `curry` to make a reusable `hasRole('admin')` predicate from `hasRole(role, user)`.
16. Build a validation pipeline with `pipe`: `trim → toLowerCase → assertNonEmpty → assertEmail`.
17. Point-free style: rewrite `xs.map(x => double(x))` as `xs.map(double)`; when does this break
    (extra args like index)?
18. Why does `curry` need to know `fn.length`? What breaks with default params / rest params?
19. Performance cost of deep currying / composition — is it a real concern?
20. Implement `memoize` + `curry` together — cache per fully-applied arg list.

---

## Must be able to state

- `fn.length` = number of params before the first default / rest param.
- Currying returns unary-ish functions until enough args are gathered, then calls the original.
- Partial application fixes args immediately and returns a function taking the rest.
- `compose` is right-to-left, `pipe` is left-to-right — both are `reduce`/`reduceRight` over fns.
- Coercion trick (`sum(1)(2)(3)`) works by overriding `valueOf`/`toString` on the returned fn.
