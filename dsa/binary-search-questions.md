# Binary Search Interview Questions — Easy → Very Very Hard

20 curated binary search problems with problem statements, intuition, JavaScript solutions,
and complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Binary Search](#1-binary-search)
2. [Search Insert Position](#2-search-insert-position)
3. [First Bad Version](#3-first-bad-version)
4. [Sqrt(x)](#4-sqrtx)
5. [Find Smallest Letter Greater Than Target](#5-find-smallest-letter-greater-than-target)

**Medium**
6. [Search in Rotated Sorted Array](#6-search-in-rotated-sorted-array)
7. [Search in Rotated Sorted Array II](#7-search-in-rotated-sorted-array-ii)
8. [Find Minimum in Rotated Sorted Array](#8-find-minimum-in-rotated-sorted-array)
9. [Find Peak Element](#9-find-peak-element)
10. [Search a 2D Matrix](#10-search-a-2d-matrix)
11. [Search a 2D Matrix II](#11-search-a-2d-matrix-ii)
12. [Find First and Last Position of Element in Sorted Array](#12-find-first-and-last-position-of-element-in-sorted-array)
13. [Koko Eating Bananas](#13-koko-eating-bananas)

**Hard**
14. [Capacity To Ship Packages Within D Days](#14-capacity-to-ship-packages-within-d-days)
15. [Split Array Largest Sum](#15-split-array-largest-sum)
16. [Kth Smallest Element in a Sorted Matrix](#16-kth-smallest-element-in-a-sorted-matrix)
17. [Find K Closest Elements](#17-find-k-closest-elements)

**Very Hard**
18. [Magnetic Force Between Two Balls](#18-magnetic-force-between-two-balls)
19. [Russian Doll Envelopes](#19-russian-doll-envelopes)

**Very Very Hard**
20. [Infinite Array Search / Book Allocation / Median of a Row-wise Sorted Matrix](#20-the-boss-fight)

---

## Easy

### 1. Binary Search

**Problem.** Given a sorted array `nums` of distinct integers and a `target`, return its
index, or `-1` if it isn't present.

**Intuition.** `lo` and `hi` bound the range that could still contain `target` — both
inclusive. At each step, compare the middle element to `target` and discard the half of
the search space that can't hold it. The invariant: if `target` exists, it's always within
`[lo, hi]`.

```javascript
function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1; // inclusive
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

**Complexity.** Time O(log n), Space O(1).

---

### 2. Search Insert Position

**Problem.** Given a sorted array of distinct integers and a `target`, return the index if
found. If not, return the index where it would be inserted to keep the array sorted.

**Intuition.** This is the "first index where `nums[i] >= target`" lower-bound search.
`lo` converges to that index; `hi` starts one past the last valid index (exclusive upper
bound). The loop invariant: everything left of `lo` is `< target`, everything from `hi`
onward is `>= target`.

```javascript
function searchInsert(nums, target) {
  let lo = 0;
  let hi = nums.length; // exclusive
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```

**Complexity.** Time O(log n), Space O(1).

---

### 3. First Bad Version

**Problem.** Versions `1..n` are checked in order; once a version is bad, every version
after it is also bad. Given an API `isBadVersion(v)`, find the first bad version while
calling the API as few times as possible.

**Intuition.** The search space is the version numbers `[1, n]`, and we're looking for the
first index where the predicate `isBadVersion` flips from `false` to `true` — a classic
lower-bound search on a monotonic boolean function, not on array values.

```javascript
function solution(isBadVersion) {
  return function firstBadVersion(n) {
    let lo = 1;
    let hi = n; // inclusive
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (isBadVersion(mid)) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  };
}
```

**Complexity.** Time O(log n) API calls, Space O(1).

---

### 4. Sqrt(x)

**Problem.** Given a non-negative integer `x`, return `floor(sqrt(x))` without using
built-in power/sqrt functions.

**Intuition.** Search the space of candidate integers `[0, x]` for the largest `mid` with
`mid * mid <= x` — that's the answer. `lo`/`hi` are both inclusive bounds on the answer
itself ("search on the answer"), not on array indices.

```javascript
function mySqrt(x) {
  if (x < 2) return x;
  let lo = 1;
  let hi = x; // inclusive
  let ans = 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (mid * mid <= x) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
```

**Complexity.** Time O(log x), Space O(1).

---

### 5. Find Smallest Letter Greater Than Target

**Problem.** Given a sorted circular array of lowercase letters `letters` (may contain
duplicates) and a `target` character, return the smallest letter strictly greater than
`target`. Wrap around to `letters[0]` if `target` is >= the largest letter.

**Intuition.** Upper-bound search: find the first index where `letters[i] > target`. `lo`
converges to that index; if it overruns the array, wrap around with modulo — that's what
makes it circular.

```javascript
function nextGreatestLetter(letters, target) {
  let lo = 0;
  let hi = letters.length; // exclusive
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (letters[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return letters[lo % letters.length];
}
```

**Complexity.** Time O(log n), Space O(1).

---

## Medium

### 6. Search in Rotated Sorted Array

**Problem.** A sorted array of distinct integers was rotated at an unknown pivot. Given
`target`, return its index, or `-1` if absent, in O(log n).

**Intuition.** At every midpoint, at least one half (`[lo, mid]` or `[mid, hi]`) is
guaranteed to be normally sorted. Check which half is sorted, then check whether `target`
lies in that half's range — if so recurse there, otherwise recurse into the other half.

```javascript
function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1; // inclusive
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) {
      // left half [lo, mid] is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // right half [mid, hi] is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
```

**Complexity.** Time O(log n), Space O(1).

---

### 7. Search in Rotated Sorted Array II

**Problem.** Same as above, but duplicates are allowed. Return `true`/`false` for whether
`target` exists.

**Intuition.** Same "one half is sorted" idea, but duplicates can make `nums[lo] ===
nums[mid] === nums[hi]` true without telling us which side is actually sorted. In that
case, shrink both ends by one and keep looking — this degrades the worst case to O(n).

```javascript
function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1; // inclusive
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return true;

    if (nums[lo] === nums[mid] && nums[mid] === nums[hi]) {
      lo++;
      hi--;
    } else if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return false;
}
```

**Complexity.** Time O(n) worst case (all duplicates), O(log n) average, Space O(1).

---

### 8. Find Minimum in Rotated Sorted Array

**Problem.** A sorted array of distinct integers was rotated at an unknown pivot. Find the
minimum element in O(log n).

**Intuition.** Compare `nums[mid]` to `nums[hi]`. If `nums[mid] > nums[hi]`, the minimum
must be to the right of `mid` (the rotation point is in `(mid, hi]`). Otherwise the minimum
is at `mid` or to its left. `hi` stays inclusive throughout so `nums[mid]` is always a
valid candidate to keep.

```javascript
function findMin(nums) {
  let lo = 0;
  let hi = nums.length - 1; // inclusive
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}
```

**Complexity.** Time O(log n), Space O(1).

---

### 9. Find Peak Element

**Problem.** A peak is an element strictly greater than its neighbors (treat out-of-bounds
neighbors as `-Infinity`). Given `nums` where `nums[i] !== nums[i+1]`, return the index of
any peak in O(log n).

**Intuition.** If `nums[mid] < nums[mid + 1]`, the slope is rising, so a peak must exist
somewhere to the right (including possibly `mid + 1`); discard the left half. Otherwise a
peak exists at `mid` or to its left. `hi` is inclusive; the loop shrinks until `lo === hi`.

```javascript
function findPeakElement(nums) {
  let lo = 0;
  let hi = nums.length - 1; // inclusive
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```

**Complexity.** Time O(log n), Space O(1).

---

### 10. Search a 2D Matrix

**Problem.** Given an `m x n` matrix where each row is sorted and the first integer of each
row is greater than the last integer of the previous row, determine if `target` exists.

**Intuition.** The matrix is really a sorted 1D array of length `m * n` in disguise. Binary
search over the flattened index space `[0, m*n)` and convert each `mid` back to
`(row, col)` via division/modulo.

```javascript
function searchMatrix(matrix, target) {
  const m = matrix.length;
  const n = matrix[0].length;
  let lo = 0;
  let hi = m * n - 1; // inclusive
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const val = matrix[Math.floor(mid / n)][mid % n];
    if (val === target) return true;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
```

**Complexity.** Time O(log(m·n)), Space O(1).

---

### 11. Search a 2D Matrix II

**Problem.** Given an `m x n` matrix where each row is sorted left-to-right and each column
is sorted top-to-bottom (but rows are *not* globally ordered like problem 10), determine if
`target` exists.

**Intuition.** This isn't a pure binary search — rows aren't chained end-to-end — but it
belongs in this family since it's a coordinate elimination search. Start at the top-right
corner: if the current value is bigger than `target`, the whole column below it is even
bigger, so drop the column (move left); if smaller, the whole row to its left is even
smaller, so drop the row (move down). Each step eliminates one row or one column.

```javascript
function searchMatrix(matrix, target) {
  if (!matrix.length || !matrix[0].length) return false;
  let row = 0;
  let col = matrix[0].length - 1;
  while (row < matrix.length && col >= 0) {
    const val = matrix[row][col];
    if (val === target) return true;
    if (val > target) col--;
    else row++;
  }
  return false;
}
```

**Complexity.** Time O(m + n) (staircase walk). An alternative: run a per-row binary
search since each row is independently sorted — O(m log n), worse than O(m + n) when
`n >> 1` but sometimes preferred for simplicity. Space O(1).

---

### 12. Find First and Last Position of Element in Sorted Array

**Problem.** Given a sorted array with duplicates, return `[first, last]` indices of
`target`, or `[-1, -1]` if absent, in O(log n).

**Intuition.** Run two lower-bound searches: one for the first index where `nums[i] >=
target` (the start), and one for the first index where `nums[i] > target` minus one (the
end). Both are the same exclusive-`hi` binary search template with a different comparison.

```javascript
function searchRange(nums, target) {
  const lowerBound = (val) => {
    let lo = 0;
    let hi = nums.length; // exclusive
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  const start = lowerBound(target);
  if (start === nums.length || nums[start] !== target) return [-1, -1];
  const end = lowerBound(target + 1) - 1;
  return [start, end];
}
```

**Complexity.** Time O(log n), Space O(1).

---

### 13. Koko Eating Bananas

**Problem.** `piles[i]` bananas in pile `i`. Koko eats at a constant integer speed `k`
bananas/hour; per hour she eats from a single pile (finishing early wastes the rest of the
hour). Find the minimum `k` such that she finishes all piles within `h` hours.

**Intuition.** Binary search on the answer: the search space is candidate eating speeds
`[1, max(piles)]`, not array indices. For a given speed, the hours needed is monotonic
(higher speed → fewer or equal hours), so we can binary search for the smallest feasible
speed using a lower-bound search.

```javascript
function minEatingSpeed(piles, h) {
  const hoursNeeded = (speed) =>
    piles.reduce((acc, p) => acc + Math.ceil(p / speed), 0);

  let lo = 1;
  let hi = Math.max(...piles); // inclusive, eating fastest pile in one hour always works
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (hoursNeeded(mid) <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Complexity.** Time O(n log(max(piles))), Space O(1).

---

## Hard

### 14. Capacity To Ship Packages Within D Days

**Problem.** `weights[i]` is the weight of the `i`-th package; packages must ship in order.
Find the minimum ship capacity such that all packages ship within `days` days.

**Intuition.** Binary search on the answer: the search space is candidate capacities
`[max(weights), sum(weights)]`. A greedy check (load packages onto the current day until
the next one would overflow capacity, then start a new day) tells us the days needed for a
given capacity — monotonic in capacity, so lower-bound search applies.

```javascript
function shipWithinDays(weights, days) {
  const daysNeeded = (cap) => {
    let count = 1;
    let curr = 0;
    for (const w of weights) {
      if (curr + w > cap) {
        count++;
        curr = 0;
      }
      curr += w;
    }
    return count;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0); // inclusive
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (daysNeeded(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Complexity.** Time O(n log(sum(weights))), Space O(1).

---

### 15. Split Array Largest Sum

**Problem.** Split `nums` into `m` non-empty contiguous subarrays to minimize the largest
subarray sum. Return that minimized largest sum.

**Intuition.** Identical shape to problem 14 with a relabeled cost function: binary search
the answer over `[max(nums), sum(nums)]`. The feasibility check greedily counts how many
subarrays are needed if no subarray sum may exceed a candidate cap; more subarrays needed
means the cap is too small.

```javascript
function splitArray(nums, m) {
  const piecesNeeded = (cap) => {
    let pieces = 1;
    let curr = 0;
    for (const n of nums) {
      if (curr + n > cap) {
        pieces++;
        curr = 0;
      }
      curr += n;
    }
    return pieces;
  };

  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0); // inclusive
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (piecesNeeded(mid) <= m) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Complexity.** Time O(n log(sum(nums))), Space O(1).

---

### 16. Kth Smallest Element in a Sorted Matrix

**Problem.** Given an `n x n` matrix sorted ascending in each row and column, find the
`k`-th smallest element (1-indexed).

**Intuition.** Binary search on the *value range* `[matrix[0][0], matrix[n-1][n-1]]`, not
indices. For a candidate value `mid`, count how many matrix elements are `<= mid` using the
staircase walk from problem 11's idea (start bottom-left, O(n) per count). Find the
smallest value whose count is `>= k`.

```javascript
function kthSmallest(matrix, k) {
  const n = matrix.length;

  const countLessEqual = (x) => {
    let count = 0;
    let row = n - 1;
    let col = 0;
    while (row >= 0 && col < n) {
      if (matrix[row][col] <= x) {
        count += row + 1; // whole column above (and incl.) `row` qualifies
        col++;
      } else {
        row--;
      }
    }
    return count;
  };

  let lo = matrix[0][0];
  let hi = matrix[n - 1][n - 1]; // inclusive
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (countLessEqual(mid) < k) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```

**Complexity.** Time O(n log(max - min)), Space O(1).

---

### 17. Find K Closest Elements

**Problem.** Given a sorted array `arr`, an integer `k`, and a value `x`, return the `k`
closest elements to `x` (sorted ascending). Ties prefer the smaller element.

**Intuition.** Instead of searching for elements one at a time, binary search directly for
the *left edge* of the k-length answer window. The window is `[lo, lo + k)`; `hi` is the
largest valid starting index (`arr.length - k`), inclusive as a bound on `lo`'s final
value but used as an exclusive loop bound. At each `mid`, compare how close `x` is to the
element just outside the left edge (`arr[mid]`) vs. just outside the right edge
(`arr[mid + k]`) — whichever side is farther from `x` can be shrunk away.

```javascript
function findClosestElements(arr, k, x) {
  let lo = 0;
  let hi = arr.length - k; // exclusive upper bound on window start
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1;
    else hi = mid;
  }
  return arr.slice(lo, lo + k);
}
```

**Complexity.** Time O(log(n - k) + k), Space O(k) for the output.

---

## Very Hard

### 18. Magnetic Force Between Two Balls

**Problem.** `position[i]` are basket positions. Place `m` balls into distinct baskets to
maximize the minimum distance between any two balls. Return that maximum minimum distance.

**Intuition.** Binary search on the answer: candidate minimum distances range over `[1,
max(position) - min(position)]`. Sort positions first. For a candidate distance `d`,
greedily place balls left to right, only placing one when it's at least `d` away from the
last placed ball — count how many balls fit. More distance ⇒ fewer balls fit (monotonic),
so binary search for the *largest* feasible `d`, which needs an upper-bound-style search
(hence `mid` rounds up to avoid infinite loops when `lo` should move).

```javascript
function maxDistance(position, m) {
  position.sort((a, b) => a - b);

  const ballsThatFit = (d) => {
    let count = 1;
    let last = position[0];
    for (let i = 1; i < position.length; i++) {
      if (position[i] - last >= d) {
        count++;
        last = position[i];
      }
    }
    return count;
  };

  let lo = 1;
  let hi = position[position.length - 1] - position[0]; // inclusive
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2); // round up: we're searching for the max feasible value
    if (ballsThatFit(mid) >= m) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
```

**Complexity.** Time O(n log n) for the sort + O(n log(range)) for the search, Space O(1)
extra.

---

### 19. Russian Doll Envelopes

**Problem.** `envelopes[i] = [w, h]`. Envelope `A` fits inside `B` if `A.w < B.w` and
`A.h < B.h`. Find the maximum number of envelopes that can be nested (a chain), in O(n log
n).

**Intuition.** Sort by width ascending; for equal widths sort by height *descending* (so
two envelopes of the same width can never both be picked into a strictly-increasing height
chain). The problem now reduces to Longest Increasing Subsequence on the heights.
Patience-sorting LIS keeps a `tails` array where `tails[i]` is the smallest tail height of
any increasing subsequence of length `i + 1`; binary search (lower bound) for where each
new height belongs — this is the `search a strictly-sorted array` template applied inside
an O(n log n) LIS.

```javascript
function maxEnvelopes(envelopes) {
  envelopes.sort((a, b) => (a[0] === b[0] ? b[1] - a[1] : a[0] - b[0]));

  const tails = [];
  for (const [, h] of envelopes) {
    let lo = 0;
    let hi = tails.length; // exclusive
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < h) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(h);
    else tails[lo] = h;
  }
  return tails.length;
}
```

**Complexity.** Time O(n log n) (sort + LIS), Space O(n).

---

## Very Very Hard

### 20. The Boss Fight

Three binary-search variants that push past the standard patterns — unbounded input,
"minimize the maximum" on a different domain, and 2D counting.

#### 20a. Search in an Infinite (unbounded-size) Sorted Array

**Problem.** You're given a sorted array through an interface `reader.get(i)` that returns
`Infinity` for any out-of-bounds index, but you don't know its length. Find the index of
`target`, or `-1` if absent.

**Intuition.** First find *any* valid upper bound by doubling (`hi = 1, 2, 4, 8, ...`)
until `reader.get(hi) >= target` — this is exponential/galloping search and takes O(log
idx) steps where `idx` is the answer's true index. Then run ordinary inclusive-bound binary
search within `[lo, hi]`.

```javascript
function search(reader, target) {
  let lo = 0;
  let hi = 1;
  while (reader.get(hi) < target) {
    lo = hi;
    hi *= 2;
  }

  while (lo <= hi) { // inclusive
    const mid = lo + Math.floor((hi - lo) / 2);
    const val = reader.get(mid);
    if (val === target) return mid;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

**Complexity.** Time O(log idx) where `idx` is the target's index (or array length),
Space O(1).

---

#### 20b. Allocate Minimum Number of Pages (Book Allocation Problem)

**Problem.** `pages[i]` is the page count of book `i`. Allocate all books, in order, to
`students` students (each gets a contiguous non-empty block of books, and every book must
be assigned) to minimize the maximum total pages assigned to any one student. Return that
minimized maximum, or `-1` if allocation is impossible (`students > pages.length`).

**Intuition.** Same "search on the answer" shape as problems 14/15: the domain is candidate
page-sum caps in `[max(pages), sum(pages)]`. A feasibility helper greedily packs books onto
the current student until adding the next would exceed the cap, then starts a new student —
if the students needed exceeds the given count, the cap is too small. Binary search finds
the smallest feasible cap.

```javascript
function allocateBooks(pages, students) {
  if (students > pages.length) return -1;

  const studentsNeeded = (cap) => {
    let count = 1;
    let curr = 0;
    for (const p of pages) {
      if (curr + p > cap) {
        count++;
        curr = 0;
      }
      curr += p;
    }
    return count;
  };

  let lo = Math.max(...pages);
  let hi = pages.reduce((a, b) => a + b, 0); // inclusive
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (studentsNeeded(mid) <= students) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Complexity.** Time O(n log(sum(pages))), Space O(1).

---

#### 20c. Median of a Row-wise Sorted Matrix

**Problem.** Given an `R x C` matrix where each row is individually sorted ascending (rows
are not related to each other) and `R * C` is odd, find the median of all `R * C` elements
without flattening and sorting the whole matrix.

**Intuition.** Binary search on the *value range* `[min of first column, max of last
column]`. For a candidate value `mid`, count how many elements across the whole matrix are
`<= mid` by running a per-row upper-bound binary search and summing the counts — O(R log
C) per check. The median is the smallest value whose count reaches the middle rank
`floor(R*C / 2) + 1`.

```javascript
function findMedian(matrix) {
  const R = matrix.length;
  const C = matrix[0].length;

  let lo = Infinity;
  let hi = -Infinity;
  for (const row of matrix) {
    lo = Math.min(lo, row[0]);
    hi = Math.max(hi, row[C - 1]);
  }

  const desiredRank = Math.floor((R * C) / 2) + 1; // 1-indexed middle rank (R*C is odd)

  const countLessEqual = (x) => {
    let count = 0;
    for (const row of matrix) {
      let l = 0;
      let h = C; // exclusive
      while (l < h) {
        const m = (l + h) >> 1;
        if (row[m] <= x) l = m + 1;
        else h = m;
      }
      count += l;
    }
    return count;
  };

  while (lo < hi) { // inclusive value range
    const mid = lo + Math.floor((hi - lo) / 2);
    if (countLessEqual(mid) < desiredRank) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```

**Complexity.** Time O(R log C · log(max - min)), Space O(1).

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Classic index search (inclusive/exclusive bounds) | 1, 2, 5, 10, 12 |
| Boolean-predicate lower bound (design-style) | 3 |
| Search on the answer (numeric domain, not indices) | 4, 13, 14, 15, 18, 20b |
| Rotated array search | 6, 7, 8 |
| Slope / peak search | 9 |
| Binary search on a matrix (staircase / value-range counting) | 11, 16, 20c |
| Window-boundary search | 17 |
| Binary search inside LIS (patience sorting) | 19 |
| Unbounded / galloping search | 20a |

**Recommended progression:** 1 → 2 → 5 → 12 → 3 → 4 → 10 → 8 → 9 → 6 → 7 → 11 → 13 →
14 → 15 → 16 → 17 → 18 → 19 → 20.
