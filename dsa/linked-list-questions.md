# Linked List Interview Questions — Easy → Very Very Hard

20 curated linked list problems with problem statements, intuition, JavaScript solutions, and
complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Reverse Linked List](#1-reverse-linked-list)
2. [Merge Two Sorted Lists](#2-merge-two-sorted-lists)
3. [Linked List Cycle (Floyd's Cycle Detection)](#3-linked-list-cycle-floyds-cycle-detection)
4. [Middle of the Linked List](#4-middle-of-the-linked-list)
5. [Remove Duplicates from Sorted List](#5-remove-duplicates-from-sorted-list)

**Medium**
6. [Add Two Numbers](#6-add-two-numbers)
7. [Remove Nth Node From End of List](#7-remove-nth-node-from-end-of-list)
8. [Reorder List](#8-reorder-list)
9. [Odd Even Linked List](#9-odd-even-linked-list)
10. [Intersection of Two Linked Lists](#10-intersection-of-two-linked-lists)
11. [Rotate List](#11-rotate-list)
12. [Swap Nodes in Pairs](#12-swap-nodes-in-pairs)
13. [Partition List](#13-partition-list)

**Hard**
14. [Reverse Nodes in k-Group](#14-reverse-nodes-in-k-group)
15. [Merge k Sorted Lists](#15-merge-k-sorted-lists)
16. [LRU Cache](#16-lru-cache)
17. [Copy List with Random Pointer](#17-copy-list-with-random-pointer)

**Very Hard**
18. [Sort List](#18-sort-list)
19. [Flatten a Multilevel Doubly Linked List](#19-flatten-a-multilevel-doubly-linked-list)

**Very Very Hard**
20. [LFU Cache / Cycle Start Detection / Skip List Design](#20-the-boss-fight)

---

Every problem below (unless noted otherwise) operates on a singly-linked list built from this
node:

```javascript
function ListNode(val, next = null) {
  this.val = val;
  this.next = next;
}
```

## Easy

### 1. Reverse Linked List

**Problem.** Given the head of a singly linked list, reverse it and return the new head.

**Intuition.** Walk the list once, and at each node flip its `next` pointer to point
backward at the previous node instead of forward. Track `prev` and the saved `next` so the
list isn't lost mid-flip.

```javascript
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 2. Merge Two Sorted Lists

**Problem.** Merge two sorted linked lists `l1` and `l2` into one sorted list by splicing
together their existing nodes, and return the head.

**Intuition.** Use a dummy head so there's no special-casing the first node. Repeatedly
attach the smaller of the two current nodes to the tail, then advance that list. Once one
list is exhausted, tack on the remainder of the other.

```javascript
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 || l2;
  return dummy.next;
}
```

**Complexity.** Time O(n + m), Space O(1) extra (nodes are re-linked, not copied).

---

### 3. Linked List Cycle (Floyd's Cycle Detection)

**Problem.** Given the head of a linked list, determine if it contains a cycle.

**Intuition.** Move two pointers at different speeds — `slow` by one step, `fast` by two.
If there's a cycle, `fast` eventually laps `slow` and they meet inside it. If `fast` hits
`null`, the list is acyclic.

```javascript
function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

**Complexity.** Time O(n), Space O(1). (Alternative: hash set of visited nodes, O(n) space.)

---

### 4. Middle of the Linked List

**Problem.** Return the middle node of a singly linked list. If there are two middle nodes
(even length), return the second one.

**Intuition.** Fast/slow pointers: advance `fast` two steps for every one step of `slow`.
When `fast` reaches the end, `slow` sits exactly at the middle.

```javascript
function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 5. Remove Duplicates from Sorted List

**Problem.** Given the head of a sorted singly linked list, delete all duplicates so each
value appears once, and return the list.

**Intuition.** Since the list is sorted, duplicates are always adjacent. Walk the list; if
the current node's value equals the next node's value, skip the next node instead of
advancing.

```javascript
function deleteDuplicates(head) {
  let curr = head;
  while (curr && curr.next) {
    if (curr.val === curr.next.val) {
      curr.next = curr.next.next;
    } else {
      curr = curr.next;
    }
  }
  return head;
}
```

**Complexity.** Time O(n), Space O(1).

---

## Medium

### 6. Add Two Numbers

**Problem.** Two non-negative integers are represented as linked lists with digits stored
in reverse order (ones digit first). Add the two numbers and return the sum as a linked
list in the same format.

**Intuition.** Simulate grade-school addition: walk both lists in lockstep, summing
corresponding digits plus a running carry, emitting one output digit per step. Keep going
as long as either list has digits left or there's a carry.

```javascript
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;
  let carry = 0;

  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return dummy.next;
}
```

**Complexity.** Time O(max(n, m)), Space O(max(n, m)) for the output list.

---

### 7. Remove Nth Node From End of List

**Problem.** Remove the `n`-th node from the end of the list and return the head, in one
pass.

**Intuition.** Advance a `fast` pointer `n` steps ahead first. Then move `fast` and `slow`
together until `fast` runs off the end — `slow` now sits right before the node to remove.
A dummy head handles the edge case of removing the actual head node.

```javascript
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy;
  let slow = dummy;

  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 8. Reorder List

**Problem.** Given `L0 → L1 → ... → Ln`, reorder it in place to
`L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ...`. Don't just rearrange values — relink the nodes.

**Intuition.** Three steps: (1) find the middle with fast/slow pointers and split the list
in half, (2) reverse the second half, (3) merge the two halves by alternately taking one
node from each.

```javascript
function reorderList(head) {
  if (!head || !head.next) return head;

  // 1. find middle
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // 2. reverse second half
  let second = slow.next;
  slow.next = null;
  let prev = null;
  while (second) {
    const next = second.next;
    second.next = prev;
    prev = second;
    second = next;
  }
  second = prev;

  // 3. merge the two halves alternately
  let first = head;
  while (second) {
    const firstNext = first.next;
    const secondNext = second.next;
    first.next = second;
    second.next = firstNext;
    first = firstNext;
    second = secondNext;
  }
  return head;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 9. Odd Even Linked List

**Problem.** Group all nodes at odd indices together followed by all nodes at even indices
(1-indexed), preserving relative order within each group, in place, O(1) extra space.

**Intuition.** Keep two running chains — `odd` and `even` — built by walking the list once
and alternately handing each node to the next chain. Remember the head of the even chain so
it can be stitched onto the tail of the odd chain at the end.

```javascript
function oddEvenList(head) {
  if (!head || !head.next) return head;

  let odd = head;
  let even = head.next;
  const evenHead = even;

  while (even && even.next) {
    odd.next = even.next;
    odd = odd.next;
    even.next = odd.next;
    even = even.next;
  }
  odd.next = evenHead;
  return head;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 10. Intersection of Two Linked Lists

**Problem.** Given the heads of two singly linked lists, return the node at which they
intersect, or `null` if they don't intersect.

**Intuition.** Walk both lists with two pointers. When a pointer reaches the end of its
list, redirect it to the head of the *other* list. Both pointers then travel
`lenA + lenB` total steps before either reaching the intersection node together or both
hitting `null` at the same time — the length difference cancels out.

```javascript
function getIntersectionNode(headA, headB) {
  let a = headA;
  let b = headB;
  while (a !== b) {
    a = a ? a.next : headB;
    b = b ? b.next : headA;
  }
  return a;
}
```

**Complexity.** Time O(n + m), Space O(1).

---

### 11. Rotate List

**Problem.** Rotate the list to the right by `k` places.

**Intuition.** Find the length and connect the tail to the head, forming a ring. The new
tail is `(length - k % length - 1)` steps from the old head; breaking the ring there
produces the rotated list.

```javascript
function rotateRight(head, k) {
  if (!head || !head.next) return head;

  let length = 1;
  let tail = head;
  while (tail.next) {
    tail = tail.next;
    length++;
  }

  k %= length;
  if (k === 0) return head;

  tail.next = head; // form a ring
  let stepsToNewTail = length - k;
  let newTail = head;
  for (let i = 1; i < stepsToNewTail; i++) newTail = newTail.next;

  const newHead = newTail.next;
  newTail.next = null; // break the ring
  return newHead;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 12. Swap Nodes in Pairs

**Problem.** Swap every two adjacent nodes and return the head. Relink nodes, don't just
swap values.

**Intuition.** A dummy head simplifies swapping the first pair. For each pair, rewire three
pointers — the node before the pair, and the two nodes in the pair — then move `prev`
forward by the pair that was just swapped.

```javascript
function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;

  while (prev.next && prev.next.next) {
    const first = prev.next;
    const second = first.next;

    first.next = second.next;
    second.next = first;
    prev.next = second;

    prev = first;
  }
  return dummy.next;
}
```

**Complexity.** Time O(n), Space O(1).

---

### 13. Partition List

**Problem.** Given a list and a value `x`, partition it so all nodes less than `x` come
before all nodes greater than or equal to `x`. Preserve the original relative order within
each partition.

**Intuition.** Build two separate chains as you walk the list once — a "before" chain for
values `< x` and an "after" chain for the rest — then splice "after" onto the tail of
"before".

```javascript
function partition(head, x) {
  const beforeDummy = new ListNode(0);
  const afterDummy = new ListNode(0);
  let before = beforeDummy;
  let after = afterDummy;

  while (head) {
    if (head.val < x) {
      before.next = head;
      before = before.next;
    } else {
      after.next = head;
      after = after.next;
    }
    head = head.next;
  }

  after.next = null; // avoid accidentally recreating a cycle
  before.next = afterDummy.next;
  return beforeDummy.next;
}
```

**Complexity.** Time O(n), Space O(1).

---

## Hard

### 14. Reverse Nodes in k-Group

**Problem.** Reverse the nodes of a linked list `k` at a time and return the modified list.
If the number of nodes isn't a multiple of `k`, leave the final leftover group as-is.

**Intuition.** First check whether at least `k` nodes remain — if not, stop and return the
head untouched. Otherwise recursively process everything after the current group first,
then reverse the current `k` nodes and point the reversed group's tail at the
already-processed rest.

```javascript
function reverseKGroup(head, k) {
  let node = head;
  let count = 0;
  while (node && count < k) {
    node = node.next;
    count++;
  }
  if (count < k) return head; // fewer than k nodes left — leave untouched

  // recursively reverse everything from the next group onward
  let prev = reverseKGroup(node, k);

  // reverse the current group of k nodes, tailing into `prev`
  let curr = head;
  for (let i = 0; i < k; i++) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

**Complexity.** Time O(n), Space O(n/k) for the recursion stack. (An iterative version with
an outer loop and dummy head gets this to O(1) extra space.)

---

### 15. Merge k Sorted Lists

**Problem.** Given an array of `k` sorted linked lists, merge them into one sorted list.

**Intuition.** At every step the next output node is the smallest head among all k lists.
A min-heap keyed by node value gives that in O(log k). Pop the minimum, append it to the
output, and if it has a successor push that successor back in.

```javascript
class MinHeap {
  constructor(compare) {
    this.data = [];
    this.compare = compare;
  }
  get size() {
    return this.data.length;
  }
  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      this._bubbleDown(0);
    }
    return top;
  }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }
  _bubbleDown(i) {
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

function mergeKLists(lists) {
  const heap = new MinHeap((a, b) => a.val - b.val);
  for (const node of lists) {
    if (node) heap.push(node);
  }

  const dummy = new ListNode(0);
  let tail = dummy;
  while (heap.size) {
    const node = heap.pop();
    tail.next = node;
    tail = tail.next;
    if (node.next) heap.push(node.next);
  }
  return dummy.next;
}
```

**Complexity.** Time O(N log k), where `N` is the total number of nodes and `k` is the
number of lists. Space O(k) for the heap. (Pairwise merging is also O(N log k) with the
same asymptotics but a different constant.)

---

### 16. LRU Cache

**Problem.** Design a Least Recently Used cache with `get(key)` and `put(key, value)`, both
O(1). When capacity is exceeded, evict the least recently used entry.

**Intuition.** A hash map gives O(1) lookup from key to node. A doubly linked list gives
O(1) removal/insertion from arbitrary positions, letting us keep nodes ordered by recency.
On every access, unlink the node and move it to the front (most-recently-used end); on
overflow, evict from the back (least-recently-used end).

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // key -> node
    this.head = { key: null, val: null, prev: null, next: null }; // MRU sentinel
    this.tail = { key: null, val: null, prev: null, next: null }; // LRU sentinel
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._addToFront(node);
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.val = value;
      this._remove(node);
      this._addToFront(node);
      return;
    }

    if (this.map.size === this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }

    const node = { key, val: value, prev: null, next: null };
    this.map.set(key, node);
    this._addToFront(node);
  }
}
```

**Complexity.** Time O(1) for both `get` and `put`, Space O(capacity).

---

### 17. Copy List with Random Pointer

**Problem.** Each node in a linked list has a `next` pointer and an extra `random` pointer
that can point to any node in the list or `null`. Return a deep copy of the list. Nodes here
have the shape `{ val, next, random }` (not the plain `ListNode`).

**Intuition.** A hash-map-free trick: interleave a copy after each original node
(`A → A' → B → B' → ...`). Now `original.next.random` — i.e. the copy's random pointer —
can be set to `original.random.next`, since `original.random`'s copy is always right after
it. Finally, unweave the two interleaved lists back apart.

```javascript
function copyRandomList(head) {
  if (!head) return null;

  // 1. interleave a copy after each original node
  let curr = head;
  while (curr) {
    const copy = { val: curr.val, next: curr.next, random: null };
    curr.next = copy;
    curr = copy.next;
  }

  // 2. wire up random pointers on the copies
  curr = head;
  while (curr) {
    if (curr.random) curr.next.random = curr.random.next;
    curr = curr.next.next;
  }

  // 3. unweave the interleaved list back into original + copy
  curr = head;
  const dummy = { next: null };
  let copyTail = dummy;
  while (curr) {
    const copy = curr.next;
    curr.next = copy.next;
    copyTail.next = copy;
    copyTail = copy;
    curr = curr.next;
  }
  return dummy.next;
}
```

**Complexity.** Time O(n), Space O(1) extra (excluding the output copy). (A hash map from
original → copy node also works in O(n) time but O(n) extra space.)

---

## Very Hard

### 18. Sort List

**Problem.** Sort a linked list in `O(n log n)` time using `O(1)` extra space (no arrays,
no recursion-heavy approach that costs extra memory).

**Intuition.** Bottom-up merge sort avoids the O(log n) recursion stack of top-down merge
sort. Merge sublists of size 1, then 2, then 4, doubling each pass, using `split` to cut a
run of a given size off the front of a sublist and `merge` to combine two runs — all done by
relinking existing nodes.

```javascript
function sortList(head) {
  if (!head || !head.next) return head;

  let length = 0;
  let node = head;
  while (node) {
    length++;
    node = node.next;
  }

  const dummy = new ListNode(0, head);

  function split(node, size) {
    let i = 1;
    while (node && i < size) {
      node = node.next;
      i++;
    }
    if (!node) return null;
    const next = node.next;
    node.next = null; // cut here
    return next;
  }

  function merge(l1, l2, prev) {
    let curr = prev;
    while (l1 && l2) {
      if (l1.val <= l2.val) {
        curr.next = l1;
        l1 = l1.next;
      } else {
        curr.next = l2;
        l2 = l2.next;
      }
      curr = curr.next;
    }
    curr.next = l1 || l2;
    while (curr.next) curr = curr.next;
    return curr; // new tail, becomes next pass's insertion point
  }

  for (let size = 1; size < length; size *= 2) {
    let prev = dummy;
    let curr = dummy.next;

    while (curr) {
      const left = curr;
      const right = split(left, size);
      curr = split(right, size);
      prev = merge(left, right, prev);
    }
  }
  return dummy.next;
}
```

**Complexity.** Time O(n log n), Space O(1) extra (bottom-up, iterative — no recursion
stack). Top-down recursive merge sort is also O(n log n) time but O(log n) space.

---

### 19. Flatten a Multilevel Doubly Linked List

**Problem.** A doubly linked list's nodes may each have an extra `child` pointer to a
separate doubly linked list, which may itself have children, and so on. Flatten it into a
single-level doubly linked list where all nodes appear in depth-first order, and every
`child` pointer is `null`. Nodes here have the shape `{ val, prev, next, child }`.

**Intuition.** Walk the list; whenever a node has a child, recursively flatten that child
list, splice it in between the current node and its original `next`, and continue the walk
from after the spliced-in section (which was already flattened by the recursive call).

```javascript
function flatten(head) {
  if (!head) return head;

  let curr = head;
  while (curr) {
    if (curr.child) {
      const next = curr.next;
      const childHead = flatten(curr.child);
      curr.child = null;

      curr.next = childHead;
      childHead.prev = curr;

      let tail = childHead;
      while (tail.next) tail = tail.next;

      tail.next = next;
      if (next) next.prev = tail;
    }
    curr = curr.next;
  }
  return head;
}
```

**Complexity.** Time O(n), where `n` is the total number of nodes across all levels (every
node is visited a constant number of times). Space O(d) for the recursion stack, where `d`
is the maximum nesting depth.

---

## Very Very Hard

### 20. The Boss Fight

Three progressively brutal linked-list problems that interviewers use to separate "strong
hire" from everyone else. Pick your poison.

#### 20a. LFU Cache

**Problem.** Design a Least Frequently Used cache with `get(key)` and `put(key, value)`,
both O(1). On eviction, remove the least frequently used entry; break ties by least
recently used among entries with that frequency.

**Intuition.** Bucket nodes by access frequency, where each bucket is its own doubly linked
list (most-recently-used at the front, least-recently-used at the back). A `nodes` map goes
key → node; a `freqLists` map goes frequency → that frequency's DLL. Track `minFreq` so
eviction always knows which bucket to pull from. On every access, remove the node from its
current frequency bucket, bump its frequency, and re-insert it at the front of the new
bucket (this doubles as "most recent" within that frequency).

```javascript
class DLinkedList {
  constructor() {
    this.head = { key: null, val: null, freq: null, prev: null, next: null };
    this.tail = { key: null, val: null, freq: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }
  addFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
    this.size++;
  }
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.size--;
  }
  removeLast() {
    if (this.size === 0) return null;
    const last = this.tail.prev;
    this.remove(last);
    return last;
  }
}

class LFUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.minFreq = 0;
    this.nodes = new Map(); // key -> node
    this.freqLists = new Map(); // freq -> DLinkedList
  }

  _getFreqList(freq) {
    if (!this.freqLists.has(freq)) this.freqLists.set(freq, new DLinkedList());
    return this.freqLists.get(freq);
  }

  _touch(node) {
    const oldFreq = node.freq;
    this._getFreqList(oldFreq).remove(node);
    if (oldFreq === this.minFreq && this._getFreqList(oldFreq).size === 0) {
      this.minFreq++;
    }
    node.freq++;
    this._getFreqList(node.freq).addFront(node);
  }

  get(key) {
    if (!this.nodes.has(key)) return -1;
    const node = this.nodes.get(key);
    this._touch(node);
    return node.val;
  }

  put(key, value) {
    if (this.capacity === 0) return;

    if (this.nodes.has(key)) {
      const node = this.nodes.get(key);
      node.val = value;
      this._touch(node);
      return;
    }

    if (this.size === this.capacity) {
      const evicted = this._getFreqList(this.minFreq).removeLast();
      this.nodes.delete(evicted.key);
      this.size--;
    }

    const node = { key, val: value, freq: 1, prev: null, next: null };
    this.nodes.set(key, node);
    this._getFreqList(1).addFront(node);
    this.minFreq = 1;
    this.size++;
  }
}
```

**Complexity.** Time O(1) for both `get` and `put`, Space O(capacity).

---

#### 20b. Detect the Starting Node of a Cycle

**Problem.** Given the head of a linked list that may contain a cycle, return the node
where the cycle begins, or `null` if there is no cycle. (Unlike problem 3, which only
detects *whether* a cycle exists.)

**Intuition.** Run Floyd's tortoise and hare until they meet inside the cycle. Let the
distance from head to cycle start be `a`, and the meeting point be `b` steps into the cycle
(cycle length `c`). By the time they meet, `slow` has moved `a + b` and `fast` has moved
`2(a + b)`, and `fast` also equals `a + b + n·c` for some integer `n` (it looped `n` extra
times). Setting those equal gives `a + b = n·c`, i.e. `a = n·c - b`. So starting a new
pointer at the head and advancing it, together with `slow` (both one step at a time), makes
them meet exactly at the cycle's start after `a` steps — because `slow` still has
`c - b = n·c - b - (n-1)·c` steps to loop back to the start from the meeting point, which
equals `a` modulo the cycle length.

```javascript
function detectCycleStart(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let ptr = head;
      while (ptr !== slow) {
        ptr = ptr.next;
        slow = slow.next;
      }
      return ptr;
    }
  }
  return null;
}
```

**Complexity.** Time O(n), Space O(1). (A hash set of visited nodes solves it too, in O(n)
time and O(n) space — the two-pointer proof above is what makes O(1) space possible.)

---

#### 20c. Design a Skip List

**Problem.** Design a Skip List — a probabilistic data structure supporting `search(target)`,
`add(num)`, and `erase(num)`, each in expected O(log n) time, without using a balanced tree
or any built-in ordered-set structure.

**Intuition.** A skip list is a "linked list with express lanes": every node has a random
number of forward pointers (`levels`), and higher levels skip over more nodes. Searching
starts at the top level and moves right as far as possible before dropping down a level,
so each level roughly halves the remaining search space — giving O(log n) expected
performance without any rebalancing. Insertion picks a random level via repeated coin
flips and splices the new node into every level up to that height.

```javascript
class SkipListNode {
  constructor(val, level) {
    this.val = val;
    this.forward = new Array(level + 1).fill(null);
  }
}

class SkipList {
  constructor(maxLevel = 16, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p;
    this.level = 0;
    this.head = new SkipListNode(-Infinity, maxLevel);
  }

  _randomLevel() {
    let lvl = 0;
    while (Math.random() < this.p && lvl < this.maxLevel) lvl++;
    return lvl;
  }

  search(target) {
    let curr = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].val < target) {
        curr = curr.forward[i];
      }
    }
    curr = curr.forward[0];
    return curr !== null && curr.val === target;
  }

  add(num) {
    const update = new Array(this.maxLevel + 1).fill(this.head);
    let curr = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].val < num) {
        curr = curr.forward[i];
      }
      update[i] = curr;
    }

    const lvl = this._randomLevel();
    if (lvl > this.level) {
      for (let i = this.level + 1; i <= lvl; i++) update[i] = this.head;
      this.level = lvl;
    }

    const newNode = new SkipListNode(num, lvl);
    for (let i = 0; i <= lvl; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }
  }

  erase(num) {
    const update = new Array(this.maxLevel + 1).fill(null);
    let curr = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].val < num) {
        curr = curr.forward[i];
      }
      update[i] = curr;
    }

    curr = curr.forward[0];
    if (!curr || curr.val !== num) return false;

    for (let i = 0; i <= this.level; i++) {
      if (update[i].forward[i] !== curr) break;
      update[i].forward[i] = curr.forward[i];
    }

    while (this.level > 0 && this.head.forward[this.level] === null) {
      this.level--;
    }
    return true;
  }
}
```

**Complexity.** Expected time O(log n) for `search`, `add`, and `erase`; expected space
O(n) (geometric level distribution keeps the total pointer count linear). Worst case
degrades to O(n) if coin flips are unlucky, but this is astronomically rare in practice.

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Iterative pointer reversal | 1, 14 |
| Fast/slow pointers (Floyd's) | 3, 4, 8, 20b |
| Dummy head + two pointers | 2, 6, 7, 12, 13 |
| Split / reverse / merge restructuring | 8, 9 |
| Merge sort on linked structures | 2, 15, 18 |
| Two-pointer length alignment | 10 |
| Doubly linked list + hash map (O(1) cache) | 16, 20a |
| Recursion on nested/grouped structures | 14, 19 |
| Interleaving / extra pointer fields | 17 |
| Heap / priority queue | 15 |
| Probabilistic / multi-level structures | 20c |

**Recommended progression:** 1 → 4 → 3 → 2 → 5 → 7 → 12 → 9 → 13 → 6 → 11 → 10 → 8 →
14 → 18 → 15 → 17 → 19 → 16 → 20.
