# Arrays & Strings — Interview Questions (JS-flavoured DSA-lite + machine coding)

Asked at: Amazon, Uber, Flipkart, Razorpay, Swiggy, Zomato, Meesho, Walmart, Booking.
These test JS idioms (reduce, Map, Set, spread) more than raw algorithms.

---

## A. Array transforms

1. **`flattenArray(arr, depth = Infinity)`** — without `Array.prototype.flat`. Recursion,
   then iterative with a stack.
2. **`chunk(arr, size)`** — split into groups of `size`.
3. **`groupBy(arr, keyFn)`** → `{ key: [items] }`.
4. **`countBy(arr, keyFn)`** → `{ key: count }`.
5. **`unique(arr)`** and **`uniqueBy(arr, keyFn)`** — preserve order.
6. **`intersection` / `union` / `difference`** of two arrays (use `Set`).
7. **`zip(a, b)` / `unzip`** and **`zipObject(keys, values)`**.
8. **`partition(arr, predicate)`** → `[pass, fail]`.
9. **`range(start, end, step)`**.
10. **`rotate(arr, k)`** — rotate right by k, k can be > length or negative.
11. **`chunkWhile` / `takeWhile` / `dropWhile`**.
12. **`sortBy(arr, ...keyFns)`** — multi-key stable sort.
13. **`moveElement(arr, from, to)`** immutably.
14. **`transpose(matrix)`** and **`rotate90(matrix)`**.
15. **`flattenDeepObjectArray`** — array of nested `{ value, children: [] }` → flat list.

---

## B. Aggregation with reduce

16. Sum / max / min / average in one `reduce` pass.
17. **`frequency(str)`** — char counts; then first non-repeating char.
18. Build a lookup: `keyBy(arr, 'id')` → `{ id: item }`.
19. **`sumNestedNumbers(obj)`** — sum all numeric leaves in a nested structure.
20. Flatten + dedupe + sort in one chain.

---

## C. Strings

21. **`reverseString`** (handle Unicode / surrogate pairs / emoji with `[...str]`).
22. **`isPalindrome`** — ignore case, spaces, punctuation.
23. **`capitalize` / `camelCase` / `kebabCase` / `snakeCase` / `titleCase`** converters.
24. **`truncate(str, n, suffix = '…')`** — don't cut mid-word (bonus).
25. **Anagram check** and **group anagrams**.
26. **`countWords`** / most frequent word.
27. **`compressString`** — `'aaabb'` → `'a3b2'` (RLE), and decompress.
28. **`template(str, data)`** — replace `{{key}}` / `${key}` with `data[key]`, support nested paths.
29. **`longestCommonPrefix(strs)`**.
30. **`isValidParentheses(str)`** — stack.
31. **`slugify(title)`** — lowercase, strip accents, spaces → hyphens, remove non-alphanumerics.

---

## D. "Explain the JS gotcha"

32. `[1, 2, 3].map(parseInt)` → `?` (why `[1, NaN, NaN]`)
33. `[10, 1, 2].sort()` → `?` (lexicographic default)
34. `[] == ![]` → `?`; `[] + []`, `[] + {}`, `{} + []`
35. `new Array(3)` vs `Array.of(3)` vs `[...Array(3)]` vs `Array(3).fill(0)`
36. `arr.length = 0` vs `arr = []` vs `arr.splice(0)`
37. Sparse arrays: `[1, , 3].forEach(...)` skips holes; `.map` preserves them
38. `'b' + 'a' + + 'a' + 'a'` → `'baNaNa'`
39. Removing while iterating — why `for` backwards or `filter`
40. Copying: shallow (`[...arr]`, `slice`) vs deep — nested objects still shared

---

## Must be able to state

- `Set` and `Map` give O(1) membership; use them for unique/intersection/keyBy.
- `reduce` is the general fold — group/count/sum/index all collapse to it.
- `sort` mutates and compares as strings by default — always pass a comparator for numbers.
- Spread/`slice` are shallow copies.
- `[...str]` / `Array.from(str)` iterate by code point (emoji-safe); `str.split('')` doesn't.
- `map(parseInt)` breaks because `parseInt(value, index)` — index becomes the radix.
