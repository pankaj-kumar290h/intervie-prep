# Array Interview Questions — Easy → Very Very Hard

20 curated array problems with problem statements, intuition, JavaScript solutions, and
complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Two Sum](#1-two-sum)
2. [Best Time to Buy and Sell Stock](#2-best-time-to-buy-and-sell-stock)
3. [Move Zeroes](#3-move-zeroes)
4. [Contains Duplicate](#4-contains-duplicate)
5. [Plus One](#5-plus-one)

**Medium**
6. [Product of Array Except Self](#6-product-of-array-except-self)
7. [Maximum Subarray (Kadane)](#7-maximum-subarray-kadane)
8. [3Sum](#8-3sum)
9. [Container With Most Water](#9-container-with-most-water)
10. [Merge Intervals](#10-merge-intervals)
11. [Subarray Sum Equals K](#11-subarray-sum-equals-k)
12. [Rotate Array In-Place](#12-rotate-array-in-place)
13. [Next Permutation](#13-next-permutation)

**Hard**
14. [Trapping Rain Water](#14-trapping-rain-water)
15. [First Missing Positive](#15-first-missing-positive)
16. [Sliding Window Maximum](#16-sliding-window-maximum)
17. [Median of Two Sorted Arrays](#17-median-of-two-sorted-arrays)

**Very Hard**
18. [Maximum Sum of 3 Non-Overlapping Subarrays](#18-maximum-sum-of-3-non-overlapping-subarrays)
19. [Count of Range Sum](#19-count-of-range-sum)

**Very Very Hard**
20. [Maximum Sum Rectangle in a 2D Matrix / Max Subarray Sum With One Deletion + Range Modules](#20-the-boss-fight)

---

## Easy

### 1. Two Sum

**Problem.** Given an array `nums` and an integer `target`, return indices of the two
numbers that add up to `target`. Exactly one solution exists; you may not use the same
element twice.

**Intuition.** For each number `x`, we need `target - x` seen earlier. A hash map from
value → index lets us check that in O(1).

```javascript
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
```

**Complexity.** Time O(n), Space O(n).

---

### 2. Best Time to Buy and Sell Stock

**Problem.** `prices[i]` is the price on day `i`. Buy one day, sell a later day. Return
the max profit, or 0 if none is possible.

**Intuition.** Track the minimum price so far; at each day the best sale profit is
`price - minSoFar`.

```javascript
function maxProfit(prices) {
  let minPrice = Infinity;
  let best = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);
    best = Math.max(best, p - minPrice);
  }
  return best;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 3. Move Zeroes

**Problem.** Move all `0`s to the end of `nums` while keeping the relative order of the
non-zero elements. Do it in-place.

**Intuition.** Two pointers: `insertPos` marks where the next non-zero goes. Walk the
array, and whenever you see a non-zero, write it at `insertPos` and advance.

```javascript
function moveZeroes(nums) {
  let insertPos = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[insertPos], nums[i]] = [nums[i], nums[insertPos]];
      insertPos++;
    }
  }
  return nums;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 4. Contains Duplicate

**Problem.** Return `true` if any value appears at least twice in `nums`.

**Intuition.** A `Set` tracks what we've seen. If we re-encounter a value, it's a dup.

```javascript
function containsDuplicate(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}
```

**Complexity.** Time O(n), Space O(n). (Alternative: sort → O(n log n) time, O(1) extra.)

---

### 5. Plus One

**Problem.** `digits` represents a non-negative integer, most-significant digit first.
Increment it by one and return the resulting digit array.

**Intuition.** Add from the right, propagating carry. If every digit was 9, prepend a 1.

```javascript
function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  return [1, ...digits];
}
```

**Complexity.** Time O(n), Space O(1) (ignoring the possible new leading digit).

---

## Medium

### 6. Product of Array Except Self

**Problem.** Return `output` where `output[i]` is the product of all elements of `nums`
except `nums[i]`. No division. O(n) time.

**Intuition.** `output[i] = (product of everything left of i) * (product of everything
right of i)`. Compute prefix products in one pass, then multiply by suffix products in a
second pass using a running variable.

```javascript
function productExceptSelf(nums) {
  const n = nums.length;
  const output = new Array(n).fill(1);

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    output[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    output[i] *= suffix;
    suffix *= nums[i];
  }

  return output;
}
```

**Complexity.** Time O(n), Space O(1) extra (output array aside).

---

### 7. Maximum Subarray (Kadane)

**Problem.** Find the contiguous subarray with the largest sum and return that sum.

**Intuition.** At each index, the best subarray ending here is either just this element
or this element appended to the best subarray ending at the previous index.

```javascript
function maxSubArray(nums) {
  let curr = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    best = Math.max(best, curr);
  }
  return best;
}
```

**Complexity.** Time O(n), Space O(1). (Divide-and-conquer O(n log n) also exists and is
a common follow-up.)

---

### 8. 3Sum

**Problem.** Return all unique triplets `[a, b, c]` in `nums` with `a + b + c === 0`.

**Intuition.** Sort. Fix the first element `i`, then two-pointer scan the rest for a pair
summing to `-nums[i]`. Skip duplicates at every level.

```javascript
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    if (nums[i] > 0) break; // no way to reach 0 with sorted positives

    let lo = i + 1;
    let hi = nums.length - 1;
    while (lo < hi) {
      const sum = nums[i] + nums[lo] + nums[hi];
      if (sum === 0) {
        res.push([nums[i], nums[lo], nums[hi]]);
        while (lo < hi && nums[lo] === nums[lo + 1]) lo++;
        while (lo < hi && nums[hi] === nums[hi - 1]) hi--;
        lo++;
        hi--;
      } else if (sum < 0) {
        lo++;
      } else {
        hi--;
      }
    }
  }
  return res;
}
```

**Complexity.** Time O(n²), Space O(1) (or O(n) depending on sort implementation).

---

### 9. Container With Most Water

**Problem.** `height[i]` is the height of a vertical line at `x = i`. Pick two lines that
with the x-axis form a container holding the most water. Return that area.

**Intuition.** Start with the widest container (both ends). The area is limited by the
shorter line, so moving the taller line inward can only lose area — always move the
shorter pointer inward hoping for a taller line.

```javascript
function maxArea(height) {
  let lo = 0;
  let hi = height.length - 1;
  let best = 0;
  while (lo < hi) {
    const area = Math.min(height[lo], height[hi]) * (hi - lo);
    best = Math.max(best, area);
    if (height[lo] < height[hi]) lo++;
    else hi--;
  }
  return best;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 10. Merge Intervals

**Problem.** Given a list of intervals `[start, end]`, merge all overlapping intervals.

**Intuition.** Sort by start. Walk through; if the current interval starts before or when
the last merged interval ends, extend the last one, otherwise push a new one.

```javascript
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    const [start, end] = intervals[i];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      res.push([start, end]);
    }
  }
  return res;
}
```

**Complexity.** Time O(n log n), Space O(n) for output.

---

### 11. Subarray Sum Equals K

**Problem.** Count the number of contiguous subarrays whose sum equals `k`. Values may be
negative.

**Intuition.** If `prefix[j] - prefix[i] === k`, the subarray `(i, j]` sums to `k`. So for
each running prefix sum, count how many earlier prefixes equal `prefix - k`.

```javascript
function subarraySum(nums, k) {
  const counts = new Map([[0, 1]]);
  let prefix = 0;
  let total = 0;

  for (const n of nums) {
    prefix += n;
    total += counts.get(prefix - k) || 0;
    counts.set(prefix, (counts.get(prefix) || 0) + 1);
  }
  return total;
}
```

**Complexity.** Time O(n), Space O(n). (Sliding window does *not* work here because of
negatives — a classic trap.)

---

### 12. Rotate Array In-Place

**Problem.** Rotate `nums` to the right by `k` steps, in-place, O(1) extra space.

**Intuition.** Reverse the whole array, then reverse the first `k` and the remaining
`n - k`. The reversals cancel out the ordering within each block while swapping the blocks.

```javascript
function rotate(nums, k) {
  const n = nums.length;
  k %= n;

  const reverse = (i, j) => {
    while (i < j) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
      j--;
    }
  };

  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
  return nums;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 13. Next Permutation

**Problem.** Rearrange `nums` into the lexicographically next greater permutation. If it's
the largest permutation, wrap to the smallest (sorted ascending). In-place, O(1) space.

**Intuition.**
1. Scan from the right for the first index `i` with `nums[i] < nums[i + 1]` (the "pivot").
2. Scan from the right for the first value greater than `nums[i]`, swap them.
3. Reverse the suffix after `i` (it was descending, becomes the smallest arrangement).

```javascript
function nextPermutation(nums) {
  const n = nums.length;
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;

  if (i >= 0) {
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  // reverse suffix
  let lo = i + 1;
  let hi = n - 1;
  while (lo < hi) {
    [nums[lo], nums[hi]] = [nums[hi], nums[lo]];
    lo++;
    hi--;
  }
  return nums;
}
```

**Complexity.** Time O(n), Space O(1).

---

## Hard

### 14. Trapping Rain Water

**Problem.** Given `height[]`, compute how much water is trapped after raining.

**Intuition.** Water above bar `i` is `min(maxLeft, maxRight) - height[i]`. Use two
pointers: whichever side has the smaller running max is the bottleneck, so that side's
trapped water is fully determined — process it and move inward.

```javascript
function trap(height) {
  let lo = 0;
  let hi = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (lo < hi) {
    if (height[lo] < height[hi]) {
      leftMax = Math.max(leftMax, height[lo]);
      water += leftMax - height[lo];
      lo++;
    } else {
      rightMax = Math.max(rightMax, height[hi]);
      water += rightMax - height[hi];
      hi--;
    }
  }
  return water;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 15. First Missing Positive

**Problem.** Given an unsorted array, find the smallest missing positive integer in O(n)
time and O(1) extra space.

**Intuition.** The answer is in `[1, n + 1]`. Use the array itself as a hash table: place
value `v` at index `v - 1` via cyclic swaps. Then the first index `i` where
`nums[i] !== i + 1` gives answer `i + 1`.

```javascript
function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (
      nums[i] > 0 &&
      nums[i] <= n &&
      nums[nums[i] - 1] !== nums[i]
    ) {
      const target = nums[i] - 1;
      [nums[i], nums[target]] = [nums[target], nums[i]];
    }
  }

  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }
  return n + 1;
}
```

**Complexity.** Time O(n) amortized (each value swapped home at most once), Space O(1).

---

### 16. Sliding Window Maximum

**Problem.** Given `nums` and window size `k`, return an array of the maximum of each
contiguous window of size `k`.

**Intuition.** Maintain a deque of indices whose values are in decreasing order. The front
is always the current window's max. Pop from the back any index with a value ≤ the
incoming one; pop from the front any index that slid out of the window.

```javascript
function maxSlidingWindow(nums, k) {
  const res = [];
  const deque = []; // stores indices, values decreasing

  for (let i = 0; i < nums.length; i++) {
    if (deque.length && deque[0] <= i - k) deque.shift();

    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);

    if (i >= k - 1) res.push(nums[deque[0]]);
  }
  return res;
}
```

**Complexity.** Time O(n) (each index pushed/popped once), Space O(k).

---

### 17. Median of Two Sorted Arrays

**Problem.** Given two sorted arrays of sizes `m` and `n`, return the median of the
combined set in O(log(m + n)) time.

**Intuition.** Binary search a partition of the smaller array. Choose `i` elements from
`A` and `j = half - i` from `B` so that everything on the left ≤ everything on the right:
`A[i-1] <= B[j]` and `B[j-1] <= A[i]`. Adjust `i` via binary search until that holds.

```javascript
function findMedianSortedArrays(A, B) {
  if (A.length > B.length) return findMedianSortedArrays(B, A);

  const m = A.length;
  const n = B.length;
  const half = (m + n + 1) >> 1;

  let lo = 0;
  let hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1;
    const j = half - i;

    const aLeft = i > 0 ? A[i - 1] : -Infinity;
    const aRight = i < m ? A[i] : Infinity;
    const bLeft = j > 0 ? B[j - 1] : -Infinity;
    const bRight = j < n ? B[j] : Infinity;

    if (aLeft <= bRight && bLeft <= aRight) {
      const leftMax = Math.max(aLeft, bLeft);
      if ((m + n) % 2 === 1) return leftMax;
      const rightMin = Math.min(aRight, bRight);
      return (leftMax + rightMin) / 2;
    } else if (aLeft > bRight) {
      hi = i - 1;
    } else {
      lo = i + 1;
    }
  }
  throw new Error("inputs not sorted");
}
```

**Complexity.** Time O(log(min(m, n))), Space O(1).

---

## Very Hard

### 18. Maximum Sum of 3 Non-Overlapping Subarrays

**Problem.** Given `nums` and integer `k`, find three non-overlapping subarrays each of
length `k` with maximum total sum. Return the three starting indices (lexicographically
smallest on ties).

**Intuition.** Precompute the rolling window sum of every length-`k` window. Then:
- `left[i]` = index of the best window in `[0, i]`.
- `right[i]` = index of the best window in `[i, end]` (ties favor smaller index).
Iterate the middle window `m` from `k` to `n - 2k`; combine with `left[m - k]` and
`right[m + k]`, keeping the best total.

```javascript
function maxSumOfThreeSubarrays(nums, k) {
  const n = nums.length;
  const w = new Array(n - k + 1).fill(0);

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += nums[i];
    if (i >= k) sum -= nums[i - k];
    if (i >= k - 1) w[i - k + 1] = sum;
  }

  const left = new Array(w.length).fill(0);
  let bestL = 0;
  for (let i = 0; i < w.length; i++) {
    if (w[i] > w[bestL]) bestL = i;
    left[i] = bestL;
  }

  const right = new Array(w.length).fill(0);
  let bestR = w.length - 1;
  for (let i = w.length - 1; i >= 0; i--) {
    if (w[i] >= w[bestR]) bestR = i; // >= keeps smaller index on ties
    right[i] = bestR;
  }

  let ans = [-1, -1, -1];
  let bestTotal = -Infinity;
  for (let m = k; m <= n - 2 * k; m++) {
    const l = left[m - k];
    const r = right[m + k];
    const total = w[l] + w[m] + w[r];
    if (total > bestTotal) {
      bestTotal = total;
      ans = [l, m, r];
    }
  }
  return ans;
}
```

**Complexity.** Time O(n), Space O(n).

---

### 19. Count of Range Sum

**Problem.** Given `nums` and bounds `lower`, `upper`, count the number of range sums
`S(i, j) = nums[i] + ... + nums[j]` that lie in `[lower, upper]` inclusive.

**Intuition.** Let `P` be prefix sums (`P[0] = 0`). A range sum equals `P[j+1] - P[i]`, so
we need pairs `(i, k)` with `lower <= P[k] - P[i] <= upper`. Do a modified merge sort on
`P`: while merging two sorted halves, for each left-half prefix `P[i]` count right-half
prefixes `P[k]` inside `[P[i] + lower, P[i] + upper]` using two moving pointers.

```javascript
function countRangeSum(nums, lower, upper) {
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];

  function sortCount(lo, hi) {
    if (hi - lo <= 1) return 0;
    const mid = (lo + hi) >> 1;
    let count = sortCount(lo, mid) + sortCount(mid, hi);

    let j = mid;
    let k = mid;
    for (let i = lo; i < mid; i++) {
      while (j < hi && prefix[j] - prefix[i] < lower) j++;
      while (k < hi && prefix[k] - prefix[i] <= upper) k++;
      count += k - j;
    }

    // merge [lo, mid) and [mid, hi)
    const merged = [];
    let a = lo;
    let b = mid;
    while (a < mid && b < hi) {
      merged.push(prefix[a] <= prefix[b] ? prefix[a++] : prefix[b++]);
    }
    while (a < mid) merged.push(prefix[a++]);
    while (b < hi) merged.push(prefix[b++]);
    for (let i = 0; i < merged.length; i++) prefix[lo + i] = merged[i];

    return count;
  }

  return sortCount(0, n + 1);
}
```

**Complexity.** Time O(n log n), Space O(n). (A merge-sort / BIT-with-coordinate-
compression solution is the expected answer; brute force is O(n²).)

---

## Very Very Hard

### 20. The Boss Fight

Three progressively brutal array problems that interviewers use to separate "strong hire"
from everyone else. Pick your poison.

#### 20a. Maximum Sum Rectangle in a 2D Matrix

**Problem.** Given an `R x C` integer matrix (values may be negative), find the submatrix
with the maximum sum. Return that sum.

**Intuition.** Fix a pair of rows `(top, bottom)`. Collapse every column between them into
a single value (the column's partial sum), giving a 1D array. Run Kadane on it — that's
the best rectangle bounded by those two rows. Try all `O(R²)` row pairs.

```javascript
function maxSumRectangle(matrix) {
  const R = matrix.length;
  const C = matrix[0].length;
  let best = -Infinity;

  for (let top = 0; top < R; top++) {
    const colSums = new Array(C).fill(0);
    for (let bottom = top; bottom < R; bottom++) {
      for (let c = 0; c < C; c++) colSums[c] += matrix[bottom][c];

      // Kadane over colSums
      let curr = colSums[0];
      let localBest = colSums[0];
      for (let c = 1; c < C; c++) {
        curr = Math.max(colSums[c], curr + colSums[c]);
        localBest = Math.max(localBest, curr);
      }
      best = Math.max(best, localBest);
    }
  }
  return best;
}
```

**Complexity.** Time O(R² · C), Space O(C). Choosing the smaller dimension for the outer
loop makes it O(min² · max).

---

#### 20b. Maximum Subarray Sum With One Deletion

**Problem.** Find the maximum sum of a non-empty contiguous subarray of `arr`, where you
may delete at most one element from it. The subarray after deletion must be non-empty.

**Intuition.** Two DP states at each index `i`:
- `noDel[i]`: best subarray ending at `i` with no deletion → `max(arr[i], noDel[i-1] + arr[i])`.
- `oneDel[i]`: best subarray ending at `i` with exactly one deletion → either delete
  `arr[i]` (`noDel[i-1]`) or extend a previous one-deletion subarray (`oneDel[i-1] + arr[i]`).

```javascript
function maximumSum(arr) {
  let noDel = arr[0];
  let oneDel = 0;
  let best = arr[0];

  for (let i = 1; i < arr.length; i++) {
    oneDel = Math.max(noDel, oneDel + arr[i]);
    noDel = Math.max(arr[i], noDel + arr[i]);
    best = Math.max(best, noDel, oneDel);
  }
  return best;
}
```

**Complexity.** Time O(n), Space O(1).

---

#### 20c. Range Module (design an interval set)

**Problem.** Design a data structure that tracks disjoint half-open ranges `[left, right)`:
- `addRange(left, right)` — add the range, merging overlaps.
- `queryRange(left, right)` — return `true` iff every point in `[left, right)` is tracked.
- `removeRange(left, right)` — stop tracking every point in `[left, right)`.

**Intuition.** Keep a sorted list of non-overlapping intervals. For `addRange`, binary
search for the first interval that could touch `left` and the last that could touch
`right`, splice them all out, and insert the union. `removeRange` is similar but reinserts
the non-overlapping leftover fragments. `queryRange` binary searches for the interval that
would contain `left` and checks it covers `right`.

```javascript
class RangeModule {
  constructor() {
    this.intervals = []; // sorted, disjoint, [start, end)
  }

  // first index with intervals[idx][1] >= val
  _lowerBoundByEnd(val) {
    let lo = 0;
    let hi = this.intervals.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.intervals[mid][1] < val) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  addRange(left, right) {
    const res = [];
    let i = 0;
    const n = this.intervals.length;

    while (i < n && this.intervals[i][1] < left) res.push(this.intervals[i++]);

    while (i < n && this.intervals[i][0] <= right) {
      left = Math.min(left, this.intervals[i][0]);
      right = Math.max(right, this.intervals[i][1]);
      i++;
    }
    res.push([left, right]);

    while (i < n) res.push(this.intervals[i++]);
    this.intervals = res;
  }

  queryRange(left, right) {
    const idx = this._lowerBoundByEnd(left + 1);
    if (idx === this.intervals.length) return false;
    const [s, e] = this.intervals[idx];
    return s <= left && right <= e;
  }

  removeRange(left, right) {
    const res = [];
    for (const [s, e] of this.intervals) {
      if (e <= left || s >= right) {
        res.push([s, e]);
      } else {
        if (s < left) res.push([s, left]);
        if (e > right) res.push([right, e]);
      }
    }
    this.intervals = res;
  }
}
```

**Complexity.** `queryRange` O(log n); `addRange` / `removeRange` O(n) worst case with an
array (O(log n + k) amortized touching `k` intervals). A balanced BST / TreeMap gets all
three to O(log n).

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Hash map lookup | 1, 4, 11 |
| Two pointers | 3, 8, 9, 14 |
| Prefix / suffix products & sums | 6, 11, 18, 19 |
| Kadane / DP on subarrays | 7, 20a, 20b |
| In-place array-as-hashtable | 12, 13, 15 |
| Monotonic deque | 16 |
| Binary search on answer / partition | 17 |
| Divide & conquer + merge | 19 |
| Interval bookkeeping | 10, 20c |

**Recommended progression:** 1 → 2 → 3 → 4 → 5 → 7 → 6 → 9 → 8 → 10 → 12 → 11 → 13 →
14 → 16 → 15 → 17 → 18 → 19 → 20.
