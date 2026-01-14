# Coding Patterns Cheatsheet

## Quick Reference for Common Interview Patterns

---

## 1. Two Pointers

### When to Use
- Sorted arrays/lists
- Finding pairs with certain conditions
- Removing duplicates in-place
- Palindrome checking

### Template
```javascript
function twoPointers(arr) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    // Process based on condition
    if (condition) {
      left++;
    } else {
      right--;
    }
  }
}
```

### Common Problems
- Two Sum (sorted array)
- Container With Most Water
- Trapping Rain Water
- Valid Palindrome
- 3Sum, 4Sum
- Remove Duplicates

---

## 2. Sliding Window

### When to Use
- Subarray/substring problems
- Contiguous elements
- "Maximum/minimum in range"
- Fixed or variable window size

### Fixed Window Template
```javascript
function fixedWindow(arr, k) {
  let windowSum = 0;
  let maxSum = 0;
  
  // Initialize first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  // Slide window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum + arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}
```

### Variable Window Template
```javascript
function variableWindow(s) {
  const seen = new Map();
  let left = 0;
  let result = 0;
  
  for (let right = 0; right < s.length; right++) {
    // Expand window
    const char = s[right];
    seen.set(char, (seen.get(char) || 0) + 1);
    
    // Shrink window while invalid
    while (/* window invalid */) {
      const leftChar = s[left];
      seen.set(leftChar, seen.get(leftChar) - 1);
      left++;
    }
    
    // Update result
    result = Math.max(result, right - left + 1);
  }
  
  return result;
}
```

### Common Problems
- Maximum Sum Subarray of Size K
- Longest Substring Without Repeating Characters
- Minimum Window Substring
- Longest Substring with K Distinct Characters
- Fruits Into Baskets

---

## 3. Fast & Slow Pointers

### When to Use
- Cycle detection
- Finding middle element
- Finding nth element from end

### Template
```javascript
function fastSlow(head) {
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      // Cycle detected
      return true;
    }
  }
  
  return false;
}
```

### Common Problems
- Linked List Cycle
- Find Middle of Linked List
- Happy Number
- Palindrome Linked List
- Find the Duplicate Number

---

## 4. Merge Intervals

### When to Use
- Overlapping intervals
- Scheduling problems
- Meeting rooms

### Template
```javascript
function mergeIntervals(intervals) {
  if (intervals.length <= 1) return intervals;
  
  // Sort by start time
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    
    if (current[0] <= last[1]) {
      // Overlapping - merge
      last[1] = Math.max(last[1], current[1]);
    } else {
      // Non-overlapping
      merged.push(current);
    }
  }
  
  return merged;
}
```

### Common Problems
- Merge Intervals
- Insert Interval
- Meeting Rooms I & II
- Non-overlapping Intervals
- Interval List Intersections

---

## 5. Binary Search

### When to Use
- Sorted array
- Finding target in O(log n)
- Finding boundary (first/last occurrence)

### Standard Template
```javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}
```

### Find First Occurrence
```javascript
function findFirst(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      result = mid;
      right = mid - 1; // Keep searching left
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
}
```

### Common Problems
- Binary Search
- Search in Rotated Sorted Array
- Find First and Last Position
- Search Insert Position
- Find Peak Element
- Koko Eating Bananas

---

## 6. BFS (Breadth-First Search)

### When to Use
- Level-order traversal
- Shortest path (unweighted)
- Finding all nodes at distance K

### Template
```javascript
function bfs(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}
```

### Graph BFS
```javascript
function bfsGraph(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  
  while (queue.length > 0) {
    const node = queue.shift();
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}
```

### Common Problems
- Level Order Traversal
- Shortest Path in Binary Matrix
- Rotting Oranges
- Word Ladder
- Number of Islands (BFS version)

---

## 7. DFS (Depth-First Search)

### When to Use
- Path finding
- Cycle detection
- Topological sort
- Connected components

### Tree DFS Template
```javascript
function dfs(root) {
  if (!root) return;
  
  // Preorder: process before children
  console.log(root.val);
  
  dfs(root.left);
  
  // Inorder: process between children
  
  dfs(root.right);
  
  // Postorder: process after children
}
```

### Graph DFS Template
```javascript
function dfsGraph(graph, node, visited = new Set()) {
  if (visited.has(node)) return;
  
  visited.add(node);
  console.log(node);
  
  for (const neighbor of graph[node]) {
    dfsGraph(graph, neighbor, visited);
  }
}
```

### Common Problems
- Path Sum
- Number of Islands
- Clone Graph
- Course Schedule
- Detect Cycle in Graph

---

## 8. Backtracking

### When to Use
- All combinations/permutations
- Subset generation
- Constraint satisfaction (Sudoku, N-Queens)

### Template
```javascript
function backtrack(result, path, choices) {
  // Base case: found a valid solution
  if (/* condition met */) {
    result.push([...path]);
    return;
  }
  
  for (const choice of choices) {
    // Skip invalid choices
    if (/* invalid */) continue;
    
    // Make choice
    path.push(choice);
    
    // Recurse
    backtrack(result, path, /* remaining choices */);
    
    // Undo choice (backtrack)
    path.pop();
  }
}
```

### Permutations Example
```javascript
function permute(nums) {
  const result = [];
  
  function backtrack(path, used) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      
      path.push(nums[i]);
      used[i] = true;
      
      backtrack(path, used);
      
      path.pop();
      used[i] = false;
    }
  }
  
  backtrack([], new Array(nums.length).fill(false));
  return result;
}
```

### Common Problems
- Subsets
- Permutations
- Combination Sum
- N-Queens
- Word Search
- Sudoku Solver

---

