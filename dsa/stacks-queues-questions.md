# Stack & Queue Interview Questions — Easy → Very Very Hard

20 curated stack and queue problems with problem statements, intuition, JavaScript
solutions, and complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Valid Parentheses](#1-valid-parentheses)
2. [Implement Queue using Two Stacks](#2-implement-queue-using-two-stacks)
3. [Implement Stack using Two Queues](#3-implement-stack-using-two-queues)
4. [Min Stack](#4-min-stack)
5. [Baseball Game](#5-baseball-game)

**Medium**
6. [Daily Temperatures](#6-daily-temperatures)
7. [Next Greater Element I & II](#7-next-greater-element-i--ii)
8. [Evaluate Reverse Polish Notation](#8-evaluate-reverse-polish-notation)
9. [Decode String](#9-decode-string)
10. [Asteroid Collision](#10-asteroid-collision)
11. [Online Stock Span](#11-online-stock-span)
12. [Remove K Digits](#12-remove-k-digits)
13. [Simplify Path](#13-simplify-path)

**Hard**
14. [Largest Rectangle in Histogram](#14-largest-rectangle-in-histogram)
15. [Maximal Rectangle](#15-maximal-rectangle)
16. [Basic Calculator II](#16-basic-calculator-ii)
17. [132 Pattern](#17-132-pattern)

**Very Hard**
18. [Basic Calculator](#18-basic-calculator)
19. [Longest Valid Parentheses](#19-longest-valid-parentheses)

**Very Very Hard**
20. [Max Stack / Circular Deque / The Celebrity Problem](#20-the-boss-fight)

---

## Easy

### 1. Valid Parentheses

**Problem.** Given a string containing only `()[]{}`, determine if the brackets are
properly matched and nested.

**Intuition.** Push every opening bracket. On a closing bracket, it must match the most
recently opened (and still unclosed) bracket — i.e. the top of the stack. Any mismatch or
leftover bracket at the end means invalid.

```javascript
function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}
```

**Complexity.** Time O(n), Space O(n).

---

### 2. Implement Queue using Two Stacks

**Problem.** Implement a FIFO queue (`push`, `pop`, `peek`, `empty`) using only two
stacks.

**Intuition.** Push always goes to `inStack`. For `pop`/`peek`, if `outStack` is empty,
dump all of `inStack` into it — this reverses the order so the oldest element ends up on
top of `outStack`. Each element is moved at most twice in its lifetime, so amortized cost
stays O(1).

```javascript
class MyQueue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }

  push(x) {
    this.inStack.push(x);
  }

  pop() {
    this._transfer();
    return this.outStack.pop();
  }

  peek() {
    this._transfer();
    return this.outStack[this.outStack.length - 1];
  }

  empty() {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }

  _transfer() {
    if (this.outStack.length === 0) {
      while (this.inStack.length) this.outStack.push(this.inStack.pop());
    }
  }
}
```

**Complexity.** Time O(1) amortized per operation, Space O(n).

---

### 3. Implement Stack using Two Queues

**Problem.** Implement a LIFO stack (`push`, `pop`, `top`, `empty`) using only two
queues.

**Intuition.** Make `push` the expensive operation: enqueue the new element into the
empty queue, then requeue everything from the other queue behind it. This puts the
newest element at the front, so `pop`/`top` are simple O(1) front reads.

```javascript
class MyStack {
  constructor() {
    this.q1 = [];
    this.q2 = [];
  }

  push(x) {
    this.q2.push(x);
    while (this.q1.length) this.q2.push(this.q1.shift());
    [this.q1, this.q2] = [this.q2, this.q1];
  }

  pop() {
    return this.q1.shift();
  }

  top() {
    return this.q1[0];
  }

  empty() {
    return this.q1.length === 0;
  }
}
```

**Complexity.** Time O(n) push, O(1) pop/top, Space O(n). (Mirror version pushes O(1) and
makes `pop` O(n) instead — the cost has to live somewhere.)

---

### 4. Min Stack

**Problem.** Design a stack supporting `push`, `pop`, `top`, and `getMin`, all in O(1)
time.

**Intuition.** Keep a second stack that tracks the running minimum at each depth. Every
push records `min(newValue, currentMin)`; every pop discards one entry from both stacks in
lockstep, so the min stack's top is always correct for whatever remains.

```javascript
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }

  push(x) {
    this.stack.push(x);
    const currMin = this.minStack.length
      ? this.minStack[this.minStack.length - 1]
      : Infinity;
    this.minStack.push(Math.min(x, currMin));
  }

  pop() {
    this.minStack.pop();
    return this.stack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}
```

**Complexity.** Time O(1) per operation, Space O(n) (one extra int per element).

---

### 5. Baseball Game

**Problem.** Given a list of operations for a baseball scoring game — an integer (a new
score), `"C"` (invalidate/remove the previous score), `"D"` (a new score double the
previous), or `"+"` (a new score = sum of the previous two) — return the sum of all valid
scores at the end.

**Intuition.** Only the most recent scores ever matter, and `"C"` needs to undo exactly
the last one — a textbook stack.

```javascript
function calPoints(ops) {
  const stack = [];

  for (const op of ops) {
    if (op === 'C') {
      stack.pop();
    } else if (op === 'D') {
      stack.push(stack[stack.length - 1] * 2);
    } else if (op === '+') {
      stack.push(stack[stack.length - 1] + stack[stack.length - 2]);
    } else {
      stack.push(parseInt(op, 10));
    }
  }
  return stack.reduce((a, b) => a + b, 0);
}
```

**Complexity.** Time O(n), Space O(n).

---

## Medium

### 6. Daily Temperatures

**Problem.** Given daily `temperatures`, return an array `answer` where `answer[i]` is
the number of days until a warmer temperature; `0` if none exists.

**Intuition.** Keep a stack of indices with temperatures in decreasing order. When the
current temperature beats the stack's top, that top index just found its answer — pop it
and record the distance. This is the "monotonic stack" pattern for next-greater-style
queries.

```javascript
function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const res = new Array(n).fill(0);
  const stack = []; // indices, temperatures decreasing

  for (let i = 0; i < n; i++) {
    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const idx = stack.pop();
      res[idx] = i - idx;
    }
    stack.push(i);
  }
  return res;
}
```

**Complexity.** Time O(n) (each index pushed/popped once), Space O(n).

---

### 7. Next Greater Element I & II

**Problem.** **I:** For each element of `nums1` (a subset of `nums2`), find the first
greater element to its right in `nums2`, or `-1`. **II:** Given a single circular array
`nums`, find the next greater element for every position, wrapping around once.

**Intuition.** Same monotonic-decreasing stack as Daily Temperatures. For **I**, run it
once over `nums2` to build a value → next-greater map, then answer `nums1` via lookup.
For **II** (circular), iterate the array twice (`i` from `0` to `2n-1`, indexing
`i % n`) but only push indices during the first pass — the second pass lets earlier
elements see wrap-around candidates without double-counting them in the stack.

```javascript
// I
function nextGreaterElement(nums1, nums2) {
  const map = new Map();
  const stack = [];

  for (const n of nums2) {
    while (stack.length && stack[stack.length - 1] < n) {
      map.set(stack.pop(), n);
    }
    stack.push(n);
  }
  return nums1.map((n) => (map.has(n) ? map.get(n) : -1));
}

// II
function nextGreaterElements(nums) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  const stack = []; // indices

  for (let i = 0; i < 2 * n; i++) {
    const idx = i % n;
    while (stack.length && nums[stack[stack.length - 1]] < nums[idx]) {
      res[stack.pop()] = nums[idx];
    }
    if (i < n) stack.push(idx);
  }
  return res;
}
```

**Complexity.** Time O(n + m) for I, O(n) for II, Space O(n) both.

---

### 8. Evaluate Reverse Polish Notation

**Problem.** Evaluate an arithmetic expression given in Reverse Polish (postfix)
notation, where tokens are integers or one of `+ - * /`.

**Intuition.** Postfix is built for a stack: push numbers, and on an operator pop the
two most recent operands, apply it, and push the result back.

```javascript
function evalRPN(tokens) {
  const stack = [];
  const ops = new Set(['+', '-', '*', '/']);

  for (const t of tokens) {
    if (ops.has(t)) {
      const b = stack.pop();
      const a = stack.pop();
      let result;
      if (t === '+') result = a + b;
      else if (t === '-') result = a - b;
      else if (t === '*') result = a * b;
      else result = Math.trunc(a / b); // truncate toward zero
      stack.push(result);
    } else {
      stack.push(parseInt(t, 10));
    }
  }
  return stack.pop();
}
```

**Complexity.** Time O(n), Space O(n).

---

### 9. Decode String

**Problem.** Decode a string encoded as `k[encoded_string]`, where the encoded string
inside brackets is repeated `k` times, e.g. `"3[a2[c]]"` → `"accaccacc"`. Encodings can
nest.

**Intuition.** Nesting screams stack. Keep two stacks: one for pending repeat counts, one
for the string built so far at each bracket depth. On `[`, push the current count and
string and reset both. On `]`, pop the count and the outer string, and append
`count` copies of the just-finished inner string to it.

```javascript
function decodeString(s) {
  const countStack = [];
  const strStack = [];
  let curStr = '';
  let curNum = 0;

  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      curNum = curNum * 10 + Number(ch);
    } else if (ch === '[') {
      countStack.push(curNum);
      strStack.push(curStr);
      curNum = 0;
      curStr = '';
    } else if (ch === ']') {
      const repeat = countStack.pop();
      const prevStr = strStack.pop();
      curStr = prevStr + curStr.repeat(repeat);
    } else {
      curStr += ch;
    }
  }
  return curStr;
}
```

**Complexity.** Time O(n · maxRepeat) (proportional to the decoded output length), Space
O(n) for the stacks and output.

---

### 10. Asteroid Collision

**Problem.** Asteroids move along a line; positive values move right, negative move
left, `abs(value)` is size. When two collide, the smaller explodes; equal sizes both
explode. Return the state after all collisions resolve.

**Intuition.** Only a right-moving asteroid already on the stack can collide with an
incoming left-moving one (opposite directions converging). Push right-movers freely.
For a left-mover, keep popping smaller right-movers off the stack (they explode) until
the stack top is either empty, also left-moving, or big enough to survive.

```javascript
function asteroidCollision(asteroids) {
  const stack = [];

  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -a) {
        stack.pop(); // top explodes, keep checking further down
      } else if (top === -a) {
        stack.pop(); // both explode
        alive = false;
      } else {
        alive = false; // incoming asteroid explodes
      }
    }
    if (alive) stack.push(a);
  }
  return stack;
}
```

**Complexity.** Time O(n) (each asteroid pushed/popped at most once), Space O(n).

---

### 11. Online Stock Span

**Problem.** Design `StockSpanner` with `next(price)`, returning the span — the number
of consecutive days (ending today, going backward) where the price was ≤ today's price.

**Intuition.** Keep a stack of `[price, span]` pairs. When a new price arrives, it
"absorbs" every stack entry with a price ≤ its own (their spans get folded in), since
those days are now dominated by today. What's left on top after absorbing is the
nearest day with a strictly higher price.

```javascript
class StockSpanner {
  constructor() {
    this.stack = []; // [price, span], decreasing prices
  }

  next(price) {
    let span = 1;
    while (this.stack.length && this.stack[this.stack.length - 1][0] <= price) {
      span += this.stack.pop()[1];
    }
    this.stack.push([price, span]);
    return span;
  }
}
```

**Complexity.** Time O(1) amortized per call, Space O(n).

---

### 12. Remove K Digits

**Problem.** Given a non-negative integer `num` as a string, remove `k` digits so that
the remaining digits form the smallest possible number (no leading zeros, unless the
result is `"0"`).

**Intuition.** To minimize the number, greedily drop any digit that is bigger than the
one right after it (a "peak") — a smaller digit later makes a smaller prefix, which
dominates the number's value. A monotonic increasing stack does exactly this: pop
larger digits off the top while budget `k` remains.

```javascript
function removeKdigits(num, k) {
  const stack = [];

  for (const ch of num) {
    while (k > 0 && stack.length && stack[stack.length - 1] > ch) {
      stack.pop();
      k--;
    }
    stack.push(ch);
  }

  while (k > 0) {
    stack.pop(); // still budget left: string was non-decreasing, trim from the end
    k--;
  }

  let i = 0;
  while (i < stack.length - 1 && stack[i] === '0') i++;
  const result = stack.slice(i).join('');
  return result === '' ? '0' : result;
}
```

**Complexity.** Time O(n) (each digit pushed/popped once), Space O(n).

---

### 13. Simplify Path

**Problem.** Given an absolute Unix-style path (may contain `.`, `..`, extra slashes),
return its simplified canonical form.

**Intuition.** Split on `/`. Real directory names get pushed; `.` is a no-op; `..` pops
the last directory (if any). Rejoin what's left on the stack with `/`.

```javascript
function simplifyPath(path) {
  const parts = path.split('/');
  const stack = [];

  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (stack.length) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return '/' + stack.join('/');
}
```

**Complexity.** Time O(n), Space O(n).

---

## Hard

### 14. Largest Rectangle in Histogram

**Problem.** Given bar heights of a histogram (equal width 1), find the area of the
largest rectangle that fits within it.

**Intuition.** For each bar, its largest rectangle (using it as the shortest bar)
extends left and right until a shorter bar blocks it. Maintain a stack of indices with
increasing heights. When a shorter bar arrives, it finalizes the rectangle for every
taller bar still on the stack — its height is `heights[popped]` and its width spans from
the new stack top (exclusive) to the current index (exclusive).

```javascript
function largestRectangleArea(heights) {
  const stack = []; // indices, increasing heights
  let best = 0;
  const n = heights.length;

  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i]; // sentinel flushes the stack at the end
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}
```

**Complexity.** Time O(n) (each index pushed/popped once), Space O(n).

---

### 15. Maximal Rectangle

**Problem.** Given a 2D binary matrix (chars `'0'`/`'1'`), find the largest rectangle
containing only `1`s, and return its area.

**Intuition.** Reduce to problem 14. Treat each row as the "ground" of a histogram:
`heights[c]` accumulates consecutive `1`s ending at the current row (reset to 0 on a
`'0'`). Run Largest Rectangle in Histogram on that row's heights and track the best
across all rows.

```javascript
function largestRectangleArea(heights) {
  const stack = [];
  let best = 0;
  const n = heights.length;

  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      best = Math.max(best, height * width);
    }
    stack.push(i);
  }
  return best;
}

function maximalRectangle(matrix) {
  if (!matrix.length || !matrix[0].length) return 0;
  const cols = matrix[0].length;
  const heights = new Array(cols).fill(0);
  let best = 0;

  for (const row of matrix) {
    for (let c = 0; c < cols; c++) {
      heights[c] = row[c] === '1' ? heights[c] + 1 : 0;
    }
    best = Math.max(best, largestRectangleArea(heights));
  }
  return best;
}
```

**Complexity.** Time O(rows · cols) (one histogram pass per row), Space O(cols).

---

### 16. Basic Calculator II

**Problem.** Evaluate a string expression with non-negative integers and `+ - * /`
(integer division truncates toward zero), no parentheses, respecting operator
precedence.

**Intuition.** `+`/`-` just need their operand pushed with the right sign for a final
sum. `*`/`/` bind tighter, so instead of pushing, pop the previous operand and combine
immediately. Track the *pending* operator (the one before the current number) and apply
it once the next operator (or end of string) is reached.

```javascript
function calculate(s) {
  const stack = [];
  let num = 0;
  let sign = '+'; // operator pending before `num`

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    }
    if ((ch !== ' ' && !(ch >= '0' && ch <= '9')) || i === s.length - 1) {
      if (sign === '+') stack.push(num);
      else if (sign === '-') stack.push(-num);
      else if (sign === '*') stack.push(stack.pop() * num);
      else if (sign === '/') stack.push(Math.trunc(stack.pop() / num));
      sign = ch;
      num = 0;
    }
  }
  return stack.reduce((a, b) => a + b, 0);
}
```

**Complexity.** Time O(n), Space O(n) (O(1) if you fold `+`/`-` into a running total
instead of a stack, since nothing needs to be popped for them).

---

### 17. 132 Pattern

**Problem.** Given `nums`, determine whether there exist indices `i < j < k` such that
`nums[i] < nums[k] < nums[j]` (a "132" pattern).

**Intuition.** Scan right to left, treating each `nums[i]` as a candidate "1". Maintain a
decreasing stack of candidate "3"s and track `third`, the best (largest) value that has
been "demoted" from the stack to serve as the "2" — i.e., some value `nums[j] > third`
was seen to its right. If a later (leftward) `nums[i] < third`, we've found `1 < 2 < 3`.

```javascript
function find132pattern(nums) {
  const stack = []; // decreasing, candidates for nums[j] ("3")
  let third = -Infinity; // best candidate for nums[k] ("2")

  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] < third) return true;
    while (stack.length && stack[stack.length - 1] < nums[i]) {
      third = stack.pop();
    }
    stack.push(nums[i]);
  }
  return false;
}
```

**Complexity.** Time O(n) (each element pushed/popped once), Space O(n).

---

## Very Hard

### 18. Basic Calculator

**Problem.** Evaluate a string expression containing non-negative integers, `+ - * /`,
parentheses, and spaces, with standard precedence and nesting — the full version of
problem 16.

**Intuition.** Recursive descent driven by a shared index `i`: `parseExpr` consumes
numbers and `+ - * /` exactly like problem 16 (a running stack combines `*`/`/`
immediately, `+`/`-` get pushed with sign), but whenever it sees `(` it recurses to
evaluate the sub-expression as a single "number," and it stops — without consuming —
when it sees `)`, handing control back to its caller to consume that bracket.

```javascript
function calculate(s) {
  let i = 0;

  function parseExpr() {
    const stack = [];
    let num = 0;
    let sign = '+'; // operator pending before `num`

    function applyPending() {
      if (sign === '+') stack.push(num);
      else if (sign === '-') stack.push(-num);
      else if (sign === '*') stack.push(stack.pop() * num);
      else if (sign === '/') stack.push(Math.trunc(stack.pop() / num));
    }

    while (i < s.length && s[i] !== ')') {
      const ch = s[i];
      if (ch === ' ') {
        i++;
        continue;
      }
      if (ch >= '0' && ch <= '9') {
        num = num * 10 + Number(ch);
        i++;
        continue;
      }
      if (ch === '(') {
        i++; // consume '('
        num = parseExpr(); // recurse for the sub-expression
        i++; // consume matching ')'
        continue;
      }
      // ch is an operator
      applyPending();
      sign = ch;
      num = 0;
      i++;
    }
    applyPending(); // flush the last operand (loop ends at ')' or end of string)
    return stack.reduce((a, b) => a + b, 0);
  }

  return parseExpr();
}
```

**Complexity.** Time O(n), Space O(n) (call stack depth + operand stack, both bounded by
nesting/expression length).

---

### 19. Longest Valid Parentheses

**Problem.** Given a string of only `(` and `)`, find the length of the longest
contiguous substring of well-formed parentheses.

**Intuition.** Keep a stack of indices, seeded with `-1` as a "base" for measuring
length. Push indices of `(`. On `)`, pop first — if the stack becomes empty, this `)` is
unmatched, so push its index as the new base; otherwise the current valid run's length
is `i - stack.top()`.

```javascript
function longestValidParentheses(s) {
  const stack = [-1]; // base index for length calculations
  let best = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i); // this ')' becomes the new base
      } else {
        best = Math.max(best, i - stack[stack.length - 1]);
      }
    }
  }
  return best;
}
```

**Complexity.** Time O(n), Space O(n). (A two-pass O(1)-space counter scan is a common
follow-up.)

---

## Very Very Hard

### 20. The Boss Fight

Three design/algorithm problems that push stacks and queues past their textbook form.

#### 20a. Max Stack

**Problem.** Design a stack supporting `push`, `pop`, `top`, `peekMax` (return the
maximum element), and `popMax` (remove and return the maximum element), all faster than
the O(n) naive re-scan.

**Intuition.** Pair the value stack with a max-tracking stack, same as Min Stack — this
gives O(1) `push`/`pop`/`top`/`peekMax`. `popMax` is the hard one: pop elements into a
buffer until the max is exposed, remove it, then push the buffer back. Removing an
arbitrary interior element from an array-backed stack is inherently O(n) in the worst
case; a doubly-linked list of nodes plus a sorted map (value → node) gets `popMax` down
to O(log n) by finding the max in the map and unlinking its node directly, at the cost
of considerably more bookkeeping.

```javascript
class MaxStack {
  constructor() {
    this.stack = [];
    this.maxStack = [];
  }

  push(x) {
    this.stack.push(x);
    const curMax = this.maxStack.length
      ? this.maxStack[this.maxStack.length - 1]
      : -Infinity;
    this.maxStack.push(Math.max(x, curMax));
  }

  pop() {
    this.maxStack.pop();
    return this.stack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  peekMax() {
    return this.maxStack[this.maxStack.length - 1];
  }

  popMax() {
    const max = this.peekMax();
    const buffer = [];
    while (this.top() !== max) {
      buffer.push(this.pop());
    }
    this.pop(); // discard the max itself
    while (buffer.length) {
      this.push(buffer.pop());
    }
    return max;
  }
}
```

**Complexity.** `push`/`pop`/`top`/`peekMax` O(1); `popMax` O(n) worst case with this
two-stack version (better than the O(n)-per-`peekMax` naive scan, but not asymptotically
better for `popMax` itself). Space O(n).

---

#### 20b. Circular Deque

**Problem.** Design a fixed-capacity circular double-ended queue supporting
`insertFront`, `insertLast`, `deleteFront`, `deleteLast`, `getFront`, `getRear`,
`isEmpty`, and `isFull`, all in O(1).

**Intuition.** Back a ring buffer with a fixed-size array plus a `front` index and a
`size` counter (avoids ambiguous "empty vs full" states that plague a plain
front/rear-pointer scheme). `front` and the rear slot are always computed mod capacity,
so wrap-around is just modular arithmetic — no shifting.

```javascript
class MyCircularDeque {
  constructor(k) {
    this.capacity = k;
    this.data = new Array(k);
    this.size = 0;
    this.front = 0;
  }

  _rearIndex() {
    return (this.front + this.size - 1 + this.capacity) % this.capacity;
  }

  insertFront(value) {
    if (this.size === this.capacity) return false;
    this.front = (this.front - 1 + this.capacity) % this.capacity;
    this.data[this.front] = value;
    this.size++;
    return true;
  }

  insertLast(value) {
    if (this.size === this.capacity) return false;
    const idx = (this.front + this.size) % this.capacity;
    this.data[idx] = value;
    this.size++;
    return true;
  }

  deleteFront() {
    if (this.size === 0) return false;
    this.front = (this.front + 1) % this.capacity;
    this.size--;
    return true;
  }

  deleteLast() {
    if (this.size === 0) return false;
    this.size--; // rear index recomputes automatically from size
    return true;
  }

  getFront() {
    return this.size === 0 ? -1 : this.data[this.front];
  }

  getRear() {
    return this.size === 0 ? -1 : this.data[this._rearIndex()];
  }

  isEmpty() {
    return this.size === 0;
  }

  isFull() {
    return this.size === this.capacity;
  }
}
```

**Complexity.** Time O(1) per operation, Space O(k).

---

#### 20c. The Celebrity Problem

**Problem.** Among `n` people, a "celebrity" is someone everyone else knows but who
knows nobody else. Given only a `knows(a, b)` query (does `a` know `b`?), find the
celebrity in O(n) queries, or report none exists.

**Intuition.** Push everyone onto a stack, then repeatedly pop two people `a` and `b`
and eliminate one: if `a` knows `b`, `a` can't be the celebrity (a celebrity knows
no one), so discard `a` and keep `b`; otherwise `b` knows `a` or is unpopular either
way, so discard `b` and keep `a`. After n-1 eliminations exactly one candidate survives
— verify it against everyone else, since this process only guarantees "if a celebrity
exists, it's this one," not that one exists.

```javascript
function findCelebrity(n, knows) {
  const stack = [];
  for (let i = 0; i < n; i++) stack.push(i);

  while (stack.length > 1) {
    const a = stack.pop();
    const b = stack.pop();
    if (knows(a, b)) {
      stack.push(b); // a knows someone, so a is disqualified
    } else {
      stack.push(a); // a doesn't know b, so b is disqualified
    }
  }

  const candidate = stack.pop();
  for (let i = 0; i < n; i++) {
    if (i === candidate) continue;
    if (knows(candidate, i) || !knows(i, candidate)) return -1;
  }
  return candidate;
}
```

**Complexity.** Time O(n) (elimination is O(n), verification is O(n)), Space O(n) for
the stack. (Brute force checking every pair is O(n²).)

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Matching / bracket validation | 1, 19 |
| Two-stack simulation | 2, 3 |
| Auxiliary stack for O(1) extremes | 4, 20a |
| Direct stack simulation | 5, 8, 10 |
| Monotonic stack (next greater / span) | 6, 7, 11, 17 |
| Monotonic stack for optimal digit removal | 12 |
| Nested structure decoding via stack-of-state | 9, 18 |
| Path / token normalization with a stack | 13 |
| Monotonic stack for area (histogram-based) | 14, 15 |
| Expression evaluation (precedence via stack) | 8, 16, 18 |
| Ring buffer / circular indexing | 20b |
| Stack-based elimination | 20c |

**Recommended progression:** 1 → 4 → 5 → 2 → 3 → 8 → 6 → 7 → 11 → 10 → 12 → 9 → 13 →
14 → 15 → 17 → 16 → 19 → 18 → 20.
