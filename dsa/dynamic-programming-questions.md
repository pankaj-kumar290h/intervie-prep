# Dynamic Programming Interview Questions — Easy → Very Very Hard

20 curated dynamic programming problems with problem statements, intuition, JavaScript
solutions, and complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Climbing Stairs](#1-climbing-stairs)
2. [Min Cost Climbing Stairs](#2-min-cost-climbing-stairs)
3. [House Robber](#3-house-robber)
4. [N-th Tribonacci Number](#4-n-th-tribonacci-number)
5. [Range Sum Query - Immutable](#5-range-sum-query---immutable)

**Medium**
6. [Coin Change](#6-coin-change)
7. [Longest Increasing Subsequence](#7-longest-increasing-subsequence)
8. [Unique Paths](#8-unique-paths)
9. [Longest Common Subsequence](#9-longest-common-subsequence)
10. [House Robber II](#10-house-robber-ii)
11. [Partition Equal Subset Sum](#11-partition-equal-subset-sum)
12. [Word Break](#12-word-break)
13. [Decode Ways](#13-decode-ways)

**Hard**
14. [Edit Distance](#14-edit-distance)
15. [Longest Palindromic Subsequence](#15-longest-palindromic-subsequence)
16. [Target Sum](#16-target-sum)
17. [Coin Change II](#17-coin-change-ii)

**Very Hard**
18. [Interleaving String](#18-interleaving-string)
19. [Burst Balloons](#19-burst-balloons)

**Very Very Hard**
20. [Longest Increasing Path in a Matrix / Matrix Chain Multiplication / Palindrome Partitioning II](#20-the-boss-fight)

---

## Easy

### 1. Climbing Stairs

**Problem.** You're climbing a staircase of `n` steps. Each move you climb 1 or 2 steps.
Return the number of distinct ways to reach the top.

**Intuition.** `dp[i] = dp[i-1] + dp[i-2]` — the last move into step `i` was either a
1-step from `i-1` or a 2-step from `i-2`. This is just Fibonacci with different base cases.

```javascript
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1;
  let prev1 = 2;
  for (let i = 3; i <= n; i++) {
    [prev2, prev1] = [prev1, prev1 + prev2];
  }
  return prev1;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 2. Min Cost Climbing Stairs

**Problem.** `cost[i]` is the cost to step on stair `i`. You may start at index 0 or 1, and
from a stair you can climb 1 or 2 steps. Return the minimum cost to reach the top (one step
past the last index).

**Intuition.** `dp[i] = cost[i] + min(dp[i-1], dp[i-2])` is the cheapest way to *land on* `i`.
`dp[0] = dp[1] = 0` since you can start there for free. The answer is `min(dp[n-1], dp[n-2])`
— the top is reached from either of the last two stairs.

```javascript
function minCostClimbingStairs(cost) {
  let prev2 = 0; // dp[i-2]
  let prev1 = 0; // dp[i-1]
  for (let i = 2; i <= cost.length; i++) {
    const curr = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 3. House Robber

**Problem.** `nums[i]` is the money in house `i`. You can't rob two adjacent houses.
Return the maximum money you can rob.

**Intuition.** `dp[i] = max(dp[i-1], dp[i-2] + nums[i])` — either skip house `i` (keep the
best up to `i-1`) or rob it (best up to `i-2` plus this house's value).

```javascript
function rob(nums) {
  let prev2 = 0; // dp[i-2]
  let prev1 = 0; // dp[i-1]
  for (const n of nums) {
    const curr = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 4. N-th Tribonacci Number

**Problem.** The Tribonacci sequence is `T[0]=0, T[1]=1, T[2]=1`, and
`T[n] = T[n-1] + T[n-2] + T[n-3]` for `n >= 3`. Return `T[n]`.

**Intuition.** Same idea as Fibonacci but with a window of 3 previous values instead of 2 —
carry three rolling variables forward instead of building an array.

```javascript
function tribonacci(n) {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  let a = 0;
  let b = 1;
  let c = 1;
  for (let i = 3; i <= n; i++) {
    [a, b, c] = [b, c, a + b + c];
  }
  return c;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 5. Range Sum Query - Immutable

**Problem.** Design a class `NumArray` that, given an immutable integer array, answers
`sumRange(left, right)` — the sum of elements between indices `left` and `right` inclusive —
for many queries.

**Intuition.** `prefix[i]` = dp state holding the sum of the first `i` elements, with
`prefix[i] = prefix[i-1] + nums[i-1]`. Precompute it once; then any range sum is a O(1)
subtraction: `prefix[right+1] - prefix[left]`.

```javascript
class NumArray {
  constructor(nums) {
    this.prefix = [0];
    for (const n of nums) {
      this.prefix.push(this.prefix[this.prefix.length - 1] + n);
    }
  }

  sumRange(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
  }
}
```

**Complexity.** Construction Time O(n), Space O(n). Each query Time O(1).

---

## Medium

### 6. Coin Change

**Problem.** Given coin denominations `coins` and a target `amount`, return the fewest
coins needed to make `amount` (unlimited supply of each coin), or `-1` if impossible.

**Intuition.** `dp[a]` = minimum coins to make amount `a`. `dp[0] = 0`, and
`dp[a] = min(dp[a - c] + 1)` over every coin `c <= a`. This is the classic unbounded
knapsack — each coin can be reused, so we iterate amounts outward and coins inward.

```javascript
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

**Complexity.** Time O(amount · coins.length), Space O(amount).

---

### 7. Longest Increasing Subsequence

**Problem.** Given an integer array `nums`, return the length of the longest strictly
increasing subsequence.

**Intuition.** The natural DP is `dp[i]` = length of the LIS ending at `i`, with
`dp[i] = 1 + max(dp[j])` over all `j < i` with `nums[j] < nums[i]` — O(n²). We can do
better: maintain `tails`, where `tails[k]` is the smallest possible tail value of any
increasing subsequence of length `k+1`. For each new number, binary-search `tails` for the
first entry `>= n` and overwrite it (or append if none exists). `tails.length` is always
the LIS length so far — the array itself isn't a real subsequence, but its length is
correct because each replacement can only help future extensions.

```javascript
function lengthOfLIS(nums) {
  const tails = [];
  for (const n of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < n) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = n; // overwrite or append
  }
  return tails.length;
}
```

**Complexity.** Time O(n log n), Space O(n). (The O(n²) tabulation is simpler to derive
first in an interview, then optimize to this.)

---

### 8. Unique Paths

**Problem.** A robot sits at the top-left of an `m x n` grid and can only move right or
down. Return the number of distinct paths to the bottom-right corner.

**Intuition.** `dp[i][j] = dp[i-1][j] + dp[i][j-1]` — you arrive at a cell either from
above or from the left. The first row and column are all 1 (only one way to walk straight
along an edge). Since row `i` only depends on row `i-1`, keep a single rolling row.

```javascript
function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      row[j] += row[j - 1];
    }
  }
  return row[n - 1];
}
```

**Complexity.** Time O(m·n), Space O(n). (A closed-form `C(m+n-2, m-1)` also exists.)

---

### 9. Longest Common Subsequence

**Problem.** Given two strings `text1` and `text2`, return the length of their longest
common subsequence (not necessarily contiguous).

**Intuition.** `dp[i][j]` = LCS length of `text1[0..i)` and `text2[0..j)`. If the last
characters match, `dp[i][j] = dp[i-1][j-1] + 1`; otherwise
`dp[i][j] = max(dp[i-1][j], dp[i][j-1])`. Only the previous row is needed at any time.

```javascript
function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  let prev = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      curr[j] = text1[i - 1] === text2[j - 1]
        ? prev[j - 1] + 1
        : Math.max(prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}
```

**Complexity.** Time O(m·n), Space O(n) (rolling rows instead of the full O(m·n) table).

---

### 10. House Robber II

**Problem.** Same as House Robber, but the houses are arranged in a circle — the first
and last houses are adjacent, so you can't rob both.

**Intuition.** Because houses 0 and `n-1` can't both be robbed, the answer is the better of
two linear House Robber runs: one excluding house 0 (`nums[1..n-1]`) and one excluding
house `n-1` (`nums[0..n-2]`). Reuse the O(1)-space linear solution on each.

```javascript
function robCircular(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];

  const robLine = (arr) => {
    let prev2 = 0;
    let prev1 = 0;
    for (const x of arr) {
      const curr = Math.max(prev1, prev2 + x);
      prev2 = prev1;
      prev1 = curr;
    }
    return prev1;
  };

  return Math.max(robLine(nums.slice(0, n - 1)), robLine(nums.slice(1)));
}
```

**Complexity.** Time O(n), Space O(1) extra (ignoring the two slice copies, which are O(n)
in JS but easy to avoid with index bounds instead).

---

### 11. Partition Equal Subset Sum

**Problem.** Given a positive-integer array `nums`, determine if it can be split into two
subsets with equal sum.

**Intuition.** Equal split requires the total sum to be even; then the question becomes
"does some subset sum to `total / 2`?" — a classic 0/1 knapsack. `dp[s]` = whether sum `s`
is reachable. Iterate items outward and sums **downward** so each number is used at most
once.

```javascript
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;

  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const n of nums) {
    for (let s = target; s >= n; s--) {
      dp[s] = dp[s] || dp[s - n];
    }
  }
  return dp[target];
}
```

**Complexity.** Time O(n · target), Space O(target).

---

### 12. Word Break

**Problem.** Given a string `s` and a dictionary `wordDict`, return whether `s` can be
segmented into a space-separated sequence of one or more dictionary words.

**Intuition.** `dp[i]` = true if `s[0..i)` can be fully segmented. `dp[0] = true` (empty
prefix). `dp[i] = true` if there's some split point `j < i` with `dp[j]` true and
`s[j..i)` in the dictionary.

```javascript
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}
```

**Complexity.** Time O(n² ) for the double loop plus O(n) average substring/hash cost per
check, Space O(n).

---

### 13. Decode Ways

**Problem.** A digit string encodes letters via `'A' -> "1", ..., 'Z' -> "26"`. Given a
digit string `s`, return the number of ways to decode it.

**Intuition.** `dp[i]` = number of ways to decode the first `i` characters. A decoding of
length `i` either ends with a single digit (`s[i-1]`, valid if it's `1`-`9`) contributing
`dp[i-1]`, or a two-digit group (`s[i-2..i)`, valid if it's `10`-`26`) contributing
`dp[i-2]`. `dp[0] = 1` (empty prefix), and a string starting with `'0'` is undecodable.

```javascript
function numDecodings(s) {
  const n = s.length;
  if (n === 0 || s[0] === '0') return 0;

  let prev2 = 1; // dp[i-2], dp[0]
  let prev1 = 1; // dp[i-1], dp[1]
  for (let i = 2; i <= n; i++) {
    let curr = 0;
    const one = Number(s.slice(i - 1, i));
    const two = Number(s.slice(i - 2, i));
    if (one >= 1) curr += prev1;
    if (two >= 10 && two <= 26) curr += prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Complexity.** Time O(n), Space O(1).

---

## Hard

### 14. Edit Distance

**Problem.** Given two strings `word1` and `word2`, return the minimum number of insert,
delete, or replace operations to convert `word1` into `word2`.

**Intuition.** `dp[i][j]` = edit distance between `word1[0..i)` and `word2[0..j)`. If the
last characters match, `dp[i][j] = dp[i-1][j-1]` (no-op). Otherwise take 1 plus the best of
insert (`dp[i][j-1]`), delete (`dp[i-1][j]`), or replace (`dp[i-1][j-1]`). Base cases:
converting an empty string costs the length of the other string.

```javascript
function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  let prev = new Array(n + 1).fill(0).map((_, j) => j);

  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1).fill(0);
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = word1[i - 1] === word2[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}
```

**Complexity.** Time O(m·n), Space O(n) (rolling rows instead of the full table; recovering
the actual edit sequence needs the full O(m·n) table).

---

### 15. Longest Palindromic Subsequence

**Problem.** Given a string `s`, return the length of the longest subsequence of `s` that
is a palindrome.

**Intuition.** `dp[i][j]` = LPS length within `s[i..j]`. If `s[i] === s[j]`, those two
characters bookend a palindrome, so `dp[i][j] = dp[i+1][j-1] + 2`. Otherwise
`dp[i][j] = max(dp[i+1][j], dp[i][j-1])`. Fill by increasing substring length, base case
`dp[i][i] = 1`.

```javascript
function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      dp[i][j] = s[i] === s[j]
        ? dp[i + 1][j - 1] + 2
        : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return dp[0][n - 1];
}
```

**Complexity.** Time O(n²), Space O(n²) (can be reduced to O(n) with careful diagonal
rolling, at the cost of readability).

---

### 16. Target Sum

**Problem.** Given an integer array `nums` and target `target`, assign each number a `+`
or `-` sign so the expression evaluates to `target`. Return the number of ways to do so.

**Intuition.** Split `nums` into a positive-assigned subset `P` and negative-assigned
subset `N`. Then `sum(P) - sum(N) = target` and `sum(P) + sum(N) = total`, so
`sum(P) = (total + target) / 2`. This reduces to "count subsets summing to
`(total + target) / 2`" — a 0/1 knapsack counting variant. If that value isn't a
non-negative integer (or exceeds `total`), the answer is 0.

```javascript
function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
  const P = (total + target) / 2;

  const dp = new Array(P + 1).fill(0);
  dp[0] = 1;
  for (const n of nums) {
    for (let s = P; s >= n; s--) {
      dp[s] += dp[s - n];
    }
  }
  return dp[P];
}
```

**Complexity.** Time O(n · P), Space O(P).

---

### 17. Coin Change II

**Problem.** Given coins `coins` (unlimited supply of each) and `amount`, return the
number of distinct **combinations** that make up `amount` (order doesn't matter).

**Intuition.** `dp[a]` = number of ways to make amount `a`. To count combinations (not
permutations), iterate coins in the **outer** loop and amounts in the inner loop — this
fixes the order in which coin types are considered, so `{1,2}` and `{2,1}` aren't
double-counted. `dp[0] = 1` (one way: use nothing).

```javascript
function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  for (const c of coins) {
    for (let a = c; a <= amount; a++) {
      dp[a] += dp[a - c];
    }
  }
  return dp[amount];
}
```

**Complexity.** Time O(amount · coins.length), Space O(amount).

---

## Very Hard

### 18. Interleaving String

**Problem.** Given strings `s1`, `s2`, `s3`, return whether `s3` is formed by interleaving
`s1` and `s2` (preserving each string's own character order, but freely interleaved with
the other).

**Intuition.** `dp[i][j]` = whether `s3[0 .. i+j)` can be formed by interleaving
`s1[0..i)` and `s2[0..j)`. It's true if either the previous char came from `s1`
(`dp[i-1][j]` true and `s1[i-1] === s3[i+j-1]`) or from `s2`
(`dp[i][j-1]` true and `s2[j-1] === s3[i+j-1]`). Only the previous row is needed.

```javascript
function isInterleave(s1, s2, s3) {
  const m = s1.length;
  const n = s2.length;
  if (m + n !== s3.length) return false;

  let prev = new Array(n + 1).fill(false);
  prev[0] = true;
  for (let j = 1; j <= n; j++) prev[j] = prev[j - 1] && s2[j - 1] === s3[j - 1];

  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1).fill(false);
    curr[0] = prev[0] && s1[i - 1] === s3[i - 1];
    for (let j = 1; j <= n; j++) {
      curr[j] =
        (curr[j - 1] && s2[j - 1] === s3[i + j - 1]) ||
        (prev[j] && s1[i - 1] === s3[i + j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}
```

**Complexity.** Time O(m·n), Space O(n).

---

### 19. Burst Balloons

**Problem.** `nums[i]` is the number painted on balloon `i`. Bursting balloon `i` earns
`nums[left] * nums[i] * nums[right]`, where `left`/`right` are the *currently adjacent*
balloons (adjacency shifts as balloons pop). Burst all balloons; return the max total
coins.

**Intuition.** Think backwards: instead of "which balloon do I burst first," ask "which
balloon do I burst **last** within a range `(left, right)`?" That balloon's neighbors at
burst time are guaranteed to be `left` and `right` themselves, regardless of what happened
to everything strictly between them. Pad `nums` with `1`s on both ends. Then
`dp[left][right]` = max coins from bursting everything strictly between `left` and `right`,
computed as `max over k in (left, right)` of
`nums[left]*nums[k]*nums[right] + dp[left][k] + dp[k][right]`.

```javascript
function maxCoins(nums) {
  const balloons = [1, ...nums, 1];
  const n = balloons.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let len = 2; len < n; len++) {
    for (let left = 0; left + len < n; left++) {
      const right = left + len;
      for (let k = left + 1; k < right; k++) {
        const coins =
          balloons[left] * balloons[k] * balloons[right] + dp[left][k] + dp[k][right];
        if (coins > dp[left][right]) dp[left][right] = coins;
      }
    }
  }
  return dp[0][n - 1];
}
```

**Complexity.** Time O(n³), Space O(n²).

---

## Very Very Hard

### 20. The Boss Fight

Three progressively brutal DP problems that interviewers use to separate "strong hire"
from everyone else. Pick your poison.

#### 20a. Longest Increasing Path in a Matrix

**Problem.** Given an `R x C` integer matrix, return the length of the longest strictly
increasing path, moving only up/down/left/right (no revisiting a cell).

**Intuition.** Because every step in a path must strictly increase, the path graph is a
DAG — no cycles are possible, so plain memoized DFS is safe (no separate "visited" set
needed). `memo[r][c]` = length of the longest increasing path starting at `(r, c)`,
computed as `1 + max(memo[neighbor])` over neighbors with a strictly greater value.
Tabulating this by increasing value would also work, but DFS+memo is far more readable.

```javascript
function longestIncreasingPath(matrix) {
  const R = matrix.length;
  const C = matrix[0].length;
  const memo = Array.from({ length: R }, () => new Array(C).fill(0));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function dfs(r, c) {
    if (memo[r][c]) return memo[r][c];
    let best = 1;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && matrix[nr][nc] > matrix[r][c]) {
        best = Math.max(best, 1 + dfs(nr, nc));
      }
    }
    memo[r][c] = best;
    return best;
  }

  let ans = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      ans = Math.max(ans, dfs(r, c));
    }
  }
  return ans;
}
```

**Complexity.** Time O(R·C) (each cell's DFS result is computed once, thanks to memo),
Space O(R·C) for the memo table and recursion stack.

---

#### 20b. Matrix Chain Multiplication

**Problem.** Given dimensions `dims` where matrix `i` is `dims[i] x dims[i+1]`, find the
minimum number of scalar multiplications needed to multiply the whole chain together
(parenthesization is free to choose).

**Intuition.** Classic interval DP. `dp[i][j]` = minimum cost to multiply matrices `i..j`
into one. Try every split point `k`: multiply `i..k` and `k+1..j` separately, then combine
the two resulting matrices, costing `dims[i]*dims[k+1]*dims[j+1]`.
`dp[i][j] = min over k in [i, j)` of `dp[i][k] + dp[k+1][j] + dims[i]*dims[k+1]*dims[j+1]`.
Fill by increasing chain length; `dp[i][i] = 0` (a single matrix needs no multiplication).

```javascript
function matrixChainOrder(dims) {
  const n = dims.length - 1; // number of matrices
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        if (cost < dp[i][j]) dp[i][j] = cost;
      }
    }
  }
  return dp[0][n - 1];
}
```

**Complexity.** Time O(n³), Space O(n²).

---

#### 20c. Palindrome Partitioning II

**Problem.** Given a string `s`, partition it into substrings that are all palindromes.
Return the minimum number of cuts needed.

**Intuition.** Two-stage DP. First precompute `isPal[i][j]` = whether `s[i..j]` is a
palindrome, expanding by substring length: `isPal[i][j] = s[i]===s[j] && isPal[i+1][j-1]`.
Then `dp[i]` = minimum cuts to partition `s[0..i]` into palindromes: if `s[0..i]` is
already a palindrome, `dp[i] = 0`; otherwise `dp[i] = min(dp[j] + 1)` over every `j < i`
where `s[j+1..i]` is a palindrome.

```javascript
function minCut(s) {
  const n = s.length;
  const isPal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = 0; i < n; i++) isPal[i][i] = true;

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      if (s[i] === s[j] && (len === 2 || isPal[i + 1][j - 1])) isPal[i][j] = true;
    }
  }

  const dp = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (isPal[0][i]) {
      dp[i] = 0;
      continue;
    }
    dp[i] = Infinity;
    for (let j = 0; j < i; j++) {
      if (isPal[j + 1][i] && dp[j] + 1 < dp[i]) dp[i] = dp[j] + 1;
    }
  }
  return dp[n - 1];
}
```

**Complexity.** Time O(n²) (palindrome table O(n²), cut DP O(n²)), Space O(n²) for the
palindrome table.

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| 1D DP (linear recurrence) | 1, 2, 3, 4, 13 |
| Prefix sums as DP | 5 |
| 2D grid DP | 8 |
| DP on strings | 9, 12, 14, 15, 18, 20c |
| Knapsack (0/1 and unbounded) | 6, 11, 16, 17 |
| Sequence/subsequence DP | 7, 9, 15 |
| Interval DP | 19, 20b |
| DP on a graph / DAG (DFS + memo) | 20a |
| Circular / state-splitting DP | 10 |

**Recommended progression:** 1 → 2 → 3 → 4 → 5 → 9 → 15 → 7 → 8 → 6 → 17 → 11 → 16 →
12 → 13 → 10 → 14 → 18 → 19 → 20.
