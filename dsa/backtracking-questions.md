# Backtracking Interview Questions — Easy → Very Very Hard

20 curated backtracking problems with problem statements, intuition, JavaScript solutions,
and complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Subsets](#1-subsets)
2. [Permutations](#2-permutations)
3. [Letter Combinations of a Phone Number](#3-letter-combinations-of-a-phone-number)
4. [Generate Parentheses](#4-generate-parentheses)
5. [Combinations](#5-combinations)

**Medium**
6. [Combination Sum](#6-combination-sum)
7. [Combination Sum II](#7-combination-sum-ii)
8. [Subsets II](#8-subsets-ii)
9. [Permutations II](#9-permutations-ii)
10. [Palindrome Partitioning](#10-palindrome-partitioning)
11. [Word Search](#11-word-search)
12. [Restore IP Addresses](#12-restore-ip-addresses)
13. [Beautiful Arrangement](#13-beautiful-arrangement)

**Hard**
14. [N-Queens](#14-n-queens)
15. [Sudoku Solver](#15-sudoku-solver)
16. [Expression Add Operators](#16-expression-add-operators)
17. [Partition to K Equal Sum Subsets](#17-partition-to-k-equal-sum-subsets)

**Very Hard**
18. [Matchsticks to Square](#18-matchsticks-to-square)
19. [Split Array into Fibonacci Sequence](#19-split-array-into-fibonacci-sequence)

**Very Very Hard**
20. [N-Queens Bitmask / Word Search II / Knight's Tour](#20-the-boss-fight)

---

## Easy

### 1. Subsets

**Problem.** Given an array `nums` of unique integers, return all possible subsets (the
power set).

**Intuition.** At each index we choose whether to include `nums[i]`. Walk the array once,
and at every recursive call *record the current path* (it's a valid subset already), then
try including each remaining element and un-choosing it afterward. No pruning needed —
every path is valid.

```javascript
function subsets(nums) {
  const res = [];
  const path = [];

  function backtrack(start) {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);      // choose
      backtrack(i + 1);        // explore
      path.pop();              // un-choose
    }
  }
  backtrack(0);
  return res;
}
```

**Complexity.** Time O(n · 2ⁿ) (2ⁿ subsets, O(n) to copy each), Space O(n) recursion depth
(output aside).

---

### 2. Permutations

**Problem.** Given an array `nums` of unique integers, return all possible permutations.

**Intuition.** Build the permutation position by position. At each step, choose any unused
number, mark it used, recurse, then un-mark it. The pruning condition is simply "skip
already-used numbers."

```javascript
function permute(nums) {
  const res = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;       // prune: already in this path
      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }
  backtrack();
  return res;
}
```

**Complexity.** Time O(n · n!), Space O(n) recursion depth (output aside).

---

### 3. Letter Combinations of a Phone Number

**Problem.** Given a string of digits `2`-`9`, return all letter combinations the digits
could represent (standard phone keypad mapping).

**Intuition.** Choose one letter for the current digit, append it, recurse into the next
digit, then remove it. The base case is reaching the end of the digit string.

```javascript
function letterCombinations(digits) {
  if (digits.length === 0) return [];
  const map = {
    2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl',
    6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz',
  };
  const res = [];
  const path = [];

  function backtrack(index) {
    if (index === digits.length) {
      res.push(path.join(''));
      return;
    }
    for (const ch of map[digits[index]]) {
      path.push(ch);
      backtrack(index + 1);
      path.pop();
    }
  }
  backtrack(0);
  return res;
}
```

**Complexity.** Time O(4ⁿ · n) (up to 4 letters per digit, n digits), Space O(n) recursion
depth (output aside).

---

### 4. Generate Parentheses

**Problem.** Given `n` pairs of parentheses, generate all combinations of well-formed
parentheses strings.

**Intuition.** Track counts of `open` and `close` used so far. Add `(` whenever
`open < n`; add `)` only when `close < open` (never let closes outrun opens — that's the
pruning condition that guarantees well-formedness by construction).

```javascript
function generateParenthesis(n) {
  const res = [];

  function backtrack(str, open, close) {
    if (str.length === 2 * n) {
      res.push(str);
      return;
    }
    if (open < n) backtrack(str + '(', open + 1, close);
    if (close < open) backtrack(str + ')', open, close + 1);
  }
  backtrack('', 0, 0);
  return res;
}
```

**Complexity.** Time O(4ⁿ / √n) (the nth Catalan number, tight bound), Space O(n) recursion
depth (output aside).

---

### 5. Combinations

**Problem.** Given integers `n` and `k`, return all possible combinations of `k` numbers
chosen from `[1, n]`.

**Intuition.** Classic choose/explore/un-choose over a start pointer that only moves
forward (so we never reorder the same combination twice). Prune early when the path
already has `k` elements.

```javascript
function combine(n, k) {
  const res = [];
  const path = [];

  function backtrack(start) {
    if (path.length === k) {
      res.push([...path]);
      return;
    }
    for (let i = start; i <= n; i++) {
      path.push(i);
      backtrack(i + 1);
      path.pop();
    }
  }
  backtrack(1);
  return res;
}
```

**Complexity.** Time O(k · C(n, k)), Space O(k) recursion depth (output aside).
(Tighter pruning: stop the loop once `n - i + 1 < k - path.length` remaining slots can't be
filled.)

---

## Medium

### 6. Combination Sum

**Problem.** Given distinct positive integers `candidates` and a `target`, return all
unique combinations where the chosen numbers sum to `target`. The same number may be
reused unlimited times.

**Intuition.** Sort first so we can prune. At each step, either reuse the current index
(allows repeats) or move to the next. Stop the loop as soon as a candidate exceeds the
remaining target — sorting makes every later candidate exceed it too.

```javascript
function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const res = [];
  const path = [];

  function backtrack(start, remaining) {
    if (remaining === 0) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // prune: sorted, rest are bigger too
      path.push(candidates[i]);
      backtrack(i, remaining - candidates[i]); // i, not i+1: reuse allowed
      path.pop();
    }
  }
  backtrack(0, target);
  return res;
}
```

**Complexity.** Time O(2^target) worst case (loose upper bound; pruning via the sorted
break cuts this drastically in practice), Space O(target / min(candidates)) recursion depth.

---

### 7. Combination Sum II

**Problem.** Given `candidates` (may contain duplicates) and `target`, return all unique
combinations summing to `target`. Each number may be used at most once.

**Intuition.** Sort so duplicates sit together. At each recursion level, skip a candidate
equal to the previous one *at the same level* (`i > start`) — that's what prevents
duplicate combinations while still allowing a duplicate value deeper in the same path.
Advance `i + 1` since reuse isn't allowed.

```javascript
function combinationSum2(candidates, target) {
  candidates.sort((a, b) => a - b);
  const res = [];
  const path = [];

  function backtrack(start, remaining) {
    if (remaining === 0) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) continue; // skip same-level dup
      if (candidates[i] > remaining) break;
      path.push(candidates[i]);
      backtrack(i + 1, remaining - candidates[i]);
      path.pop();
    }
  }
  backtrack(0, target);
  return res;
}
```

**Complexity.** Time O(2ⁿ) worst case (loose upper bound; the dedup skip and sorted break
prune heavily), Space O(n) recursion depth.

---

### 8. Subsets II

**Problem.** Given an array `nums` that may contain duplicates, return all possible
unique subsets.

**Intuition.** Same choose/explore/un-choose as Subsets, but sort first and skip a
candidate equal to the previous one at the same recursion level (`i > start`) — that
prevents generating the same subset twice while still allowing duplicates within one path.

```javascript
function subsetsWithDup(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  const path = [];

  function backtrack(start) {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue; // skip same-level dup
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  }
  backtrack(0);
  return res;
}
```

**Complexity.** Time O(n · 2ⁿ) worst case (loose upper bound; duplicate skipping prunes
whenever repeats exist), Space O(n) recursion depth (output aside).

---

### 9. Permutations II

**Problem.** Given an array `nums` that may contain duplicates, return all unique
permutations.

**Intuition.** Same used-array approach as Permutations, but sort first. The pruning rule
`nums[i] === nums[i-1] && !used[i-1]` skips a duplicate only when its identical
predecessor is currently *unused* — this forces duplicate values to be placed in a fixed
relative order, eliminating duplicate permutations.

```javascript
function permuteUnique(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  const path = [];
  const used = new Array(nums.length).fill(false);

  function backtrack() {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue; // prune dup order
      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }
  backtrack();
  return res;
}
```

**Complexity.** Time O(n · n!) worst case (loose upper bound; the dup-order rule prunes
proportionally to how many duplicates exist), Space O(n) recursion depth.

---

### 10. Palindrome Partitioning

**Problem.** Given a string `s`, partition it so every substring is a palindrome. Return
all possible partitions.

**Intuition.** Choose the next cut: try every prefix starting at `start`, and only recurse
into it if that prefix is a palindrome (the pruning condition — non-palindromic prefixes
are dead ends). Base case: `start` reaches the end of the string.

```javascript
function partition(s) {
  const res = [];
  const path = [];

  function isPalindrome(str) {
    let lo = 0;
    let hi = str.length - 1;
    while (lo < hi) {
      if (str[lo] !== str[hi]) return false;
      lo++;
      hi--;
    }
    return true;
  }

  function backtrack(start) {
    if (start === s.length) {
      res.push([...path]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      const sub = s.slice(start, end + 1);
      if (!isPalindrome(sub)) continue; // prune: not a valid piece
      path.push(sub);
      backtrack(end + 1);
      path.pop();
    }
  }
  backtrack(0);
  return res;
}
```

**Complexity.** Time O(n · 2ⁿ) worst case (2ⁿ possible partitions, O(n) palindrome check
each; can drop to O(1) checks with a precomputed DP table), Space O(n) recursion depth.

---

### 11. Word Search

**Problem.** Given a 2D `board` of letters and a `word`, return `true` if the word exists
as a path of adjacent (horizontally/vertically) cells, each cell used at most once.

**Intuition.** DFS/backtrack from every starting cell. At each step, check the current
cell matches the current character; if so, mark it visited (mutate in place with a
sentinel), explore all 4 directions, then restore it. The pruning condition is any
mismatch or out-of-bounds/already-visited cell.

```javascript
function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function backtrack(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[i]) {
      return false; // prune
    }

    const temp = board[r][c];
    board[r][c] = '#'; // mark visited
    const found =
      backtrack(r + 1, c, i + 1) ||
      backtrack(r - 1, c, i + 1) ||
      backtrack(r, c + 1, i + 1) ||
      backtrack(r, c - 1, i + 1);
    board[r][c] = temp; // un-choose

    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (backtrack(r, c, 0)) return true;
    }
  }
  return false;
}
```

**Complexity.** Time O(rows · cols · 4^L) where L is the word length (loose upper bound;
immediate character mismatches prune almost all branches in practice), Space O(L)
recursion depth.

---

### 12. Restore IP Addresses

**Problem.** Given a string of digits `s`, return all ways to insert three dots to form a
valid IP address (four segments, each `0`-`255`, no segment with a leading zero unless it's
exactly `"0"`).

**Intuition.** Choose the length (1-3 digits) of the next segment, validate it (no leading
zero, value ≤ 255 — the pruning condition), and recurse. Stop when four segments are
placed and exactly the whole string has been consumed.

```javascript
function restoreIpAddresses(s) {
  const res = [];
  const path = [];

  function backtrack(start) {
    if (path.length === 4) {
      if (start === s.length) res.push(path.join('.'));
      return;
    }
    for (let len = 1; len <= 3 && start + len <= s.length; len++) {
      const seg = s.slice(start, start + len);
      if (len > 1 && seg[0] === '0') break; // prune: leading zero
      if (Number(seg) > 255) break;         // prune: out of range
      path.push(seg);
      backtrack(start + len);
      path.pop();
    }
  }
  backtrack(0);
  return res;
}
```

**Complexity.** Time O(1) (at most 3⁴ = 81 segment-length combinations to try regardless
of input size), Space O(1) recursion depth (bounded by 4).

---

### 13. Beautiful Arrangement

**Problem.** Count the permutations of `[1, n]` such that at every position `i`
(1-indexed), either `perm[i]` is divisible by `i` or `i` is divisible by `perm[i]`.

**Intuition.** Fill positions `1..n` one at a time. At position `pos`, try every unused
number and only recurse if it satisfies the divisibility condition — the pruning check
`num % pos !== 0 && pos % num !== 0` skips invalid placements before ever descending into
them, which is what makes this tractable beyond brute-force permutation generation.

```javascript
function countArrangement(n) {
  let count = 0;
  const used = new Array(n + 1).fill(false);

  function backtrack(pos) {
    if (pos > n) {
      count++;
      return;
    }
    for (let num = 1; num <= n; num++) {
      if (used[num]) continue;
      if (num % pos !== 0 && pos % num !== 0) continue; // prune
      used[num] = true;
      backtrack(pos + 1);
      used[num] = false;
    }
  }
  backtrack(1);
  return count;
}
```

**Complexity.** Time O(k) for some k << n! (loose bound n!, but the divisibility pruning
cuts the branching factor sharply as n grows), Space O(n) recursion depth.

---

## Hard

### 14. N-Queens

**Problem.** Place `n` queens on an `n x n` chessboard so no two attack each other. Return
all distinct board configurations.

**Intuition.** Place one queen per row. At row `r`, try every column; a placement is valid
only if its column and both diagonals (`row - col`, `row + col`) aren't already occupied —
the pruning condition. Track occupied columns/diagonals with sets, add before recursing,
remove after.

```javascript
function solveNQueens(n) {
  const res = [];
  const cols = new Set();
  const diag1 = new Set(); // row - col
  const diag2 = new Set(); // row + col
  const placement = []; // placement[row] = col

  function backtrack(row) {
    if (row === n) {
      res.push(placement.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;

      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      placement.push(col);

      backtrack(row + 1);

      placement.pop();
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  }
  backtrack(0);
  return res;
}
```

**Complexity.** Time O(n!) worst case (loose upper bound; column/diagonal pruning cuts the
search tree drastically compared to trying all n^n placements), Space O(n) for the sets and
recursion depth.

---

### 15. Sudoku Solver

**Problem.** Solve a 9x9 Sudoku puzzle in place: fill empty cells (`'.'`) so every row,
column, and 3x3 box contains digits `1`-`9` exactly once.

**Intuition.** Scan cells left-to-right, top-to-bottom. For each empty cell, try digits
1-9; the pruning condition is the digit already appearing in that row, column, or box
(tracked with sets for O(1) checks). Recurse to the next cell; if every continuation fails,
undo and backtrack. Return `true` up the stack as soon as a full solution is found.

```javascript
function solveSudoku(board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v !== '.') {
        rows[r].add(v);
        cols[c].add(v);
        boxes[Math.floor(r / 3) * 3 + Math.floor(c / 3)].add(v);
      }
    }
  }

  function backtrack(pos) {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    if (board[r][c] !== '.') return backtrack(pos + 1);

    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    for (let d = 1; d <= 9; d++) {
      const ch = String(d);
      if (rows[r].has(ch) || cols[c].has(ch) || boxes[b].has(ch)) continue; // prune

      board[r][c] = ch;
      rows[r].add(ch);
      cols[c].add(ch);
      boxes[b].add(ch);

      if (backtrack(pos + 1)) return true;

      board[r][c] = '.';
      rows[r].delete(ch);
      cols[c].delete(ch);
      boxes[b].delete(ch);
    }
    return false;
  }

  backtrack(0);
  return board;
}
```

**Complexity.** Time O(9^m) where m is the number of empty cells (loose upper bound; row/
col/box pruning eliminates the vast majority of digit choices in practice), Space O(1)
extra (fixed 9x9 tracking sets) plus O(m) recursion depth.

---

### 16. Expression Add Operators

**Problem.** Given a string `num` of digits and an integer `target`, insert the binary
operators `+`, `-`, `*` between digits so the resulting expression evaluates to `target`.
Return all such expressions. No leading zeros in any multi-digit segment.

**Intuition.** Choose the next operand (any length, skipping leading-zero splits), then
choose an operator for it, and recurse. The tricky part is `*`: since it binds tighter than
`+`/`-`, we track the previous operand's *signed* contribution to the running total, so we
can undo it and redo the multiplication: `currVal - prevOperand + prevOperand * val`.

```javascript
function addOperators(num, target) {
  const res = [];
  const n = num.length;

  function backtrack(index, expr, currVal, prevOperand) {
    if (index === n) {
      if (currVal === target) res.push(expr);
      return;
    }
    for (let i = index; i < n; i++) {
      if (i > index && num[index] === '0') break; // prune: leading zero
      const str = num.slice(index, i + 1);
      const val = Number(str);

      if (index === 0) {
        // first operand: no operator in front of it
        backtrack(i + 1, str, val, val);
      } else {
        backtrack(i + 1, expr + '+' + str, currVal + val, val);
        backtrack(i + 1, expr + '-' + str, currVal - val, -val);
        backtrack(
          i + 1,
          expr + '*' + str,
          currVal - prevOperand + prevOperand * val,
          prevOperand * val
        );
      }
    }
  }
  backtrack(0, '', 0, 0);
  return res;
}
```

**Complexity.** Time O(4^n) worst case (n split points, 3 operators + operand-length
choice; loose upper bound — leading-zero pruning trims it), Space O(n) recursion depth.

---

### 17. Partition to K Equal Sum Subsets

**Problem.** Given `nums` and an integer `k`, return `true` if `nums` can be partitioned
into `k` non-empty subsets with equal sums.

**Intuition.** If the total isn't divisible by `k`, fail immediately. Otherwise assign
elements (sorted descending, so big values get placed — and pruned — first) one at a time
to one of `k` buckets. Prune whenever a bucket would exceed the target sum, and skip trying
the same running-bucket-total twice in a row (`buckets[i] === buckets[i-1]`) since that's
guaranteed to repeat work already ruled out.

```javascript
function canPartitionKSubsets(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % k !== 0) return false;
  const target = total / k;

  nums.sort((a, b) => b - a);
  if (nums[0] > target) return false;

  const buckets = new Array(k).fill(0);

  function backtrack(index) {
    if (index === nums.length) return buckets.every((b) => b === target);

    for (let i = 0; i < k; i++) {
      if (buckets[i] + nums[index] > target) continue; // prune: overflow
      if (i > 0 && buckets[i] === buckets[i - 1]) continue; // prune: identical state

      buckets[i] += nums[index];
      if (backtrack(index + 1)) return true;
      buckets[i] -= nums[index];

      if (buckets[i] === 0) break; // prune: empty bucket failed, others are equivalent
    }
    return false;
  }
  return backtrack(0);
}
```

**Complexity.** Time O(k^n) worst case (loose upper bound; descending order plus the
identical-bucket and empty-bucket prunes cut this enormously in practice), Space O(n)
recursion depth.

---

## Very Hard

### 18. Matchsticks to Square

**Problem.** Given an array of matchstick lengths, return `true` if they can be arranged
to form a square (each matchstick used exactly once, no breaking).

**Intuition.** This is Partition to K Equal Sum Subsets with `k = 4` — the target side
length is `total / 4`. Sort descending so the biggest sticks get placed (and pruned) first,
and apply the same identical-bucket and empty-bucket pruning to avoid redundant branches.

```javascript
function makesquare(matchsticks) {
  const total = matchsticks.reduce((a, b) => a + b, 0);
  if (total % 4 !== 0) return false;
  const side = total / 4;

  matchsticks.sort((a, b) => b - a);
  if (matchsticks[0] > side) return false;

  const sides = [0, 0, 0, 0];

  function backtrack(index) {
    if (index === matchsticks.length) return sides.every((s) => s === side);

    for (let i = 0; i < 4; i++) {
      if (sides[i] + matchsticks[index] > side) continue; // prune: overflow
      if (i > 0 && sides[i] === sides[i - 1]) continue;   // prune: identical state

      sides[i] += matchsticks[index];
      if (backtrack(index + 1)) return true;
      sides[i] -= matchsticks[index];

      if (sides[i] === 0) break; // prune: empty side failed, others equivalent
    }
    return false;
  }
  return backtrack(0);
}
```

**Complexity.** Time O(4ⁿ) worst case (loose upper bound; descending order plus heavy
pruning is what makes this solvable at all — without it, even n=15 is impractical), Space
O(n) recursion depth.

---

### 19. Split Array into Fibonacci Sequence

**Problem.** Given a numeric string `num`, return any way to split it into a sequence of
at least 3 numbers that forms a valid Fibonacci-like sequence (each number is the sum of
the previous two), with no leading zeros in any multi-digit number and every number fitting
in a 32-bit signed integer.

**Intuition.** Backtrack over cut points, building the sequence left to right. For the
first two numbers, any valid split is allowed. From the third number on, the required
value is fully determined (`path[-2] + path[-1]`) — the pruning condition is exact: if the
next candidate substring's numeric value doesn't equal that sum, either skip (too small) or
give up on longer substrings at this position (too big, and it only grows from here). Also
prune leading zeros and 32-bit overflow.

```javascript
function splitIntoFibonacci(num) {
  const n = num.length;
  const MAX = 2 ** 31 - 1;
  const path = [];

  function backtrack(index) {
    if (index === n) return path.length >= 3;

    for (let i = index; i < n; i++) {
      if (i > index && num[index] === '0') break; // prune: leading zero
      const str = num.slice(index, i + 1);
      if (str.length > 10) break; // prune: longer than MAX can ever be
      const val = Number(str);
      if (val > MAX) break; // prune: overflow

      const len = path.length;
      if (len >= 2) {
        const need = path[len - 2] + path[len - 1];
        if (val > need) break;   // prune: only grows from here, no point extending
        if (val < need) continue; // too small, try a longer substring
      }

      path.push(val);
      if (backtrack(i + 1)) return true;
      path.pop();
    }
    return false;
  }

  return backtrack(0) ? path : [];
}
```

**Complexity.** Time O(n²) amortized (loose bound O(2ⁿ) without pruning; once two numbers
are fixed, the rest of the sequence is forced, so pruning collapses branching to near-
linear), Space O(n) recursion depth.

---

## Very Very Hard

### 20. The Boss Fight

Three progressively brutal backtracking problems that interviewers use to separate
"strong hire" from everyone else. Pick your poison.

#### 20a. N-Queens with Bitmask Optimization

**Problem.** Same as problem 14 (count or return all N-Queens solutions), but fast enough
to comfortably handle `n` up to ~16 instead of ~10.

**Intuition.** Represent occupied columns and both diagonal directions as integers, one bit
per column. `cols | diag1 | diag2` gives every attacked column in the current row as a
single bitmask; `available = full & ~occupied` gives all safe columns at once — no per-
column set lookups. Peel off one bit at a time with `bit = available & -available`, recurse
with the diagonals shifted (`<< 1` / `>> 1` to slide them into the next row's frame), and
the un-choose step is implicit since each recursive call gets its own local mask values
(no shared mutable state to restore).

```javascript
function totalNQueens(n) {
  let count = 0;
  const full = (1 << n) - 1;

  function backtrack(row, cols, diag1, diag2) {
    if (row === n) {
      count++;
      return;
    }
    let available = full & ~(cols | diag1 | diag2);
    while (available) {
      const bit = available & -available; // lowest set bit = next candidate column
      available ^= bit;                    // remove it from remaining candidates
      backtrack(row + 1, cols | bit, (diag1 | bit) << 1, (diag2 | bit) >> 1);
    }
  }
  backtrack(0, 0, 0, 0);
  return count;
}
```

**Complexity.** Time O(n!) worst case (same asymptotic bound as problem 14, but each node
does O(1) bit tricks instead of O(n) set operations — empirically an order of magnitude
faster; n=12 naive vs bitmask measured ~40x). Space O(n) recursion depth, O(1) extra per
frame (no sets to maintain).

---

#### 20b. Word Search II (Trie + Backtracking)

**Problem.** Given a 2D `board` of letters and a list of `words`, return all words from the
list that can be formed by a path of adjacent cells (each cell used at most once per word).

**Intuition.** Searching for each word independently (repeating Word Search per word) is
wasteful when words share prefixes. Build a Trie of all target words first. DFS from every
board cell, but instead of tracking one target word, walk the Trie alongside the DFS — the
pruning condition is "no child in the Trie for this letter," which kills entire families of
words in one check. When a Trie node marks the end of a word, record it and null out that
marker to avoid duplicate results; optionally delete Trie leaves with no children as you
backtrack to keep the Trie shrinking as words are found.

```javascript
class TrieNode {
  constructor() {
    this.children = {};
    this.word = null;
  }
}

function findWords(board, words) {
  const root = new TrieNode();
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.word = w;
  }

  const rows = board.length;
  const cols = board[0].length;
  const res = [];

  function backtrack(r, c, node) {
    const ch = board[r][c];
    const next = node.children[ch];
    if (!next) return; // prune: no word in the Trie continues this way

    if (next.word) {
      res.push(next.word);
      next.word = null; // avoid duplicate matches
    }

    board[r][c] = '#'; // mark visited
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== '#') {
        backtrack(nr, nc, next);
      }
    }
    board[r][c] = ch; // un-choose

    if (Object.keys(next.children).length === 0) {
      delete node.children[ch]; // prune dead Trie branch for future cells
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      backtrack(r, c, root);
    }
  }
  return res;
}
```

**Complexity.** Time O(rows · cols · 4^L) where L is the longest word (loose upper bound;
Trie pruning means the search dies the moment a prefix stops matching *any* word, sharing
work across all words simultaneously), Space O(total characters in `words`) for the Trie
plus O(L) recursion depth.

---

#### 20c. The Knight's Tour (with Warnsdorff's Heuristic)

**Problem.** On an `n x n` chessboard, find a sequence of knight moves that visits every
square exactly once, starting from `(0, 0)`. Return the board labeled with visit order, or
`null` if no tour exists.

**Intuition.** Naive backtracking (try all 8 moves in a fixed order from every square) is
exponential and untractable past roughly n=6-7. Warnsdorff's heuristic reorders the choices
at each step: always try the reachable square with the *fewest* onward moves first. This
greedily steers the knight toward corners and edges before they become unreachable dead
ends, which in practice finds a full tour almost without ever needing to backtrack. The
pruning/un-choose structure is still classic backtracking (mark visited, recurse, unmark on
failure) — the heuristic just reorders which branch gets tried first.

```javascript
function knightsTour(n) {
  const moves = [
    [2, 1], [1, 2], [-1, 2], [-2, 1],
    [-2, -1], [-1, -2], [1, -2], [2, -1],
  ];
  const board = Array.from({ length: n }, () => new Array(n).fill(-1));

  function countOnwardMoves(r, c) {
    let cnt = 0;
    for (const [dr, dc] of moves) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === -1) cnt++;
    }
    return cnt;
  }

  function backtrack(r, c, step) {
    board[r][c] = step;
    if (step === n * n - 1) return true;

    const candidates = [];
    for (const [dr, dc] of moves) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === -1) {
        candidates.push([nr, nc, countOnwardMoves(nr, nc)]);
      }
    }
    candidates.sort((a, b) => a[2] - b[2]); // Warnsdorff: fewest onward moves first

    for (const [nr, nc] of candidates) {
      if (backtrack(nr, nc, step + 1)) return true;
    }

    board[r][c] = -1; // un-choose
    return false;
  }

  return backtrack(0, 0, 0) ? board : null;
}
```

**Complexity.** Time O(8^(n²)) worst case with no heuristic (loose upper bound; Warnsdorff's
heuristic makes real-world runs close to O(n²) with rare backtracking, which is what makes
boards up to n=8 and beyond tractable at all), Space O(n²) for the board plus O(n²)
recursion depth.

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Choose/explore/un-choose basics (subsets & permutations) | 1, 2, 8, 9 |
| String building with local validity check | 3, 4, 12 |
| Fixed-size combination with forward-only pointer | 5, 6, 7 |
| Substring/partition backtracking | 10, 19 |
| Grid DFS with visited-marking | 11, 20b |
| Constraint-satisfaction with conflict tracking | 13, 14, 15, 20a |
| Digit-splitting with running-value undo | 16, 19 |
| Equal-partition into k buckets | 17, 18 |
| Heuristic-ordered search | 20c |
| Trie-accelerated search | 20b |

**Recommended progression:** 1 → 2 → 5 → 4 → 3 → 8 → 9 → 6 → 7 → 10 → 12 → 11 → 13 →
14 → 15 → 17 → 18 → 16 → 19 → 20.
