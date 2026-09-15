# Bit Manipulation Interview Questions — Easy → Very Very Hard

20 curated bit manipulation problems with problem statements, intuition, JavaScript
solutions, and complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Single Number](#1-single-number)
2. [Number of 1 Bits / Hamming Weight](#2-number-of-1-bits--hamming-weight)
3. [Counting Bits](#3-counting-bits)
4. [Power of Two](#4-power-of-two)
5. [Reverse Bits](#5-reverse-bits)

**Medium**
6. [Single Number II](#6-single-number-ii)
7. [Single Number III](#7-single-number-iii)
8. [Sum of Two Integers](#8-sum-of-two-integers)
9. [Bitwise AND of Numbers Range](#9-bitwise-and-of-numbers-range)
10. [Missing Number](#10-missing-number)
11. [Divide Two Integers](#11-divide-two-integers)
12. [Subsets via Bitmask](#12-subsets-via-bitmask)
13. [Total Hamming Distance](#13-total-hamming-distance)

**Hard**
14. [Maximum XOR of Two Numbers in an Array](#14-maximum-xor-of-two-numbers-in-an-array)
15. [Gray Code](#15-gray-code)

**Very Hard**
16. [Minimum XOR Sum of Two Arrays](#16-minimum-xor-sum-of-two-arrays)
17. [Count of Subsets with XOR Sum Equal to K](#17-count-of-subsets-with-xor-sum-equal-to-k)
18. [UTF-8 Validation](#18-utf-8-validation)
19. [Integer Replacement](#19-integer-replacement)

**Very Very Hard**
20. [Maximum XOR With an Element From Array / Shortest Path Visiting All Nodes + N-Queens via Bitmask](#20-the-boss-fight)

---

## Easy

### 1. Single Number

**Problem.** Every element in `nums` appears twice except for one. Find that single one in
linear time and O(1) extra space.

**Intuition.** XOR is its own inverse and commutative: `x ^ x === 0` and `x ^ 0 === x`.
XOR-ing every element together cancels all pairs, leaving only the unpaired value.

```javascript
function singleNumber(nums) {
  let result = 0;
  for (const n of nums) result ^= n;
  return result;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 2. Number of 1 Bits / Hamming Weight

**Problem.** Given an unsigned 32-bit integer, return the number of `1` bits in its binary
representation.

**Intuition.** `n & (n - 1)` clears the lowest set bit (borrow turns the lowest `1` and
every trailing `0` into `0...1`, and ANDing with the original wipes just that bit). Repeat
until `n` is 0 — the number of iterations is the bit count. Use `>>> 0` / unsigned
right-shift-based loops when the input might be treated as a signed value, since JS's
bitwise operators work on signed 32-bit integers.

```javascript
function hammingWeight(n) {
  let count = 0;
  let u = n >>> 0; // treat as unsigned so the loop terminates correctly
  while (u !== 0) {
    u &= u - 1;
    count++;
  }
  return count;
}
```

**Complexity.** Time O(k) where k is the number of set bits (at most 32), Space O(1).

---

### 3. Counting Bits

**Problem.** Given an integer `n`, return an array `ans` of length `n + 1` where `ans[i]`
is the number of `1` bits in the binary representation of `i`.

**Intuition.** `i & (i - 1)` strips the lowest set bit of `i`, giving a smaller number
we've already computed. So `bits[i] = bits[i & (i - 1)] + 1`. This is an O(n) DP instead of
counting bits from scratch for every number.

```javascript
function countBits(n) {
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i & (i - 1)] + 1;
  }
  return dp;
}
```

**Complexity.** Time O(n), Space O(n) for the output.

---

### 4. Power of Two

**Problem.** Given an integer `n`, return `true` if it is a power of two.

**Intuition.** A power of two has exactly one set bit (`0b1000...0`). `n & (n - 1)` clears
that single bit, so the result is `0` iff `n` had exactly one bit set. Guard against `n <= 0`
since the trick alone would wrongly accept `0`.

```javascript
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}
```

**Complexity.** Time O(1), Space O(1).

---

### 5. Reverse Bits

**Problem.** Reverse the bits of a given 32-bit unsigned integer.

**Intuition.** Peel off the lowest bit of `n` with `n & 1`, shift it into the correct
position of the result, then shift `n` right. Use `>>>` (unsigned right shift) for `n` so
sign extension never introduces spurious `1`s, and force the final result unsigned with
`>>> 0` since the top bit can otherwise be read as a negative number in JS.

```javascript
function reverseBits(n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1;
  }
  return result >>> 0; // ensure unsigned 32-bit output
}
```

**Complexity.** Time O(32) = O(1), Space O(1).

---

## Medium

### 6. Single Number II

**Problem.** Every element in `nums` appears exactly three times except for one, which
appears once. Find that element in O(n) time and O(1) space.

**Intuition.** Track two accumulators, `ones` and `twos`, representing bits seen exactly
once or twice so far *modulo 3* — a bit set three times must cancel back to 0 in both. For
each number: `ones = (ones ^ n) & ~twos` (add `n` into `ones` unless it just became a
"twice" bit), then `twos = (twos ^ n) & ~ones` (symmetric update). After processing all
numbers, `ones` holds the answer. This works with JS's 32-bit bitwise ops even on negative
numbers because the state machine only ever tracks bit *parity mod 3*, not magnitude.

```javascript
function singleNumberII(nums) {
  let ones = 0;
  let twos = 0;
  for (const n of nums) {
    ones = (ones ^ n) & ~twos;
    twos = (twos ^ n) & ~ones;
  }
  return ones;
}
```

**Complexity.** Time O(n), Space O(1). (Alternative: count set bits at each of the 32
positions across all numbers, mod 3 each count, and reassemble — same complexity, more
intuitive but more code.)

---

### 7. Single Number III

**Problem.** Exactly two elements in `nums` appear once; every other element appears
exactly twice. Return the two singles (in any order).

**Intuition.** XOR-ing everything cancels the duplicated pairs and leaves `a ^ b` for the
two singles `a` and `b`. Since `a !== b`, `a ^ b` has at least one set bit; isolate the
lowest one with `diff = xorAll & (-xorAll)`. That bit differs between `a` and `b`, so it
partitions all numbers into two groups (bit set / bit clear) with `a` and `b` in different
groups and every duplicate pair in the same group. XOR-ing within each group isolates `a`
and `b` separately.

```javascript
function singleNumberIII(nums) {
  let xorAll = 0;
  for (const n of nums) xorAll ^= n;

  const diff = xorAll & (-xorAll); // lowest set bit; works via two's complement in JS

  let a = 0;
  let b = 0;
  for (const n of nums) {
    if (n & diff) a ^= n;
    else b ^= n;
  }
  return [a, b];
}
```

**Complexity.** Time O(n), Space O(1).

---

### 8. Sum of Two Integers

**Problem.** Given two integers `a` and `b`, return their sum without using the `+` or `-`
operators.

**Intuition.** `a ^ b` gives the sum ignoring carries, and `(a & b) << 1` gives the carries
that need to be added back in. Repeat — feeding the carry back in as `b` — until there's no
carry left. This terminates in JS because `&`, `^`, and `<<` operate on 32-bit signed
integers, so the carry eventually shifts out of range and becomes 0, exactly mirroring
fixed-width integer addition in a language like C.

```javascript
function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a = a ^ b;
    b = carry;
  }
  return a;
}
```

**Complexity.** Time O(1) (at most 32 iterations), Space O(1).

---

### 9. Bitwise AND of Numbers Range

**Problem.** Given two integers `m` and `n` with `m <= n`, return the bitwise AND of all
numbers in the range `[m, n]` inclusive.

**Intuition.** As numbers increase from `m` to `n`, any bit position that ever flips gets
ANDed to 0 somewhere in the range. So the answer is just the common binary prefix shared by
`m` and `n` — shift both right in lockstep until they're equal, then shift that common
prefix back to its original position.

```javascript
function rangeBitwiseAnd(m, n) {
  let shift = 0;
  while (m < n) {
    m >>= 1;
    n >>= 1;
    shift++;
  }
  return m << shift;
}
```

**Complexity.** Time O(log n) (at most 32 shifts), Space O(1).

---

### 10. Missing Number

**Problem.** Given an array `nums` containing `n` distinct numbers taken from `[0, n]`,
return the one number missing from the range.

**Intuition.** XOR every index `0..n-1` and every value in `nums` together with `n` itself.
Every value that's actually present cancels with its matching index, leaving only the
missing number. (Equivalently: `sum(0..n) - sum(nums)`, but XOR sidesteps overflow.)

```javascript
function missingNumber(nums) {
  let result = nums.length; // account for index n, which has no array slot
  for (let i = 0; i < nums.length; i++) {
    result ^= i ^ nums[i];
  }
  return result;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 11. Divide Two Integers

**Problem.** Given two integers `dividend` and `divisor`, divide without using
multiplication, division, or the mod operator. Truncate toward zero. Assume a 32-bit
signed integer range and return `INT_MAX` (2147483647) on overflow.

**Intuition.** Repeatedly find the largest `divisor * 2^k` that still fits into what's left
of the dividend, subtract it, and add `2^k` to the result — this is long division in
binary. Doubling would normally use `<<`, but `dividend` can be as extreme as `-2^31`, whose
absolute value (`2^31`) is already outside the signed 32-bit range that `<<` operates on in
JS — shifting it would silently wrap to a negative number. So doubling is done with plain
addition (`temp + temp`) instead of a bitwise shift, keeping the values as ordinary JS
numbers until the very end.

```javascript
function divide(dividend, divisor) {
  const INT_MAX = 2 ** 31 - 1;
  const INT_MIN = -(2 ** 31);
  if (dividend === INT_MIN && divisor === -1) return INT_MAX; // classic overflow case

  const negative = (dividend < 0) !== (divisor < 0);
  let a = Math.abs(dividend);
  let b = Math.abs(divisor);
  let result = 0;

  while (a >= b) {
    let temp = b;
    let multiple = 1;
    // double via addition, not << , since `a` can exceed the 32-bit signed range
    while (a >= temp + temp) {
      temp += temp;
      multiple += multiple;
    }
    a -= temp;
    result += multiple;
  }

  return negative ? -result : result;
}
```

**Complexity.** Time O(log²n) (outer loop runs O(log n) times, each doubling inner loop is
also O(log n)), Space O(1).

---

### 12. Subsets via Bitmask

**Problem.** Given an array `nums` of unique integers, return all possible subsets (the
power set).

**Intuition.** Every subset corresponds to a unique integer mask in `[0, 2^n - 1]`, where
bit `i` set means "include `nums[i]`". Enumerating all masks and reading off their set bits
enumerates every subset without recursion.

```javascript
function subsets(nums) {
  const n = nums.length;
  const result = [];

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(nums[i]);
    }
    result.push(subset);
  }
  return result;
}
```

**Complexity.** Time O(n · 2ⁿ), Space O(n · 2ⁿ) for the output.

---

### 13. Total Hamming Distance

**Problem.** The Hamming distance between two integers is the number of differing bit
positions. Given an array `nums`, return the sum of Hamming distances between all pairs.

**Intuition.** Computing pairwise distances directly is O(n²). Instead, handle each of the
32 bit positions independently: if `c` numbers have a `1` at that position (and `n - c`
have a `0`), that position contributes `c * (n - c)` to the total (every 1-vs-0 pair
differs there). Summing this over all 32 positions gives the answer in one linear pass per
bit.

```javascript
function totalHammingDistance(nums) {
  const n = nums.length;
  let total = 0;

  for (let bit = 0; bit < 32; bit++) {
    let ones = 0;
    for (const num of nums) {
      if ((num >> bit) & 1) ones++;
    }
    total += ones * (n - ones);
  }
  return total;
}
```

**Complexity.** Time O(32n) = O(n), Space O(1).

---

## Hard

### 14. Maximum XOR of Two Numbers in an Array

**Problem.** Given an array `nums`, find the maximum value of `nums[i] ^ nums[j]` over all
pairs.

**Intuition.** Build the answer bit by bit from the most significant bit down. At each
step, assume the answer so far (`max`) can gain this bit (`candidate = max | (1 << i)`),
and check if any two numbers' prefixes (masked to the bits considered so far) actually XOR
to that candidate — using a hash set of prefixes makes each check O(number of elements).
If no pair achieves it, this bit can't be set and we keep `max` as is. Bit index starts at
30 rather than 31 since inputs are non-negative 32-bit values (top usable bit is bit 30).

```javascript
function findMaximumXOR(nums) {
  let max = 0;
  let mask = 0;

  for (let i = 30; i >= 0; i--) {
    mask |= (1 << i);
    const prefixes = new Set();
    for (const n of nums) prefixes.add(n & mask);

    const candidate = max | (1 << i);
    for (const p of prefixes) {
      if (prefixes.has(candidate ^ p)) {
        max = candidate;
        break;
      }
    }
  }
  return max;
}
```

**Complexity.** Time O(32n) = O(n), Space O(n) for the prefix set. (A bit-trie achieves the
same complexity with a different constant factor and generalizes better to per-query
lookups — see problem 20a.)

---

### 15. Gray Code

**Problem.** An n-bit Gray code sequence is a permutation of `0` to `2^n - 1` where
consecutive values (including the wrap-around from last to first) differ in exactly one
bit. Return any valid such sequence.

**Intuition.** The formula `g(i) = i ^ (i >> 1)` directly produces the standard reflected
binary Gray code. Why it works: converting a binary number to Gray code cancels adjacent
bit pairs — shifting right by one and XOR-ing means each output bit is the XOR of two
adjacent input bits, which guarantees that incrementing `i` by 1 (flipping a suffix of
bits via carry) changes only a single bit in `g(i)`.

```javascript
function grayCode(n) {
  const result = [];
  for (let i = 0; i < (1 << n); i++) {
    result.push(i ^ (i >> 1));
  }
  return result;
}
```

**Complexity.** Time O(2ⁿ), Space O(2ⁿ) for the output.

---

## Very Hard

### 16. Minimum XOR Sum of Two Arrays

**Problem.** Given two integer arrays `nums1` and `nums2` of the same length `n`, find a
permutation of `nums2` that minimizes `sum(nums1[i] ^ nums2[i])` for all `i`, and return
that minimum sum.

**Intuition.** This is an assignment problem: pair each index of `nums1` with a distinct
index of `nums2`. Use bitmask DP where `mask` represents which elements of `nums2` have
already been used. `dp[mask]` = minimum cost pairing the first `popcount(mask)` elements of
`nums1` with the elements of `nums2` indicated by `mask`. Transition: from `dp[mask]`, try
assigning `nums1[popcount(mask)]` to any unused index `j`, moving to `dp[mask | (1 << j)]`.

```javascript
function popcount(x) {
  let c = 0;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
}

function minimumXORSum(nums1, nums2) {
  const n = nums1.length;
  const size = 1 << n;
  const dp = new Array(size).fill(Infinity);
  dp[0] = 0;

  for (let mask = 0; mask < size; mask++) {
    if (dp[mask] === Infinity) continue;
    const i = popcount(mask);
    if (i === n) continue;

    for (let j = 0; j < n; j++) {
      if (!(mask & (1 << j))) {
        const next = mask | (1 << j);
        const cost = dp[mask] + (nums1[i] ^ nums2[j]);
        if (cost < dp[next]) dp[next] = cost;
      }
    }
  }
  return dp[size - 1];
}
```

**Complexity.** Time O(n · 2ⁿ), Space O(2ⁿ).

---

### 17. Count of Subsets with XOR Sum Equal to K

**Problem.** Given an array of non-negative integers `arr` and an integer `K`, count the
number of subsets (the empty subset counts, with XOR sum 0) whose XOR of elements equals
`K`.

**Intuition.** Classic subset DP with XOR instead of sum: `dp[x]` = number of subsets
processed so far with XOR value `x`. Since XOR of non-negative numbers never exceeds the OR
of all of them, we only need an array sized to `maxXor = K | arr[0] | arr[1] | ...`. For
each new number, every existing subset can either skip it (XOR unchanged) or include it
(XOR flips via `x ^ num`) — computed against a snapshot of the previous `dp` so each element
is used at most once per subset.

```javascript
function subsetXorCount(arr, k) {
  let maxXor = k;
  for (const a of arr) maxXor |= a;

  let dp = new Array(maxXor + 1).fill(0);
  dp[0] = 1; // empty subset has XOR 0

  for (const num of arr) {
    const next = dp.slice();
    for (let x = 0; x <= maxXor; x++) {
      if (dp[x]) next[x ^ num] += dp[x];
    }
    dp = next;
  }
  return dp[k] || 0;
}
```

**Complexity.** Time O(n · maxXor), Space O(maxXor).

---

### 18. UTF-8 Validation

**Problem.** Given an array of integers representing a byte stream (only the lowest 8 bits
of each integer matter), determine whether it forms a valid UTF-8 encoding. A valid
sequence's leading byte encodes how many continuation bytes follow via its high bits:
`0xxxxxxx` (1 byte total), `110xxxxx` (2 bytes), `1110xxxx` (3 bytes), `11110xxx` (4
bytes); every continuation byte must match `10xxxxxx`.

**Intuition.** Track how many continuation bytes are still expected. On a fresh byte,
inspect its high bits to determine the byte-count of this character (or fail if none of
the patterns match) and set `remaining` accordingly. On a continuation byte, verify the
`10` prefix and decrement `remaining`. Mask every byte with `& 0xFF` first since the input
integers may carry bits above position 7 that aren't part of the logical byte.

```javascript
function validUtf8(data) {
  let remaining = 0;

  for (const byteFull of data) {
    const b = byteFull & 0xFF;

    if (remaining === 0) {
      if ((b >> 7) === 0) remaining = 0;
      else if ((b >> 5) === 0b110) remaining = 1;
      else if ((b >> 4) === 0b1110) remaining = 2;
      else if ((b >> 3) === 0b11110) remaining = 3;
      else return false;
    } else {
      if ((b >> 6) !== 0b10) return false;
      remaining--;
    }
  }
  return remaining === 0;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 19. Integer Replacement

**Problem.** Given a positive integer `n`, in one step you may replace it with `n / 2` if
`n` is even, or `n + 1` / `n - 1` if `n` is odd. Return the minimum number of steps to
reach 1.

**Intuition.** When `n` is odd, its last two bits decide the greedy choice: if `n % 4 === 1`
(bit pattern `...01`, or the special case `n === 3`), subtract 1 — that clears more low
bits than adding would. Otherwise (`n % 4 === 3`, pattern `...11`, excluding `n === 3`), add
1 — the carry chain clears more bits than subtracting would (e.g. `...0111 + 1 = ...1000`).
`n & 3` (reading the low two bits) stays correct even when `n` grows past the 32-bit signed
boundary near `n = 2^31 - 1`, because bitwise AND only inspects the low bits of the two's
complement representation — the plain arithmetic (`+`, `-`, `/`) done elsewhere is what
actually needs values outside the 32-bit range to behave, and regular JS numbers handle
that fine up to `2^31`.

```javascript
function integerReplacement(n) {
  let steps = 0;
  while (n !== 1) {
    if ((n & 1) === 0) {
      n = n / 2;
    } else if (n === 3 || (n & 3) === 1) {
      n = n - 1;
    } else {
      n = n + 1;
    }
    steps++;
  }
  return steps;
}
```

**Complexity.** Time O(log n), Space O(1). (A DP/memoized recursion also works but is
unnecessary given the greedy bit-pattern rule above.)

---

## Very Very Hard

### 20. The Boss Fight

Three progressively brutal bit-manipulation problems that interviewers use to separate
"strong hire" from everyone else. Pick your poison.

#### 20a. Maximum XOR With an Element From Array

**Problem.** Given `nums` and a list of `queries`, where `queries[i] = [xi, mi]`, answer
each query with the maximum value of `xi ^ nums[j]` over all `nums[j] <= mi` — or `-1` if no
such element exists.

**Intuition.** Sort both `nums` and the queries by their limit `m`, then process queries in
increasing order of `m`, inserting every `nums[j] <= m` into a binary trie (over bit
prefixes, most significant bit first) before answering. To answer a query, walk the trie
from the most significant bit, greedily preferring the child representing the *opposite*
bit of `xi` at each level (maximizing XOR), falling back to the same-bit child when the
opposite doesn't exist. This greedy trie descent finds the true maximum in one pass instead
of checking every inserted number.

```javascript
class TrieNode {
  constructor() {
    this.children = [null, null];
  }
}

function maximizeXor(nums, queries) {
  nums.sort((a, b) => a - b);
  const order = queries.map((_, i) => i).sort((a, b) => queries[a][1] - queries[b][1]);

  const root = new TrieNode();
  const BITS = 29; // values fit under 2^30 per typical constraints (nums, x <= 1e9)

  function insert(num) {
    let node = root;
    for (let b = BITS; b >= 0; b--) {
      const bit = (num >> b) & 1;
      if (!node.children[bit]) node.children[bit] = new TrieNode();
      node = node.children[bit];
    }
  }

  function query(x) {
    let node = root;
    let res = 0;
    for (let b = BITS; b >= 0; b--) {
      const bit = (x >> b) & 1;
      const want = bit ^ 1;
      if (node.children[want]) {
        res |= (1 << b);
        node = node.children[want];
      } else {
        node = node.children[bit];
      }
    }
    return res;
  }

  const ans = new Array(queries.length).fill(-1);
  let i = 0;
  let inserted = false;
  for (const qi of order) {
    const [x, m] = queries[qi];
    while (i < nums.length && nums[i] <= m) {
      insert(nums[i]);
      i++;
      inserted = true;
    }
    ans[qi] = inserted ? query(x) : -1;
  }
  return ans;
}
```

**Complexity.** Time O((n + q) log maxVal) for sorting plus O(30) per insert/query, Space
O(n · 30) for the trie.

---

#### 20b. Shortest Path Visiting All Nodes

**Problem.** Given an undirected connected graph as an adjacency list `graph`, find the
length of the shortest path that visits every node at least once. You may start at any node
and revisit nodes/edges.

**Intuition.** Model the state as `(currentNode, visitedMask)` where `visitedMask` is a
bitmask of nodes seen so far. BFS over this state space guarantees the first time we reach
`visitedMask === (1 << n) - 1` (all bits set) is via a shortest path. Seed the BFS with all
`n` single-node starting states simultaneously (multi-source BFS) since the path can begin
anywhere.

```javascript
function shortestPathLength(graph) {
  const n = graph.length;
  if (n === 1) return 0;

  const full = (1 << n) - 1;
  const visited = Array.from({ length: n }, () => new Array(1 << n).fill(false));
  const queue = [];

  for (let i = 0; i < n; i++) {
    queue.push([i, 1 << i, 0]);
    visited[i][1 << i] = true;
  }

  let qi = 0;
  while (qi < queue.length) {
    const [node, mask, dist] = queue[qi++];
    if (mask === full) return dist;

    for (const next of graph[node]) {
      const nextMask = mask | (1 << next);
      if (!visited[next][nextMask]) {
        visited[next][nextMask] = true;
        queue.push([next, nextMask, dist + 1]);
      }
    }
  }
  return -1;
}
```

**Complexity.** Time O(n² · 2ⁿ) (each of n · 2ⁿ states explores up to n neighbors), Space
O(n · 2ⁿ).

---

#### 20c. N-Queens Solution Count via Bitmask

**Problem.** Given an integer `n`, return the number of distinct solutions to the n-queens
puzzle (place `n` queens on an `n x n` board so none attack each other).

**Intuition.** Place queens row by row, tracking three bitmasks over columns: `cols`
(occupied columns), `diag1` (occupied "/" diagonals), `diag2` (occupied "\" diagonals).
`full & ~(cols | diag1 | diag2)` gives all safe column positions for the current row as a
single bitmask in O(1). `bit & (-bit)` isolates the lowest available position to try next;
subtracting it removes that candidate. Shifting `diag1` left and `diag2` right (unsigned,
`>>>`, so no sign bit leaks in) as we descend rows re-aligns each diagonal mask with the
next row's columns.

```javascript
function totalNQueens(n) {
  let count = 0;
  const full = (1 << n) - 1;

  function solve(row, cols, diag1, diag2) {
    if (row === n) {
      count++;
      return;
    }
    let available = full & ~(cols | diag1 | diag2);
    while (available) {
      const bit = available & (-available); // lowest safe column
      available -= bit;
      solve(row + 1, cols | bit, (diag1 | bit) << 1, (diag2 | bit) >>> 1);
    }
  }

  solve(0, 0, 0, 0);
  return count;
}
```

**Complexity.** Time O(n!) worst case in theory, but the bitmask pruning makes it fast in
practice up to roughly `n = 15`; Space O(n) for the recursion stack.

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| XOR self-cancellation | 1, 7, 10, 15 |
| Bit counting (`n & (n-1)`, per-position tally) | 2, 3, 13, 16 |
| Bitmask subsets / enumeration | 12, 17 |
| Bitmask DP | 16, 17 |
| Bitmask state-space BFS | 20b |
| Greedy bit-by-bit construction (with hash set / trie) | 14, 20a |
| Shift-based arithmetic (add/divide without `+`/`/`) | 8, 11 |
| Prefix / common-bit trimming | 9 |
| Byte-pattern validation | 18 |
| Bitmask board-state pruning | 20c |
| 32-bit signed-vs-unsigned gotchas (`>>` vs `>>>`, overflow) | 2, 5, 11, 19, 20c |

**Recommended progression:** 1 → 2 → 3 → 4 → 5 → 10 → 9 → 12 → 6 → 7 → 13 → 8 → 11 → 15 →
14 → 16 → 17 → 19 → 18 → 20.
