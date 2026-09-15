# Heap & Priority Queue Interview Questions — Easy → Very Very Hard

20 curated heap and priority-queue problems with problem statements, intuition,
JavaScript solutions, and complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Kth Largest Element in a Stream](#1-kth-largest-element-in-a-stream)
2. [Last Stone Weight](#2-last-stone-weight)
3. [Relative Ranks](#3-relative-ranks)
4. [Kth Largest Element in an Array](#4-kth-largest-element-in-an-array)
5. [Sort Characters By Frequency](#5-sort-characters-by-frequency)

**Medium**
6. [Top K Frequent Elements](#6-top-k-frequent-elements)
7. [K Closest Points to Origin](#7-k-closest-points-to-origin)
8. [Task Scheduler](#8-task-scheduler)
9. [Reorganize String](#9-reorganize-string)
10. [Meeting Rooms II](#10-meeting-rooms-ii)
11. [Single-Threaded CPU](#11-single-threaded-cpu)
12. [Furthest Building You Can Reach](#12-furthest-building-you-can-reach)
13. [Find K Pairs with Smallest Sums](#13-find-k-pairs-with-smallest-sums)

**Hard**
14. [Merge k Sorted Lists](#14-merge-k-sorted-lists)
15. [Find Median from Data Stream](#15-find-median-from-data-stream)
16. [Smallest Range Covering Elements from K Lists](#16-smallest-range-covering-elements-from-k-lists)

**Very Hard**
17. [IPO (Maximize Capital)](#17-ipo-maximize-capital)
18. [Trapping Rain Water II](#18-trapping-rain-water-ii)
19. [Ugly Number II](#19-ugly-number-ii)

**Very Very Hard**
20. [Design Twitter / Sliding Window Median / Median Stream with Removal](#20-the-boss-fight)

---

## The Shared Heap Class

JavaScript has no built-in heap or priority queue, and every problem below needs one. To
avoid re-implementing sift-up/sift-down twenty times, we build **one generic comparator-based
heap** and reuse it everywhere. Passing `(a, b) => a - b` gives a min-heap; `(a, b) => b - a`
gives a max-heap; any custom comparator gives a heap ordered however a problem needs.

```javascript
class Heap {
  constructor(compare = (a, b) => a - b) {
    this.data = [];
    this.compare = compare;
  }

  size() {
    return this.data.length;
  }

  peek() {
    return this.data[0];
  }

  toArray() {
    return [...this.data]; // unordered snapshot, useful when order doesn't matter
  }

  push(val) {
    this.data.push(val);
    this._siftUp(this.data.length - 1);
  }

  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  _siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  _siftDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.compare(this.data[l], this.data[smallest]) < 0) smallest = l;
      if (r < n && this.compare(this.data[r], this.data[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

// MinHeap:  new Heap((a, b) => a - b)
// MaxHeap:  new Heap((a, b) => b - a)
// Custom:   new Heap((a, b) => a.priority - b.priority)  // etc.
```

Every solution below is built from `new Heap(comparator)` — no problem reimplements the
sift logic.

---

## Easy

### 1. Kth Largest Element in a Stream

**Problem.** Design a class `KthLargest(k, nums)` that maintains the `k`th largest element
of a growing stream. `add(val)` inserts `val` and returns the current `k`th largest.

**Intuition.** Keep a min-heap capped at size `k`. The smallest element in that heap is
always the `k`th largest overall — anything smaller than the heap's root can never make the
top `k`, so it's safe to evict the root whenever the heap grows past `k`.

```javascript
class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new Heap((a, b) => a - b); // min-heap, capped at size k
    for (const n of nums) this.add(n);
  }

  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop();
    return this.heap.peek();
  }
}
```

**Complexity.** Time O(log k) per `add`, Space O(k).

---

### 2. Last Stone Weight

**Problem.** You have stones with positive weights. Repeatedly smash the two heaviest
together: if equal, both vanish; otherwise the lighter is destroyed and the heavier becomes
`heavy - light`. Return the weight of the last stone left, or `0` if none remain.

**Intuition.** "Repeatedly take the two largest" is exactly what a max-heap is for. Pop
twice, push the difference back if non-zero, repeat until at most one stone remains.

```javascript
function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => b - a); // max-heap
  for (const s of stones) heap.push(s);

  while (heap.size() > 1) {
    const y = heap.pop();
    const x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.size() ? heap.pop() : 0;
}
```

**Complexity.** Time O(n log n), Space O(n).

---

### 3. Relative Ranks

**Problem.** Given distinct athlete scores, assign ranks. The top 3 get `"Gold Medal"`,
`"Silver Medal"`, `"Bronze Medal"`; the rest get their rank as a string (`"4"`, `"5"`, ...).

**Intuition.** Push every index onto a max-heap ordered by its score. Popping in order
hands out places 1, 2, 3, ... directly.

```javascript
function findRelativeRanks(score) {
  const n = score.length;
  const heap = new Heap((a, b) => score[b] - score[a]); // max-heap of indices, by score
  for (let i = 0; i < n; i++) heap.push(i);

  const medals = ["Gold Medal", "Silver Medal", "Bronze Medal"];
  const res = new Array(n);
  let rank = 1;
  while (heap.size()) {
    const idx = heap.pop();
    res[idx] = rank <= 3 ? medals[rank - 1] : String(rank);
    rank++;
  }
  return res;
}
```

**Complexity.** Time O(n log n), Space O(n). (Sorting index pairs works just as well — the
heap is mostly for practice threading a comparator through indices.)

---

### 4. Kth Largest Element in an Array

**Problem.** Given an unsorted array and an integer `k`, return the `k`th largest element
(the `k`th largest in sorted order, not the `k`th distinct value), one-shot (no stream).

**Intuition.** Same trick as problem 1 but as a single pass: maintain a min-heap of size
`k` over the whole array; its root ends up being the answer.

```javascript
function findKthLargest(nums, k) {
  const heap = new Heap((a, b) => a - b); // min-heap, capped at size k
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek();
}
```

**Complexity.** Time O(n log k), Space O(k). (Quickselect gives O(n) average time, O(1)
space, but mutates the array and has O(n²) worst case.)

---

### 5. Sort Characters By Frequency

**Problem.** Given a string `s`, sort its characters by decreasing frequency and return the
resulting string (ties can be in any order).

**Intuition.** Count frequencies with a map, then a max-heap keyed by frequency pops the
most frequent character first; repeat it `freq` times.

```javascript
function frequencySort(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);

  const heap = new Heap((a, b) => b[1] - a[1]); // max-heap of [char, freq] by freq
  for (const entry of counts) heap.push(entry);

  let res = "";
  while (heap.size()) {
    const [ch, freq] = heap.pop();
    res += ch.repeat(freq);
  }
  return res;
}
```

**Complexity.** Time O(n + u log u) where `u` is the number of distinct characters, Space
O(n). (Bucket sort by frequency gets this to O(n) since frequency is bounded by `n`.)

---

## Medium

### 6. Top K Frequent Elements

**Problem.** Given `nums` and `k`, return the `k` most frequent elements (any order).

**Intuition.** Count frequencies, then keep a min-heap of `[value, freq]` pairs capped at
size `k`, ordered by `freq`. Whatever survives at the end is the top `k`.

```javascript
function topKFrequent(nums, k) {
  const counts = new Map();
  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);

  const heap = new Heap((a, b) => a[1] - b[1]); // min-heap of [value, freq] by freq
  for (const entry of counts) {
    heap.push(entry);
    if (heap.size() > k) heap.pop();
  }

  const res = [];
  while (heap.size()) res.push(heap.pop()[0]);
  return res;
}
```

**Complexity.** Time O(n log k), Space O(n). (Bucket sort by frequency gets this to O(n).)

---

### 7. K Closest Points to Origin

**Problem.** Given `points` on the 2D plane, return the `k` points closest to the origin
(any order).

**Intuition.** Same "capped heap" pattern as problem 6, but a max-heap this time: keep the
`k` smallest-distance points seen so far by evicting the current farthest whenever the heap
overflows.

```javascript
function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(b) - dist(a)); // max-heap by distance, capped at k
  for (const p of points) {
    heap.push(p);
    if (heap.size() > k) heap.pop();
  }
  return heap.toArray();
}
```

**Complexity.** Time O(n log k), Space O(k). (Quickselect on distance gives O(n) average.)

---

### 8. Task Scheduler

**Problem.** Given `tasks` (letters) and a cooldown `n`, the CPU can run one task per
cycle but the same task type must wait `n` cycles before repeating; idle cycles are allowed.
Return the minimum number of cycles to finish all tasks.

**Intuition.** Greedily run whichever remaining task type has the highest count. Simulate
in rounds of length `n + 1`: pop up to `n + 1` tasks from a max-heap of counts, decrement
each, push back any still-remaining, and repeat. If the heap is still non-empty after a
round, that round necessarily cost the full `n + 1` cycles (including idles); if it emptied
early, only the tasks actually run counted.

```javascript
function leastInterval(tasks, n) {
  const counts = new Map();
  for (const t of tasks) counts.set(t, (counts.get(t) || 0) + 1);

  const heap = new Heap((a, b) => b - a); // max-heap of remaining counts
  for (const c of counts.values()) heap.push(c);

  let time = 0;
  while (heap.size()) {
    const batch = [];
    for (let i = 0; i <= n; i++) {
      if (heap.size()) batch.push(heap.pop());
    }
    for (const c of batch) {
      if (c - 1 > 0) heap.push(c - 1);
    }
    time += heap.size() ? n + 1 : batch.length;
  }
  return time;
}
```

**Complexity.** Time O(n_tasks · log 26) which is effectively O(n_tasks), Space O(26).

---

### 9. Reorganize String

**Problem.** Rearrange the characters of `s` so no two adjacent characters are the same.
Return any valid rearrangement, or `""` if impossible.

**Intuition.** Always place the currently most frequent character next (max-heap by
frequency), but hold the just-placed character out of the heap for one round so it can't be
placed immediately again — re-insert it after placing the next character. Impossible exactly
when one character's count exceeds `ceil(n / 2)`.

```javascript
function reorganizeString(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);

  const heap = new Heap((a, b) => b[1] - a[1]); // max-heap of [char, count] by count
  for (const entry of counts) heap.push(entry);

  if (heap.size() && heap.peek()[1] > Math.ceil(s.length / 2)) return "";

  const res = [];
  let prev = null; // [char, remainingCount] held back for one round
  while (heap.size()) {
    const curr = heap.pop();
    res.push(curr[0]);
    curr[1]--;
    if (prev && prev[1] > 0) heap.push(prev);
    prev = curr;
  }
  return res.join("");
}
```

**Complexity.** Time O(n log u) where `u` is the number of distinct characters, Space O(n).

---

### 10. Meeting Rooms II

**Problem.** Given meeting `intervals`, return the minimum number of rooms required so no
two overlapping meetings share a room.

**Intuition.** Sort by start time. Keep a min-heap of end times for rooms currently in use.
For each meeting, if the earliest-freeing room ends at or before this meeting's start, reuse
it (pop then push); otherwise open a new room (just push). The final heap size is the answer.

```javascript
function minMeetingRooms(intervals) {
  if (!intervals.length) return 0;
  intervals.sort((a, b) => a[0] - b[0]);

  const heap = new Heap((a, b) => a - b); // min-heap of room end times
  heap.push(intervals[0][1]);

  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    if (heap.peek() <= start) heap.pop();
    heap.push(end);
  }
  return heap.size();
}
```

**Complexity.** Time O(n log n), Space O(n).

---

### 11. Single-Threaded CPU

**Problem.** `tasks[i] = [enqueueTime, processingTime]`. A single-threaded CPU picks, among
available tasks, the one with the shortest processing time (ties broken by original index);
it never idles unnecessarily. Return the order (original indices) in which tasks finish.

**Intuition.** Sort tasks by enqueue time. Advance a clock; at each point push every task
that has become available into a min-heap keyed by `(processingTime, index)`. Run the heap's
root; if nothing is available yet, jump the clock forward to the next task's enqueue time.

```javascript
function getOrder(tasks) {
  const n = tasks.length;
  const indexed = tasks.map(([enqueue, processing], i) => [enqueue, processing, i]);
  indexed.sort((a, b) => a[0] - b[0]);

  const heap = new Heap((a, b) => a[1] - b[1] || a[2] - b[2]); // by processing time, then index
  const res = [];
  let time = 0;
  let i = 0;

  while (res.length < n) {
    while (i < n && indexed[i][0] <= time) {
      heap.push(indexed[i]);
      i++;
    }
    if (!heap.size()) {
      time = indexed[i][0]; // jump to the next task's arrival
      continue;
    }
    const [enqueue, processing, idx] = heap.pop();
    time += processing;
    res.push(idx);
  }
  return res;
}
```

**Complexity.** Time O(n log n), Space O(n).

---

### 12. Furthest Building You Can Reach

**Problem.** Moving between adjacent buildings of increasing height costs either a ladder
(any height difference) or `diff` bricks. Given `bricks`, `ladders`, and `heights`, return
the furthest building index reachable.

**Intuition.** Greedily use ladders on the largest climbs. Push every positive height
difference onto a min-heap capped at `ladders` entries. When the heap overflows, the
*smallest* climb currently assigned a ladder is the cheapest to convert to bricks — evict it
and pay bricks for it instead. Stop the moment bricks go negative.

```javascript
function furthestBuilding(heights, bricks, ladders) {
  const heap = new Heap((a, b) => a - b); // min-heap of climbs currently "on a ladder"

  for (let i = 0; i < heights.length - 1; i++) {
    const diff = heights[i + 1] - heights[i];
    if (diff <= 0) continue;

    heap.push(diff);
    if (heap.size() > ladders) {
      bricks -= heap.pop(); // evict smallest climb from ladders, pay bricks for it
    }
    if (bricks < 0) return i;
  }
  return heights.length - 1;
}
```

**Complexity.** Time O(n log ladders), Space O(ladders).

---

### 13. Find K Pairs with Smallest Sums

**Problem.** Given sorted arrays `nums1`, `nums2` and integer `k`, return the `k` pairs
`(nums1[i], nums2[j])` with the smallest sums.

**Intuition.** The smallest-sum pair is always `(nums1[0], nums2[0])`. Seed a min-heap with
`(nums1[i], nums2[0])` for the first `min(len(nums1), k)` values of `i`. Each time you pop a
pair `(i, j)`, the next candidate from that same `i` row is `(i, j + 1)` — push it. This
explores sums in non-decreasing order without ever generating all `m * n` pairs.

```javascript
function kSmallestPairs(nums1, nums2, k) {
  if (!nums1.length || !nums2.length || k <= 0) return [];

  const heap = new Heap((a, b) => a[0] - b[0]); // min-heap of [sum, i, j]
  for (let i = 0; i < Math.min(nums1.length, k); i++) {
    heap.push([nums1[i] + nums2[0], i, 0]);
  }

  const res = [];
  while (res.length < k && heap.size()) {
    const [sum, i, j] = heap.pop();
    res.push([nums1[i], nums2[j]]);
    if (j + 1 < nums2.length) {
      heap.push([nums1[i] + nums2[j + 1], i, j + 1]);
    }
  }
  return res;
}
```

**Complexity.** Time O(k log(min(k, m))), Space O(min(k, m)).

---

## Hard

### 14. Merge k Sorted Lists

**Problem.** Merge `k` sorted linked lists into one sorted linked list.

**Intuition.** This file is heap-focused, so we define a minimal local `ListNode`. Push the
head of every non-empty list into a min-heap keyed by node value. Repeatedly pop the
smallest node, append it to the output, and push its `next` (if any) — this is k-way merge
via a heap instead of a manual k-pointer scan.

```javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeKLists(lists) {
  const heap = new Heap((a, b) => a.val - b.val); // min-heap of list nodes, by value

  for (const node of lists) {
    if (node) heap.push(node);
  }

  const dummy = new ListNode(0);
  let tail = dummy;

  while (heap.size()) {
    const node = heap.pop();
    tail.next = node;
    tail = node;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}
```

**Complexity.** Time O(N log k) where `N` is the total number of nodes, Space O(k).

---

### 15. Find Median from Data Stream

**Problem.** Design a class supporting `addNum(num)` and `findMedian()` that returns the
median of all numbers added so far.

**Intuition.** Split the stream into two halves via two heaps: a max-heap `lo` holding the
smaller half, a min-heap `hi` holding the larger half, kept balanced so their sizes differ
by at most 1. The median is then either `lo`'s root (odd total) or the average of both roots
(even total) — O(1) to read.

```javascript
class MedianFinder {
  constructor() {
    this.lo = new Heap((a, b) => b - a); // max-heap, lower half
    this.hi = new Heap((a, b) => a - b); // min-heap, upper half
  }

  addNum(num) {
    if (!this.lo.size() || num <= this.lo.peek()) this.lo.push(num);
    else this.hi.push(num);

    // rebalance so sizes differ by at most 1, lo allowed to hold the extra element
    if (this.lo.size() > this.hi.size() + 1) this.hi.push(this.lo.pop());
    else if (this.hi.size() > this.lo.size()) this.lo.push(this.hi.pop());
  }

  findMedian() {
    if (this.lo.size() > this.hi.size()) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
  }
}
```

**Complexity.** Time O(log n) per `addNum`, O(1) per `findMedian`, Space O(n).

---

### 16. Smallest Range Covering Elements from K Lists

**Problem.** Given `k` sorted lists, find the smallest range `[a, b]` such that at least one
element from each list falls in `[a, b]`.

**Intuition.** Keep one pointer per list, all starting at index 0, tracked in a min-heap by
current value plus a running `currMax` of all pointers' values. The heap's min and
`currMax` always bound a valid range (one element from every list). Pop the min, try to
shrink it by advancing that list's pointer, and update the best range seen — stop once any
list is exhausted (can no longer cover all `k`).

```javascript
function smallestRange(nums) {
  const k = nums.length;
  const heap = new Heap((a, b) => a[0] - b[0]); // min-heap of [value, listIdx, elemIdx]
  let currMax = -Infinity;

  for (let i = 0; i < k; i++) {
    heap.push([nums[i][0], i, 0]);
    currMax = Math.max(currMax, nums[i][0]);
  }

  let best = [-Infinity, Infinity];
  while (heap.size() === k) {
    const [val, listIdx, elemIdx] = heap.pop();
    if (currMax - val < best[1] - best[0]) best = [val, currMax];

    if (elemIdx + 1 < nums[listIdx].length) {
      const nextVal = nums[listIdx][elemIdx + 1];
      currMax = Math.max(currMax, nextVal);
      heap.push([nextVal, listIdx, elemIdx + 1]);
    }
  }
  return best;
}
```

**Complexity.** Time O(N log k) where `N` is the total number of elements, Space O(k).

---

## Very Hard

### 17. IPO (Maximize Capital)

**Problem.** You start with capital `w` and can complete at most `k` projects. Project `i`
requires `capital[i]` to start and yields `profits[i]`. After finishing a project its profit
is added to your capital. Choose projects (each at most once) to maximize final capital.

**Intuition.** Sort projects by required capital. At each of the `k` rounds, push every
project now affordable (capital requirement ≤ current `w`) into a max-heap of profits, then
greedily take the single most profitable affordable project. The sorted-capital pointer only
moves forward, so no project is scanned twice.

```javascript
function findMaximizedCapital(k, w, profits, capital) {
  const n = profits.length;
  const projects = profits.map((p, i) => [capital[i], p]);
  projects.sort((a, b) => a[0] - b[0]);

  const maxHeap = new Heap((a, b) => b - a); // max-heap of affordable profits
  let i = 0;

  for (let round = 0; round < k; round++) {
    while (i < n && projects[i][0] <= w) {
      maxHeap.push(projects[i][1]);
      i++;
    }
    if (!maxHeap.size()) break; // nothing affordable, stuck
    w += maxHeap.pop();
  }
  return w;
}
```

**Complexity.** Time O(n log n), Space O(n).

---

### 18. Trapping Rain Water II

**Problem.** Given a 2D elevation map `heightMap`, compute the total volume of rain water
it can trap.

**Intuition.** Generalizes 1D trapping rain water: water level at any cell is bounded by the
lowest "wall" surrounding it on all paths to the outside. Start with every border cell in a
min-heap (the boundary of the container). Repeatedly pop the globally lowest boundary cell,
expand to its unvisited neighbors, trap `max(0, height - neighborHeight)` there, and push the
neighbor back with height `max(height, neighborHeight)` — the water level never drops as the
frontier moves inward, exactly like Dijkstra's frontier expansion.

```javascript
function trapRainWater(heightMap) {
  const rows = heightMap.length;
  const cols = heightMap[0].length;
  if (rows < 3 || cols < 3) return 0;

  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const heap = new Heap((a, b) => a[0] - b[0]); // min-heap of [height, row, col]

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        heap.push([heightMap[r][c], r, c]);
        visited[r][c] = true;
      }
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let water = 0;

  while (heap.size()) {
    const [height, r, c] = heap.pop();
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || visited[nr][nc]) continue;
      visited[nr][nc] = true;
      water += Math.max(0, height - heightMap[nr][nc]);
      heap.push([Math.max(height, heightMap[nr][nc]), nr, nc]);
    }
  }
  return water;
}
```

**Complexity.** Time O(R · C · log(R · C)), Space O(R · C).

---

### 19. Ugly Number II

**Problem.** An ugly number is a positive integer whose only prime factors are 2, 3, and 5.
Return the `n`th ugly number (1 is the 1st).

**Intuition.** Start a min-heap with `1`. Repeatedly pop the smallest ugly number found so
far and push its multiples by 2, 3, 5 (skipping duplicates with a `Set`) — this generates
ugly numbers in increasing order, so the `n`th pop is the answer.

```javascript
function nthUglyNumber(n) {
  const heap = new Heap((a, b) => a - b);
  const seen = new Set([1]);
  heap.push(1);

  let ugly = 1;
  const factors = [2, 3, 5];
  for (let i = 0; i < n; i++) {
    ugly = heap.pop();
    for (const f of factors) {
      const next = ugly * f;
      if (!seen.has(next)) {
        seen.add(next);
        heap.push(next);
      }
    }
  }
  return ugly;
}
```

**Complexity.** Time O(n log n), Space O(n). (A three-pointer DP — track the next multiple
of 2, 3, and 5 to append and take the min of the three each step — does this in O(n) time
and O(n) space with no heap at all; it's the expected optimal answer, but the heap version
generalizes better to an arbitrary set of prime factors.)

---

## Very Very Hard

### 20. The Boss Fight

Three heap-heavy design problems, each pushing the two-heap median pattern further.

#### 20a. Design Twitter

**Problem.** Design a simplified Twitter: `postTweet(userId, tweetId)`,
`getNewsFeed(userId)` (the 10 most recent tweet IDs, most recent first, from the user and
everyone they follow), `follow(followerId, followeeId)`, `unfollow(followerId, followeeId)`.

**Intuition.** Give every user a chronological list of `[time, tweetId]`. `getNewsFeed` is a
k-way merge: seed a max-heap (by time) with the *most recent* tweet from the user and each
followee, pop the global max, and push that same user's *next-most-recent* tweet — identical
in shape to merging k sorted lists (problem 14), but walking each list newest-to-oldest and
stopping after 10 pops.

```javascript
class Twitter {
  constructor() {
    this.time = 0;
    this.tweets = new Map(); // userId -> [[time, tweetId], ...] chronological
    this.following = new Map(); // userId -> Set(followeeId)
  }

  postTweet(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push([this.time++, tweetId]);
  }

  getNewsFeed(userId) {
    const heap = new Heap((a, b) => b[0] - a[0]); // max-heap by time
    const users = new Set([userId, ...(this.following.get(userId) || [])]);

    for (const u of users) {
      const list = this.tweets.get(u);
      if (list && list.length) {
        const idx = list.length - 1; // most recent tweet from u
        heap.push([list[idx][0], list[idx][1], u, idx]);
      }
    }

    const res = [];
    while (res.length < 10 && heap.size()) {
      const [time, tweetId, u, idx] = heap.pop();
      res.push(tweetId);
      if (idx - 1 >= 0) {
        const list = this.tweets.get(u);
        heap.push([list[idx - 1][0], list[idx - 1][1], u, idx - 1]);
      }
    }
    return res;
  }

  follow(followerId, followeeId) {
    if (followerId === followeeId) return;
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    this.following.get(followerId)?.delete(followeeId);
  }
}
```

**Complexity.** `postTweet`/`follow`/`unfollow` O(1) (amortized). `getNewsFeed` O(f log f)
where `f` is the number of followees, since the heap holds at most `f + 1` entries at once.

---

#### 20b. Sliding Window Median

**Problem.** Given `nums` and window size `k`, return the median of every contiguous window
of size `k`.

**Intuition.** Same two-heap split as Find Median from Data Stream (problem 15), but now
elements must also leave the window. A heap can't remove an arbitrary interior element in
better than O(n), so instead of removing eagerly we **lazily delete**: mark the outgoing
value in a `delayed` count map, and only actually pop it from a heap once it *surfaces at the
root* (checked in `_prune`, called right before we trust `peek()`). Separate `loSize`/`hiSize`
counters track each half's true logical size (excluding pending-deletion entries still
sitting in the array), which is what rebalancing must use instead of `heap.size()`.

```javascript
class SlidingWindowMedian {
  constructor() {
    this.lo = new Heap((a, b) => b - a); // max-heap, lower half
    this.hi = new Heap((a, b) => a - b); // min-heap, upper half
    this.delayed = new Map(); // value -> pending lazy-deletion count
    this.loSize = 0;
    this.hiSize = 0;
  }

  _prune(heap) {
    while (heap.size() && this.delayed.get(heap.peek())) {
      const cnt = this.delayed.get(heap.peek());
      if (cnt === 1) this.delayed.delete(heap.peek());
      else this.delayed.set(heap.peek(), cnt - 1);
      heap.pop();
    }
  }

  _insert(num) {
    if (!this.loSize || num <= this.lo.peek()) {
      this.lo.push(num);
      this.loSize++;
    } else {
      this.hi.push(num);
      this.hiSize++;
    }
  }

  _remove(num) {
    this.delayed.set(num, (this.delayed.get(num) || 0) + 1);
    if (num <= this.lo.peek()) this.loSize--;
    else this.hiSize--;
  }

  _balance() {
    if (this.loSize > this.hiSize + 1) {
      this.hi.push(this.lo.pop());
      this.loSize--;
      this.hiSize++;
      this._prune(this.lo);
    } else if (this.hiSize > this.loSize) {
      this.lo.push(this.hi.pop());
      this.hiSize--;
      this.loSize++;
      this._prune(this.hi);
    }
  }

  _median() {
    if (this.loSize > this.hiSize) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
  }

  medianSlidingWindow(nums, k) {
    const res = [];
    for (let i = 0; i < k; i++) this._insert(nums[i]);
    this._prune(this.lo);
    this._prune(this.hi);
    this._balance();
    res.push(this._median());

    for (let i = k; i < nums.length; i++) {
      this._insert(nums[i]);
      this._remove(nums[i - k]);
      this._prune(this.lo);
      this._prune(this.hi);
      this._balance();
      res.push(this._median());
    }
    return res;
  }
}

function medianSlidingWindow(nums, k) {
  return new SlidingWindowMedian().medianSlidingWindow(nums, k);
}
```

**Complexity.** Time O(n log k) amortized (each element is pushed and lazily popped at most
once per heap), Space O(k).

---

#### 20c. Median of Stream with Removal

**Problem.** Design a data structure over a multiset of numbers supporting `insert(num)`,
`remove(num)` (removes one occurrence of a value known to have been previously inserted —
not necessarily the most recent, and not tied to any sliding window), and `findMedian()`.

**Intuition.** A binary heap only supports efficient removal of its *root*. Deleting an
arbitrary value would normally require locating it in the array (O(n)) and re-heapifying —
there's no cheap way to jump straight to an interior element. The fix is the same lazy
deletion as 20b, generalized beyond a sliding window: mark the value as pending removal in a
`delayed` map immediately, adjust the logical half-size it belonged to, and only physically
pop it from a heap array once it rises to that heap's root and would otherwise be trusted by
`peek()`. Because deletions are tracked by *value* with a count (not by object identity), it
also correctly handles duplicate values without needing to distinguish which instance was
removed.

```javascript
class MedianStreamWithRemoval {
  constructor() {
    this.lo = new Heap((a, b) => b - a); // max-heap, lower half
    this.hi = new Heap((a, b) => a - b); // min-heap, upper half
    this.delayed = new Map(); // value -> pending lazy-deletion count
    this.loSize = 0;
    this.hiSize = 0;
  }

  _prune(heap) {
    while (heap.size() && this.delayed.get(heap.peek())) {
      const cnt = this.delayed.get(heap.peek());
      if (cnt === 1) this.delayed.delete(heap.peek());
      else this.delayed.set(heap.peek(), cnt - 1);
      heap.pop();
    }
  }

  _rebalance() {
    if (this.loSize > this.hiSize + 1) {
      this.hi.push(this.lo.pop());
      this.loSize--;
      this.hiSize++;
      this._prune(this.lo);
    } else if (this.hiSize > this.loSize) {
      this.lo.push(this.hi.pop());
      this.hiSize--;
      this.loSize++;
      this._prune(this.hi);
    }
  }

  insert(num) {
    if (!this.loSize || num <= this.lo.peek()) {
      this.lo.push(num);
      this.loSize++;
    } else {
      this.hi.push(num);
      this.hiSize++;
    }
    this._rebalance();
  }

  remove(num) {
    this.delayed.set(num, (this.delayed.get(num) || 0) + 1);
    if (num <= this.lo.peek()) this.loSize--;
    else this.hiSize--;

    this._prune(this.lo);
    this._prune(this.hi);
    this._rebalance();
  }

  findMedian() {
    if (this.loSize > this.hiSize) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
  }
}
```

**Complexity.** Time O(log n) amortized per `insert`/`remove`, O(1) per `findMedian`,
Space O(n) (the `delayed` map holds at most one entry per pending removal).

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Fixed-size heap for top/kth queries | 1, 4, 6, 7 |
| Max-heap greedy simulation | 2, 8, 9, 12 |
| Heap-driven interval / scheduling | 10, 11 |
| k-way merge across sorted sequences | 13, 14, 16, 19, 20a |
| Two heaps for running median | 15, 20b, 20c |
| Sort-then-gate + heap (deferred eligibility) | 17 |
| Grid boundary expansion (Dijkstra-style min-heap) | 18 |
| Lazy deletion in heaps | 20b, 20c |

**Recommended progression:** 1 → 4 → 2 → 3 → 5 → 6 → 7 → 10 → 11 → 8 → 9 → 12 → 13 →
19 → 14 → 16 → 15 → 17 → 18 → 20.