## 9. Dynamic Programming

### When to Use
- Optimal substructure
- Overlapping subproblems
- Counting problems
- Min/max optimization

### Top-Down (Memoization) Template
```javascript
function dpTopDown(n, memo = new Map()) {
  // Base case
  if (n <= 1) return n;
  
  // Check memo
  if (memo.has(n)) return memo.get(n);
  
  // Calculate and store
  const result = dpTopDown(n - 1, memo) + dpTopDown(n - 2, memo);
  memo.set(n, result);
  
  return result;
}
```

### Bottom-Up (Tabulation) Template
```javascript
function dpBottomUp(n) {
  if (n <= 1) return n;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}
```

### Space-Optimized Template
```javascript
function dpOptimized(n) {
  if (n <= 1) return n;
  
  let prev2 = 0;
  let prev1 = 1;
  
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}
```

### Common Problems
- Climbing Stairs
- House Robber
- Coin Change
- Longest Increasing Subsequence
- Longest Common Subsequence
- 0/1 Knapsack
- Edit Distance

---

## 10. Monotonic Stack

### When to Use
- Next greater/smaller element
- Stock span problems
- Histogram problems

### Template
```javascript
function monotonicStack(arr) {
  const result = new Array(arr.length).fill(-1);
  const stack = []; // Stores indices
  
  for (let i = 0; i < arr.length; i++) {
    // Pop while current element is greater than stack top
    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {
      const index = stack.pop();
      result[index] = arr[i]; // or i for index
    }
    stack.push(i);
  }
  
  return result;
}
```

### Common Problems
- Daily Temperatures
- Next Greater Element
- Largest Rectangle in Histogram
- Trapping Rain Water (stack approach)
- Stock Span Problem

---

## 11. Heap / Priority Queue

### When to Use
- K largest/smallest elements
- Top K frequent elements
- Merge K sorted lists
- Median finding

### JavaScript MinHeap Implementation
```javascript
class MinHeap {
  constructor() {
    this.heap = [];
  }
  
  parent(i) { return Math.floor((i - 1) / 2); }
  leftChild(i) { return 2 * i + 1; }
  rightChild(i) { return 2 * i + 2; }
  
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
  
  push(val) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }
  
  pop() {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }
  
  bubbleUp(i) {
    while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }
  
  bubbleDown(i) {
    let min = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    
    if (left < this.heap.length && this.heap[left] < this.heap[min]) {
      min = left;
    }
    if (right < this.heap.length && this.heap[right] < this.heap[min]) {
      min = right;
    }
    
    if (min !== i) {
      this.swap(i, min);
      this.bubbleDown(min);
    }
  }
  
  peek() { return this.heap[0]; }
  size() { return this.heap.length; }
}
```

### Common Problems
- Kth Largest Element
- Top K Frequent Elements
- Merge K Sorted Lists
- Find Median from Data Stream
- Meeting Rooms II

---

## 12. Union Find

### When to Use
- Connected components
- Cycle detection (undirected graph)
- Grouping problems

### Template
```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n;
  }
  
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  
  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);
    
    if (px === py) return false;
    
    // Union by rank
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    
    this.count--;
    return true;
  }
  
  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}
```

### Common Problems
- Number of Connected Components
- Redundant Connection
- Accounts Merge
- Number of Provinces
- Longest Consecutive Sequence

---

## 13. Trie

### When to Use
- Autocomplete
- Spell checker
- Word search in matrix
- Prefix matching

### Template
```javascript
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  
  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEnd = true;
  }
  
  search(word) {
    const node = this.traverse(word);
    return node !== null && node.isEnd;
  }
  
  startsWith(prefix) {
    return this.traverse(prefix) !== null;
  }
  
  traverse(str) {
    let node = this.root;
    for (const char of str) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char);
    }
    return node;
  }
}
```

### Common Problems
- Implement Trie
- Word Search II
- Design Add and Search Words
- Replace Words

---

## Quick Pattern Selection Guide

```
┌─────────────────────────────────────────────────────────────┐
│                 PATTERN SELECTION GUIDE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  "Given a sorted array..."        → Binary Search           │
│  "Find pairs in sorted array..."  → Two Pointers            │
│  "Contiguous subarray..."         → Sliding Window          │
│  "Linked list cycle..."           → Fast & Slow Pointers    │
│  "Overlapping intervals..."       → Merge Intervals         │
│  "Level-by-level tree..."         → BFS                     │
│  "Find all paths..."              → DFS / Backtracking      │
│  "Generate all combinations..."   → Backtracking            │
│  "Optimal solution with..."       → Dynamic Programming     │
│  "Next greater element..."        → Monotonic Stack         │
│  "K largest/smallest..."          → Heap                    │
│  "Connected components..."        → Union Find              │
│  "Prefix matching..."             → Trie                    │
│  "Shortest path (weighted)..."    → Dijkstra                │
│  "Shortest path (unweighted)..."  → BFS                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Time Complexity Reference

| Pattern | Time Complexity | Space Complexity |
|---------|-----------------|------------------|
| Two Pointers | O(n) | O(1) |
| Sliding Window | O(n) | O(k) |
| Binary Search | O(log n) | O(1) |
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |
| Backtracking | O(n!) or O(2^n) | O(n) |
| DP (1D) | O(n) | O(n) or O(1) |
| DP (2D) | O(n*m) | O(n*m) or O(n) |
| Monotonic Stack | O(n) | O(n) |
| Heap Operations | O(log n) | O(n) |
| Union Find | O(α(n)) ≈ O(1) | O(n) |
| Trie | O(m) per operation | O(n*m) |

---

मालिक, keep this cheatsheet handy for quick pattern recognition during interviews! 🚀
